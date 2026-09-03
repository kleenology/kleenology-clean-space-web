import type {
  Catalogue,
  CatalogueItem,
  QuoteInput,
  QuoteLine,
  QuoteResult,
} from "./types";

/** تقريب لهللتين — أسعار القائمة فيها كسور مثل 24.5 و104.3 */
const round = (value: number) => Math.round(value * 100) / 100;

/** كل بنود الكتالوج مسطّحة مع اسم مجموعتها */
export function flattenCatalogue(catalogue: Catalogue): (CatalogueItem & { group: string })[] {
  return catalogue.groups.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.name })),
  );
}

export function findItem(catalogue: Catalogue, code: string) {
  return flattenCatalogue(catalogue).find((item) => item.code === code);
}

/**
 * أجر ساعة العامل الواحد، مشتقاً من الرواتب الشهرية الفعلية.
 *
 * القسمة على الساعات المُنتِجة فقط (لا كل الساعات المدفوعة): الراتب يُدفع
 * كاملاً سواء كان العامل في موقع أو ينتظر، فتحميل الساعة المُباعة نصيبها من
 * وقت الانتظار هو ما يعطي تكلفة صادقة.
 */
export function hourlyWage(catalogue: Catalogue): number {
  const c = catalogue.cost;
  // ساعات العمل المُنتِجة التي يشتريها إجمالي الراتب الشهري
  const productiveHours =
    c.crewSize * c.workingDaysPerMonth * c.hoursPerDay * c.utilization;
  if (productiveHours <= 0) return 0;
  return c.monthlyPayroll / productiveHours;
}

/**
 * أسعار القائمة شاملة ضريبة القيمة المضافة، فالضريبة تُستخرج من داخل المبلغ
 * ولا تُضاف فوقه: الصافي = المبلغ ÷ (1 + نسبة الضريبة).
 */
export function calculateQuote(catalogue: Catalogue, input: QuoteInput): QuoteResult {
  const all = flattenCatalogue(catalogue);

  const lines: QuoteLine[] = [];
  for (const selected of input.items) {
    const item = all.find((candidate) => candidate.code === selected.code);
    if (!item || selected.qty <= 0) continue;
    lines.push({
      code: item.code,
      group: item.group,
      label: item.label,
      unitPrice: item.price,
      qty: selected.qty,
      amount: round(item.price * selected.qty),
      time: item.time,
      noDiscount: item.noDiscount === true,
    });
  }

  const listTotal = round(lines.reduce((sum, line) => sum + line.amount, 0));

  // بعض البنود بسعر ثابت لا يسري عليه الخصم، فالخصم يُحسب على ما عداها فقط
  const discountableTotal = round(
    lines.filter((line) => !line.noDiscount).reduce((sum, line) => sum + line.amount, 0),
  );
  const fixedTotal = round(listTotal - discountableTotal);

  const rawDiscount =
    input.discountType === "percent"
      ? discountableTotal * (Math.max(0, input.discountValue) / 100)
      : Math.max(0, input.discountValue);
  const discountAmount = round(Math.min(rawDiscount, discountableTotal));

  // ما يدفعه العميل فعلاً — شامل الضريبة
  const total = round(listTotal - discountAmount);

  const netBeforeVat = catalogue.pricesIncludeVat
    ? round(total / (1 + catalogue.vatRate))
    : total;
  const vatAmount = round(total - netBeforeVat);

  const workers = Math.max(1, input.workers || 1);
  const hours = Math.max(0, input.hours || 0);
  const wage = hourlyWage(catalogue);
  const labor = round(workers * hours * wage);
  const supplies = round(netBeforeVat * catalogue.cost.suppliesPercent);
  const costTotal = round(labor + catalogue.cost.transport + supplies);
  const profit = round(netBeforeVat - costTotal);
  // الضريبة ليست إيراداً للشركة، فالهامش يُحسب على الصافي بعد استبعادها
  const marginPercent = netBeforeVat > 0 ? profit / netBeforeVat : 0;

  return {
    lines,
    listTotal,
    discountableTotal,
    fixedTotal,
    hourlyWage: round(wage),
    discountAmount,
    total,
    netBeforeVat,
    vatAmount,
    deposit: round(total * catalogue.depositPercent),
    cost: {
      labor,
      transport: catalogue.cost.transport,
      supplies,
      total: costTotal,
      profit,
      marginPercent,
      belowMinimum: netBeforeVat > 0 && marginPercent < catalogue.cost.minMarginPercent,
    },
  };
}
