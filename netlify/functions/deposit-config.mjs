import {
  getSecretKey,
  getMode,
  getDepositAmountSar,
  isMockMode,
  jsonResponse,
} from "../lib/moyasar.mjs";

// يخبر الواجهة هل خيار العربون مفعّل وبأي وضع (محاكاة / اختبار / حقيقي) وبأي مبلغ
// لا يكشف أي بيانات سرية — فقط الحالة والمبلغ المعلن
export default async (request) => {
  const mode = getMode(getSecretKey());

  if (!mode) {
    // لا يوجد مفتاح: نسمح بالمحاكاة على localhost فقط، وإلا نُخفي الخيار تماماً
    if (isMockMode(request)) {
      return jsonResponse({
        enabled: true,
        mode: "mock",
        amountSar: getDepositAmountSar(),
      });
    }
    return jsonResponse({ enabled: false, mode: null, amountSar: null });
  }

  return jsonResponse({
    enabled: true,
    mode,
    amountSar: getDepositAmountSar(),
  });
};
