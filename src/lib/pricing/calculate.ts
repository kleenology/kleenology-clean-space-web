import type {
  AreaTier,
  PricingRates,
  QuoteInput,
  QuoteResult,
  LineItem,
} from "./types";

/** تقريب لأقرب ريال — كل المبالغ المعروضة أعداد صحيحة */
const round = (value: number) => Math.round(value);

/**
 * تكلفة المساحة بشرائح تصاعدية مثل شرائح الضريبة: أول شريحة بسعرها،
 * والزيادة عليها بسعر الشريحة التالية — حتى لا يقفز السعر عند حدود الشرائح.
 */
export function areaCost(areaSqm: number, tiers: AreaTier[]): number {
  let remaining = Math.max(0, areaSqm);
  let previousCap = 0;
  let total = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const cap = tier.upTo ?? Infinity;
    const span = Math.min(remaining, cap - previousCap);
    if (span > 0) {
      total += span * tier.perSqm;
      remaining -= span;
    }
    previousCap = cap;
  }

  return total;
}

/** عدد الساعات المقترح لإنجاز العمل بطاقم بالحجم المُعطى */
export function suggestHours(
  areaSqm: number,
  workers: number,
  sqmPerWorkerHour: number,
): number {
  if (workers <= 0 || sqmPerWorkerHour <= 0) return 0;
  const raw = areaSqm / (workers * sqmPerWorkerHour);
  // نصف ساعة هي أصغر وحدة عملية للجدولة، وبحد أدنى ساعتان لأي زيارة
  return Math.max(2, Math.ceil(raw * 2) / 2);
}

export function calculateQuote(rates: PricingRates, input: QuoteInput): QuoteResult {
  const property = rates.propertyTypes[input.propertyType];
  const service =
    rates.serviceTypes.find((s) => s.key === input.serviceType) ?? rates.serviceTypes[0];
  const urgency =
    rates.urgencies.find((u) => u.key === input.urgency) ?? rates.urgencies[0];

  const lines: LineItem[] = [];
  const area = Math.max(0, input.areaSqm || 0);
  const floors = Math.max(1, input.floors || 1);

  if (property) {
    lines.push({ label: `أساس ${property.label}`, amount: property.base });

    const areaAmount = areaCost(area, property.areaTiers);
    if (areaAmount > 0) {
      lines.push({ label: "المساحة", detail: `${area} م²`, amount: areaAmount });
    }

    const extraFloors = floors - 1;
    if (extraFloors > 0) {
      lines.push({
        label: "الأدوار الإضافية",
        detail: `${extraFloors} × ${property.floorFee} ر.س`,
        amount: extraFloors * property.floorFee,
      });
    }
  }

  for (const room of input.rooms) {
    const rate = rates.rooms.find((r) => r.key === room.key);
    const condition = rates.conditions.find((c) => c.key === room.condition);
    if (!rate || !condition || room.qty <= 0) continue;
    lines.push({
      label: rate.label,
      detail: `${room.qty} × ${rate.price} ر.س — ${condition.label}`,
      amount: rate.price * room.qty * condition.multiplier,
    });
  }

  for (const extra of input.extras) {
    const rate = rates.extras.find((e) => e.key === extra.key);
    if (!rate || extra.qty <= 0) continue;
    lines.push({
      label: rate.label,
      detail: `${extra.qty} ${rate.unit} × ${rate.price} ر.س`,
      amount: rate.price * extra.qty,
    });
  }

  const itemsSubtotal = lines.reduce((sum, line) => sum + line.amount, 0);

  const serviceMultiplier = service?.multiplier ?? 1;
  const urgencyMultiplier = urgency?.multiplier ?? 1;
  const beforeMinCharge = itemsSubtotal * serviceMultiplier * urgencyMultiplier;

  // الحد الأدنى يُطبَّق على قيمة العمل نفسها، والخصم يأتي بعده — حتى يبقى
  // بيد المشرف أن ينزل تحت الحد الأدنى بخصم مقصود ومرئي في التفصيل.
  const minChargeApplied = beforeMinCharge > 0 && beforeMinCharge < rates.minCharge;
  const beforeDiscount = minChargeApplied ? rates.minCharge : beforeMinCharge;

  const rawDiscount =
    input.discountType === "percent"
      ? beforeDiscount * (Math.max(0, input.discountValue) / 100)
      : Math.max(0, input.discountValue);
  const discountAmount = Math.min(rawDiscount, beforeDiscount);

  const netBeforeVat = beforeDiscount - discountAmount;
  const vatAmount = netBeforeVat * rates.vatRate;
  const total = netBeforeVat + vatAmount;

  const workers = Math.max(1, input.workers || 1);
  const hours = Math.max(0, input.hours || 0);
  const labor = workers * hours * rates.cost.hourlyWagePerWorker;
  const supplies = netBeforeVat * rates.cost.suppliesPercent;
  const costTotal = labor + rates.cost.transport + supplies;
  const profit = netBeforeVat - costTotal;
  // الضريبة ليست إيراداً للشركة، فالهامش يُحسب على الصافي قبلها
  const marginPercent = netBeforeVat > 0 ? profit / netBeforeVat : 0;

  return {
    lines: lines.map((line) => ({ ...line, amount: round(line.amount) })),
    itemsSubtotal: round(itemsSubtotal),
    serviceMultiplier,
    urgencyMultiplier,
    beforeMinCharge: round(beforeMinCharge),
    minChargeApplied,
    beforeDiscount: round(beforeDiscount),
    discountAmount: round(discountAmount),
    netBeforeVat: round(netBeforeVat),
    vatAmount: round(vatAmount),
    total: round(total),
    deposit: round(total * rates.depositPercent),
    cost: {
      labor: round(labor),
      transport: round(rates.cost.transport),
      supplies: round(supplies),
      total: round(costTotal),
      profit: round(profit),
      marginPercent,
      belowMinimum: netBeforeVat > 0 && marginPercent < rates.cost.minMarginPercent,
    },
    suggestedHours: suggestHours(area, workers, service?.sqmPerWorkerHour ?? 0),
  };
}
