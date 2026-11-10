// دالة مجدولة: تُفحَص الحجوزات يومياً وتُرسَل للإدارة على تليجرام —
//  • تذكير بالموعد قبله بيوم (موعد الغد).
//  • رسالة تقييم بعد الخدمة (موعد الأمس).
// كل رسالة تُرسَل مرة واحدة فقط (نعلّم السجل بـ reminderSentAt / reviewSentAt).

import { recordStore, MAX_SEARCH_SCAN } from "../lib/blob-records.mjs";
import { notifyAdmin, notifyEnabled } from "../lib/notify.mjs";
import { reminderMessage, reviewMessage } from "../lib/booking-messages.mjs";

const STORE = "pricing-bookings";

// 6:00 بتوقيت UTC = 9 صباحاً بالرياض، كل يوم
export const config = { schedule: "0 6 * * *" };

// تاريخ اليوم بتوقيت الرياض بصيغة YYYY-MM-DD (يطابق صيغة منتقي التاريخ)
function riyadhDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

export default async () => {
  if (!notifyEnabled()) return new Response("telegram not configured", { status: 200 });

  const store = recordStore(STORE);
  const tomorrow = riyadhDate(1);
  const yesterday = riyadhDate(-1);

  let reminders = 0;
  let reviews = 0;

  try {
    const { blobs } = await store.list();
    const keys = blobs
      .map((e) => e.key)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, MAX_SEARCH_SCAN);

    for (const key of keys) {
      const r = await store.get(key, { type: "json" }).catch(() => null);
      if (!r || !r.date) continue;

      // تذكير: موعده بكرة ولم يُرسَل تذكير بعد
      if (r.date === tomorrow && !r.reminderSentAt) {
        await notifyAdmin(
          `🔔 ذكّر العميل بموعد بكرة — انسخ وأرسل له:\n` +
          `${r.phone ? `(جواله: ${r.phone})\n` : ""}` +
          `——————————\n${reminderMessage(r)}`,
        );
        await store.setJSON(key, { ...r, reminderSentAt: new Date().toISOString() });
        reminders++;
      }

      // تقييم: الخدمة كانت أمس ولم تُرسَل رسالة تقييم بعد
      if (r.date === yesterday && !r.reviewSentAt) {
        await notifyAdmin(
          `⭐ اطلب تقييم العميل — انسخ وأرسل له:\n` +
          `${r.phone ? `(جواله: ${r.phone})\n` : ""}` +
          `——————————\n${reviewMessage(r)}`,
        );
        await store.setJSON(key, { ...r, reviewSentAt: new Date().toISOString() });
        reviews++;
      }
    }
  } catch (error) {
    console.error("booking-reminders error:", error);
    return new Response("error", { status: 500 });
  }

  return new Response(`reminders:${reminders} reviews:${reviews}`, { status: 200 });
};
