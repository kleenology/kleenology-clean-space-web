import {
  getSecretKey,
  getMode,
  getDepositAmountSar,
  createInvoice,
  isMockMode,
  encodeMockId,
  jsonResponse,
} from "../lib/moyasar.mjs";

const MAX_FIELD_LENGTH = 200;

function clean(value) {
  return typeof value === "string" ? value.trim().slice(0, MAX_FIELD_LENGTH) : "";
}

export default async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const mock = isMockMode(request);
  const mode = mock ? "mock" : getMode(getSecretKey());
  if (!mode) {
    return jsonResponse({ error: "not_configured" }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_body" }, 400);
  }

  const booking = {
    service: clean(payload.service),
    date: clean(payload.date),
    timeSlot: clean(payload.timeSlot),
    name: clean(payload.name),
    phone: clean(payload.phone),
    neighborhood: clean(payload.neighborhood),
    notes: clean(payload.notes),
  };

  if (!booking.name || !booking.phone || !booking.service) {
    return jsonResponse({ error: "missing_fields" }, 400);
  }

  // المبلغ يُحدَّد من الخادم فقط — لا يُقرأ من العميل إطلاقاً
  const amountSar = getDepositAmountSar();
  const origin = new URL(request.url).origin;

  // محاكاة محلية: نتخطى ميسر ونعود مباشرة لصفحة النتيجة بمعرّف تجريبي
  if (mock) {
    const id = encodeMockId(booking);
    return jsonResponse({
      url: `${origin}/payment/result?id=${encodeURIComponent(id)}`,
      mode,
      amountSar,
    });
  }

  try {
    const invoice = await createInvoice({
      amountSar,
      description: `عربون حجز خدمة تنظيف — ${booking.service} — ${booking.name}`,
      callbackUrl: `${origin}/payment/result`,
      metadata: booking,
    });

    if (!invoice?.url) {
      return jsonResponse({ error: "unexpected_response" }, 502);
    }

    return jsonResponse({ url: invoice.url, mode, amountSar });
  } catch {
    return jsonResponse({ error: "gateway_error" }, 502);
  }
};
