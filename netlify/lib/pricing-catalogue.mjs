// كتالوج أسعار كلينولوجي — "باقات التنظيف لمرة واحدة بمدينة الرياض"
//
// الأسعار هنا هي "السعر قبل الخصم" من قائمة الأسعار الرسمية، وهي **شاملة
// ضريبة القيمة المضافة**. الصفحة تفكّ الضريبة من داخل المبلغ ولا تضيفها فوقه.
//
// لماذا الملف هنا وليس في src/؟ أي ملف داخل src/ يُحزَم مع الموقع العام ويقدر
// أي زائر يقرأه. هذا الملف يبقى على خادم Netlify ولا يُرسل إلا بعد تسجيل دخول
// المشرف.
//
// لتعديل الأسعار: عدّل القيمة ثم ادفع التغيير (git push)، وحدّث version.

export const CATALOGUE = {
  version: "2.0 — قائمة الأسعار الرسمية",

  // ——— القواعد العامة ———
  vatRate: 0.15,              // ضريبة القيمة المضافة (مستخرجة من داخل السعر)
  pricesIncludeVat: true,     // أسعار القائمة شاملة الضريبة
  discountPercent: 15,        // خصم ثابت على كل عرض
  depositPercent: 0.25,       // نسبة العربون من الإجمالي

  // ——— المجموعات ———
  // kind: "package" باقة أساسية | "addon" بند إضافي
  // price: السعر قبل الخصم كما في القائمة (شامل الضريبة)
  // noDiscount: بند بسعر ثابت لا يدخل في خصم العرض إطلاقاً
  // time: عمود "الوقت المتوقع" كما ورد في القائمة (للاطلاع فقط)
  groups: [
    {
      name: "استديو",
      kind: "package",
      items: [
        { code: "KLN-005", label: "غير مؤثث", price: 500, time: "1-3 ساعة" },
        { code: "KLN-081", label: "مؤثث", price: 650, time: "1-3 ساعة" },
      ],
    },
    {
      name: "شقة مؤثثة",
      kind: "package",
      items: [
        { code: "KLN-006", label: "غرفتين وصالة", price: 850, time: "1-3 ساعة" },
        { code: "KLN-007", label: "3 غرف وصالة", price: 950, time: "1-3 ساعة" },
        { code: "KLN-008", label: "4 غرف وصالة", price: 1000, time: "1-5 ساعة" },
        { code: "KLN-009", label: "5 غرف وصالة", price: 1200, time: "1-3 ساعة" },
        { code: "KLN-010", label: "6 غرف وصالة", price: 1500, time: "1-3 ساعة" },
      ],
    },
    {
      name: "شقة غير مؤثثة",
      kind: "package",
      items: [
        { code: "KLN-011", label: "غرفتين وصالة", price: 800, time: "1-3 ساعة" },
        { code: "KLN-012", label: "3 غرف وصالة", price: 900, time: "1-3 ساعة" },
        { code: "KLN-013", label: "4 غرف وصالة", price: 1000, time: "1-3 ساعة" },
        { code: "KLN-014", label: "5 غرف وصالة", price: 1200, time: "1-3 ساعة" },
        { code: "KLN-015", label: "6 غرف وصالة", price: 1400, time: "4-8 ساعة" },
      ],
    },
    {
      name: "تنظيف الفيلا المؤثثة",
      kind: "package",
      items: [
        { code: "KLN-032", label: "فيلا مساحة 250م", price: 2300, time: "24-48 ساعة" },
        { code: "KLN-033", label: "فيلا مساحة 300م", price: 3000, time: "24-48 ساعة" },
        { code: "KLN-034", label: "فيلا مساحة 400م", price: 3500, time: "1-3 ساعة" },
        { code: "KLN-035", label: "فيلا مساحة 500م", price: 4000, time: "1-3 ساعة" },
        { code: "KLN-036", label: "فيلا مساحة 600م", price: 4500, time: "1-3 ساعة" },
        { code: "KLN-037", label: "فيلا مساحة 800م", price: 5000, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف الفيلا غير مؤثثة",
      kind: "package",
      items: [
        { code: "KLN-038", label: "فيلا مساحة 250م", price: 2000, time: "1-3 ساعة" },
        { code: "KLN-039", label: "فيلا مساحة 300م", price: 2500, time: "1-3 ساعة" },
        { code: "KLN-040", label: "فيلا مساحة 400م", price: 3000, time: "1-3 ساعة" },
        { code: "KLN-041", label: "فيلا مساحة 500م", price: 3500, time: "1-3 ساعة" },
        { code: "KLN-042", label: "فيلا مساحة 600م", price: 4000, time: "1-3 ساعة" },
        { code: "KLN-043", label: "فيلا مساحة 800م", price: 4500, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف مكتب",
      kind: "package",
      items: [
        { code: "KLN-060", label: "مكتب غير مؤثث 50م", price: 500, time: "1-3 ساعة" },
        { code: "KLN-061", label: "مكتب غير مؤثث 100م", price: 700, time: "1-3 ساعة" },
        { code: "KLN-062", label: "مكتب غير مؤثث 150م", price: 900, time: "1-3 ساعة" },
        { code: "KLN-063", label: "مكتب مؤثث 50م", price: 700, time: "1-3 ساعة" },
        { code: "KLN-064", label: "مكتب مؤثث 100م", price: 1000, time: "1-3 ساعة" },
        { code: "KLN-065", label: "مكتب 150م مؤثث", price: 1300, time: "1-3 ساعة" },
      ],
    },
    {
      name: "مكافحة حشرات",
      kind: "addon",
      items: [
        { code: "KLN-001", label: "شقة", price: 200, time: "1-3 ساعة" },
        { code: "KLN-002", label: "فيلا", price: 500, time: "1-3 ساعة" },
        { code: "KLN-003", label: "حوش صغير", price: 250, time: "1-3 ساعة" },
        { code: "KLN-004", label: "حوش كبير", price: 350, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف الواجهات",
      kind: "addon",
      items: [
        { code: "KLN-016", label: "نافذة صغيرة سهلة الفك", price: 80, time: "4-8 ساعة" },
        { code: "KLN-017", label: "نافذة متوسطة سهلة الفك", price: 120, time: "4-8 ساعة" },
        { code: "KLN-018", label: "نافذة كبيرة سهلة الفك", price: 170, time: "4-8 ساعة" },
        { code: "KLN-019", label: "نافذة صغيرة وصول خارجي", price: 120, time: "4-8 ساعة" },
        { code: "KLN-020", label: "نافذة متوسطة وصول خارجي", price: 200, time: "4-8 ساعة" },
        { code: "KLN-021", label: "نافذة كبيرة وصول خارجي", price: 270, time: "4-8 ساعة" },
      ],
    },
    {
      name: "تنظيف الكنب",
      kind: "addon",
      items: [
        { code: "KLN-022", label: "كنب شخص واحد", price: 35, time: "4-8 ساعة" },
        { code: "KLN-023", label: "كنب 3 اشخاص", price: 105, time: "4-8 ساعة" },
        { code: "KLN-024", label: "كنب 7 اشخاص", price: 245, time: "4-8 ساعة" },
        { code: "KLN-025", label: "كنب 10 اشخاص", price: 300, time: "24-48 ساعة" },
        { code: "KLN-026", label: "كنب 12 شخص", price: 350, time: "24-48 ساعة" },
      ],
    },
    {
      name: "تنظيف الملاحق والاحواش",
      kind: "addon",
      items: [
        { code: "KLN-027", label: "حوش صغير 100 م", price: 200, time: "24-48 ساعة" },
        { code: "KLN-028", label: "حوش 170 م", price: 250, time: "24-48 ساعة" },
        { code: "KLN-029", label: "حوش كبير 250م", price: 300, time: "24-48 ساعة" },
        { code: "KLN-030", label: "ملحق صغير 3*3 م غير مؤثث", price: 300, time: "24-48 ساعة" },
        { code: "KLN-031", label: "ملحق صغير مؤثث", price: 350, time: "24-48 ساعة" },
      ],
    },
    {
      name: "تنظيف المطابخ",
      kind: "addon",
      items: [
        { code: "KLN-044", label: "2*3م", price: 270, time: "1-3 ساعة" },
        { code: "KLN-045", label: "4*3م", price: 300, time: "1-3 ساعة" },
        { code: "KLN-046", label: "4*5م", price: 350, time: "1-3 ساعة" },
        { code: "KLN-047", label: "6*5م", price: 380, time: "1-3 ساعة" },
        { code: "KLN-048", label: "5*3م", price: 420, time: "1-3 ساعة" },
        { code: "KLN-049", label: "4*6م", price: 460, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف السلالم",
      kind: "addon",
      items: [
        { code: "KLN-050", label: "درج دورين", price: 150, time: "1-3 ساعة" },
        { code: "KLN-051", label: "درج ثلاثة ادوار", price: 170, time: "1-3 ساعة" },
        { code: "KLN-052", label: "درج اربعة ادوار", price: 200, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف مكيفات",
      kind: "addon",
      items: [
        // بند موحّد يحلّ محل التسعيرات القديمة المتضاربة (مكيف واحد وثلاثة
        // بنفس السعر، ومكيف إضافي بـ40، وملاحظة تسعير مخالفة).
        // ثابت 100 ر.س للمكيف الواحد ولا يدخل في خصم العرض.
        { code: "KLN-080", label: "مكيف سبليت — وحدة داخلية + خارجية", price: 100, time: "1-3 ساعة", noDiscount: true },
      ],
    },
    {
      name: "غسيل سجاد",
      kind: "addon",
      items: [
        // سعر ثابت للمتر لا يدخل في خصم العرض. حلّ محل بنود المقاسات القديمة
        // (3*3 و4*4 و5*5) التي كانت تعطي أسعاراً مختلفة للمتر الواحد.
        { code: "KLN-079", label: "سجاد بالمتر", price: 10, time: "1-3 ساعة", noDiscount: true },
      ],
    },
    {
      name: "تنظيف ستائر بالبخار",
      kind: "addon",
      items: [
        { code: "KLN-068", label: "ستارة 1", price: 80, time: "1-3 ساعة" },
        { code: "KLN-069", label: "ستائر 3", price: 140, time: "1-3 ساعة" },
        { code: "KLN-070", label: "ستائر 5", price: 270, time: "1-3 ساعة" },
        { code: "KLN-071", label: "ستائر 7", price: 490, time: "1-3 ساعة" },
      ],
    },
    {
      name: "التنظيف الجاف للستائر",
      kind: "addon",
      items: [
        { code: "KLN-072", label: "ستارة 1", price: 120, time: "1-3 ساعة" },
        { code: "KLN-073", label: "ستائر 3", price: 210, time: "1-3 ساعة" },
        { code: "KLN-074", label: "ستائر 5", price: 405, time: "1-3 ساعة" },
        { code: "KLN-075", label: "ستائر 7", price: 480, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف خزانات",
      kind: "addon",
      items: [
        { code: "KLN-076", label: "خزان علوي 5000ك", price: 250, time: "1-4 ساعة" },
        { code: "KLN-077", label: "خزان ارضي صغير", price: 800, time: "1-4 ساعة" },
        { code: "KLN-078", label: "خزان ارضي كبير", price: 1500, time: "1-4 ساعة" },
      ],
    },
  ],
};

export default CATALOGUE;
