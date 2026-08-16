import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";
import { HardHat, Shield, Clock, CheckCircle, Zap, Star } from "lucide-react";

const HardHatIcon = () => <HardHat className="h-10 w-10 text-white" />;

const ar: ServiceContent = {
  seo: {
    title: "تنظيف ما بعد البناء والتشطيب | كلينولوجي",
    description: "تنظيف متخصص بعد البناء والتجديد. إزالة الغبار والأتربة وبقايا الطلاء والإسمنت. نسلمك المكان جاهزاً للسكن.",
    keywords: "تنظيف بعد البناء, تنظيف تشطيبات, تنظيف ما بعد التجديد, تنظيف عمارات, كلينولوجي",
    url: "https://kleenology.me/post-construction-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500",
  hero: {
    icon: <HardHatIcon />,
    title: "تنظيف ما بعد البناء والتشطيب",
    subtitle: "نتولى التنظيف الشامل بعد أعمال البناء والتجديد. نزيل كل الغبار والبقايا ونسلمك المكان جاهزاً للسكن.",
    whatsappText: "مرحباً، أود الاستفسار عن خدمة تنظيف ما بعد البناء",
  },
  stats: [
    { value: "١ يوم", label: "مدة الخدمة العادية" },
    { value: "١٠٠٪", label: "جاهز للسكن" },
    { value: "+٢٠٠", label: "مشروع منجز" },
  ],
  includes: {
    title: "ماذا تشمل خدمة تنظيف ما بعد البناء؟",
    items: [
      "إزالة غبار البناء من جميع الأسطح",
      "تنظيف بقايا الإسمنت والطلاء والسيراميك",
      "تنظيف النوافذ والزجاج من آثار الدهانات",
      "غسيل الأرضيات وإزالة بقايا الغراء",
      "تنظيف الأدوات الصحية والمطابخ",
      "إزالة الأشرطة اللاصقة وآثارها",
      "تنظيف الأبواب والنوافذ والمقابض",
      "تنظيف فتحات التكييف والكهرباء",
      "جمع الأتربة والمخلفات الخفيفة",
      "تلميع الأسطح الزجاجية والمعدنية",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-slate-600" />,
      title: "فريق متخصص ببعد البناء",
      desc: "خبرة خاصة في التعامل مع مخلفات البناء والتشطيبات.",
    },
    {
      icon: <Clock className="h-7 w-7 text-slate-600" />,
      title: "تسليم في الوقت المحدد",
      desc: "نلتزم بالجدول الزمني لمشروعك ونسلمك في الموعد.",
    },
    {
      icon: <Zap className="h-7 w-7 text-slate-600" />,
      title: "معدات متخصصة",
      desc: "أجهزة شفط قوية ومعدات خاصة بإزالة مخلفات البناء.",
    },
  ],
  steps: [
    { num: "١", title: "معاينة الموقع", desc: "نزور الموقع ونحدد حجم العمل والمعدات اللازمة." },
    { num: "٢", title: "تنظيف شامل", desc: "فريق متخصص يعمل بكفاءة لإزالة كل المخلفات والأوساخ." },
    { num: "٣", title: "تسليم جاهز", desc: "نسلمك المكان نظيفاً تماماً جاهزاً للسكن أو الافتتاح." },
  ],
  cta: {
    title: "هل انتهيت من البناء؟",
    subtitle: "تواصل معنا ونرتب تنظيف الموقع وتسليمك إياه جاهزاً.",
    whatsappLabel: "اطلب عرض سعر الآن",
    bookLabel: "احجز الآن",
  },
  breadcrumb: "تنظيف بعد البناء",
};

const en: ServiceContent = {
  seo: {
    title: "Post-Construction Cleaning Services | Kleenology",
    description: "Specialized cleaning after construction and renovation. Dust, paint, and cement removal. We hand over your space move-in ready.",
    keywords: "post construction cleaning, after renovation cleaning, construction cleanup, kleenology",
    url: "https://kleenology.me/post-construction-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500",
  hero: {
    icon: <HardHatIcon />,
    title: "Post-Construction Cleaning",
    subtitle: "We handle full cleanup after construction and renovation. Removing all dust and residue so you get a move-in ready space.",
    whatsappText: "Hello! I'd like to inquire about your post-construction cleaning service",
  },
  stats: [
    { value: "1 Day", label: "Typical Service Duration" },
    { value: "100%", label: "Move-In Ready" },
    { value: "200+", label: "Projects Completed" },
  ],
  includes: {
    title: "What's Included in Post-Construction Cleaning?",
    items: [
      "Removing construction dust from all surfaces",
      "Cement, paint, and tile residue removal",
      "Window and glass cleaning from paint marks",
      "Floor washing and adhesive removal",
      "Cleaning plumbing fixtures and kitchens",
      "Removing adhesive tape and its residue",
      "Cleaning doors, windows, and handles",
      "AC vents and electrical outlet cleaning",
      "Collecting light debris and dust",
      "Polishing glass and metal surfaces",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-slate-600" />,
      title: "Construction Specialists",
      desc: "Special expertise in handling construction waste and finishing residue.",
    },
    {
      icon: <Clock className="h-7 w-7 text-slate-600" />,
      title: "On-Time Delivery",
      desc: "We respect your project timeline and deliver on schedule.",
    },
    {
      icon: <Zap className="h-7 w-7 text-slate-600" />,
      title: "Specialized Equipment",
      desc: "Heavy-duty suction machines and tools specifically for construction cleanup.",
    },
  ],
  steps: [
    { num: "1", title: "Site Inspection", desc: "We visit the site to assess scope of work and required equipment." },
    { num: "2", title: "Full Cleanup", desc: "A specialized team works efficiently to remove all debris and dirt." },
    { num: "3", title: "Ready Handover", desc: "We hand over a spotless space, ready to move in or open." },
  ],
  cta: {
    title: "Construction Done? Let's Clean Up.",
    subtitle: "Contact us and we'll arrange the cleanup and hand over your space ready.",
    whatsappLabel: "Get a Price Quote",
    bookLabel: "Book Now",
  },
  breadcrumb: "Post-Construction Cleaning",
};

const PostConstructionCleaning = () => <ServicePageLayout ar={ar} en={en} />;
export default PostConstructionCleaning;
