// توليد سر التحقق بخطوتين للوحة الإدارة. شغّله مرة واحدة على جهازك:
//   node scripts/gen-totp.mjs
// ثم:
//   ١) أضف السر في تطبيق المصادقة (Google/Microsoft Authenticator): «إدخال مفتاح يدوياً»
//      أو امسح الباركود من الرابط otpauth أدناه (ألصقه في أي مولّد QR).
//   ٢) الصق السر في Netlify: Site settings → Environment variables →
//      PRICING_ADMIN_TOTP_SECRET، ثم أعد النشر.
// من حينها يطلب الدخول كلمة المرور + الرمز. لا تحفظ السر في المشروع ولا ترسله لأحد.

import { generateSecret } from "../netlify/lib/totp.mjs";

const secret = generateSecret();
const label = encodeURIComponent("كلينولوجي — لوحة الإدارة");
const issuer = encodeURIComponent("Kleenology");
const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&digits=6&period=30`;

console.log("\n  سر التحقق بخطوتين (PRICING_ADMIN_TOTP_SECRET):\n");
console.log("    " + secret + "\n");
console.log("  رابط الإضافة للتطبيق (otpauth):\n");
console.log("    " + uri + "\n");
console.log("  الخطوات:");
console.log("   ١) أضف السر في تطبيق المصادقة (إدخال مفتاح يدوياً، أو امسح الرابط كـ QR).");
console.log("   ٢) الصقه في Netlify كمتغير PRICING_ADMIN_TOTP_SECRET ثم أعد النشر.");
console.log("   ٣) جرّب الدخول: كلمة المرور ثم الرمز المكوّن من 6 أرقام.\n");
