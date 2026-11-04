// ملخص شهري للإدارة على تليجرام — يُرسَل أول كل شهر عن الشهر المنصرم.
// دالة مجدولة (Netlify Scheduled Function)، لا تُستدعى من المتصفح.

import { sendSummary } from "../lib/summary.mjs";

// 6:00 بتوقيت UTC = 9 صباحاً بالرياض، أول كل شهر
export const config = { schedule: "0 6 1 * *" };

export default async () => {
  // الشهر المنصرم: نرجع ليوم في الشهر السابق
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  await sendSummary(prev);
  return new Response("sent", { status: 200 });
};
