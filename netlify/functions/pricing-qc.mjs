// سجل فحوصات الجودة — يُحفظ في Netlify Blobs
// كل العمليات تتطلب جلسة مشرف صالحة.

import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";
import {
  recordStore, recentKeys, summarizeKeys, searchRecords, newKey, MAX_BODY_BYTES,
} from "../lib/blob-records.mjs";

const STORE = "pricing-quality-checks";

/** يحسب النتيجة من النتائج المخزّنة بلا تحميل التقرير كاملاً في القائمة */
function summarize(key, record) {
  const results = record?.results && typeof record.results === "object" ? record.results : {};
  const verdicts = Object.values(results).map((r) => r?.verdict);
  const passed = verdicts.filter((v) => v === "pass").length;
  const checked = verdicts.filter(Boolean).length;
  return {
    id: key,
    customerName: record?.customerName ?? "",
    phone: record?.phone ?? "",
    location: record?.location ?? "",
    date: record?.date ?? "",
    supervisor: record?.supervisor ?? "",
    checked,
    passed,
    percent: checked > 0 ? Math.round((passed / checked) * 100) : 0,
    photoCount: Array.isArray(record?.photos) ? record.photos.length : 0,
    savedAt: record?.savedAt ?? "",
  };
}

export default async (request) => {
  if (!isConfigured()) return jsonResponse({ error: "not_configured" }, 503);
  if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const query = url.searchParams.get("q");

  try {
    const store = recordStore(STORE);

    if (request.method === "GET") {
      if (id) {
        const record = await store.get(id, { type: "json" });
        if (!record) return jsonResponse({ error: "not_found" }, 404);
        return jsonResponse({ check: { ...record, id } });
      }
      if (query?.trim()) {
        const { matches, total } = await searchRecords(store, query, summarize);
        return jsonResponse({ checks: matches, total, searched: true });
      }

      const { keys, total } = await recentKeys(store);
      return jsonResponse({
        checks: await summarizeKeys(store, keys, summarize),
        total,
        truncated: total > keys.length,
      });
    }

    if (request.method === "POST") {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "too_large" }, 413);
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return jsonResponse({ error: "invalid_body" }, 400);
      }

      const key = typeof payload.id === "string" && payload.id ? payload.id : newKey();
      const { id: _ignored, ...rest } = payload;
      const record = { ...rest, savedAt: new Date().toISOString() };
      await store.setJSON(key, record);
      return jsonResponse({ id: key, savedAt: record.savedAt });
    }

    if (request.method === "DELETE") {
      if (!id) return jsonResponse({ error: "missing_id" }, 400);
      await store.delete(id);
      return jsonResponse({ deleted: id });
    }

    return jsonResponse({ error: "method_not_allowed" }, 405);
  } catch (error) {
    console.error("quality checks store error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
