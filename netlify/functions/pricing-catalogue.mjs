// كتالوج الأسعار — لا يُسلَّم إلا لجلسة مشرف صالحة
// تستدعيه الصفحة عند إعادة التحميل للتأكد أن الجلسة لا تزال سارية

import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";
import { CATALOGUE } from "../lib/pricing-catalogue.mjs";

export default async (request) => {
  if (request.method !== "GET") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  if (!isConfigured()) {
    return jsonResponse({ error: "not_configured" }, 503);
  }

  const expiresAt = requireSession(request);
  if (!expiresAt) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  return jsonResponse({ expiresAt, catalogue: CATALOGUE });
};
