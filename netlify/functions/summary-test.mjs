// إرسال ملخص تجريبي الآن على تليجرام — للإدارة فقط (زر في اللوحة).
// يرسل أرقام الشهر الحالي حتى اللحظة.

import { requireSession, jsonResponse } from "../lib/admin-auth.mjs";
import { notifyEnabled } from "../lib/notify.mjs";
import { sendSummary } from "../lib/summary.mjs";

export default async (request) => {
  if (request.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);
  if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);
  if (!notifyEnabled()) return jsonResponse({ error: "telegram_not_configured" }, 400);

  try {
    await sendSummary(new Date(), " (حتى الآن)");
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("summary test error:", error);
    return jsonResponse({ error: "failed" }, 503);
  }
};
