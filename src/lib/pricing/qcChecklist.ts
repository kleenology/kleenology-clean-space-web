// قائمة فحص الجودة — يعبّيها المشرف بعد انتهاء الشغل وقبل التسليم للعميل.
// البنود ليست سرية (لا أسعار فيها) فتبقى هنا لا على الخادم؛ لتعديلها عدّل
// هذا الملف وانشر.

export type Verdict = "pass" | "redo" | "missed";

export interface ChecklistItem {
  key: string;
  label: string;
}

export interface ChecklistSection {
  key: string;
  title: string;
  items: ChecklistItem[];
}

export const VERDICTS: { key: Verdict; label: string; short: string }[] = [
  { key: "pass", label: "مقبول", short: "✅" },
  { key: "redo", label: "يحتاج إعادة", short: "⚠️" },
  { key: "missed", label: "لم يُنفَّذ", short: "❌" },
];

export const CHECKLIST: ChecklistSection[] = [
  {
    key: "general",
    title: "عام",
    items: [
      { key: "floors", label: "الأرضيات نظيفة وخالية من البقع" },
      { key: "skirting", label: "النعلات والزوايا السفلية" },
      { key: "corners", label: "الأركان والزوايا" },
      { key: "doors", label: "الأبواب والمقابض" },
      { key: "switches", label: "مفاتيح الإنارة والأفياش" },
      { key: "glass", label: "الزجاج والنوافذ من الداخل" },
      { key: "frames", label: "إطارات النوافذ ومجاري الشيش" },
      { key: "ceiling", label: "الأسقف والزوايا العلوية — أتربة وعناكب" },
      { key: "ac", label: "المكيفات وفتحات التهوية" },
      { key: "lights", label: "الإنارة والثريات" },
      { key: "walls", label: "الجدران خالية من البقع والبصمات" },
      { key: "smell", label: "الرائحة العامة للمكان" },
    ],
  },
  {
    key: "kitchen",
    title: "المطبخ",
    items: [
      { key: "counters", label: "الأسطح والرخام" },
      { key: "cabinets", label: "الدواليب من الداخل والخارج" },
      { key: "sink", label: "الحوض والخلاط" },
      { key: "oven", label: "الفرن والبوتاجاز" },
      { key: "hood", label: "الشفاط والفلاتر" },
      { key: "fridge", label: "الثلاجة من الخارج" },
      { key: "bin", label: "سلة النفايات" },
    ],
  },
  {
    key: "bathrooms",
    title: "الحمامات",
    items: [
      { key: "toilet", label: "المرحاض والمقعد" },
      { key: "basin", label: "المغسلة والحنفيات" },
      { key: "mirror", label: "المرآة" },
      { key: "shower", label: "الشطاف والدش" },
      { key: "bathfloor", label: "الأرضيات والصرف" },
      { key: "limescale", label: "إزالة الكلس والترسبات" },
      { key: "bathsmell", label: "الرائحة" },
    ],
  },
  {
    key: "handover",
    title: "التسليم",
    items: [
      { key: "waste", label: "إخراج مخلفات التنظيف من الموقع" },
      { key: "furniture", label: "إعادة الأثاث إلى مكانه" },
      { key: "utilities", label: "إطفاء الإنارة وإغلاق الماء" },
      { key: "keys", label: "تسليم المفاتيح" },
    ],
  },
];

/** كل بنود القائمة مسطّحة مع اسم قسمها */
export function flatChecklist(): (ChecklistItem & { section: string })[] {
  return CHECKLIST.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.title })),
  );
}

export const TOTAL_ITEMS = flatChecklist().length;
