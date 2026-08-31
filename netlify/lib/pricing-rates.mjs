// جدول أسعار التسعير الداخلي — يقرأه المشرف فقط بعد تسجيل الدخول
//
// لماذا الجدول هنا وليس في كود الواجهة؟
// أي ملف داخل src/ يُحزَم مع الموقع العام ويقدر أي زائر يقرأه. هذا الملف يبقى
// على خادم Netlify ولا يُرسل إلا بعد التحقق من كلمة مرور المشرف.
//
// لتعديل الأسعار: عدّل القيم هنا ثم انشر الموقع (git push). حدّث كذلك حقل
// version حتى يعرف المشرف أن التسعيرة اللي بين يديه هي الأحدث.

export const RATES = {
  version: "1.0 — 2026-08-31",

  // ——— القواعد العامة ———
  vatRate: 0.15,        // ضريبة القيمة المضافة
  minCharge: 350,       // الحد الأدنى لقيمة أي عملية (قبل الخصم والضريبة)
  depositPercent: 0.25, // نسبة العربون من الإجمالي النهائي

  // ——— أنواع العقارات ———
  // areaTiers شرائح تصاعدية مثل شرائح الضريبة: أول 200 م² بسعر، والزيادة بسعر أقل.
  // upTo: null تعني الشريحة الأخيرة (بلا حد أعلى).
  propertyTypes: {
    villa: {
      label: "فيلا / دوبلكس",
      base: 600,
      floorFee: 250, // يُضاف عن كل دور بعد الدور الأول
      areaTiers: [
        { upTo: 200,  perSqm: 4.5 },
        { upTo: 400,  perSqm: 3.5 },
        { upTo: 700,  perSqm: 2.8 },
        { upTo: null, perSqm: 2.2 },
      ],
    },
    apartment: {
      label: "دور / شقة",
      base: 300,
      floorFee: 150,
      areaTiers: [
        { upTo: 120,  perSqm: 5.0 },
        { upTo: 250,  perSqm: 4.0 },
        { upTo: null, perSqm: 3.0 },
      ],
    },
    office: {
      label: "مكتب / محل تجاري",
      base: 400,
      floorFee: 200,
      areaTiers: [
        { upTo: 200,  perSqm: 5.5 },
        { upTo: 500,  perSqm: 4.5 },
        { upTo: null, perSqm: 3.5 },
      ],
    },
  },

  // ——— الغرف ———
  // نفس مفاتيح الغرف المستخدمة في صفحة المعاينة الذاتية (/self-inspection)
  rooms: [
    { key: "livingroom", label: "غرفة معيشة",        price: 60  },
    { key: "bedroom",    label: "غرفة نوم",           price: 55  },
    { key: "majlis",     label: "مجلس / صالة",        price: 90  },
    { key: "kitchen",    label: "مطبخ",               price: 120 },
    { key: "bathroom",   label: "حمام / دورة مياه",   price: 90  },
    { key: "dining",     label: "غرفة طعام",          price: 55  },
    { key: "balcony",    label: "شرفة / بلكون",       price: 40  },
    { key: "store",      label: "مخزن / غرفة خادمة",  price: 45  },
    { key: "stairs",     label: "درج",                price: 60  },
  ],

  // معامل حالة الغرفة — يُضرب في سعر الغرفة
  conditions: [
    { key: "clean",  label: "نظيف",            multiplier: 1.0  },
    { key: "medium", label: "متوسط",            multiplier: 1.25 },
    { key: "deep",   label: "يحتاج تنظيف عميق", multiplier: 1.6  },
  ],

  // ——— نوع الخدمة ———
  // sqmPerWorkerHour: إنتاجية العامل الواحد بالمتر المربع في الساعة، تُستخدم
  // لاقتراح عدد الساعات تلقائياً (يقدر المشرف يعدّله يدوياً).
  serviceTypes: [
    { key: "standard", label: "تنظيف عادي",       multiplier: 1.0,  sqmPerWorkerHour: 22 },
    { key: "deep",     label: "تنظيف عميق",        multiplier: 1.35, sqmPerWorkerHour: 12 },
    { key: "moveinout",label: "تسليم / استلام سكن", multiplier: 1.4,  sqmPerWorkerHour: 11 },
    { key: "post",     label: "ما بعد البناء",     multiplier: 1.75, sqmPerWorkerHour: 8  },
  ],

  // ——— الاستعجال ———
  urgencies: [
    { key: "normal",   label: "موعد عادي",   multiplier: 1.0  },
    { key: "nextday",  label: "خلال ٢٤ ساعة", multiplier: 1.1  },
    { key: "sameday",  label: "نفس اليوم",   multiplier: 1.2  },
  ],

  // ——— الإضافات ———
  // unit: وحدة القياس التي تُضرب في الكمية
  extras: [
    { key: "ac_split",     label: "مكيف سبليت",        price: 80,  unit: "وحدة" },
    { key: "ac_window",    label: "مكيف شباك",          price: 60,  unit: "وحدة" },
    { key: "sofa_seat",    label: "كنب (لكل مقعد)",     price: 35,  unit: "مقعد" },
    { key: "mattress",     label: "مرتبة",              price: 60,  unit: "مرتبة" },
    { key: "curtain",      label: "ستارة",              price: 45,  unit: "ستارة" },
    { key: "carpet_sqm",   label: "سجاد",               price: 12,  unit: "م²" },
    { key: "glass_sqm",    label: "واجهة زجاج",         price: 15,  unit: "م²" },
    { key: "yard_sqm",     label: "حوش / فناء خارجي",   price: 3,   unit: "م²" },
    { key: "water_tank",   label: "خزان مياه",          price: 350, unit: "خزان" },
    { key: "pool",         label: "مسبح",               price: 400, unit: "مسبح" },
  ],

  // ——— التكلفة والربحية (تظهر للمشرف فقط ولا تُرسل للعميل) ———
  cost: {
    hourlyWagePerWorker: 28,  // تكلفة ساعة العامل الواحد بالريال
    transport: 80,            // تكلفة النقل للموقع
    suppliesPercent: 0.06,    // المواد والمستهلكات كنسبة من صافي السعر
    minMarginPercent: 0.30,   // أقل هامش ربح مقبول — تحته يظهر تحذير
    defaultWorkers: 3,
  },
};

export default RATES;
