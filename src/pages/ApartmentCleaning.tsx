import teamUnit from "@/assets/move-cleaning.jpg";
import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";

// صفحة مخصصة لبحث «تنظيف شقق بالرياض» — قبل هذا كان عندنا مقال مدونة فقط
const ar: ServiceContent = {
  seo: {
    title: "تنظيف شقق بالرياض | قبل السكن وبعد خروج المستأجر | كلينولوجي",
    description: "تنظيف شقق بالرياض: تنظيف شامل قبل السكن، بعد خروج المستأجر، أو تنظيف دوري. فريق بزي موحد ومشرف، مواد آمنة، وضمان الرضا أو نعود مجاناً.",
    keywords: "تنظيف شقق بالرياض, تنظيف شقق, شركة تنظيف شقق الرياض, تنظيف شقة قبل السكن, تنظيف شقق مفروشة, كلينولوجي",
    url: "https://kleenology.me/apartment-cleaning-riyadh",
  },
  hero: {
    title: "تنظيف شقق بالرياض",
    subtitle: "شقة جديدة قبل ما تسكنها، شقة طلع منها مستأجر، أو تنظيف دوري لشقتك: فريقنا يجي بكامل معداته ويسلمك الشقة نظيفة من المطبخ للحمامات للبلكونة.",
    whatsappText: "مرحباً، أبي عرض سعر لتنظيف شقة بالرياض",
  },
  stats: [
    { value: "+690", label: "عميل" },
    { value: "98%", label: "رضا العملاء" },
    { value: "24h", label: "ضمان المراجعة" },
  ],
  includes: {
    title: "وش يشمل تنظيف الشقة؟",
    items: [
      "تنظيف المطبخ: الخزائن من الداخل والخارج والأسطح والمغسلة",
      "تنظيف وتعقيم الحمامات والمغاسل والمرايا",
      "تنظيف الغرف والصالة والممرات",
      "مسح الأبواب والمقابض والإضاءات",
      "تنظيف النوافذ والزجاج من الداخل",
      "كنس ومسح الأرضيات بالكامل",
      "تنظيف البلكونة",
      "إزالة البقع عن الجدران والأسطح",
      "تعقيم أسطح اللمس المتكررة",
      "جمع النفايات والتخلص منها",
    ],
  },
  benefits: [
    { title: "قبل السكن أو بعد المستأجر", desc: "نجهّز الشقة الجديدة للسكن، أو نرجّع الشقة لحالتها قبل ما يدخلها مستأجر جديد." },
    { title: "ضمان الرضا", desc: "إذا ما رضيت عن النتيجة نرجع ونعيد التنظيف مجاناً خلال 24 ساعة." },
    { title: "مواد آمنة", desc: "مواد تنظيف معتمدة وآمنة للأطفال والحيوانات الأليفة." },
  ],
  steps: [
    { num: "١", title: "أرسل التفاصيل", desc: "عدد الغرف والحمامات والحي على الواتس، أو احجز من الموقع." },
    { num: "٢", title: "يوصل الفريق", desc: "في الموعد، بكامل المعدات والمواد. توفّر لنا الماء والكهرباء بس." },
    { num: "٣", title: "تستلم شقتك نظيفة", desc: "تتفقد الشقة معنا، وإذا فيه ملاحظة نعدّلها." },
  ],
  cta: {
    title: "شقتك تحتاج تنظيف؟",
    subtitle: "أرسل لنا عدد الغرف والحي، ونرسل لك عرض السعر على الواتس.",
    whatsappLabel: "اطلب عرض سعر الآن",
    bookLabel: "احجز الآن",
  },
  breadcrumb: "تنظيف شقق بالرياض",
  faq: [
    { q: "كم ياخذ تنظيف الشقة؟", a: "أغلب الشقق تخلص في نفس اليوم. الشقق الكبيرة أو اللي تحتاج تنظيف عميق قد تاخذ يوم كامل حسب الحالة." },
    { q: "هل أحتاج أوفر أدوات أو مواد؟", a: "لا، الفريق يجي بكامل معداته ومواد التنظيف. توفّر الماء والكهرباء بس." },
    { q: "تنظفون الشقق المفروشة والإيجار اليومي؟", a: "إيه، ننظف الشقق المفروشة بين الضيوف، والشقق قبل وبعد المستأجرين." },
    { q: "هل المواد آمنة للأطفال؟", a: "إيه، نستخدم مواد تنظيف معتمدة وآمنة للأطفال والحيوانات الأليفة." },
    { q: "وش لو ما عجبني التنظيف؟", a: "نرجع ونعيد التنظيف مجاناً خلال 24 ساعة." },
    { q: "تخدمون أي أحياء؟", a: "كل أحياء الرياض: الشمال مثل الملقا والنرجس والياسمين، والوسط مثل العليا والملز، والشرق مثل الروضة والربوة، وغيرها." },
  ],
  related: [
    { title: "التنظيف التأهيلي بعد البناء", href: "/post-construction-cleaning" },
    { title: "تنظيف فلل بالرياض", href: "/villa-cleaning-riyadh" },
    { title: "تنظيف سجاد وكنب", href: "/carpet-cleaning" },
  ],
};

