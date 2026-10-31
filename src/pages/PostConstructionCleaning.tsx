import teamStairs from "@/assets/rehab-cleaning.jpg";
import { ServicePageLayout, ServiceContent } from "@/components/ServicePageLayout";
import { HardHat, Shield, Clock, CheckCircle, Zap, Star } from "lucide-react";

const HardHatIcon = () => <HardHat className="h-10 w-10 text-white" />;

const ar: ServiceContent = {
  seo: {
    title: "تنظيف تأهيلي بالرياض | تنظيف بعد البناء والترميم | كلينولوجي",
    description: "تنظيف تأهيلي بالرياض للفلل والشقق والمكاتب بعد البناء أو الترميم: إزالة غبار البناء وبقايا الإسمنت والدهان والسيليكون وتنظيف الزجاج والأرضيات، وتسليم المكان جاهزاً للسكن.",
    keywords: "تنظيف تأهيلي, تنظيف تأهيلي بالرياض, تنظيف بعد البناء, تنظيف بعد الترميم, تنظيف بعد التشطيب, تنظيف فلل جديدة, كلينولوجي",
    url: "https://kleenology.me/post-construction-cleaning",
  },
  heroGradient: "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500",
  hero: {
    icon: <HardHatIcon />,
    title: "التنظيف التأهيلي بالرياض",
    subtitle: "تنظيف شامل بعد البناء أو الترميم أو التشطيب: نشيل غبار البناء وبقايا الإسمنت والدهان من كل زاوية، ونسلمك الفيلا أو الشقة أو المكتب جاهز للسكن.",
    whatsappText: "مرحباً، أبي عرض سعر لتنظيف تأهيلي (بعد بناء أو ترميم)",
  },
  stats: [
    { value: "١ يوم", label: "مدة الخدمة العادية" },
    { value: "١٠٠٪", label: "جاهز للسكن" },
    { value: "+٢٠٠", label: "مشروع منجز" },
  ],
  includes: {
    title: "وش يشمل التنظيف التأهيلي؟",
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
  breadcrumb: "التنظيف التأهيلي",
  faq: [
    { q: "وش هو التنظيف التأهيلي؟", a: "هو التنظيف اللي يجي بعد البناء أو الترميم أو التشطيب، عشان يتأهل المكان للسكن أو الاستخدام: إزالة غبار البناء وبقايا الإسمنت والدهان والسيليكون والغراء، وتنظيف الزجاج والأرضيات والحمامات والمطابخ." },
    { q: "متى أحتاج تنظيف تأهيلي؟", a: "بعد استلام فيلا أو شقة جديدة من المقاول، بعد ترميم أو تجديد بيت أو مكتب، وقبل تسليم وحدات لملاكها أو مستأجريها." },
    { q: "كم ياخذ التنظيف التأهيلي؟", a: "الشقة أو الدور غالباً يوم عمل واحد، والفلل الكبيرة قد تاخذ يومين حسب المساحة وكمية المخلفات. نحدد المدة بعد معاينة الموقع أو صوره." },
    { q: "هل تشيلون مخلفات البناء الكبيرة؟", a: "نجمع الأتربة والمخلفات الخفيفة. المخلفات الكبيرة مثل الحجر وبقايا الطوب وقطع الخشب تكون عادة على المقاول قبل التنظيف." },
    { q: "تخدمون أي أحياء في الرياض؟", a: "نخدم كل أحياء الرياض، وخاصة الأحياء الجديدة اللي فيها بناء كثير مثل الملقا والنرجس والياسمين والعارض والقيروان." },
    { q: "كيف أحجز وأعرف السعر؟", a: "أرسل لنا على الواتس نوع المكان ومساحته التقريبية وصور له، ونرسل لك عرض سعر. السعر يعتمد على المساحة وكمية بقايا البناء." },
  ],
  related: [
    { title: "تنظيف فلل بالرياض", href: "/villa-cleaning-riyadh" },
    { title: "تنظيف شقق بالرياض", href: "/apartment-cleaning-riyadh" },
    { title: "التنظيف العميق", href: "/deep-cleaning" },
  ],
};

const en: ServiceContent = {
  seo: {
    title: "Post-Construction & Renovation Cleaning in Riyadh | Kleenology",
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
  related: [
    { title: "Villa Cleaning in Riyadh", href: "/villa-cleaning-riyadh" },
    { title: "Apartment Cleaning in Riyadh", href: "/apartment-cleaning-riyadh" },
    { title: "Deep Cleaning", href: "/deep-cleaning" },
  ],
};

const PostConstructionCleaning = () => (
  <ServicePageLayout ar={ar} en={en} photo={teamStairs}
    photoAlt={{ ar: "تنظيف درج من مخلفات البناء", en: "Cleaning construction debris off a staircase" }} />
);
export default PostConstructionCleaning;
