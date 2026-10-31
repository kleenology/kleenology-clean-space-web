import teamWindow from "@/assets/windows-cleaning.jpg";
import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";

// صفحة مخصصة لبحث «تنظيف فلل بالرياض»
const ar: ServiceContent = {
  seo: {
    title: "تنظيف فلل بالرياض | تنظيف شامل لكل الأدوار | كلينولوجي",
    description: "تنظيف فلل بالرياض: تنظيف شامل لكل الأدوار والمجالس والمطابخ والحمامات والسلالم والزجاج والحوش، بفريق كامل ومشرف. قبل السكن، بعد التشطيب، أو تنظيف دوري.",
    keywords: "تنظيف فلل بالرياض, تنظيف فلل, شركة تنظيف فلل الرياض, تنظيف فيلا قبل السكن, كلينولوجي",
    url: "https://kleenology.me/villa-cleaning-riyadh",
  },
  hero: {
    title: "تنظيف فلل بالرياض",
    subtitle: "الفيلا تحتاج فريق كامل مو عامل واحد: نوزع الشغل على الأدوار والمجالس والمطابخ والحمامات والسلالم والزجاج والحوش، ومشرف يتابع كل زاوية قبل التسليم.",
    whatsappText: "مرحباً، أبي عرض سعر لتنظيف فيلا بالرياض",
  },
  stats: [
    { value: "+690", label: "عميل" },
    { value: "98%", label: "رضا العملاء" },
    { value: "24h", label: "ضمان المراجعة" },
  ],
  includes: {
    title: "وش يشمل تنظيف الفيلا؟",
    items: [
      "تنظيف كل الأدوار: الغرف والصالات والممرات",
      "المجالس والكنب والسجاد (حسب الطلب)",
      "المطبخ الرئيسي والتحضيري: الخزائن والأسطح والأجهزة من الخارج",
      "تنظيف وتعقيم كل الحمامات",
      "السلالم والدرابزين",
      "النوافذ والواجهات الزجاجية من الداخل",
      "الأبواب والمقابض والإضاءات",
      "الأرضيات والرخام",
      "الحوش والملاحق والسطح",
      "إزالة البقع عن الجدران والأسطح",
    ],
  },
  benefits: [
    { title: "فريق كامل ومشرف", desc: "عدد العمال حسب حجم الفيلا، ومشرف يتابع ويمر على كل دور قبل التسليم." },
    { title: "قبل السكن، بعد التشطيب، أو دوري", desc: "نجهّز الفيلا الجديدة للسكن، أو ننظفها بعد الترميم، أو تنظيف دوري قبل المناسبات." },
    { title: "ضمان الرضا", desc: "إذا ما رضيت عن النتيجة نرجع ونعيد التنظيف مجاناً خلال 24 ساعة." },
  ],
  steps: [
    { num: "١", title: "أرسل التفاصيل", desc: "عدد الأدوار والغرف والحي، وصور للفيلا إذا تقدر، على الواتس." },
    { num: "٢", title: "نجهّز الفريق", desc: "نحدد عدد العمال والمدة حسب الحجم، ونتفق على الموعد." },
    { num: "٣", title: "تستلم فيلتك نظيفة", desc: "المشرف يمر معك على الأدوار، وأي ملاحظة نعدّلها." },
  ],
  cta: {
    title: "فيلتك تحتاج تنظيف شامل؟",
    subtitle: "أرسل لنا عدد الأدوار والحي، ونرسل لك عرض السعر على الواتس.",
    whatsappLabel: "اطلب عرض سعر الآن",
    bookLabel: "احجز الآن",
  },
  breadcrumb: "تنظيف فلل بالرياض",
  faq: [
    { q: "كم عامل يجي لتنظيف الفيلا؟", a: "حسب حجم الفيلا وعدد أدوارها. نحدد عدد العمال والمدة بعد ما ترسل لنا التفاصيل أو الصور." },
    { q: "كم ياخذ تنظيف الفيلا؟", a: "التنظيف العادي غالباً يوم عمل واحد. الفلل الكبيرة أو التنظيف بعد التشطيب قد ياخذ يومين." },
    { q: "تنظفون الفيلا بعد البناء أو الترميم؟", a: "إيه، هذا اسمه التنظيف التأهيلي: نشيل غبار البناء وبقايا الإسمنت والدهان ونسلمها جاهزة للسكن." },
    { q: "هل أحتاج أوفر أدوات أو مواد؟", a: "لا، الفريق يجي بكامل معداته ومواد التنظيف. توفّر الماء والكهرباء بس." },
    { q: "وش لو ما عجبني التنظيف؟", a: "نرجع ونعيد التنظيف مجاناً خلال 24 ساعة." },
    { q: "تخدمون أي أحياء؟", a: "كل أحياء الرياض، ومنها أحياء الفلل في الشمال مثل الملقا والنرجس والياسمين وحطين والنخيل." },
  ],
  related: [
    { title: "التنظيف التأهيلي بعد البناء", href: "/post-construction-cleaning" },
    { title: "تنظيف شقق بالرياض", href: "/apartment-cleaning-riyadh" },
    { title: "تنظيف سجاد وكنب", href: "/carpet-cleaning" },
  ],
};

