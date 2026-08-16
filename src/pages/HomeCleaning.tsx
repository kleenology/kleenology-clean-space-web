import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";
import { Home, Shield, Leaf, Clock, Star, Users } from "lucide-react";

const ar: ServiceContent = {
  seo: {
    title: "تنظيف منازل احترافي | كلينولوجي",
    description: "خدمة تنظيف منازل احترافية بأحدث المعدات ومواد آمنة وصديقة للبيئة. نظافة شاملة مع ضمان الرضا التام.",
    keywords: "تنظيف منازل, تنظيف شقق, تنظيف بيت, خدمة تنظيف, كلينولوجي, تنظيف الرياض",
    url: "https://kleenology.me/home-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400",
  hero: {
    icon: <Home className="h-10 w-10 text-white" />,
    title: "تنظيف منازل احترافي",
    subtitle: "نظافة شاملة تصل لكل زاوية في منزلك. فريق محترف بمواد آمنة ومعدات متطورة مع ضمان الرضا التام.",
    whatsappText: "مرحباً، أود الاستفسار عن خدمة تنظيف المنازل",
  },
  stats: [
    { value: "١٠٠٪", label: "ضمان الرضا" },
    { value: "+٥٠٠", label: "عميل سعيد" },
    { value: "٢٤h", label: "ضمان المراجعة" },
  ],
  includes: {
    title: "ماذا تشمل خدمة تنظيف المنازل؟",
    items: [
      "تنظيف وتعقيم الحمامات بالكامل",
      "تنظيف المطبخ شاملاً الأجهزة والأسطح",
      "مسح جميع الأسطح والأثاث من الغبار",
      "كنس وتنظيف الأرضيات بالمماسح",
      "تنظيف النوافذ والمرايا والزجاج",
      "تنظيف الغرف والصالات والممرات",
      "تنظيف الخزائن من الخارج",
      "إزالة البقع عن الأسطح والجدران",
      "تعقيم أسطح التلامس المتكررة",
      "جمع النفايات والتخلص منها",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-emerald-600" />,
      title: "ضمان ١٠٠٪",
      desc: "إذا لم تكن راضياً نعود مجاناً خلال ٢٤ ساعة لإعادة التنظيف.",
    },
    {
      icon: <Leaf className="h-7 w-7 text-emerald-600" />,
      title: "مواد آمنة وطبيعية",
      desc: "منتجات تنظيف معتمدة آمنة لعائلتك وأطفالك والبيئة.",
    },
    {
      icon: <Users className="h-7 w-7 text-emerald-600" />,
      title: "فريق موثوق ومدرب",
      desc: "فريق متخصص بخبرة عالية ومعتمد بأعلى معايير الجودة.",
    },
  ],
  steps: [
    { num: "١", title: "تواصل واحجز", desc: "تواصل معنا عبر واتساب أو صفحة الحجز وحدد موعدك." },
    { num: "٢", title: "يصل الفريق", desc: "فريقنا يصل في الوقت المحدد بكامل معداته ومنظفاته." },
    { num: "٣", title: "منزل نظيف تماماً", desc: "تفقد النتيجة وإذا لم تكن راضياً نعود مجاناً." },
  ],
  cta: {
    title: "احجز تنظيف منزلك اليوم",
    subtitle: "استمتع بمنزل نظيف ومعقم — نحن نتولى كل شيء.",
    whatsappLabel: "اطلب عرض سعر الآن",
    bookLabel: "احجز الآن",
  },
  breadcrumb: "تنظيف المنازل",
};

const en: ServiceContent = {
  seo: {
    title: "Professional Home Cleaning Services | Kleenology",
    description: "Expert home cleaning services with eco-friendly products. Deep cleaning, sanitization, and spotless results guaranteed. Book your home cleaning today!",
    keywords: "home cleaning, house cleaning, residential cleaning, deep cleaning, eco-friendly cleaning, sanitization",
    url: "https://kleenology.me/home-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400",
  hero: {
    icon: <Home className="h-10 w-10 text-white" />,
    title: "Professional Home Cleaning",
    subtitle: "A spotless clean reaching every corner of your home. Professional team with safe products and advanced tools, backed by a 100% satisfaction guarantee.",
    whatsappText: "Hello! I'd like to inquire about your home cleaning service",
  },
  stats: [
    { value: "100%", label: "Satisfaction Guarantee" },
    { value: "500+", label: "Happy Clients" },
    { value: "24h", label: "Review Guarantee" },
  ],
  includes: {
    title: "What's Included in Home Cleaning?",
    items: [
      "Full bathroom cleaning and sanitization",
      "Kitchen cleaning including appliances and surfaces",
      "Dusting all surfaces and furniture",
      "Vacuuming and mopping all floors",
      "Window, mirror, and glass cleaning",
      "Bedrooms, living areas, and hallways",
      "Exterior cabinet cleaning",
      "Stain removal from surfaces and walls",
      "Disinfecting high-touch surfaces",
      "Trash collection and disposal",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-emerald-600" />,
      title: "100% Guarantee",
      desc: "Not satisfied? We return for free within 24 hours to re-clean.",
    },
    {
      icon: <Leaf className="h-7 w-7 text-emerald-600" />,
      title: "Safe & Natural Products",
      desc: "Certified cleaning products safe for your family, children, and the environment.",
    },
    {
      icon: <Users className="h-7 w-7 text-emerald-600" />,
      title: "Trusted & Trained Team",
      desc: "Specialized team with extensive experience meeting the highest quality standards.",
    },
  ],
  steps: [
    { num: "1", title: "Contact & Book", desc: "Reach us via WhatsApp or the booking page and choose your time." },
    { num: "2", title: "Team Arrives", desc: "Our team arrives on time with all equipment and cleaning products." },
    { num: "3", title: "Spotless Home", desc: "Inspect the results — not satisfied? We return for free." },
  ],
  cta: {
    title: "Book Your Home Cleaning Today",
    subtitle: "Enjoy a clean and sanitized home — we handle everything.",
    whatsappLabel: "Get a Price Quote",
    bookLabel: "Book Now",
  },
  breadcrumb: "Home Cleaning",
};

const HomeCleaning = () => <ServicePageLayout ar={ar} en={en} />;
export default HomeCleaning;
