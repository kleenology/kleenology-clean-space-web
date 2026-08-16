import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";
import { Building2, Shield, Clock, Zap, Users, Star } from "lucide-react";

const ar: ServiceContent = {
  seo: {
    title: "تنظيف مكاتب وشركات احترافي | كلينولوجي",
    description: "خدمات تنظيف مكاتب وشركات وبيئات عمل احترافية. جدولة مرنة وفريق موثوق مع ضمان النظافة المستمرة.",
    keywords: "تنظيف مكاتب, تنظيف شركات, تنظيف بيئة عمل, تنظيف تجاري, كلينولوجي",
    url: "https://kleenology.me/office-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500",
  hero: {
    icon: <Building2 className="h-10 w-10 text-white" />,
    title: "تنظيف مكاتب وشركات",
    subtitle: "بيئة عمل نظيفة تعكس احترافيتك وترفع إنتاجية فريقك. جدولة مرنة تناسب دوام شركتك مع فريق موثوق ومعتمد.",
    whatsappText: "مرحباً، أود الاستفسار عن خدمة تنظيف المكاتب",
  },
  stats: [
    { value: "٢٤/٧", label: "جدولة مرنة" },
    { value: "+١٥٠", label: "شركة عميلة" },
    { value: "١٠٠٪", label: "سرية وأمان" },
  ],
  includes: {
    title: "ماذا تشمل خدمة تنظيف المكاتب؟",
    items: [
      "تنظيف وتعقيم مناطق الاستقبال والمداخل",
      "تنظيف قاعات الاجتماعات والمؤتمرات",
      "تعقيم مكاتب العمل والأسطح",
      "تنظيف الحمامات والمطابخ ومناطق الاستراحة",
      "كنس وتنظيف الأرضيات والسجاد",
      "تنظيف النوافذ والأقسام الزجاجية",
      "تفريغ سلال المهملات وتنظيفها",
      "تنظيف الأجهزة المشتركة والشاشات",
      "تعقيم أسطح التلامس المتكررة بالمكتب",
      "تنظيف السلالم والممرات والمصاعد",
    ],
  },
  benefits: [
    {
      icon: <Clock className="h-7 w-7 text-blue-600" />,
      title: "جدولة تناسبك",
      desc: "قبل الدوام، بعد الدوام، أو في عطلة نهاية الأسبوع — نحن نتكيف مع جدولك.",
    },
    {
      icon: <Shield className="h-7 w-7 text-blue-600" />,
      title: "سرية وأمان تام",
      desc: "فريق موثوق ومعتمد مع احترام تام لسرية بيانات ومستندات شركتك.",
    },
    {
      icon: <Zap className="h-7 w-7 text-blue-600" />,
      title: "رفع إنتاجية الفريق",
      desc: "بيئة عمل نظيفة ومنظمة تحسن تركيز الموظفين وإنتاجيتهم.",
    },
  ],
  steps: [
    { num: "١", title: "تقييم وعرض سعر", desc: "نزور مكتبك ونقدم عرض سعر مخصص حسب المساحة والاحتياجات." },
    { num: "٢", title: "اتفاق وجدولة", desc: "نتفق على الموعد والتكرار المناسب لشركتك." },
    { num: "٣", title: "تنظيف منتظم", desc: "فريق ثابت يعتني بمكتبك بانتظام مع تقارير دورية." },
  ],
  cta: {
    title: "بيئة عمل نظيفة = فريق أكثر إنتاجية",
    subtitle: "تواصل معنا اليوم للحصول على عرض سعر مخصص لشركتك.",
    whatsappLabel: "اطلب عرض سعر الآن",
    bookLabel: "احجز الآن",
  },
  breadcrumb: "تنظيف المكاتب",
};

const en: ServiceContent = {
  seo: {
    title: "Professional Office & Commercial Cleaning | Kleenology",
    description: "Professional cleaning for offices, companies, and workplaces. Flexible scheduling and trusted team with consistent cleanliness guarantee.",
    keywords: "office cleaning, commercial cleaning, business cleaning, corporate cleaning, workplace cleaning, kleenology",
    url: "https://kleenology.me/office-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500",
  hero: {
    icon: <Building2 className="h-10 w-10 text-white" />,
    title: "Office & Commercial Cleaning",
    subtitle: "A clean workplace reflects your professionalism and boosts team productivity. Flexible scheduling around your business hours with a trusted, certified team.",
    whatsappText: "Hello! I'd like to inquire about your office cleaning service",
  },
  stats: [
    { value: "24/7", label: "Flexible Scheduling" },
    { value: "150+", label: "Business Clients" },
    { value: "100%", label: "Privacy & Security" },
  ],
  includes: {
    title: "What's Included in Office Cleaning?",
    items: [
      "Reception area and entrance cleaning",
      "Meeting rooms and conference halls",
      "Workstation and desk sanitization",
      "Restrooms, kitchens, and break rooms",
      "Vacuuming and mopping all floors and carpets",
      "Window and glass partition cleaning",
      "Trash collection and bin cleaning",
      "Shared devices and screen cleaning",
      "High-touch surface disinfection",
      "Stairways, hallways, and elevator cleaning",
    ],
  },
  benefits: [
    {
      icon: <Clock className="h-7 w-7 text-blue-600" />,
      title: "Flexible Scheduling",
      desc: "Before hours, after hours, or weekends — we adapt to your schedule.",
    },
    {
      icon: <Shield className="h-7 w-7 text-blue-600" />,
      title: "Privacy & Security",
      desc: "Trusted, certified team with full respect for your business data and documents.",
    },
    {
      icon: <Zap className="h-7 w-7 text-blue-600" />,
      title: "Boost Team Productivity",
      desc: "A clean and organized workspace improves employee focus and output.",
    },
  ],
  steps: [
    { num: "1", title: "Assessment & Quote", desc: "We visit your office and provide a custom quote based on size and needs." },
    { num: "2", title: "Agreement & Schedule", desc: "We agree on timing and frequency that suits your business." },
    { num: "3", title: "Regular Cleaning", desc: "A dedicated team takes care of your office consistently with periodic reports." },
  ],
  cta: {
    title: "Clean Office = More Productive Team",
    subtitle: "Contact us today for a customized quote for your business.",
    whatsappLabel: "Get a Price Quote",
    bookLabel: "Book Now",
  },
  breadcrumb: "Office Cleaning",
};

const OfficeCleaning = () => <ServicePageLayout ar={ar} en={en} />;
export default OfficeCleaning;
