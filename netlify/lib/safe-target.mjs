// حماية من SSRF: قبل ما الخادم يجلب رابطاً أعطاه زائر، نتأكد إن كل عناوين
// الاسم عامة. فحص النص وحده ما يكفي: «[::1]» و«127.0.0.1.nip.io» و«2130706433»
// كلها توصل للجهاز نفسه — وفيه واجهة تشغيل Lambda الداخلية على localhost.

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateV4(ip) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||   // CGNAT
    (a === 169 && b === 254) ||             // link-local + cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224                                 // multicast / reserved
  );
}

function isPrivateV6(ip) {
  const h = ip.toLowerCase();
  if (h === "::" || h === "::1") return true;
  // ::ffff:127.0.0.1 وأشباهها — تحويل IPv4 داخل IPv6
  const mapped = h.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  if (/^::ffff:[0-9a-f]{1,4}:[0-9a-f]{1,4}$/.test(h)) return true;
  return h.startsWith("fe8") || h.startsWith("fe9") || h.startsWith("fea") || h.startsWith("feb")
    || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("ff");
}

export function isPrivateAddress(ip) {
  const v = isIP(ip);
  if (v === 4) return isPrivateV4(ip);
  if (v === 6) return isPrivateV6(ip);
  return true; // غير معروف = مرفوض
}

/** يرجّع سبب الرفض أو null إذا الرابط آمن للجلب */
export async function unsafeTarget(url) {
  if (url.protocol !== "https:" && url.protocol !== "http:") return "only http(s) targets are allowed";
  if (url.username || url.password) return "credentials in url are not allowed";
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) {
    return "target host is not permitted";
  }
  let addresses;
  try {
    addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  } catch {
    return "target host could not be resolved";
  }
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    return "target host is not permitted";
  }
  return null;
}
