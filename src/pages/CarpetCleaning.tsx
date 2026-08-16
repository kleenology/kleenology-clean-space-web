import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";
import { Shield, Zap, Star, Leaf, Droplets, Clock } from "lucide-react";

const ar: ServiceContent = {
  seo: {
    title: "تنظيف سجاد وموكيت احترافي | كلينولوجي",
    description: "تنظيف السجاد والموكيت بالبخار وإزالة البقع العنيدة. معدات احترافية ومواد آمنة. نتائج مضمونة.",
    keywords: "تنظيف سجاد, تنظيف موكيت, إزالة بقع السجاد, تنظيف بالبخار, كلينولوجي",
    url: "https://kleenology.me/carpet-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400",
  hero: {
    icon: <Droplets className="h-10 w-10 text-white" />,
    title: "تنظيف السجاد والموكيت",
    subtitle: "تنظيف عميق بالبخار يزيل البقع والروائح ويعيد السجاد لمظهره الأصلي. جفاف سريع وحماية طويلة الأمد.",
    whatsappText: "مرحباً، أود الاستفسار عن خدمة تنظيف السجاد",
  },
  stats: [
    { value: "٩٨٪", label: "نسبة إزالة البقع" },
    { value: "٢-٤h", label: "وقت الجفاف" },
    { value: "+٣٠٠", label: "سجادة منظفة" },
  ],
  includes: {
    title: "ماذا تشمل خدمة تنظيف السجاد؟",
    items: [
      "فحص السجادة وتحديد نوع الأقمشة والبقع",
      "شفط الغبار والأتربة بمكانس احترافية",
      "معالجة البقع العنيدة قبل الغسيل",
      "تنظيف بالبخار الساخن لإزالة الجراثيم",
      "شطف كامل للتخلص من بقايا المنظفات",
      "تجفيف سريع بمعدات ضخ الهواء",
      "تنظيف المفروشات والكنبات بنفس الأسلوب",
      "معالجة الروائح ومزيلات التعفن",
      "حماية الألياف بعد التنظيف",
      "فحص نهائي لضمان الجودة",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-amber-600" />,
      title: "ضمان إزالة البقع",
      desc: "نضمن إزالة ٩٨٪ من البقع أو نعيد الخدمة مجاناً.",
    },
    {
      icon: <Zap className="h-7 w-7 text-amber-600" />,
      title: "جفاف سريع",
      desc: "تجف السجادة خلال ساعتين إلى أربع ساعات فقط.",
    },
    {
      icon: <Leaf className="h-7 w-7 text-amber-600" />,
      title: "مواد آمنة للأطفال",
      desc: "منظفات معتمدة آمنة تماماً للأطفال والحيوانات الأليفة.",
    },
  ],
  steps: [
    { num: "١", title: "تقييم وتحضير", desc: "يفحص فريقنا السجادة ويحدد المعاملة المناسبة لكل نوع." },
    { num: "٢", title: "تنظيف بالبخار", desc: "تنظيف عميق بالبخار يصل لجذور الألياف ويزيل كل الأوساخ." },
    { num: "٣", title: "تجفيف وتسليم", desc: "تجفيف سريع ومراجعة النتيجة معك قبل المغادرة." },
  ],
  cta: {
    title: "أعد لسجادتك بريقها الأصلي",
    subtitle: "تواصل معنا اليوم ونرتب لك موعداً في أقرب وقت.",
    whatsappLabel: "اطلب عرض سعر الآن",
    bookLabel: "احجز الآن",
  },
  breadcrumb: "تنظيف السجاد",
};

const en: ServiceContent = {
  seo: {
    title: "Professional Carpet & Rug Cleaning | Kleenology",
    description: "Steam carpet cleaning and stubborn stain removal. Professional equipment and safe products. Guaranteed results with fast drying.",
    keywords: "carpet cleaning, rug cleaning, stain removal, steam cleaning, kleenology",
    url: "https://kleenology.me/carpet-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-amber-600 via-amber-500 to-yellow-400",
  hero: {
    icon: <Droplets className="h-10 w-10 text-white" />,
    title: "Carpet & Rug Cleaning",
    subtitle: "Deep steam cleaning removes stains and odors, restoring your carpet to its original condition. Fast drying and long-lasting protection.",
    whatsappText: "Hello! I'd like to inquire about your carpet cleaning service",
  },
  stats: [
    { value: "98%", label: "Stain Removal Rate" },
    { value: "2–4h", label: "Drying Time" },
    { value: "300+", label: "Carpets Cleaned" },
  ],
  includes: {
    title: "What's Included in Carpet Cleaning?",
    items: [
      "Inspection of carpet type and stains",
      "Professional vacuuming of dust and debris",
      "Pre-treatment of stubborn stains",
      "Hot steam cleaning to eliminate bacteria",
      "Full rinse to remove detergent residue",
      "Fast drying with air blowers",
      "Upholstery and sofa cleaning available",
      "Odor treatment and deodorizing",
      "Fiber protection after cleaning",
      "Final quality inspection",
    ],
  },
  benefits: [
    {
      icon: <Shield className="h-7 w-7 text-amber-600" />,
      title: "Stain Removal Guarantee",
      desc: "We guarantee removing 98% of stains or we redo it for free.",
    },
    {
      icon: <Zap className="h-7 w-7 text-amber-600" />,
      title: "Fast Drying",
      desc: "Your carpet is dry and ready to use within 2–4 hours.",
    },
    {
      icon: <Leaf className="h-7 w-7 text-amber-600" />,
      title: "Child & Pet Safe",
      desc: "Certified products completely safe for children and pets.",
    },
  ],
  steps: [
    { num: "1", title: "Assess & Prepare", desc: "Our team inspects your carpet and determines the right treatment." },
    { num: "2", title: "Steam Clean", desc: "Deep steam cleaning reaches fiber roots removing all dirt and bacteria." },
    { num: "3", title: "Dry & Deliver", desc: "Fast drying and a final review with you before we leave." },
  ],
  cta: {
    title: "Restore Your Carpet's Original Beauty",
    subtitle: "Contact us today and we'll arrange an appointment as soon as possible.",
    whatsappLabel: "Get a Price Quote",
    bookLabel: "Book Now",
  },
  breadcrumb: "Carpet Cleaning",
};

const CarpetCleaning = () => <ServicePageLayout ar={ar} en={en} />;
export default CarpetCleaning;
