// أنواع كتالوج الأسعار كما يصل من الخادم (netlify/lib/pricing-catalogue.mjs)
// الكتالوج لا يوجد في كود الواجهة — يُجلب بعد تسجيل دخول المشرف فقط.

export interface CatalogueItem {
  /** كود الخدمة في قائمة الأسعار الرسمية، مثل FAC-006 */
  code: string;
  label: string;
  /** السعر قبل الخصم كما في القائمة — شامل ضريبة القيمة المضافة */
  price: number;
  /** عمود "الوقت المتوقع" كما ورد في القائمة (للاطلاع فقط) */
  time: string;
  note?: string;
}

export interface CatalogueGroup {
  name: string;
  /** package: باقة أساسية | addon: بند إضافي */
  kind: "package" | "addon";
  items: CatalogueItem[];
}

export interface CostRates {
  hourlyWagePerWorker: number;
  transport: number;
  suppliesPercent: number;
  minMarginPercent: number;
  defaultWorkers: number;
}

export interface Catalogue {
  version: string;
  vatRate: number;
  pricesIncludeVat: boolean;
  defaultDiscountPercent: number;
  depositPercent: number;
  cost: CostRates;
  groups: CatalogueGroup[];
}

/** بند مختار في عرض السعر */
export interface SelectedItem {
  code: string;
  qty: number;
}

export interface QuoteInput {
  items: SelectedItem[];
  discountType: "percent" | "fixed";
  discountValue: number;
  workers: number;
  hours: number;
}

export interface QuoteLine {
  code: string;
  group: string;
  label: string;
  unitPrice: number;
  qty: number;
  amount: number;
  time: string;
}

export interface QuoteResult {
  lines: QuoteLine[];
  /** مجموع أسعار القائمة قبل الخصم (شامل الضريبة) */
  listTotal: number;
  discountAmount: number;
  /** المبلغ الذي يدفعه العميل فعلاً — شامل الضريبة */
  total: number;
  /** الصافي بعد استخراج الضريبة من داخل المبلغ */
  netBeforeVat: number;
  vatAmount: number;
  deposit: number;
  cost: {
    labor: number;
    transport: number;
    supplies: number;
    total: number;
    profit: number;
    /** هامش الربح كنسبة من الصافي بعد استبعاد الضريبة */
    marginPercent: number;
    belowMinimum: boolean;
  };
}