const en: ServiceContent = {
  seo: {
    title: "Villa Cleaning in Riyadh | Full Villa Cleaning | Kleenology",
    description: "Villa cleaning in Riyadh: every floor, majlis, kitchen, bathroom, staircase, glass and courtyard by a full team with a supervisor — move-in, after finishing work, or regular.",
    keywords: "villa cleaning riyadh, house cleaning riyadh, villa deep cleaning, kleenology",
    url: "https://kleenology.me/villa-cleaning-riyadh",
  },
  hero: {
    title: "Villa Cleaning in Riyadh",
    subtitle: "A villa needs a full team, not one cleaner: we split the work across floors, majlis, kitchens, bathrooms, stairs, glass and courtyard, with a supervisor checking every corner before handover.",
    whatsappText: "Hello, I'd like a quote for villa cleaning in Riyadh",
  },
  stats: [
    { value: "690+", label: "clients" },
    { value: "98%", label: "satisfaction" },
    { value: "24h", label: "re-clean guarantee" },
  ],
  includes: {
    title: "What's included",
    items: [
      "Every floor: rooms, living areas and hallways",
      "Majlis, sofas and carpets (on request)",
      "Main and prep kitchens: cabinets, counters, appliance exteriors",
      "All bathrooms cleaned and disinfected",
      "Stairs and handrails",
      "Windows and glass facades (inside)",
      "Doors, handles and lights",
      "Floors and marble",
      "Courtyard, annexes and roof",
      "Stains removed from walls and surfaces",
    ],
  },
  benefits: [
    { title: "Full team + supervisor", desc: "Team size matched to the villa, with a supervisor checking each floor before handover." },
    { title: "Move-in, post-finishing or regular", desc: "New villas made ready, post-renovation cleanups, or regular cleaning before occasions." },
    { title: "Satisfaction guarantee", desc: "Not happy? We come back and re-clean free within 24 hours." },
  ],
  steps: [
    { num: "1", title: "Send the details", desc: "Floors, rooms, area and photos if you can, on WhatsApp." },
    { num: "2", title: "We plan the team", desc: "Team size and duration based on the villa; we agree on a date." },
    { num: "3", title: "Walk through together", desc: "The supervisor walks the floors with you and fixes anything missed." },
  ],
  cta: {
    title: "Need a full villa clean?",
    subtitle: "Send us the number of floors and the area and we'll quote on WhatsApp.",
    whatsappLabel: "Get a quote",
    bookLabel: "Book now",
  },
  breadcrumb: "Villa Cleaning in Riyadh",
  related: [
    { title: "Post-construction cleaning", href: "/post-construction-cleaning" },
    { title: "Apartment Cleaning in Riyadh", href: "/apartment-cleaning-riyadh" },
    { title: "Carpet & sofa cleaning", href: "/carpet-cleaning" },
  ],
};

const VillaCleaning = () => (
  <ServicePageLayout ar={ar} en={en} photo={teamWindow}
    photoAlt={{ ar: "عامل من فريق كلينولوجي ينظف زجاج فيلا", en: "A Kleenology team member cleaning villa glass" }} />
);
export default VillaCleaning;
