import {
  getSecretKey,
  getMode,
  fetchPayment,
  fetchInvoice,
  jsonResponse,
} from "../lib/moyasar.mjs";

// نقطة النهاية هذه بلا مصادقة: أي شخص يملك رقم العملية يستطيع استدعاءها،
// ورقم العملية يظهر في شريط العنوان فتلتقطه أدوات التحليلات.
// لذلك لا نعيد رقم الجوال ولا الملاحظات إطلاقاً — وهي أخطر ما في الحجز.
const PUBLIC_BOOKING_FIELDS = ["service", "date", "timeSlot", "name", "neighborhood"];

function publicBooking(metadata) {
  if (!metadata || typeof metadata !== "object") return null;
  const out = {};
  for (const key of PUBLIC_BOOKING_FIELDS) {
    const value = metadata[key];
    if (typeof value === "string" && value) out[key] = value;
  }
  return Object.keys(out).length ? out : null;
}

// يتحقق من حالة الدفع من خادم ميسر مباشرة.
// لا نثق أبداً بحالة الدفع القادمة في رابط العودة لأنها قابلة للتزوير.
export default async (request) => {
  const mode = getMode(getSecretKey());
  if (!mode) {
    return jsonResponse({ error: "not_configured" }, 503);
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return jsonResponse({ error: "missing_id" }, 400);
  }

  let record = null;
  try {
    record = await fetchPayment(id);
  } catch {
    try {
      const invoice = await fetchInvoice(id);
      record = invoice?.payments?.find((p) => p.status === "paid") || invoice;
    } catch {
      return jsonResponse({ error: "not_found" }, 404);
    }
  }

  const paid = record?.status === "paid";

  return jsonResponse({
    mode,
    paid,
    status: record?.status ?? "unknown",
    amountSar: typeof record?.amount === "number" ? record.amount / 100 : null,
    reference: record?.id ?? id,
    booking: publicBooking(record?.metadata),
  });
};
