// سجل الحجوزات: يُحفَظ الحجز عند تأكيده من لوحة الإدارة ويُرسَل تنبيه فوري
// للجروب على تليجرام. دالة booking-reminders المجدولة تقرأ هذا السجل وترسل
// تذكيراً قبل الموعد بيوم ورسالة تقييم بعده.

import {
  recordStore, newKey, recentKeys, summarizeKeys, MAX_BODY_BYTES,
} from "../lib/blob-records.mjs";
import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";
import { notifyAdmin } from "../lib/notify.mjs";

const STORE = "pricing-bookings";

function summarize(key, r) {
  return {
    id: key,
    customerName: r?.customerName ?? "",
    phone: r?.phone ?? "",
    bookingNo: r?.bookingNo ?? "",
    date: r?.date ?? "",
    time: r?.time ?? "",
    location: r?.location ?? "",
    serviceType: r?.serviceType ?? "",
    savedAt: r?.savedAt ?? "",
    reminderSentAt: r?.reminderSentAt ?? "",
    reviewSentAt: r?.reviewSentAt ?? "",
  };
}

export default async (request) => {
  if (!isConfigured()) return jsonResponse({ error: "not_configured" }, 503);
  if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);

  const store = recordStore(STORE);

  try {
    if (request.method === "GET") {
      const { keys, total } = await recentKeys(store);
      return jsonResponse({ bookings: await summarizeKeys(store, keys, summarize), total });
    }

    if (request.method === "POST") {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "too_large" }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return jsonResponse({ error: "invalid_body" }, 400); }

      const record = {
        customerName: String(body.customerName ?? "").slice(0, 120),
        phone: String(body.phone ?? "").slice(0, 40),
        bookingNo: String(body.bookingNo ?? "").slice(0, 40),
        date: String(body.date ?? "").slice(0, 20),
        time: String(body.time ?? "").slice(0, 60),
        location: String(body.location ?? "").slice(0, 120),
        serviceType: String(body.serviceType ?? "").slice(0, 120),
        savedAt: new Date().toISOString(),
      };

      const key = newKey();
      await store.setJSON(key, record);

      await notifyAdmin(
        `🗓️ حجز جديد\n\n` +
        `العميل: ${record.customerName || "—"}\n` +
        `الجوال: ${record.phone || "—"}\n` +
        `رقم الطلب: ${record.bookingNo || "—"}\n` +
        `التاريخ: ${record.date || "—"}${record.time ? ` — ${record.time}` : ""}\n` +
        (record.location ? `الموقع: ${record.location}\n` : "") +
        (record.serviceType ? `الخدمة: ${record.serviceType}\n` : "") +
        `\nبيوصلك تذكير تلقائي قبل الموعد بيوم، ورسالة تقييم بعده.`,
      ).catch(() => {});

      return jsonResponse({ id: key, savedAt: record.savedAt });
    }

    return jsonResponse({ error: "method_not_allowed" }, 405);
  } catch (error) {
    console.error("bookings store error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
