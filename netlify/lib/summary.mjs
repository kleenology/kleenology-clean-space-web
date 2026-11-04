// بناء ملخص الأعمال وإرساله على تليجرام — يستخدمه الملخص الشهري المجدول
// وزر «أرسل ملخص الآن» في اللوحة.

import { recordStore } from "./blob-records.mjs";
import { notifyAdmin, notifyEnabled } from "./notify.mjs";
import { REF_STORE } from "./customer-referrals.mjs";

export function monthPrefix(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(d) {
  return d.toLocaleDateString("ar-SA-u-ca-gregory", { month: "long", year: "numeric" });
}

async function countByMonth(storeName, prefix) {
  try {
    const { blobs } = await recordStore(storeName).list({ prefix });
    return blobs.length;
  } catch {
    return 0;
  }
}

/** يحسب أرقام شهرٍ بادئته prefix (YYYY-MM) */
export async function computeSummary(prefix) {
  const qc = await countByMonth("pricing-quality-checks", prefix);
  const leads = await countByMonth("partner-leads", prefix);

  let refCodes = 0;
  let friends = 0;
  try {
    const refs = recordStore(REF_STORE);
    const { blobs } = await refs.list();
    for (const { key } of blobs) {
      if (key.startsWith("idx:")) continue;
      const r = await refs.get(key, { type: "json" }).catch(() => null);
      if (!r) continue;
      if (String(r.createdAt ?? "").startsWith(prefix)) refCodes += 1;
      for (const f of r.friends ?? []) {
        if (String(f.at ?? "").startsWith(prefix)) friends += 1;
      }
    }
  } catch { /* الملخص تكميلي */ }

  let approvedPartners = 0;
  try {
    const ps = recordStore("partners");
    const { blobs } = await ps.list();
    for (const { key } of blobs) {
      const p = await ps.get(key, { type: "json" }).catch(() => null);
      if (p?.status === "approved") approvedPartners += 1;
    }
  } catch { /* تجاهل */ }

  return { qc, leads, refCodes, friends, approvedPartners };
}

export function formatSummary(label, s, suffix = "") {
  return (
    `📊 ملخص ${label}${suffix} — كلينولوجي\n\n` +
    `🛡️ فحوصات الجودة: ${s.qc}\n` +
    `🤝 عملاء محالون من الشركاء: ${s.leads}\n` +
    `🎁 أكواد إحالة جديدة للعملاء: ${s.refCodes}\n` +
    `👥 أصدقاء حجزوا عبر الإحالة: ${s.friends}\n` +
    `✅ شركاء معتمدون (إجمالي): ${s.approvedPartners}\n\n` +
    `بالتوفيق 🌿`
  );
}

/** يبني ويرسل ملخص الشهر المحدّد؛ يرجّع true إن أُرسل */
export async function sendSummary(date, suffix = "") {
  if (!notifyEnabled()) return false;
  const prefix = monthPrefix(date);
  const s = await computeSummary(prefix);
  await notifyAdmin(formatSummary(monthLabel(date), s, suffix));
  return true;
}
