// تحقق دخول مشرف التسعير — كلمة المرور تبقى في متغيرات بيئة Netlify
// ولا تصل المتصفح إطلاقاً. المتصفح يستلم توكناً موقّعاً محدود الصلاحية فقط.

import crypto from "node:crypto";

const SESSION_HOURS = 12;
const MAX_ATTEMPTS = 8;          // محاولات فاشلة مسموحة لكل عنوان IP
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

// عدّاد محاولات مؤقت داخل الذاكرة — يبطئ التخمين الآلي ولا يُعتمد عليه وحده،
// فدوال Netlify قد تعمل على أكثر من نسخة. الحماية الحقيقية كلمة مرور قوية.
const attempts = new Map();

export function getAdminPassword() {
  return process.env.PRICING_ADMIN_PASSWORD || "";
}

export function isConfigured() {
  return getAdminPassword().length > 0;
}

// سر التوقيع: متغير مستقل إن وُجد، وإلا يُشتق من كلمة المرور نفسها.
// الاشتقاق يعني أن تغيير كلمة المرور يُبطل كل الجلسات القائمة — وهذا مطلوب.
function signingSecret() {
  const explicit = process.env.PRICING_ADMIN_SECRET;
  if (explicit) return explicit;
  return crypto.createHash("sha256").update(`kleenology:${getAdminPassword()}`).digest("hex");
}

function sign(data) {
  return crypto.createHmac("sha256", signingSecret()).update(data).digest("base64url");
}

// مقارنة ثابتة الزمن حتى لا يكشف زمن الرد أي جزء من القيمة الصحيحة
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkPassword(candidate) {
  const expected = getAdminPassword();
  if (!expected || typeof candidate !== "string") return false;
  return safeEqual(candidate, expected);
}

export function createToken() {
  const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp: expiresAt })).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, expiresAt };
}

// يرجّع تاريخ الانتهاء إن كان التوكن صحيحاً وغير منتهٍ، وإلا null
export function verifyToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, sign(payload))) return null;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || Date.now() > exp) return null;
    return exp;
  } catch {
    return null;
  }
}

// يقرأ التوكن من ترويسة Authorization: Bearer <token>
export function tokenFromRequest(request) {
  const header = request.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

export function requireSession(request) {
  return verifyToken(tokenFromRequest(request));
}

export function clientKey(request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export function isLockedOut(key) {
  const record = attempts.get(key);
  if (!record) return false;
  if (Date.now() > record.resetAt) {
    attempts.delete(key);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

export function recordFailure(key) {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return;
  }
  record.count += 1;
}

export function clearFailures(key) {
  attempts.delete(key);
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
