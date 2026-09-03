// سجل المعاينات الميدانية — يُحفظ في Netlify Blobs
// كل العمليات تتطلب جلسة مشرف صالحة؛ لا شيء منها متاح للعامة.

import { getStore } from "@netlify/blobs";
import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";

const STORE = "pricing-inspections";
const MAX_LIST = 50;
const MAX_BODY_BYTES = 64 * 1024;

// المفتاح يبدأ بالطابع الزمني، فترتيب المفاتيح تنازلياً = الأحدث أولاً
// بلا حاجة لقراءة كل معاينة لمعرفة تاريخها.
function newKey() {
  return `${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}`;
}

function store() {
  return getStore({ name: STORE, consistency: "strong" });
}

/** ملخّص خفيف لعرض القائمة بلا تحميل التفاصيل كاملة */
function summarize(key, record) {
  const levels = Array.isArray(record?.levels) ? record.levels : [];
  return {
    id: key,
    customerName: record?.customerName ?? "",
    location: record?.location ?? "",
    date: record?.date ?? "",
    time: record?.time ?? "",
    serviceType: record?.serviceType ?? "",
    supervisor: record?.supervisor ?? "",
    levelCount: levels.length,
    roomCount: levels.reduce(
      (sum, level) =>
        sum + (Array.isArray(level?.rooms) ? level.rooms.reduce((s, r) => s + (Number(r?.qty) || 0), 0) : 0),
      0,
    ),
    savedAt: record?.savedAt ?? "",
  };
}

export default async (request) => {
  if (!isConfigured()) {
    return jsonResponse({ error: "not_configured" }, 503);
  }
  if (!requireSession(request)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    const blobs = store();

    if (request.method === "GET") {
      if (id) {
        const record = await blobs.get(id, { type: "json" });
        if (!record) return jsonResponse({ error: "not_found" }, 404);
        return jsonResponse({ inspection: { ...record, id } });
      }

      const { blobs: entries } = await blobs.list();
      const keys = entries
        .map((entry) => entry.key)
        .sort((a, b) => b.localeCompare(a))
        .slice(0, MAX_LIST);

      const records = await Promise.all(
        keys.map(async (key) => {
          const record = await blobs.get(key, { type: "json" }).catch(() => null);
          return record ? summarize(key, record) : null;
        }),
      );

      return jsonResponse({
        inspections: records.filter(Boolean),
        total: entries.length,
        truncated: entries.length > MAX_LIST,
      });
    }

    if (request.method === "POST") {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) {
        return jsonResponse({ error: "too_large" }, 413);
      }
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return jsonResponse({ error: "invalid_body" }, 400);
      }

      // الحفظ فوق معاينة قائمة يبقيها بنفس مفتاحها بدل إنشاء نسخة ثانية
      const key = typeof payload.id === "string" && payload.id ? payload.id : newKey();
      const { id: _ignored, ...rest } = payload;
      const record = { ...rest, savedAt: new Date().toISOString() };

      await blobs.setJSON(key, record);
      return jsonResponse({ id: key, savedAt: record.savedAt });
    }

    if (request.method === "DELETE") {
      if (!id) return jsonResponse({ error: "missing_id" }, 400);
      await blobs.delete(id);
      return jsonResponse({ deleted: id });
    }

    return jsonResponse({ error: "method_not_allowed" }, 405);
  } catch (error) {
    // أشهر سبب: تخزين Blobs غير مفعّل على الموقع
    console.error("inspections store error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
