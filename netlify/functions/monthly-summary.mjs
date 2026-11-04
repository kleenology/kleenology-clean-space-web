// ملخص شهري للإدارة على تليجرام — يُرسَل أول كل شهر عن الشهر المنصرم.
// دالة مجدولة (Netlify Scheduled Function)، لا تُستدعى من المتصفح.

import { recordStore } from "../lib/blob-records.mjs";
import { notifyAdmin, notifyEnabled } from "../lib/notify.mjs";
import { REF_STORE } from "../lib/customer-referrals.mjs";

// 6:00 بتوقيت UTC = 9 صباحاً بالرياض، أول كل شهر
export const config = { schedule: "0 6 1 * *" };

function prevMonth(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prefix = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const label = d.toLocaleDateString("ar-SA-u-ca-gregory", { month: "long", year: "numeric" });
  return { prefix, label };
}

// مفاتيح فحوصات الجودة والعملاء المحالين تبدأ بالطابع الزمني، فالعدّ بالبادئة رخيص
async function countByMonth(storeName, prefix) {
  try {
    const { blobs } = await recordStore(storeName).list({ prefix });
    return blobs.length;
  } catch {
    return 0;
  }
}

export default async () => {
  if (!notifyEnabled()) return new Response("notify disabled", { status: 200 });

  const { prefix, label } = prevMonth();

  const qc = await countByMonth("pricing-quality-checks", prefix);
  const leads = await countByMonth("partner-leads", prefix);

  // الإحالات: أكواد جديدة هذا الشهر + أصدقاء حجزوا هذا الشهر
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
  } catch { /* تجاهل — الملخص تكميلي */ }

  // إجمالي الشركاء المعتمدين
  let approvedPartners = 0;
  try {
    const ps = recordStore("partners");
    const { blobs } = await ps.list();
    for (const { key } of blobs) {
      const p = await ps.get(key, { type: "json" }).catch(() => null);
      if (p?.status === "approved") approvedPartners += 1;
    }
  } catch { /* تجاهل */ }

  const msg =
    `📊 ملخص ${label} — كلينولوجي\n\n` +
    `🛡️ فحوصات الجودة: ${qc}\n` +
    `🤝 عملاء محالون من الشركاء: ${leads}\n` +
    `🎁 أكواد إحالة جديدة للعملاء: ${refCodes}\n` +
    `👥 أصدقاء حجزوا عبر الإحالة: ${friends}\n` +
    `✅ شركاء معتمدون (إجمالي): ${approvedPartners}\n\n` +
    `بالتوفيق في الشهر الجديد 🌿`;

  await notifyAdmin(msg);
  return new Response("sent", { status: 200 });
};
