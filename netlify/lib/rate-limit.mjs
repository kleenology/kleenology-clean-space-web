// حد بسيط لعدد الطلبات لكل عنوان IP — داخل الذاكرة، فيبطئ الإغراق الآلي ولا
// يُعتمد عليه وحده (دوال Netlify قد تعمل على أكثر من نسخة).

const buckets = new Map();

/**
 * يرجّع true إذا تجاوز المفتاح الحد في النافذة الزمنية.
 * المفتاح يُبادأ باسم المسار حتى لا تتشارك المسارات نفس العدّاد.
 */
export function rateLimited(key, { max = 15, windowMs = 10 * 60 * 1000 } = {}) {
  const now = Date.now();
  const record = buckets.get(key);
  if (!record || now > record.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  record.count += 1;
  return record.count > max;
}

export function clientIp(request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}