const en: ServiceContent = {
  seo: {
    title: "Apartment Cleaning in Riyadh | Move-in & Move-out | Kleenology",
    description: "Apartment cleaning in Riyadh: move-in, move-out and regular cleaning by a uniformed team with a supervisor, safe products and a satisfaction guarantee.",
    keywords: "apartment cleaning riyadh, flat cleaning riyadh, move in cleaning, move out cleaning, kleenology",
    url: "https://kleenology.me/apartment-cleaning-riyadh",
  },
  hero: {
    title: "Apartment Cleaning in Riyadh",
    subtitle: "A new apartment before you move in, a unit after a tenant leaves, or regular cleaning — our team brings everything and hands it back spotless, kitchen to balcony.",
    whatsappText: "Hello, I'd like a quote for apartment cleaning in Riyadh",
  },
  stats: [
    { value: "690+", label: "clients" },
    { value: "98%", label: "satisfaction" },
    { value: "24h", label: "re-clean guarantee" },
  ],
  includes: {
    title: "What's included",
    items: [
      "Kitchen: cabinets inside and out, counters and sink",
      "Bathrooms, sinks and mirrors cleaned and disinfected",
      "Bedrooms, living room and hallways",
      "Doors, handles and light switches",
      "Windows and glass (inside)",
      "All floors vacuumed and mopped",
      "Balcony",
      "Stains removed from walls and surfaces",
      "High-touch surfaces disinfected",
      "Rubbish collected and removed",
    ],
  },
  benefits: [
    { title: "Move-in or move-out", desc: "We prepare new apartments for living, or reset units between tenants." },
    { title: "Satisfaction guarantee", desc: "Not happy? We come back and re-clean free within 24 hours." },
    { title: "Safe products", desc: "Certified products that are safe for children and pets." },
  ],
  steps: [
    { num: "1", title: "Send the details", desc: "Rooms, bathrooms and neighborhood on WhatsApp, or book online." },
    { num: "2", title: "The team arrives", desc: "On time with all equipment and products. You provide water and power." },
    { num: "3", title: "Walk through together", desc: "Check the apartment with us; anything missed, we fix." },
  ],
  cta: {
    title: "Need your apartment cleaned?",
    subtitle: "Send us the number of rooms and the area and we'll quote on WhatsApp.",
    whatsappLabel: "Get a quote",
    bookLabel: "Book now",
  },
  breadcrumb: "Apartment Cleaning in Riyadh",
  related: [
    { title: "Post-construction cleaning", href: "/post-construction-cleaning" },
    { title: "Villa Cleaning in Riyadh", href: "/villa-cleaning-riyadh" },
    { title: "Carpet & sofa cleaning", href: "/carpet-cleaning" },
  ],
};

const ApartmentCleaning = () => (
  <ServicePageLayout ar={ar} en={en} photo={teamUnit}
    photoAlt={{ ar: "فريق كلينولوجي داخل شقة في الرياض", en: "Kleenology team inside an apartment in Riyadh" }} />
);
export default ApartmentCleaning;
