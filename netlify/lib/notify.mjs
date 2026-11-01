// تنبيهات لحظية للإدارة عبر تليجرام.
// اختياري بالكامل: إذا لم تُضبط المتغيّرات لا يحدث شيء ولا يتأثر التسجيل.
// الإعداد: أنشئ بوت عبر @BotFather واحصل على TELEGRAM_BOT_TOKEN،
//          ثم أرسل رسالة للبوت واحصل على chat id وضعه في TELEGRAM_CHAT_ID.

const TIMEOUT_MS = 5000;

export function notifyEnabled() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * يرسل رسالة للإدارة على تليجرام. لا يرمي أبداً — فشل التنبيه
 * يجب ألا يُفشل العملية الأساسية (تسجيل شريك، إلخ).
 */
export async function notifyAdmin(text) {
  if (!notifyEnabled()) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      },
    );
    if (!res.ok) {
      console.error("telegram notify failed:", res.status, await res.text().catch(() => ""));
    }
  } catch (error) {
    console.error("telegram notify error:", error?.message || error);
  } finally {
    clearTimeout(timer);
  }
}
