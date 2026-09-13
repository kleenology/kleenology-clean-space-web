// أدوات مشتركة لسجلات JSON المخزّنة في Netlify Blobs
// يستخدمها سجل المعاينات وسجل فحوصات الجودة.

import { getStore } from "@netlify/blobs";
import { matchesQuery } from "./search-text.mjs";

export const MAX_LIST = 50;
// البحث يمسح كل السجلات لا آخر خمسين: الشكوى قد تكون عن وظيفة قديمة،
// وسجلٌّ لا يُعثر عليه أسوأ من بحث يستغرق ثانية.
export const MAX_SEARCH_SCAN = 500;
export const MAX_BODY_BYTES = 64 * 1024;

// المفتاح يبدأ بالطابع الزمني، فترتيب المفاتيح تنازلياً = الأحدث أولاً
// بلا حاجة لقراءة كل سجل لمعرفة تاريخه.
export function newKey() {
  return `${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recordStore(name) {
  return getStore({ name, consistency: "strong" });
}

/** مفاتيح السجلات مرتّبة من الأحدث، مع إجمالي العدد */
export async function recentKeys(store) {
  const { blobs } = await store.list();
  const keys = blobs
    .map((entry) => entry.key)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, MAX_LIST);
  return { keys, total: blobs.length };
}

/**
 * يبحث في كل السجلات ويرجّع ملخّصات المطابق منها، الأحدث أولاً.
 * لا يمكن الترشيح من المفاتيح لأنها طوابع زمنية، فالمسح الكامل لازم.
 */
export async function searchRecords(store, query, summarize) {
  const { blobs } = await store.list();
  const keys = blobs
    .map((entry) => entry.key)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, MAX_SEARCH_SCAN);

  const rows = await Promise.all(
    keys.map(async (key) => {
      const record = await store.get(key, { type: "json" }).catch(() => null);
      if (!record || !matchesQuery(record, query)) return null;
      return summarize(key, record);
    }),
  );
  return { matches: rows.filter(Boolean), scanned: keys.length, total: blobs.length };
}

/** يقرأ السجلات المطلوبة ويحوّلها لملخّصات، متجاهلاً أي سجل تالف */
export async function summarizeKeys(store, keys, summarize) {
  const rows = await Promise.all(
    keys.map(async (key) => {
      const record = await store.get(key, { type: "json" }).catch(() => null);
      return record ? summarize(key, record) : null;
    }),
  );
  return rows.filter(Boolean);
}
