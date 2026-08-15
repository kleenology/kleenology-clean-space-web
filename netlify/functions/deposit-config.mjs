import {
  getSecretKey,
  getMode,
  getDepositAmountSar,
  jsonResponse,
} from "../lib/moyasar.mjs";

// يخبر الواجهة هل خيار العربون مفعّل وبأي وضع (اختبار / حقيقي) وبأي مبلغ
// لا يكشف أي بيانات سرية — فقط الحالة والمبلغ المعلن
export default async () => {
  const mode = getMode(getSecretKey());

  if (!mode) {
    return jsonResponse({ enabled: false, mode: null, amountSar: null });
  }

  return jsonResponse({
    enabled: true,
    mode,
    amountSar: getDepositAmountSar(),
  });
};
