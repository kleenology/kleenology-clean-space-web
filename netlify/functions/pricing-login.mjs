// تسجيل دخول مشرف التسعير
// يستقبل كلمة المرور، وعند نجاحها يرجّع توكن جلسة موقّع + جدول الأسعار

import {
  isConfigured,
  checkPassword,
  createToken,
  clientKey,
  isLockedOut,
  recordFailure,
  clearFailures,
  jsonResponse,
} from "../lib/admin-auth.mjs";
import { CATALOGUE } from "../lib/pricing-catalogue.mjs";

export default async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  if (!isConfigured()) {
    return jsonResponse({ error: "not_configured" }, 503);
  }

  const key = clientKey(request);
  if (isLockedOut(key)) {
    return jsonResponse({ error: "too_many_attempts" }, 429);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  if (!checkPassword(payload?.password)) {
    recordFailure(key);
    return jsonResponse({ error: "invalid_password" }, 401);
  }

  clearFailures(key);
  const { token, expiresAt } = createToken();
  return jsonResponse({ token, expiresAt, catalogue: CATALOGUE });
};
