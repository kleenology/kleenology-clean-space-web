import type { Catalogue, QuoteResult } from "./types";

export interface CustomerInfo {
  name: string;
  phone: string;
  neighborhood: string;
  visitDate: string;
  notes: string;
}

const sar = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("en-US")} ر.س`;
};

/**
 * نص عرض السعر المُرسل للعميل.
 * لا يحتوي أي رقم داخلي — لا تكلفة عمالة ولا هامش ربح ولا عدد العمال.
 */
export function buildCustomerQuote(
  catalogue: Catalogue,
  result: QuoteResult,
  customer: CustomerInfo,
  options: { showCodes: boolean } = { showCodes: false },
): string {
  const parts: string[] = [];

  parts.push(`مرحباً${customer.name ? ` ${customer.name}` : ""} 👋`);
  parts.push("هذا عرض السعر من *كلينولوجي* لخدمة التنظيف:\n");

  if (customer.neighborhood) parts.push(`📍 الموقع: ${customer.neighborhood}`);
  if (customer.visitDate) parts.push(`📅 تاريخ الزيارة: ${customer.visitDate}`);
  if (customer.neighborhood || customer.visitDate) parts.push("");

  parts.push("📋 *الخدمات:*");
  for (const line of result.lines) {
    const code = options.showCodes ? ` [${line.code}]` : "";
    const qty = line.qty > 1 ? ` ×${line.qty}` : "";
    parts.push(`  • ${line.group} — ${line.label}${qty}${code}: ${sar(line.amount)}`);
  }

  parts.push("\n💰 *السعر:*");
  if (result.discountAmount > 0) {
    parts.push(`الإجمالي قبل الخصم: ${sar(result.listTotal)}`);
    parts.push(`الخصم: −${sar(result.discountAmount)}`);
  }
  parts.push(`*الإجمالي: ${sar(result.total)}*`);
  parts.push(
    `_شامل ضريبة القيمة المضافة ${Math.round(catalogue.vatRate * 100)}٪ (${sar(result.vatAmount)})_`,
  );
  parts.push(`العربون لتأكيد الحجز: ${sar(result.deposit)}`);

  if (customer.notes) parts.push(`\n📝 ملاحظات: ${customer.notes}`);

  parts.push("\nالعرض ساري لمدة ٧ أيام. جاهزين نبدأ متى ما ناسبك ✨");

  return parts.join("\n");
}

/** ملخص داخلي للمشرف — يشمل التكلفة وهامش الربح */
export function buildInternalSummary(
  catalogue: Catalogue,
  result: QuoteResult,
  customer: CustomerInfo,
  crew: { workers: number; hours: number },
): string {
  const lines: string[] = [];
  lines.push("🔒 ملخص تسعير داخلي — لا يُرسل للعميل");
  lines.push(`الكتالوج: ${catalogue.version}`);
  lines.push(`التاريخ: ${new Date().toLocaleDateString("en-GB")}`);
  lines.push("");
  lines.push(`العميل: ${customer.name || "—"} | ${customer.phone || "—"}`);
  if (customer.neighborhood) lines.push(`الموقع: ${customer.neighborhood}`);
  lines.push("");
  lines.push("— البنود —");
  for (const line of result.lines) {
    lines.push(
      `${line.code} ${line.group} — ${line.label} ×${line.qty} @ ${sar(line.unitPrice)} = ${sar(line.amount)}`,
    );
  }
  lines.push("");
  lines.push(`قبل الخصم: ${sar(result.listTotal)}`);
  lines.push(`الخصم: −${sar(result.discountAmount)}`);
  lines.push(`الإجمالي (شامل الضريبة): ${sar(result.total)}`);
  lines.push(`منه ضريبة: ${sar(result.vatAmount)}`);
  lines.push(`الصافي بعد الضريبة: ${sar(result.netBeforeVat)}`);
  lines.push(`العربون: ${sar(result.deposit)}`);
  lines.push("");
  lines.push("— التكلفة —");
  lines.push(`الطاقم: ${crew.workers} عامل × ${crew.hours} ساعة = ${sar(result.cost.labor)}`);
  lines.push(`النقل: ${sar(result.cost.transport)}`);
  lines.push(`المواد: ${sar(result.cost.supplies)}`);
  lines.push(`إجمالي التكلفة: ${sar(result.cost.total)}`);
  lines.push(
    `الربح: ${sar(result.cost.profit)} (${Math.round(result.cost.marginPercent * 100)}٪ من الصافي)`,
  );

  return lines.join("\n");
}

/** يحوّل رقم الجوال إلى صيغة واتساب الدولية (966...) */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("05")) return `966${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 9) return `966${digits}`;
  return digits;
}
