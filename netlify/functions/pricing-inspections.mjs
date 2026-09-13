// سجل المعاينات الميدانية — يُحفظ في Netlify Blobs
// كل العمليات تتطلب جلسة مشرف صالحة؛ لا شيء منها متاح للعامة.

import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";
import {
  recordStore, recentKeys, summarizeKeys, newKey, MAX_BODY_BYTES,
} from "../lib/blob-records.mjs";

const STORE = "pricing-inspections";

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
    const blobs = recordStore(STORE);

    if (request.method === "GET") {
      if (id) {
        const record = await blobs.get(id, { type: "json" });
        if (!record) return jsonResponse({ error: "not_found" }, 404);
        return jsonResponse({ inspection: { ...record, id } });
      }

      const { keys, total } = await recentKeys(blobs);
      return jsonResponse({
        inspections: await summarizeKeys(blobs, keys, summarize),
        total,
        truncated: total > keys.length,
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
