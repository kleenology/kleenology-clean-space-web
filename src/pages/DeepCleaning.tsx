import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";
import { Sparkles, Shield, Clock, Star, Leaf, Users } from "lucide-react";

const ar: ServiceContent = {
  seo: {
    title: "تنظيف عميق احترافي | كلينولوجي",
    description: "خدمة تنظيف عميق شاملة من الأعلى للأسفل. تنظيف الخزائن، الأجهزة، الأسقف، والمناطق صعبة الوصول بأحدث المعدات.",
    keywords: "تنظيف عميق, تنظيف شامل, تنظيف احترافي, كلينولوجي, deep cleaning الرياض",
    url: "https://kleenology.me/deep-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-primary via-primary/80 to-brand-blue",
  hero: {
    icon: <Sparkles className="h-10 w-10 text-white" />,
    title: "تنظيف عميق احترافي",
    subtitle: "تنظيف شامل من الأعلى للأسفل يصل لكل زاوية. مثالي لأول حجز، ما بعد الإجازات، وقبل المناسبات.",
    whatsappText: "مرحباً، أود الاستفسار عن خدمة التنظيف العميق",
  },
  stats: [
    { value: "100%", label: "ضمان الرضا" },
    { value: "+500", label: "عميل سعيد" },
    { value: "24h", label: "ضمان المراجعة" },
  ],
  includes: {
    title: "ماذا يشمل التنظيف العميق؟",
    items: [
      "تنظيف وتعقيم الحمامات بالكامل من الداخل",
      "تنظيف المطبخ شاملاً داخل الثلاجة والفرن",
      "مسح جميع الأسطح والجدران والأبواب",
      "تنظيف الخزائن من الداخل والخارج",
      "تنظيف النوافذ والمرايا والزجاج",
      "كنس وتنظيف الأرضيات بالبخار",
      "تنظيف المراوح والإضاءة والأسقف",
      "إزالة الأوساخ من الزوايا والفجوات",
      "تعقيم أسطح التلامس بمواد آمنة",
      "إزالة البقع والترسبات العنيدة",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-primary" />,
      title: "ضمان 100%",
      desc: "إذا لم تكن راضياً نعود مجاناً خلال 24 ساعة لإعادة التنظيف.",
    },
    {
      icon: <Leaf className="h-7 w-7 text-primary" />,
      title: "مواد آمنة وصديقة",
      desc: "منتجات تنظيف معتمدة آمنة لعائلتك وأطفالك والبيئة.",
    },
    {
      icon: <Users className="h-7 w-7 text-primary" />,
      title: "فريق محترف ومدرب",
      desc: "فريق متخصص بخبرة عالية وأدوات احترافية متطورة.",
    },
  ],
  steps: [
    { num: "١", title: "تواصل واحجز", desc: "تواصل معنا عبر واتساب أو صفحة الحجز وحدد موعدك." },
    { num: "٢", title: "يصل الفريق", desc: "يصل فريقنا المتخصص في الوقت المحدد بكامل معداته." },
    { num: "٣", title: "استمتع بالنظافة", desc: "تفقد النتيجة وإذا لم تكن راضياً نعود مجاناً." },
  ],
  cta: {
    title: "احجز التنظيف العميق الآن",
    subtitle: "لا تترك زاوية واحدة دون تنظيف. فريقنا جاهز اليوم.",
    whatsappLabel: "اطلب عرض سعر الآن",
    bookLabel: "احجز الآن",
  },
  breadcrumb: "تنظيف عميق",
};

const en: ServiceContent = {
  seo: {
    title: "Professional Deep Cleaning Services | Kleenology",
    description: "Comprehensive top-to-bottom deep cleaning. Cabinets, appliances, ceilings, and hard-to-reach areas using professional equipment.",
    keywords: "deep cleaning, thorough cleaning, professional cleaning, kleenology, deep cleaning Riyadh",
    url: "https://kleenology.me/deep-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-primary via-primary/80 to-brand-blue",
  hero: {
    icon: <Sparkles className="h-10 w-10 text-white" />,
    title: "Professional Deep Cleaning",
    subtitle: "A thorough top-to-bottom clean reaching every corner. Perfect for first bookings, post-vacation refreshes, and special occasions.",
    whatsappText: "Hello! I'd like to inquire about your deep cleaning service",
  },
  stats: [
    { value: "100%", label: "Satisfaction Guarantee" },
    { value: "500+", label: "Happy Clients" },
    { value: "24h", label: "Review Guarantee" },
  ],
  includes: {
    title: "What's Included in Deep Cleaning?",
    items: [
      "Full bathroom sanitization inside and out",
      "Kitchen cleaning including inside fridge & oven",
      "Wiping all surfaces, walls, and doors",
      "Cabinets cleaned inside and outside",
      "Windows, mirrors, and glass cleaning",
      "Vacuuming and steam mopping all floors",
      "Fans, light fixtures, and ceiling cleaning",
      "Removing dirt from corners and crevices",
      "Disinfecting all high-touch surfaces",
      "Removing tough stains and buildup",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-primary" />,
      title: "100% Guarantee",
      desc: "Not satisfied? We return for free within 24 hours to re-clean.",
    },
    {
      icon: <Leaf className="h-7 w-7 text-primary" />,
      title: "Safe & Eco-Friendly",
      desc: "Certified cleaning products safe for your family, children, and the environment.",
    },
    {
      icon: <Users className="h-7 w-7 text-primary" />,
      title: "Professional Team",
      desc: "Specialized team with extensive experience and advanced professional tools.",
    },
  ],
  steps: [
    { num: "1", title: "Contact & Book", desc: "Reach us via WhatsApp or the booking page and choose your time." },
    { num: "2", title: "Team Arrives", desc: "Our specialized team arrives on time with all equipment ready." },
    { num: "3", title: "Enjoy Cleanliness", desc: "Inspect the results — not satisfied? We return for free." },
  ],
  cta: {
    title: "Book Your Deep Cleaning Today",
    subtitle: "Leave no corner untouched. Our team is ready today.",
    whatsappLabel: "Get a Price Quote",
    bookLabel: "Book Now",
  },
  breadcrumb: "Deep Cleaning",
};

const DeepCleaning = () => <ServicePageLayout ar={ar} en={en} />;
export default DeepCleaning;
