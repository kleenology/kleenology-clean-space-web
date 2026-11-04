// إحالة العملاء: كل عميل يحصل كوداً تلقائياً (يُنشأ عند حفظ الفحص). صديقه
// يحجز بالكود فيأخذ خصماً، والعميل المحيل يأخذ مكافأة على طلبه الجاي.
//   POST {action:"ensure", reportId}   [إدارة] إنشاء/إرجاع كود إحالة لتقرير
//   GET  ?code=X                        [عام] اسم العميل المحيل (لصفحة الصديق)
//   POST {action:"friend", code, ...}   [عام] تسجيل صديق حجز عبر الكود
//
// لا نكشف جوال العميل المحيل. المعرّفات عشوائية يصعب تخمينها.

import { jsonResponse, requireSession } from "../lib/admin-auth.mjs";
import { rateLimited, clientIp } from "../lib/rate-limit.mjs";
import { MAX_BODY_BYTES } from "../lib/blob-records.mjs";
import { notifyAdmin } from "../lib/notify.mjs";
import {
  referralStore, ensureReferral, clean, validPhone, FRIEND_DISCOUNT, REFERRER_REWARD,
} from "../lib/customer-referrals.mjs";

export default async (request) => {
  const refs = referralStore();

  try {
    // اسم المحيل للصفحة العامة للصديق
    if (request.method === "GET") {
      const code = new URL(request.url).searchParams.get("code");
      if (!code) return jsonResponse({ error: "missing_code" }, 400);
      const ref = await refs.get(code, { type: "json" }).catch(() => null);
      if (!ref) return jsonResponse({ error: "invalid_code" }, 404);
      return jsonResponse({ referrerName: ref.referrerName || "", friendDiscount: FRIEND_DISCOUNT });
    }

    if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "too_large" }, 413);
    let payload;
    try { payload = JSON.parse(raw); } catch { return jsonResponse({ error: "invalid_body" }, 400); }

    // إنشاء/إرجاع كود لتقرير — إدارة فقط
    if (payload.action === "ensure") {
      if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);
      const code = await ensureReferral(payload.reportId);
      if (!code) return jsonResponse({ error: "missing_fields" }, 400);
      return jsonResponse({ code, friendDiscount: FRIEND_DISCOUNT, referrerReward: REFERRER_REWARD });
    }

    // تسجيل صديق حجز عبر الكود — عام
    if (payload.action === "friend") {
      if (payload.website) return jsonResponse({ ok: true }); // فخ للبوتات
      if (rateLimited(`referral:${clientIp(request)}`, { max: 20 })) {
        return jsonResponse({ error: "too_many_requests" }, 429);
      }
      const code = clean(payload.code, 40);
      const name = clean(payload.name, 80);
      const phone = clean(payload.phone, 20);
      if (!name || !validPhone(phone)) return jsonResponse({ error: "missing_fields" }, 400);

      const ref = await refs.get(code, { type: "json" }).catch(() => null);
      if (!ref) return jsonResponse({ error: "invalid_code" }, 404);

      ref.friends = [...(ref.friends ?? []), { name, phone, at: new Date().toISOString() }];
      await refs.setJSON(code, ref);

      await notifyAdmin(
        `🎁 إحالة عميل جديدة\n\n` +
        `الصديق: ${name}\nجواله: ${phone}\n` +
        `عن طريق: ${ref.referrerName || "عميل"}${ref.referrerPhone ? ` (${ref.referrerPhone})` : ""}\n\n` +
        `طبّق خصم ${FRIEND_DISCOUNT}٪ للصديق، واعطِ المحيل ${REFERRER_REWARD}٪ على طلبه الجاي.`,
      );
      return jsonResponse({ ok: true, referrerName: ref.referrerName || "" });
    }

    return jsonResponse({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("customer referral error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
