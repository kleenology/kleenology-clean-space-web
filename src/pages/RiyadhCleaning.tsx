import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TrustBadges } from "@/components/TrustBadges";
import {
  MessageCircle,
  CheckCircle2,
  MapPin,
  Star,
  Phone,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";
import { SEO } from "@/components/SEO";

const neighborhoods = [
  "حي العليا", "حي النخيل", "حي الملقا", "حي الياسمين",
  "حي الروضة", "حي الورود", "حي السليمانية", "حي المحمدية",
  "حي الربوة", "حي النرجس", "حي الصحافة", "حي الندى",
  "حي قرطبة", "حي الرائد", "حي الوادي", "حي العزيزية",
  "حي البديعة", "حي الشفا", "حي الملز", "حي الرحمانية",
  "حي الزهراء", "حي الفيحاء", "حي البطحاء", "حي المربع",
];

const services = [
  { icon: "🏠", title: "تنظيف المنازل بالرياض", desc: "تنظيف شامل لجميع أنواع المنازل والفلل في الرياض بأعلى معايير الجودة", href: "/home-cleaning" },
  { icon: "🏢", title: "تنظيف المكاتب بالرياض", desc: "خدمات تنظيف احترافية للمكاتب والشركات في منطقة الرياض", href: "/office-cleaning" },
  { icon: "✨", title: "التنظيف العميق بالرياض", desc: "تنظيف عميق وشامل يصل إلى أدق التفاصيل لمنزلك في الرياض", href: "/deep-cleaning" },
  { icon: "🧽", title: "تنظيف السجاد بالرياض", desc: "تنظيف وغسيل السجاد بالبخار وإزالة البقع الصعبة في الرياض", href: "/carpet-cleaning" },
  { icon: "🔨", title: "تنظيف ما بعد البناء بالرياض", desc: "تنظيف متخصص للمواقع الإنشائية وما بعد التشطيبات في الرياض", href: "/post-construction-cleaning" },
];

const stats = [
  { value: "+690", label: "عميل في الرياض" },
  { value: "٣", label: "سنوات خبرة" },
  { value: "٤.٩", label: "تقييم العملاء" },
  { value: "١٠٠٪", label: "ضمان الرضا" },
];

const reviews = [
  { name: "ياسر بن مضواح", text: "الله يوفقكم، فريق عمل متميز وشغل مرتب ونظيف", stars: 5, area: "حي الملقا" },
  { name: "حسن العتيبي", text: "دقة متناهية، اهتمام بأدق التفاصيل، واستعداد دائم لتقبل الملاحظات. خدمة حقيقية تستحق التجربة!", stars: 5, area: "حي النخيل" },
  { name: "الزين", text: "رائع شغلهم وإحترافي ماشاء الله، إن شاء الله مو آخر تعامل معاكم", stars: 5, area: "حي العليا" },
];

export default function RiyadhCleaning() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const handleWhatsApp = () => {
    const msg = "مرحباً، أريد الاستفسار عن خدمات التنظيف في الرياض";
    window.open(`https://wa.me/966537519929?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = "tel:+966537519929";
  };

  const riyadhJsonLd = [
    {
      "@type": "LocalBusiness",
      "name": "كلينولوجي | Kleenology",
      "alternateName": "Kleenology",
      "description": "أفضل شركة تنظيف في الرياض. تنظيف منازل، مكاتب، سجاد وتنظيف عميق بمواد آمنة وضمان الرضا ١٠٠٪",
      "url": "https://kleenology.me/cleaning-riyadh",
      "telephone": "+966537519929",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "الرياض",
        "addressRegion": "الرياض",
        "addressCountry": "SA",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "24.7136",
        "longitude": "46.6753",
      },
      "areaServed": neighborhoods.map((n) => ({ "@type": "Neighborhood", "name": n })),
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "690",
        "bestRating": "5",
      },
      "review": reviews.map((r) => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": r.name },
        "reviewRating": { "@type": "Rating", "ratingValue": String(r.stars), "bestRating": "5" },
        "reviewBody": r.text,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://kleenology.me" },
        { "@type": "ListItem", "position": 2, "name": "خدمات التنظيف في الرياض", "item": "https://kleenology.me/cleaning-riyadh" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title="شركة تنظيف منازل الرياض | كلينولوجي — خبرة +٣ سنوات"
        description="كلينولوجي أفضل شركة تنظيف في الرياض. تنظيف منازل، مكاتب، سجاد وتنظيف عميق بمواد آمنة وضمان الرضا ١٠٠٪. خدمة في جميع أحياء الرياض. احجز الآن!"
        keywords="شركة تنظيف الرياض, تنظيف منازل الرياض, تنظيف شقق الرياض, تنظيف فلل الرياض, شركة تنظيف بالرياض, تنظيف عميق الرياض, تنظيف سجاد الرياض, أفضل شركة تنظيف الرياض"
        url="https://kleenology.me/cleaning-riyadh"
        locale="ar_SA"
        jsonLd={riyadhJsonLd}
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-bl from-primary/10 via-background to-background text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <MapPin className="h-4 w-4" />
            خدمات التنظيف في الرياض
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
            أفضل شركة تنظيف{" "}
            <span className="text-primary">في الرياض</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            كلينولوجي — شركة تنظيف احترافية تخدم جميع أحياء الرياض منذ أكثر من ٣ سنوات.
            فريق معتمد، مواد آمنة، وضمان رضا كامل أو نعود مجاناً.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-base px-6 py-3 gap-2"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              احجز الآن عبر واتساب
            </Button>
            <Button
              onClick={handleCall}
              variant="outline"
              size="lg"
              className="text-base px-6 py-3 gap-2"
            >
              <Phone className="h-5 w-5" />
              اتصل بنا الآن
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-brand-yellow mb-1">{s.value}</div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              خدمات التنظيف في الرياض
            </h2>
            <p className="text-muted-foreground">نقدم حلول تنظيف متكاملة لجميع احتياجاتك في الرياض</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="group bg-white border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-primary/5 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              لماذا كلينولوجي هي الأفضل في الرياض؟
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: <Shield className="h-5 w-5 text-primary" />, title: "فريق معتمد وموثوق", desc: "جميع أفراد الفريق مدربون ومعتمدون بأعلى المعايير" },
              { icon: <Sparkles className="h-5 w-5 text-primary" />, title: "مواد تنظيف آمنة", desc: "نستخدم مواد صديقة للبيئة وآمنة للأطفال والحيوانات الأليفة" },
              { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, title: "ضمان الرضا ١٠٠٪", desc: "إذا لم تكن راضياً نعود ونعيد الخدمة مجاناً خلال ٢٤ ساعة" },
              { icon: <Clock className="h-5 w-5 text-primary" />, title: "التزام بالمواعيد", desc: "نصل في الوقت المحدد ونسلم العمل في الموعد المتفق عليه" },
              { icon: <MapPin className="h-5 w-5 text-primary" />, title: "خدمة في كل الرياض", desc: "نغطي جميع أحياء ومناطق مدينة الرياض بدون استثناء" },
              { icon: <Star className="h-5 w-5 text-primary" />, title: "+٦٩٠ عميل سعيد", desc: "ثقة أكثر من ٦٩٠ عائلة وشركة في الرياض تتحدث عنا" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 bg-white p-5 rounded-xl border border-border">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              أحياء الرياض التي نخدمها
            </h2>
            <p className="text-muted-foreground">نصل إليك في جميع أنحاء مدينة الرياض</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {neighborhoods.map((n, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium"
              >
                <MapPin className="h-3 w-3" />
                {n}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            لا تجد حيك؟ تواصل معنا — نخدم جميع أحياء الرياض
          </p>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-foreground px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">آراء عملائنا في الرياض</h2>
            <p className="text-white/60">ماذا يقول عملاؤنا عن خدماتنا</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/10">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{r.text}"</p>
                <div>
                  <div className="font-semibold text-white text-sm">{r.name}</div>
                  <div className="text-white/50 text-xs flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {r.area}، الرياض
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustBadges />

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            احجز خدمة التنظيف الآن في الرياض
          </h2>
          <p className="text-muted-foreground mb-8">
            تواصل معنا عبر واتساب وسنرد عليك خلال دقائق لتحديد موعدك
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-base px-8 py-3 gap-2"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              احجز عبر واتساب
            </Button>
            <Button
              href="/booking"
              variant="outline"
              size="lg"
              className="text-base px-8 py-3"
              onClick={() => (window.location.href = "/booking")}
            >
              نموذج الحجز الإلكتروني
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <Button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-float hover:shadow-lg transform hover:scale-110 transition-all duration-300"
        size="icon"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-7 w-7 text-white" />
      </Button>
    </div>
  );
}
