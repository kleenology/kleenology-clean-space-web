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
  defaultDiscountPercent: 30, // الخصم الافتراضي — يقدر المشرف يغيّره لكل عميل
  depositPercent: 0.25,       // نسبة العربون من الإجمالي

  // ——— التكلفة والربحية (داخلي فقط، لا يصل العميل) ———
  cost: {
    // أجر الساعة يُشتق من رواتبك الفعلية بدل رقم ثابت مخمَّن.
    // لو تغيّرت الرواتب أو حجم الفريق، عدّل رقمين هنا وينضبط الحساب كله.
    monthlyPayroll: 6700,     // إجمالي رواتب الفريق شهرياً (ر.س)
    crewSize: 4,              // عدد العمال في الفريق
    workingDaysPerMonth: 26,
    hoursPerDay: 8,

    // نسبة الساعات التي يقضيها العامل فعلاً في المواقع من إجمالي ساعاته
    // المدفوعة. الراتب يُدفع كاملاً سواء كان في موقع أو ينتظر، فقسمة الراتب
    // على الساعات المدفوعة كلها تُظهر التكلفة أقل من حقيقتها. اضبطها من واقع
    // جدول أعمالك: 1.0 = كل ساعة مدفوعة ساعة عمل مُباعة (غير واقعي عملياً).
    utilization: 0.70,

    transport: 80,            // ⚠️ قيمة مبدئية — تحتاج ضبطاً
    suppliesPercent: 0.06,    // ⚠️ قيمة مبدئية — تحتاج ضبطاً
    minMarginPercent: 0.30,   // أقل هامش مقبول قبل ظهور التحذير الأحمر
    defaultWorkers: 4,
  },

  // ——— المجموعات ———
  // kind: "package" باقة أساسية | "addon" بند إضافي
  // price: السعر قبل الخصم كما في القائمة (شامل الضريبة)
  // time: عمود "الوقت المتوقع" كما ورد في القائمة — بعضه وقت عمل وبعضه مدة
  //       تسليم (الكنب والسجاد مثلاً)، فلا يُستخدم لحساب ساعات العمالة تلقائياً.
  groups: [
    {
      name: "استديو",
      kind: "package",
      items: [
        { code: "FAC-005", label: "مؤثث وغير مؤثث", price: 500, time: "1-3 ساعة" },
      ],
    },
    {
      name: "شقة مؤثثة",
      kind: "package",
      items: [
        { code: "FAC-006", label: "غرفتين وصالة", price: 850, time: "1-3 ساعة" },
        { code: "FAC-007", label: "3 غرف وصالة", price: 950, time: "1-3 ساعة" },
        { code: "FAC-008", label: "4 غرف وصالة", price: 1000, time: "1-5 ساعة" },
        { code: "FAC-009", label: "5 غرف وصالة", price: 1200, time: "1-3 ساعة" },
        { code: "FAC-010", label: "6 غرف وصالة", price: 1500, time: "1-3 ساعة" },
      ],
    },
    {
      name: "شقة غير مؤثثة",
      kind: "package",
      items: [
        { code: "FAC-011", label: "غرفتين وصالة", price: 800, time: "1-3 ساعة" },
        { code: "FAC-012", label: "3 غرف وصالة", price: 900, time: "1-3 ساعة" },
        { code: "FAC-013", label: "4 غرف وصالة", price: 1000, time: "1-3 ساعة" },
        { code: "FAC-014", label: "5 غرف وصالة", price: 1200, time: "1-3 ساعة" },
        { code: "FAC-015", label: "6 غرف وصالة", price: 1400, time: "4-8 ساعة" },
      ],
    },
    {
      name: "تنظيف الفيلا المؤثثة",
      kind: "package",
      items: [
        { code: "FAC-032", label: "فيلا مساحة 250م", price: 2300, time: "24-48 ساعة" },
        { code: "FAC-033", label: "فيلا مساحة 300م", price: 3000, time: "24-48 ساعة" },
        { code: "FAC-034", label: "فيلا مساحة 400م", price: 3500, time: "1-3 ساعة" },
        { code: "FAC-035", label: "فيلا مساحة 500م", price: 4000, time: "1-3 ساعة" },
        { code: "FAC-036", label: "فيلا مساحة 600م", price: 4500, time: "1-3 ساعة" },
        { code: "FAC-037", label: "فيلا مساحة 800م", price: 5000, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف الفيلا غير مؤثثة",
      kind: "package",
      items: [
        { code: "FAC-038", label: "فيلا مساحة 250م", price: 2000, time: "1-3 ساعة" },
        { code: "FAC-039", label: "فيلا مساحة 300م", price: 2500, time: "1-3 ساعة" },
        { code: "FAC-040", label: "فيلا مساحة 400م", price: 3000, time: "1-3 ساعة" },
        { code: "FAC-041", label: "فيلا مساحة 500م", price: 3500, time: "1-3 ساعة" },
        { code: "FAC-042", label: "فيلا مساحة 600م", price: 4000, time: "1-3 ساعة" },
        { code: "FAC-043", label: "فيلا مساحة 800م", price: 4500, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف مكتب",
      kind: "package",
      items: [
        { code: "FAC-060", label: "مكتب غير مؤثث 50م", price: 500, time: "1-3 ساعة" },
        { code: "FAC-061", label: "مكتب غير مؤثث 100م", price: 700, time: "1-3 ساعة" },
        { code: "FAC-062", label: "مكتب غير مؤثث 150م", price: 900, time: "1-3 ساعة" },
        { code: "FAC-063", label: "مكتب مؤثث 50م", price: 700, time: "1-3 ساعة" },
        { code: "FAC-064", label: "مكتب مؤثث 100م", price: 1000, time: "1-3 ساعة" },
        { code: "FAC-065", label: "مكتب 150م مؤثث", price: 1300, time: "1-3 ساعة" },
      ],
    },
    {
      name: "مكافحة حشرات",
      kind: "addon",
      items: [
        { code: "FAC-001", label: "شقة", price: 200, time: "1-3 ساعة" },
        { code: "FAC-002", label: "فيلا", price: 500, time: "1-3 ساعة" },
        { code: "FAC-003", label: "حوش صغير", price: 250, time: "1-3 ساعة" },
        { code: "FAC-004", label: "حوش كبير", price: 350, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف الواجهات",
      kind: "addon",
      items: [
        { code: "FAC-016", label: "نافذة صغيرة سهلة الفك", price: 80, time: "4-8 ساعة" },
        { code: "FAC-017", label: "نافذة متوسطة سهلة الفك", price: 120, time: "4-8 ساعة" },
        { code: "FAC-018", label: "نافذة كبيرة سهلة الفك", price: 170, time: "4-8 ساعة" },
        { code: "FAC-019", label: "نافذة صغيرة وصول خارجي", price: 120, time: "4-8 ساعة" },
        { code: "FAC-020", label: "نافذة متوسطة وصول خارجي", price: 200, time: "4-8 ساعة" },
        { code: "FAC-021", label: "نافذة كبيرة وصول خارجي", price: 270, time: "4-8 ساعة" },
      ],
    },
    {
      name: "تنظيف الكنب",
      kind: "addon",
      items: [
        { code: "FAC-022", label: "كنب شخص واحد", price: 35, time: "4-8 ساعة" },
        { code: "FAC-023", label: "كنب 3 اشخاص", price: 105, time: "4-8 ساعة" },
        { code: "FAC-024", label: "كنب 7 اشخاص", price: 245, time: "4-8 ساعة" },
        { code: "FAC-025", label: "كنب 10 اشخاص", price: 300, time: "24-48 ساعة" },
        { code: "FAC-026", label: "كنب 12 شخص", price: 350, time: "24-48 ساعة" },
      ],
    },
    {
      name: "تنظيف الملاحق والاحواش",
      kind: "addon",
      items: [
        { code: "FAC-027", label: "حوش صغير 100 م", price: 200, time: "24-48 ساعة" },
        { code: "FAC-028", label: "حوش 170 م", price: 250, time: "24-48 ساعة" },
        { code: "FAC-029", label: "حوش كبير 250م", price: 300, time: "24-48 ساعة" },
        { code: "FAC-030", label: "ملحق صغير 3*3 م غير مؤثث", price: 300, time: "24-48 ساعة" },
        { code: "FAC-031", label: "ملحق صغير مؤثث", price: 350, time: "24-48 ساعة" },
      ],
    },
    {
      name: "تنظيف المطابخ",
      kind: "addon",
      items: [
        { code: "FAC-044", label: "2*3م", price: 270, time: "1-3 ساعة" },
        { code: "FAC-045", label: "4*3م", price: 300, time: "1-3 ساعة" },
        { code: "FAC-046", label: "4*5م", price: 350, time: "1-3 ساعة" },
        { code: "FAC-047", label: "6*5م", price: 380, time: "1-3 ساعة" },
        { code: "FAC-048", label: "5*3م", price: 420, time: "1-3 ساعة" },
        { code: "FAC-049", label: "4*6م", price: 460, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف السلالم",
      kind: "addon",
      items: [
        { code: "FAC-050", label: "درج دورين", price: 150, time: "1-3 ساعة" },
        { code: "FAC-051", label: "درج ثلاثة ادوار", price: 170, time: "1-3 ساعة" },
        { code: "FAC-052", label: "درج اربعة ادوار", price: 200, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف مكيفات",
      kind: "addon",
      items: [
        { code: "FAC-053", label: "مكيف اسبلت 1", price: 150, time: "1-3 ساعة" },
        { code: "FAC-054", label: "مكيفات اسبلت 3", price: 150, time: "1-3 ساعة" },
        { code: "FAC-055", label: "مكيفات اسبلت 4", price: 160, time: "1-3 ساعة" },
        { code: "FAC-056", label: "مكيفات اسبلت 12", price: 360, time: "1-3 ساعة" },
        { code: "FAC-066", label: "مكيف اضافي", price: 40, time: "1-3 ساعة" },
        { code: "FAC-067", label: "تنظيف مكيفات", price: 149, time: "1-3 ساعة", note: "المكيف بـ150 اثنين بـ150 اكثر من خمسة بـ40 اكثر من عشرة بـ35" },
      ],
    },
    {
      name: "غسيل سجاد",
      kind: "addon",
      items: [
        { code: "FAC-057", label: "سجادة 3*3م", price: 108, time: "1-3 ساعة", note: "المتر بـ12 ريال" },
        { code: "FAC-058", label: "سجادة 4*4م", price: 192, time: "1-3 ساعة", note: "اكثر من عشرين متر المتر بـ10" },
        { code: "FAC-059", label: "سجادة 5*5م", price: 210, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف ستائر بالبخار",
      kind: "addon",
      items: [
        { code: "FAC-068", label: "ستارة 1", price: 80, time: "1-3 ساعة" },
        { code: "FAC-069", label: "ستائر 3", price: 140, time: "1-3 ساعة" },
        { code: "FAC-070", label: "ستائر 5", price: 270, time: "1-3 ساعة" },
        { code: "FAC-071", label: "ستائر 7", price: 490, time: "1-3 ساعة" },
      ],
    },
    {
      name: "التنظيف الجاف للستائر",
      kind: "addon",
      items: [
        { code: "FAC-072", label: "ستارة 1", price: 120, time: "1-3 ساعة" },
        { code: "FAC-073", label: "ستائر 3", price: 210, time: "1-3 ساعة" },
        { code: "FAC-074", label: "ستائر 5", price: 405, time: "1-3 ساعة" },
        { code: "FAC-075", label: "ستائر 7", price: 480, time: "1-3 ساعة" },
      ],
    },
    {
      name: "تنظيف خزانات",
      kind: "addon",
      items: [
        { code: "FAC-076", label: "خزان علوي 5000ك", price: 250, time: "1-4 ساعة" },
        { code: "FAC-077", label: "خزان ارضي صغير", price: 800, time: "1-4 ساعة" },
        { code: "FAC-078", label: "خزان ارضي كبير", price: 1500, time: "1-4 ساعة" },
      ],
    },
  ],
};

export default CATALOGUE;
