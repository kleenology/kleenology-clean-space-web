import type { PricingRates, QuoteInput, QuoteResult } from "./types";

export interface CustomerInfo {
  name: string;
  phone: string;
  neighborhood: string;
  visitDate: string;
  notes: string;
}

const sar = (value: number) => `${value.toLocaleString("en-US")} ر.س`;

/**
 * نص عرض السعر المُرسل للعميل.
 * لا يحتوي أي رقم داخلي — لا تكلفة عمالة ولا هامش ربح ولا عدد العمال.
 */
export function buildCustomerQuote(
  rates: PricingRates,
  input: QuoteInput,
  result: QuoteResult,
  customer: CustomerInfo,
  options: { itemized: boolean } = { itemized: true },
): string {
  const property = rates.propertyTypes[input.propertyType];
  const service = rates.serviceTypes.find((s) => s.key === input.serviceType);
  const urgency = rates.urgencies.find((u) => u.key === input.urgency);

  const parts: string[] = [];

  parts.push(`مرحباً${customer.name ? ` ${customer.name}` : ""} 👋`);
  parts.push("هذا عرض السعر من *كلينولوجي* لخدمة التنظيف:\n");

  parts.push("🏠 *تفاصيل المكان:*");
  if (property) parts.push(`النوع: ${property.label}`);
  if (input.areaSqm > 0) parts.push(`المساحة: ${input.areaSqm} م²`);
  if (input.floors > 1) parts.push(`عدد الأدوار: ${input.floors}`);
  if (service) parts.push(`الخدمة: ${service.label}`);
  if (urgency && urgency.multiplier !== 1) parts.push(`الموعد: ${urgency.label}`);
  if (customer.neighborhood) parts.push(`الموقع: ${customer.neighborhood}`);
  if (customer.visitDate) parts.push(`تاريخ الزيارة: ${customer.visitDate}`);

  if (options.itemized && result.lines.length > 0) {
    parts.push("\n📋 *تفصيل الخدمة:*");
    for (const line of result.lines) {
      parts.push(`  • ${line.label}${line.detail ? ` (${line.detail})` : ""}`);
    }
  }

  parts.push("\n💰 *السعر:*");
  parts.push(`الإجمالي قبل الضريبة: ${sar(result.beforeDiscount)}`);
  if (result.discountAmount > 0) {
    parts.push(`الخصم: −${sar(result.discountAmount)}`);
    parts.push(`بعد الخصم: ${sar(result.netBeforeVat)}`);
  }
  parts.push(`ضريبة القيمة المضافة (${Math.round(rates.vatRate * 100)}٪): ${sar(result.vatAmount)}`);
  parts.push(`*الإجمالي النهائي: ${sar(result.total)}*`);
  parts.push(`العربون لتأكيد الحجز: ${sar(result.deposit)}`);

  if (customer.notes) parts.push(`\n📝 ملاحظات: ${customer.notes}`);

  parts.push("\nالعرض ساري لمدة ٧ أيام. جاهزين نبدأ متى ما ناسبك ✨");

  return parts.join("\n");
}

/** ملخص داخلي للمشرف — يشمل التكلفة وهامش الربح */
export function buildInternalSummary(
  rates: PricingRates,
  input: QuoteInput,
  result: QuoteResult,
  customer: CustomerInfo,
): string {
  const property = rates.propertyTypes[input.propertyType];
  const service = rates.serviceTypes.find((s) => s.key === input.serviceType);

  const lines: string[] = [];
  lines.push("🔒 ملخص تسعير داخلي — لا يُرسل للعميل");
  lines.push(`التسعيرة: ${rates.version}`);
  lines.push(`التاريخ: ${new Date().toLocaleDateString("en-GB")}`);
  lines.push("");
  lines.push(`العميل: ${customer.name || "—"} | ${customer.phone || "—"}`);
  lines.push(`المكان: ${property?.label ?? "—"} — ${input.areaSqm} م² — ${input.floors} دور`);
  lines.push(`الخدمة: ${service?.label ?? "—"}`);
  lines.push("");
  lines.push("— البنود —");
  for (const line of result.lines) {
    lines.push(`${line.label}${line.detail ? ` (${line.detail})` : ""}: ${sar(line.amount)}`);
  }
  lines.push("");
  lines.push(`مجموع البنود: ${sar(result.itemsSubtotal)}`);
  lines.push(`معامل الخدمة: ×${result.serviceMultiplier}`);
  lines.push(`معامل الاستعجال: ×${result.urgencyMultiplier}`);
  if (result.minChargeApplied) lines.push(`رُفع للحد الأدنى: ${sar(rates.minCharge)}`);
  if (result.discountAmount > 0) lines.push(`الخصم: −${sar(result.discountAmount)}`);
  lines.push(`الصافي قبل الضريبة: ${sar(result.netBeforeVat)}`);
  lines.push(`الضريبة: ${sar(result.vatAmount)}`);
  lines.push(`الإجمالي: ${sar(result.total)}`);
  lines.push(`العربون: ${sar(result.deposit)}`);
  lines.push("");
  lines.push("— التكلفة —");
  lines.push(`الطاقم: ${input.workers} عامل × ${input.hours} ساعة = ${sar(result.cost.labor)}`);
  lines.push(`النقل: ${sar(result.cost.transport)}`);
  lines.push(`المواد: ${sar(result.cost.supplies)}`);
  lines.push(`إجمالي التكلفة: ${sar(result.cost.total)}`);
  lines.push(`الربح: ${sar(result.cost.profit)} (${Math.round(result.cost.marginPercent * 100)}٪)`);

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
