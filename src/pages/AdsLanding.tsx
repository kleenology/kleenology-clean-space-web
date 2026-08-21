import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import {
  MessageCircle,
  Phone,
  CheckCircle2,
  Star,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

const SERVICES = [
  { icon: "🏠", title: "تنظيف المنازل والفلل", href: "/home-cleaning" },
  { icon: "🏢", title: "تنظيف المكاتب والشركات", href: "/office-cleaning" },
  { icon: "✨", title: "التنظيف العميق الشامل", href: "/deep-cleaning" },
  { icon: "🧽", title: "تنظيف السجاد بالبخار", href: "/carpet-cleaning" },
  { icon: "🔨", title: "تنظيف ما بعد البناء", href: "/post-construction-cleaning" },
  { icon: "🧴", title: "التعقيم والتطهير", href: "/deep-cleaning" },
];

const REVIEWS = [
  { name: "ياسر بن مضواح", text: "الله يوفقكم، فريق عمل متميز وشغل مرتب ونظيف", stars: 5 },
  { name: "حسن العتيبي", text: "دقة متناهية، اهتمام بأدق التفاصيل، واستعداد دائم لتقبل الملاحظات. خدمة حقيقية تستحق التجربة وبقوة!", stars: 5 },
  { name: "الزين", text: "رائع شغلهم وإحترافي ماشاء الله، إن شاء الله مو آخر تعامل معاكم", stars: 5 },
];

const FAQS = [
  { q: "كم تستغرق الخدمة؟", a: "الخدمة العادية تستغرق يوم عمل واحد. التنظيف العميق وما بعد البناء قد يمتد ليومين حسب المساحة." },
  { q: "هل المواد المستخدمة آمنة للأطفال؟", a: "نعم. نستخدم مواد تنظيف معتمدة وصديقة للبيئة، آمنة تماماً للأطفال والحيوانات الأليفة." },
  { q: "ماذا لو لم أكن راضياً عن النتيجة؟", a: "نضمن رضاك. إذا لم تكن راضياً نعود ونعيد العمل مجاناً خلال ٢٤ ساعة — بدون نقاش." },
  { q: "هل أحتاج لتوفير أدوات التنظيف؟", a: "لا. الفريق يصل بكامل معداته ومواد التنظيف. تحتاج فقط لتوفير الماء والكهرباء." },
];

export default function AdsLanding() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWhatsApp = () => {
    const msg = "مرحباً، أريد الاستفسار عن خدمات التنظيف";
    window.open(`https://wa.me/966537519929?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = "tel:+966537519929";
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEO
        title="كلينولوجي — خدمات تنظيف احترافية في الرياض"
        description="كلينولوجي شركة تنظيف تعمل في الرياض منذ ٣ سنوات. +٦٩٠ عميل، مواد آمنة، ضمان رضا ١٠٠٪. احجز الآن."
        keywords="شركة تنظيف الرياض, تنظيف منازل الرياض, كلينولوجي"
        url="https://kleenology.me/book-now"
      />

      {/* Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <a href="/">
          <img
            src="/lovable-uploads/afda02d7-63e7-4998-92eb-dbe3d776cea3.png"
            alt="Kleenology"
            className="h-12 w-auto"
          />
        </a>
        <button
          onClick={handleCall}
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <Phone className="h-4 w-4" />
          <span dir="ltr">0537 519 929</span>
        </button>
      </header>

      {/* Hero */}
      <section className="bg-foreground text-white px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-white/50 text-sm tracking-widest uppercase mb-6 font-medium">
            Kleenology — الرياض
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            نظافة تليق بمنزلك.
            <br />
            <span className="text-brand-yellow">لا وعود فارغة.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            فريق معتمد يعمل في الرياض منذ ٣ سنوات. +٦٩٠ عميل وثقوا بنا،
            ومواد تنظيف آمنة لعائلتك. ضمان الرضا أو نعود مجاناً.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleWhatsApp}
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-base px-8 gap-2 h-12"
            >
              <MessageCircle className="h-5 w-5" />
              اطلب عرض سعر الآن
            </Button>
            <Button
              onClick={handleCall}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-12"
            >
              <Phone className="h-5 w-5" />
              اتصل مباشرة
            </Button>
          </div>
        </div>
      </section>

      {/* Stats — real numbers only */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-x-reverse divide-gray-100">
          {[
            { value: "+٦٩٠", label: "عميل في الرياض" },
            { value: "٣ سنوات", label: "خبرة في السوق" },
            { value: "٤.٩ ★", label: "متوسط التقييم" },
          ].map((s, i) => (
            <div key={i} className="py-8 text-center">
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2">خدماتنا</h2>
          <p className="text-gray-500 mb-10 text-sm">نتخصص في التنظيف — لا أكثر، لا أقل.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SERVICES.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="group flex items-center gap-3 border border-gray-100 rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                  {s.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">ماذا يشمل عملنا؟</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "تنظيف كامل لجميع الغرف",
              "تطهير وتعقيم الحمامات والمطبخ",
              "إزالة الأتربة من جميع الأسطح",
              "مسح وكنس الأرضيات",
              "تنظيف النوافذ من الداخل",
              "فريق يصل بكامل معداته ومواده",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-100">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-2">ماذا قال عملاؤنا</h2>
          <p className="text-gray-500 text-sm mb-10">تقييمات حقيقية من عملاء حقيقيين في الرياض</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{r.text}"</p>
                <p className="font-semibold text-foreground text-sm">{r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8">أسئلة شائعة</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-right font-semibold text-foreground text-sm"
                >
                  {faq.q}
                  <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            جاهز للحجز؟
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            تواصل معنا على واتساب وسنرتب معك الموعد المناسب خلال دقائق.
          </p>
          <Button
            onClick={handleWhatsApp}
            size="lg"
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-base px-10 gap-2 h-12"
          >
            <MessageCircle className="h-5 w-5" />
            اطلب عرض سعر الآن
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            أو اتصل مباشرة على{" "}
            <button onClick={handleCall} className="underline hover:text-foreground transition-colors" dir="ltr">
              0537 519 929
            </button>
          </p>
        </div>
      </section>

      {/* Footer minimal */}
      <div className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © 2024 كلينولوجي — الرياض، المملكة العربية السعودية
      </div>
    </div>
  );
}
