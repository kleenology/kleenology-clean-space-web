// أنواع جدول الأسعار كما يصل من الخادم (netlify/lib/pricing-rates.mjs)
// الجدول لا يوجد في كود الواجهة — يُجلب بعد تسجيل دخول المشرف فقط.

export interface AreaTier {
  /** الحد الأعلى للشريحة بالمتر المربع، و null يعني الشريحة الأخيرة بلا حد */
  upTo: number | null;
  perSqm: number;
}

export interface PropertyTypeRate {
  label: string;
  base: number;
  floorFee: number;
  areaTiers: AreaTier[];
}

export interface RoomRate {
  key: string;
  label: string;
  price: number;
}

export interface ConditionRate {
  key: string;
  label: string;
  multiplier: number;
}

export interface ServiceTypeRate {
  key: string;
  label: string;
  multiplier: number;
  sqmPerWorkerHour: number;
}

export interface UrgencyRate {
  key: string;
  label: string;
  multiplier: number;
}

export interface ExtraRate {
  key: string;
  label: string;
  price: number;
  unit: string;
}

export interface CostRates {
  hourlyWagePerWorker: number;
  transport: number;
  suppliesPercent: number;
  minMarginPercent: number;
  defaultWorkers: number;
}

export interface PricingRates {
  version: string;
  vatRate: number;
  minCharge: number;
  depositPercent: number;
  propertyTypes: Record<string, PropertyTypeRate>;
  rooms: RoomRate[];
  conditions: ConditionRate[];
  serviceTypes: ServiceTypeRate[];
  urgencies: UrgencyRate[];
  extras: ExtraRate[];
  cost: CostRates;
}

export interface RoomInput {
  key: string;
  qty: number;
  condition: string;
}

export interface ExtraInput {
  key: string;
  qty: number;
}

export interface QuoteInput {
  propertyType: string;
  areaSqm: number;
  floors: number;
  serviceType: string;
  urgency: string;
  rooms: RoomInput[];
  extras: ExtraInput[];
  discountType: "percent" | "fixed";
  discountValue: number;
  workers: number;
  hours: number;
}

export interface LineItem {
  label: string;
  detail?: string;
  amount: number;
}

export interface QuoteResult {
  lines: LineItem[];
  /** مجموع البنود قبل معاملي الخدمة والاستعجال */
  itemsSubtotal: number;
  serviceMultiplier: number;
  urgencyMultiplier: number;
  /** القيمة بعد المعاملات وقبل تطبيق الحد الأدنى */
  beforeMinCharge: number;
  /** هل رُفع السعر إلى الحد الأدنى؟ */
  minChargeApplied: boolean;
  beforeDiscount: number;
  discountAmount: number;
  netBeforeVat: number;
  vatAmount: number;
  total: number;
  deposit: number;
  cost: {
    labor: number;
    transport: number;
    supplies: number;
    total: number;
    profit: number;
    /** هامش الربح كنسبة من صافي السعر قبل الضريبة */
    marginPercent: number;
    belowMinimum: boolean;
  };
  /** عدد الساعات المقترح لطاقم بالحجم المُدخل */
  suggestedHours: number;
}
