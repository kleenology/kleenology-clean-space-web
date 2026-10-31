// تحقق بخطوتين للوحة الإدارة — رمز TOTP من تطبيق مصادقة (Google Authenticator،
// Microsoft Authenticator، أو أي تطبيق متوافق مع RFC 6238).
//
// السر يبقى في متغير بيئة Netlify (PRICING_ADMIN_TOTP_SECRET) ولا يصل المتصفح.
// لا مكتبة خارجية: HMAC-SHA1 من crypto يكفي، فنتجنّب تبعية جديدة فيها ثغرات.

import crypto from "node:crypto";

const STEP_SECONDS = 30;
const DIGITS = 6;
const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** يفكّ ترميز base32 (RFC 4648) — يتجاهل الفراغات والحروف الصغيرة والحشو */
export function base32Decode(input) {
  const clean = String(input ?? "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    value = (value << 5) | B32_ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return Buffer.from(out);
}

function hotp(secretBuf, counter) {
  const buf = Buffer.alloc(8);
  // عدّاد 64-بت big-endian؛ الجزء العالي صفر لعقود قادمة فنكتفي بـ 32-بت المنخفضة
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac("sha1", secretBuf).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 10 ** DIGITS).padStart(DIGITS, "0");
}

/**
 * يتحقق أن الرمز يطابق السر في نافذة زمنية (±window خطوة، الافتراضي خطوة
 * واحدة = ±30 ثانية) لاستيعاب فرق ساعة الجهاز. المقارنة ثابتة الزمن.
 */
export function verifyTotp(secret, token, window = 1) {
  const code = String(token ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const secretBuf = base32Decode(secret);
  if (secretBuf.length === 0) return false;
  const counter = Math.floor(Date.now() / 1000 / STEP_SECONDS);
  for (let i = -window; i <= window; i++) {
    const expected = hotp(secretBuf, counter + i);
    if (expected.length === code.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code))) {
      return true;
    }
  }
  return false;
}

/** سر base32 عشوائي لإعداد التطبيق — يستخدمه scripts/gen-totp.mjs */
export function generateSecret(bytes = 20) {
  const raw = crypto.randomBytes(bytes);
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of raw) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += B32_ALPHABET[(value >>> bits) & 31];
    }
  }
  return out;
}
