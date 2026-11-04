// منطق إحالة العملاء المشترك: إنشاء كود لكل تقرير (idempotent) وثوابت النِسب.
// يُستدعى من حفظ فحص الجودة (ليُنشأ الكود تلقائياً) ومن دالة الإحالة العامة.

import crypto from "node:crypto";
import { recordStore } from "./blob-records.mjs";
import { normalizePhone } from "./search-text.mjs";

export const REF_STORE = "customer-referrals";
export const CHECKS_STORE = "pricing-quality-checks";
export const FRIEND_DISCOUNT = 15;   // خصم الصديق على أول طلب
export const REFERRER_REWARD = 15;   // مكافأة العميل المحيل على طلبه الجاي

export const clean = (s, n) => (typeof s === "string" ? s.trim().slice(0, n) : "");
export const validPhone = (p) => normalizePhone(p).length >= 9;

export function referralStore() {
  return recordStore(REF_STORE);
}

export async function genCode(store) {
  for (let i = 0; i < 6; i++) {
    const code = `C-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const exists = await store.get(code, { type: "json" }).catch(() => null);
    if (!exists) return code;
  }
  return `C-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * يضمن وجود كود إحالة لتقرير. idempotent عبر فهرس عكسي بالتقرير.
 * لا يُنشئ كوداً إلا لتقرير فيه اسم وجوال صحيح. يرجّع الكود أو null.
 */
export async function ensureReferral(reportId, checkArg = null) {
  const id = clean(reportId, 120);
  if (!id) return null;
  const refs = referralStore();

  const existing = await refs.get(`idx:${id}`, { type: "json" }).catch(() => null);
  if (existing?.code) return existing.code;

  const check = checkArg ?? (await recordStore(CHECKS_STORE).get(id, { type: "json" }).catch(() => null));
  const name = clean(check?.customerName, 80);
  const phone = clean(check?.phone, 20);
  if (!name || !validPhone(phone)) return null;

  const code = await genCode(refs);
  await refs.setJSON(code, {
    code,
    referrerName: name,
    referrerPhone: phone,
    reportId: id,
    createdAt: new Date().toISOString(),
    friends: [],
  });
  await refs.setJSON(`idx:${id}`, { code });
  return code;
}
