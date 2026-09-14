// قوائم فحص الجودة — يعبّيها المشرف بعد انتهاء الشغل وقبل التسليم للعميل.
// البنود ليست سرية (لا أسعار فيها) فتبقى هنا لا على الخادم؛ لتعديلها عدّل
// هذا الملف وانشر.
//
// لكل نوع تنظيف قائمته: بنود التأهيلي (بوهيات، أسمنت، لواصق) لا علاقة لها
// ببنود تنظيف الأثاث (بقع، تجفيف، رغوة متبقية)، وقائمة واحدة تجمعها كانت
// ستجبر المشرف على تخطّي ثلثها في كل وظيفة.

export type Verdict = "pass" | "redo" | "missed";
export type ServiceKind = "general" | "rehab" | "furniture";

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

export const SERVICE_KINDS: { key: ServiceKind; label: string; desc: string }[] = [
  { key: "general", label: "تنظيف عام", desc: "تنظيف اعتيادي لمنزل أو مكتب مأهول" },
  { key: "rehab", label: "تنظيف تأهيلي", desc: "بعد البناء أو الترميم — بوهيات وأسمنت ولواصق" },
  { key: "furniture", label: "تنظيف أثاث", desc: "كنب ومراتب وسجاد وستائر" },
];

const GENERAL: ChecklistSection[] = [
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

const REHAB: ChecklistSection[] = [
  {
    key: "debris",
    title: "المخلفات والبقايا",
    items: [
      { key: "rubble", label: "إخراج مخلفات البناء والأنقاض" },
      { key: "cement", label: "إزالة بقايا الأسمنت والجبس" },
      { key: "paint", label: "إزالة بقع الدهان (البوهيات) عن الأرضيات" },
      { key: "stickers", label: "إزالة اللواصق والملصقات عن الزجاج والأبواب" },
      { key: "silicone", label: "إزالة بقايا السيليكون والغراء" },
      { key: "dust", label: "إزالة غبار البناء الناعم من كل الأسطح" },
    ],
  },
  {
    key: "surfaces",
    title: "الأرضيات والأسطح",
    items: [
      { key: "grout", label: "الفواصل بين البلاط نظيفة" },
      { key: "polish", label: "تلميع الأرضيات" },
      { key: "skirting", label: "النعلات والوزرات" },
      { key: "walls", label: "الجدران خالية من الرذاذ والبقع" },
      { key: "ceiling", label: "الأسقف والكرانيش" },
      { key: "stairs", label: "الدرج والدرابزين" },
    ],
  },
  {
    key: "openings",
    title: "النوافذ والأبواب",
    items: [
      { key: "glass", label: "الزجاج من الداخل والخارج" },
      { key: "tracks", label: "مجاري الشيش والنوافذ من الأتربة" },
      { key: "frames", label: "إطارات النوافذ والأبواب" },
      { key: "doors", label: "الأبواب والمقابض" },
      { key: "acvents", label: "فتحات التكييف من غبار البناء" },
    ],
  },
  {
    key: "wet",
    title: "الحمامات والمطبخ",
    items: [
      { key: "bathcement", label: "إزالة الأسمنت عن السيراميك والخلاطات" },
      { key: "sanitary", label: "الأطقم الصحية والمغاسل" },
      { key: "cabinets", label: "الدواليب من الداخل من أثر الغبار" },
      { key: "drains", label: "الصرف والبلاعات مفتوحة ونظيفة" },
    ],
  },
  {
    key: "outdoor",
    title: "الخارجي والتسليم",
    items: [
      { key: "yard", label: "الحوش والممرات الخارجية" },
      { key: "facade", label: "الواجهات الخارجية" },
      { key: "waste", label: "إخراج مخلفات التنظيف من الموقع" },
      { key: "utilities", label: "إطفاء الإنارة وإغلاق الماء" },
      { key: "keys", label: "تسليم المفاتيح" },
    ],
  },
];

const FURNITURE: ChecklistSection[] = [
  {
    key: "sofa",
    title: "الكنب والمجالس",
    items: [
      { key: "stains", label: "إزالة البقع الظاهرة" },
      { key: "deep", label: "تنظيف عميق بالبخار أو الرغوة" },
      { key: "cushions", label: "الوسائد من الوجهين" },
      { key: "under", label: "تحت الوسائد والزوايا والأطراف" },
      { key: "wood", label: "الأجزاء الخشبية والأرجل" },
    ],
  },
  {
    key: "mattress",
    title: "المراتب",
    items: [
      { key: "mattop", label: "الوجه العلوي" },
      { key: "matbottom", label: "الوجه السفلي" },
      { key: "matsides", label: "الأطراف والحواف" },
      { key: "matstains", label: "إزالة البقع" },
    ],
  },
  {
    key: "carpet",
    title: "السجاد",
    items: [
      { key: "carpetstains", label: "إزالة البقع" },
      { key: "carpetwash", label: "الغسيل والشطف الكامل" },
      { key: "fringe", label: "الأطراف والهدّاب" },
      { key: "backing", label: "الوجه السفلي" },
    ],
  },
  {
    key: "curtains",
    title: "الستائر والمنسوجات",
    items: [
      { key: "curtainclean", label: "الستائر نظيفة وخالية من الأتربة" },
      { key: "curtainhang", label: "أُعيد تعليقها بشكل صحيح" },
      { key: "chairs", label: "الكراسي والمساند" },
    ],
  },
  {
    key: "finishing",
    title: "الإنهاء والتسليم",
    items: [
      { key: "dry", label: "التجفيف الكامل قبل التسليم" },
      { key: "residue", label: "لا بقايا رغوة أو صابون" },
      { key: "color", label: "لا تغيّر في اللون أو الملمس" },
      { key: "smell", label: "الرائحة بعد التنظيف" },
      { key: "placed", label: "إعادة القطع إلى أماكنها" },
    ],
  },
];

export const CHECKLISTS: Record<ServiceKind, ChecklistSection[]> = {
  general: GENERAL,
  rehab: REHAB,
  furniture: FURNITURE,
};

/** السجلات المحفوظة قبل إضافة الأنواع ليس لها نوع، وكلها كانت عامة */
export const DEFAULT_KIND: ServiceKind = "general";

export function checklistFor(kind: ServiceKind | undefined): ChecklistSection[] {
  return CHECKLISTS[kind ?? DEFAULT_KIND] ?? CHECKLISTS[DEFAULT_KIND];
}

export function kindLabel(kind: ServiceKind | undefined): string {
  return SERVICE_KINDS.find((k) => k.key === (kind ?? DEFAULT_KIND))?.label ?? "تنظيف عام";
}
