import {
  getSecretKey,
  getMode,
  getDepositAmountSar,
  fetchPayment,
  fetchInvoice,
  isMockMode,
  decodeMockId,
  jsonResponse,
} from "../lib/moyasar.mjs";

// يتحقق من حالة الدفع من خادم ميسر مباشرة.
// لا نثق أبداً بحالة الدفع القادمة في رابط العودة لأنها قابلة للتزوير.
export default async (request) => {
  const mock = isMockMode(request);
  const mode = mock ? "mock" : getMode(getSecretKey());
  if (!mode) {
    return jsonResponse({ error: "not_configured" }, 503);
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return jsonResponse({ error: "missing_id" }, 400);
  }

  // محاكاة محلية: نعيد نتيجة ناجحة مصطنعة — لا تعمل إلا على localhost وبدون مفتاح
  if (mock) {
    return jsonResponse({
      mode,
      paid: true,
      status: "paid",
      amountSar: getDepositAmountSar(),
      reference: id,
      booking: decodeMockId(id),
    });
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
    booking: record?.metadata ?? null,
  });
};
