// إحالة العملاء: كل عميل يحصل كوداً تلقائياً مع إرسال تقريره. صديقه يحجز
// بالكود فيأخذ خصماً، والعميل المحيل يأخذ مكافأة على طلبه الجاي.
//   POST {action:"ensure", reportId}   [إدارة] إنشاء/إرجاع كود إحالة لتقرير
//   GET  ?code=X                        [عام] اسم العميل المحيل (لصفحة الصديق)
//   POST {action:"friend", code, ...}   [عام] تسجيل صديق حجز عبر الكود
//
// لا نكشف جوال العميل المحيل. المعرّفات عشوائية يصعب تخمينها.

import crypto from "node:crypto";
import { jsonResponse, requireSession } from "../lib/admin-auth.mjs";
import { rateLimited, clientIp } from "../lib/rate-limit.mjs";
import { recordStore, MAX_BODY_BYTES } from "../lib/blob-records.mjs";
import { normalizePhone } from "../lib/search-text.mjs";
import { notifyAdmin } from "../lib/notify.mjs";

const REF_STORE = "customer-referrals";
const CHECKS_STORE = "pricing-quality-checks";

export const FRIEND_DISCOUNT = 15;   // خصم الصديق على أول طلب
export const REFERRER_REWARD = 15;   // مكافأة العميل المحيل على طلبه الجاي

const clean = (s, n) => (typeof s === "string" ? s.trim().slice(0, n) : "");
const validPhone = (p) => normalizePhone(p).length >= 9;

async function genCode(store) {
  for (let i = 0; i < 6; i++) {
    const code = `C-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const exists = await store.get(code, { type: "json" }).catch(() => null);
    if (!exists) return code;
  }
  return `C-${Date.now().toString(36).toUpperCase()}`;
}

export default async (request) => {
  const refs = recordStore(REF_STORE);

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

    // إنشاء/إرجاع كود لتقرير — إدارة فقط، idempotent عبر فهرس عكسي بالتقرير
    if (payload.action === "ensure") {
      if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);
      const reportId = clean(payload.reportId, 120);
      if (!reportId) return jsonResponse({ error: "missing_report" }, 400);

      const existing = await refs.get(`idx:${reportId}`, { type: "json" }).catch(() => null);
      if (existing?.code) {
        return jsonResponse({ code: existing.code, friendDiscount: FRIEND_DISCOUNT, referrerReward: REFERRER_REWARD });
      }

      const check = await recordStore(CHECKS_STORE).get(reportId, { type: "json" }).catch(() => null);
      if (!check) return jsonResponse({ error: "not_found" }, 404);

      const code = await genCode(refs);
      await refs.setJSON(code, {
        code,
        referrerName: clean(check.customerName, 80),
        referrerPhone: clean(check.phone, 20),
        reportId,
        createdAt: new Date().toISOString(),
        friends: [],
      });
      await refs.setJSON(`idx:${reportId}`, { code });
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
