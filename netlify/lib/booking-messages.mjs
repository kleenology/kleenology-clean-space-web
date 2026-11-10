// رسائل جاهزة تُرسَل للإدارة على تليجرام لتُنسَخ وتُرسل للعميل على الواتس.
// التذكير يُرسَل قبل الموعد بيوم، ورسالة التقييم بعد الخدمة.

// رابط التقييم المطلوب (غير صفحة /review الداخلية).
const REVIEW_URL = "kleenology.github.io/Feedback/reviews.html";

const line = (emoji, label, value) => (value ? `${emoji} ${label}: ${value}\n` : "");

export function reminderMessage(b) {
  return (
    `تذكير ودّي 🔔 من كلينولوجي\n\n` +
    `مرحباً ${b.customerName || ""}، نذكّرك بموعد خدمتك بكرة:\n\n` +
    line("🗓️", "التاريخ", b.date) +
    line("⏰", "الوقت", b.time) +
    line("📍", "الموقع", b.location) +
    `\nجاهزين نخدمك! لو تحتاج تغيّر الموعد، ردّ على الرسالة.`
  ).trim();
}

export function reviewMessage(b) {
  return (
    `تم إنجاز خدمتك ✅\n\n` +
    `شكراً لثقتك بكلينولوجي يا ${b.customerName || ""}\n` +
    `نتمنى الخدمة نالت رضاك.\n\n` +
    `رأيك يهمنا — قيّمنا في دقيقة:\n${REVIEW_URL}\n\n` +
    `وإذا تبي تحجز مرة ثانية، إحنا جاهزين 💙`
  ).trim();
}
