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

  const discountAmount = round(discountableTotal * (catalogue.discountPercent / 100));

  // ما يدفعه العميل فعلاً — شامل الضريبة
  const total = round(listTotal - discountAmount);

  const netBeforeVat = catalogue.pricesIncludeVat
    ? round(total / (1 + catalogue.vatRate))
    : total;
  const vatAmount = round(total - netBeforeVat);

  return {
    lines,
    listTotal,
    discountableTotal,
    fixedTotal,
    discountAmount,
    total,
    netBeforeVat,
    vatAmount,
    deposit: round(total * catalogue.depositPercent),
  };
}
