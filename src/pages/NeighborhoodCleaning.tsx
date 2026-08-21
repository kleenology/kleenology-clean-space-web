import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  MessageCircle, MapPin, CheckCircle2,
  Star, Shield, Sparkles, Clock,
} from "lucide-react";
import { neighborhoods, getNeighborhood } from "@/data/neighborhoods";

const WHATSAPP = "966537519929";

const services = [
  { icon: "🏠", title: "تنظيف المنازل والشقق",     href: "/home-cleaning" },
  { icon: "✨", title: "التنظيف العميق الشامل",     href: "/deep-cleaning" },
  { icon: "🧽", title: "تنظيف السجاد بالبخار",      href: "/carpet-cleaning" },
  { icon: "🏢", title: "تنظيف المكاتب والشركات",    href: "/office-cleaning" },
  { icon: "🔨", title: "تنظيف ما بعد البناء",       href: "/post-construction-cleaning" },
];

const reviews = [
  { name: "ياسر بن مضواح",  text: "الله يوفقكم، فريق عمل متميز وشغل مرتب ونظيف",                                          stars: 5 },
  { name: "حسن العتيبي",    text: "دقة متناهية، اهتمام بأدق التفاصيل. خدمة حقيقية تستحق التجربة!",                          stars: 5 },
  { name: "الزين",           text: "رائع شغلهم وإحترافي ماشاء الله، إن شاء الله مو آخر تعامل معاكم",                        stars: 5 },
];

const whyUs = [
  { icon: <Shield className="h-5 w-5 text-primary" />,    title: "ضمان الرضا ١٠٠٪",        desc: "نعود مجاناً خلال ٢٤ ساعة إذا لم تكن راضياً" },
  { icon: <Sparkles className="h-5 w-5 text-primary" />,  title: "مواد آمنة للعائلة",       desc: "منتجات صديقة للبيئة وآمنة للأطفال والحيوانات" },
  { icon: <Clock className="h-5 w-5 text-primary" />,     title: "التزام بالمواعيد",         desc: "نصل في الوقت المحدد دون تأخير" },
  { icon: <CheckCircle2 className="h-5 w-5 text-primary" />, title: "فريق موثوق ومعتمد",   desc: "جميع أفراد الفريق مدربون ومعتمدون" },
];

export default function NeighborhoodCleaning() {
  const { neighborhood: slug } = useParams<{ neighborhood: string }>();
  const n = slug ? getNeighborhood(slug) : null;

  if (!n) return <Navigate to="/cleaning-riyadh" replace />;

  const handleWhatsApp = () => {
    const msg = `مرحباً، أريد الاستفسار عن خدمات التنظيف في ${n.fullNameAr} بالرياض`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const nearby = [
    ...neighborhoods.filter(nb => nb.slug !== n.slug && nb.district === n.district),
    ...neighborhoods.filter(nb => nb.slug !== n.slug && nb.district !== n.district),
  ].slice(0, 6);

  const pageUrl = `https://kleenology.me/cleaning-riyadh/${n.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "الرئيسية",            "item": "https://kleenology.me" },
        { "@type": "ListItem", "position": 2, "name": "تنظيف الرياض",        "item": "https://kleenology.me/cleaning-riyadh" },
        { "@type": "ListItem", "position": 3, "name": `تنظيف ${n.fullNameAr}`, "item": pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": `خدمات تنظيف ${n.fullNameAr} بالرياض`,
      "description": `كلينولوجي تقدم خدمات تنظيف احترافية في ${n.fullNameAr} بالرياض. تنظيف منازل، سجاد، وتنظيف عميق بمواد آمنة وضمان رضا ١٠٠٪`,
      "url": pageUrl,
      "serviceType": "Cleaning Service",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Kleenology",
        "alternateName": "كلينولوجي",
        "url": "https://kleenology.me",
        "telephone": "+966537519929",
      },
      "areaServed": {
        "@type": "Neighborhood",
        "name": n.fullNameAr,
        "containedInPlace": { "@type": "City", "name": "الرياض", "sameAs": "https://www.wikidata.org/wiki/Q3692" },
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title={`تنظيف منازل ${n.fullNameAr} بالرياض | كلينولوجي`}
        description={`كلينولوجي — خدمات تنظيف احترافية في ${n.fullNameAr}، ${n.district}. تنظيف منازل، عميق، وسجاد بمواد آمنة وضمان رضا ١٠٠٪. احجز الآن!`}
        keywords={`تنظيف ${n.fullNameAr}, تنظيف منازل ${n.fullNameAr}, شركة تنظيف ${n.fullNameAr}, تنظيف ${n.nameAr} الرياض, كلينولوجي`}
        url={pageUrl}
        jsonLd={jsonLd}
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-bl from-primary/10 via-background to-background text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <MapPin className="h-4 w-4" />
            {n.district}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
            تنظيف منازل{" "}
            <span className="text-primary">{n.fullNameAr}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            {n.description}
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
              onClick={() => (window.location.href = "/booking")}
              variant="outline"
              size="lg"
              className="text-base px-6 py-3"
            >
              نموذج الحجز الإلكتروني
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "+690", label: "عميل في الرياض" },
              { value: "٤.٩",  label: "تقييم العملاء" },
              { value: "١٠٠٪", label: "ضمان الرضا" },
              { value: "٣+",   label: "سنوات خبرة" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-brand-yellow mb-1">{s.value}</div>
                <div className="text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              خدماتنا في {n.fullNameAr}
            </h2>
            <p className="text-muted-foreground">حلول تنظيف متكاملة لسكان {n.fullNameAr}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s, i) => (
              <a
                key={i}
                href={s.href}
                className="group bg-white border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 bg-primary/5 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            لماذا كلينولوجي في {n.fullNameAr}؟
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyUs.map((item, i) => (
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

      {/* Reviews */}
      <section className="py-16 bg-foreground px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-white text-center mb-8">آراء عملائنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/10">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-4">"{r.text}"</p>
                <div className="font-semibold text-white text-sm">{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby neighborhoods */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            نخدم أيضاً الأحياء المجاورة
          </h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {nearby.map((nb, i) => (
              <Link
                key={i}
                to={`/cleaning-riyadh/${nb.slug}`}
                className="inline-flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium hover:bg-primary/10 transition-colors"
              >
                <MapPin className="h-3 w-3" />
                {nb.fullNameAr}
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            <Link to="/cleaning-riyadh" className="text-primary hover:underline">
              عرض جميع أحياء الرياض ←
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 text-center bg-primary/5">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            احجز تنظيف منزلك في {n.fullNameAr} الآن
          </h2>
          <p className="text-muted-foreground mb-8">
            تواصل معنا عبر واتساب وسنرد عليك خلال دقائق لتحديد موعدك
          </p>
          <Button
            onClick={handleWhatsApp}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-base px-8 py-3 gap-2"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            احجز عبر واتساب
          </Button>
        </div>
      </section>

      <Footer />

    </div>
  );
}
