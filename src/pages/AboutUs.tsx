import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { TrustBadges } from "@/components/TrustBadges";
import { Button } from "@/components/ui/button";
import { MessageCircle, Target, Eye, Heart, Users, Calendar, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const content = {
  ar: {
    seoTitle: "من نحن | كلينولوجي",
    seoDesc: "تعرف على كلينولوجي، شركة التنظيف الاحترافية في الرياض. قصتنا، رؤيتنا، وفريقنا المتخصص.",
    hero: {
      tag: "من نحن",
      title: "كلينولوجي — نظافة من القلب",
      subtitle: "بدأنا بحلم بسيط: أن نقدم خدمة تنظيف تليق بكل بيت وكل شركة في الرياض. اليوم، بعد ٣ سنوات و٦٩٠+ عميل سعيد، نفخر بأننا من أكثر شركات التنظيف ثقةً في المنطقة.",
      whatsapp: "تواصل معنا",
    },
    story: {
      title: "قصتنا",
      text: "انطلقت كلينولوجي من الرياض بهدف واحد: رفع معيار خدمات التنظيف في المملكة. آمنا بأن النظافة ليست مجرد إزالة الأوساخ، بل هي تجربة تستحق الاهتمام بكل تفصيلة صغيرة. بدأنا بفريق صغير ومتحمس، وكل عميل راضٍ كان يزيدنا إصراراً على التطور والتميز.",
    },
    values: [
      { icon: Target, title: "مهمتنا", text: "تقديم خدمات تنظيف احترافية تتجاوز توقعات عملائنا مع الحفاظ على أعلى معايير الجودة والأمان." },
      { icon: Eye, title: "رؤيتنا", text: "أن نكون الخيار الأول لكل عميل يبحث عن نظافة حقيقية وخدمة موثوقة في الرياض والمملكة." },
      { icon: Heart, title: "قيمنا", text: "الأمانة، الدقة، احترام العميل، والسعي الدائم للتحسين. هذه قيم لا نتنازل عنها أبداً." },
    ],
    stats: [
      { icon: Calendar, value: "٣", label: "سنوات خبرة" },
      { icon: Users, value: "٦٩٠+", label: "عميل سعيد" },
      { icon: MapPin, value: "الرياض", label: "نخدمكم في" },
    ],
    cta: "احجز خدمتك الآن",
  },
  en: {
    seoTitle: "About Us | Kleenology",
    seoDesc: "Learn about Kleenology, the professional cleaning company in Riyadh. Our story, vision, and specialized team.",
    hero: {
      tag: "About Us",
      title: "Kleenology — Clean From the Heart",
      subtitle: "We started with a simple dream: to deliver cleaning services worthy of every home and business in Riyadh. Today, after 3 years and 690+ happy clients, we're proud to be one of the most trusted cleaning companies in the region.",
      whatsapp: "Contact Us",
    },
    story: {
      title: "Our Story",
      text: "Kleenology launched in Riyadh with one goal: to raise the standard of cleaning services in Saudi Arabia. We believed that cleanliness isn't just about removing dirt — it's an experience that deserves attention to every small detail. We started with a small, passionate team, and every satisfied client pushed us to grow and excel.",
    },
    values: [
      { icon: Target, title: "Our Mission", text: "To deliver professional cleaning services that exceed our clients' expectations while maintaining the highest standards of quality and safety." },
      { icon: Eye, title: "Our Vision", text: "To be the first choice for every client seeking genuine cleanliness and reliable service in Riyadh and Saudi Arabia." },
      { icon: Heart, title: "Our Values", text: "Honesty, precision, client respect, and a constant drive for improvement — values we never compromise on." },
    ],
    stats: [
      { icon: Calendar, value: "3", label: "Years of Experience" },
      { icon: Users, value: "690+", label: "Happy Clients" },
      { icon: MapPin, value: "Riyadh", label: "Serving" },
    ],
    cta: "Book Your Service Now",
  },
};

const AboutUs = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const c = isRTL ? content.ar : content.en;

  const aboutJsonLd = [
    {
      "@type": "Organization",
      "name": "Kleenology",
      "alternateName": "كلينولوجي",
      "url": "https://kleenology.me",
      "logo": "https://kleenology.me/logobg.png",
      "foundingDate": "2022",
      "description": isRTL ? content.ar.hero.subtitle : content.en.hero.subtitle,
      "telephone": "+966537519929",
      "email": "Contract@kleenology.net",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "الرياض",
        "addressCountry": "SA",
      },
      "sameAs": ["https://www.tiktok.com/@kleenology"],
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": isRTL ? "الرئيسية" : "Home", "item": "https://kleenology.me" },
        { "@type": "ListItem", "position": 2, "name": isRTL ? "من نحن" : "About Us", "item": "https://kleenology.me/about" },
      ],
    },
  ];

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={c.seoTitle}
        description={c.seoDesc}
        keywords="كلينولوجي, من نحن, شركة تنظيف الرياض, kleenology about"
        url="https://kleenology.me/about"
        locale={isRTL ? "ar_SA" : "en_US"}
        jsonLd={aboutJsonLd}
      />
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary via-primary/80 to-brand-blue py-20 px-4 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              {c.hero.tag}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{c.hero.title}</h1>
            <p className="text-xl text-white/90 leading-relaxed mb-10">{c.hero.subtitle}</p>
            <Button
              onClick={() => window.open("https://wa.me/966537519929", "_blank")}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-lg px-8 py-6 rounded-xl"
            >
              <MessageCircle className="h-5 w-5 me-2" />
              {c.hero.whatsapp}
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b border-border py-10 px-4">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
            {c.stats.map((s, i) => (
              <div key={i}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3 mx-auto">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground" dir="ltr">{s.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="py-16 px-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-6">{c.story.title}</h2>
          <p className="text-muted-foreground text-lg leading-loose">{c.story.text}</p>
        </section>

        {/* Values */}
        <section className="bg-muted/30 py-16 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {c.values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-border text-center hover:shadow-clean transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{v.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />

        {/* CTA */}
        <section className="bg-foreground text-background py-16 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              {isRTL ? "جاهز تجرب الفرق؟" : "Ready to Experience the Difference?"}
            </h2>
            <Button
              onClick={() => window.location.href = "/booking"}
              size="lg"
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-lg px-10 py-6 rounded-xl"
            >
              <MessageCircle className="h-5 w-5 me-2" />
              {c.cta}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
