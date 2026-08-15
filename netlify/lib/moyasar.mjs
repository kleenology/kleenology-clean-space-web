// أدوات مشتركة للتعامل مع بوابة ميسر (Moyasar)
// المفتاح السري يبقى في بيئة Netlify ولا يصل المتصفح إطلاقاً

const API_BASE = "https://api.moyasar.com/v1";

export const DEFAULT_DEPOSIT_SAR = 100;

export function getSecretKey() {
  return process.env.MOYASAR_SECRET_KEY || "";
}

// وضع البوابة مشتق من بادئة المفتاح نفسه — لا يمكن تزويره من العميل
export function getMode(secretKey = getSecretKey()) {
  if (secretKey.startsWith("sk_test_")) return "test";
  if (secretKey.startsWith("sk_live_")) return "live";
  return null;
}

// وضع المحاكاة للتجربة المحلية فقط: يعمل حصراً عندما يكون الطلب قادماً من localhost
// ولا يوجد مفتاح ميسر. لا يمكن تفعيله على النطاق الحقيقي إطلاقاً لأن الشرط هو المضيف نفسه.
const PREVIEW_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function isPreviewHost(request) {
  try {
    return PREVIEW_HOSTS.has(new URL(request.url).hostname);
  } catch {
    return false;
  }
}

export function isMockMode(request) {
  return !getSecretKey() && isPreviewHost(request);
}

const MOCK_PREFIX = "mock_";

export function encodeMockId(booking) {
  return MOCK_PREFIX + Buffer.from(JSON.stringify(booking)).toString("base64url");
}

export function decodeMockId(id) {
  if (typeof id !== "string" || !id.startsWith(MOCK_PREFIX)) return null;
  try {
    return JSON.parse(
      Buffer.from(id.slice(MOCK_PREFIX.length), "base64url").toString("utf8")
    );
  } catch {
    return null;
  }
}

export function getDepositAmountSar() {
  const raw = Number(process.env.DEPOSIT_AMOUNT_SAR);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_DEPOSIT_SAR;
}

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function moyasarRequest(path, { method = "GET", body } = {}) {
  const secretKey = getSecretKey();
  if (!secretKey) throw new Error("missing MOYASAR_SECRET_KEY");

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      // ميسر يستخدم Basic Auth بالمفتاح السري كاسم مستخدم وكلمة مرور فارغة
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || `moyasar request failed: ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export function createInvoice({ amountSar, description, callbackUrl, metadata }) {
  return moyasarRequest("/invoices", {
    method: "POST",
    body: {
      amount: Math.round(amountSar * 100), // المبلغ بالهللات
      currency: "SAR",
      description,
      callback_url: callbackUrl,
      metadata,
    },
  });
}

export function fetchPayment(id) {
  return moyasarRequest(`/payments/${encodeURIComponent(id)}`);
}

export function fetchInvoice(id) {
  return moyasarRequest(`/invoices/${encodeURIComponent(id)}`);
}
