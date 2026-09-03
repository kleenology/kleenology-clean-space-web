// أنواع كتالوج الأسعار كما يصل من الخادم (netlify/lib/pricing-catalogue.mjs)
// الكتالوج لا يوجد في كود الواجهة — يُجلب بعد تسجيل دخول المشرف فقط.

export interface CatalogueItem {
  /** كود خدمة كلينولوجي، مثل KLN-006 */
  code: string;
  label: string;
  /** السعر قبل الخصم كما في القائمة — شامل ضريبة القيمة المضافة */
  price: number;
  /** عمود "الوقت المتوقع" كما ورد في القائمة (للاطلاع فقط) */
  time: string;
  /** بند بسعر ثابت لا يدخل في خصم العرض */
  noDiscount?: boolean;
  note?: string;
}

export interface CatalogueGroup {
  name: string;
  /** package: باقة أساسية | addon: بند إضافي */
  kind: "package" | "addon";
  items: CatalogueItem[];
}

export interface Catalogue {
  version: string;
  vatRate: number;
  pricesIncludeVat: boolean;
  /** خصم ثابت يُطبَّق على كل عرض */
  discountPercent: number;
  depositPercent: number;
  groups: CatalogueGroup[];
}

/** بند مختار في عرض السعر */
export interface SelectedItem {
  code: string;
  qty: number;
}

export interface QuoteInput {
  items: SelectedItem[];
}

export interface QuoteLine {
  code: string;
  group: string;
  label: string;
  unitPrice: number;
  qty: number;
  amount: number;
  time: string;
  noDiscount: boolean;
}

export interface QuoteResult {
  lines: QuoteLine[];
  /** مجموع أسعار القائمة قبل الخصم (شامل الضريبة) */
  listTotal: number;
  /** الجزء الذي يسري عليه الخصم */
  discountableTotal: number;
  /** الجزء ذو السعر الثابت الذي لا يسري عليه الخصم */
  fixedTotal: number;
  discountAmount: number;
  /** المبلغ الذي يدفعه العميل فعلاً — شامل الضريبة */
  total: number;
  /** الصافي بعد استخراج الضريبة من داخل المبلغ */
  netBeforeVat: number;
  vatAmount: number;
  deposit: number;
}
