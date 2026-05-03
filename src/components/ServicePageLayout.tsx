import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";

export interface ServiceContent {
  seo: { title: string; description: string; keywords: string; url: string };
  hero: { icon: ReactNode; title: string; subtitle: string; whatsappText: string };
  stats: { value: string; label: string }[];
  includes: { title: string; items: string[] };
  benefits: { icon: ReactNode; title: string; desc: string }[];
  steps: { num: string; title: string; desc: string }[];
  cta: { title: string; subtitle: string; whatsappLabel: string; bookLabel: string };
  breadcrumb: string;
  heroGradient: string;
}

interface ServicePageLayoutProps {
  ar: ServiceContent;
  en: ServiceContent;
}

const WHATSAPP_NUMBER = "966537519929";

export const ServicePageLayout = ({ ar, en }: ServicePageLayoutProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const c = isRTL ? ar : en;

  const openWhatsApp = () => {
    if ((window as any).pixelTracker) {
      (window as any).pixelTracker.trackWhatsAppClick();
    }
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(c.hero.whatsappText)}`,
      "_blank"
    );
  };

  const openBooking = () => {
    window.location.href = "/booking";
  };

  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isRTL ? "الرئيسية" : "Home", "item": "https://kleenology.me" },
      { "@type": "ListItem", "position": 2, "name": c.breadcrumb, "item": c.seo.url },
    ],
  };

  const serviceJsonLd = {
    "@type": "Service",
    "name": c.seo.title.replace(/ \| كلينولوجي| \| Kleenology/g, ""),
    "description": c.seo.description,
    "url": c.seo.url,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Kleenology",
      "alternateName": "كلينولوجي",
      "url": "https://kleenology.me",
      "telephone": "+966537519929",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "الرياض",
        "addressCountry": "SA",
      },
    },
    "areaServed": {
      "@type": "City",
      "name": "Riyadh",
      "sameAs": "https://www.wikidata.org/wiki/Q3692",
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": c.includes.title,
      "itemListElement": c.includes.items.map((item) => ({
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": item },
      })),
    },
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO {...c.seo} jsonLd={[breadcrumbJsonLd, serviceJsonLd]} />
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className={`${c.heroGradient} py-20 px-4`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur mb-6">
              {c.hero.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {c.hero.title}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              {c.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={openWhatsApp}
                size="lg"
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-lg px-8 py-6 rounded-xl shadow-lg"
              >
                <MessageCircle className="h-5 w-5 me-2" />
                {c.cta.whatsappLabel}
              </Button>
              <Button
                onClick={openBooking}
                size="lg"
                variant="outline"
                className="bg-white/10 border-white text-white hover:bg-white hover:text-foreground text-lg px-8 py-6 rounded-xl"
              >
                <Calendar className="h-5 w-5 me-2" />
                {c.cta.bookLabel}
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-3 gap-4 text-center">
            {c.stats.map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Includes */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            {c.includes.title}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {c.includes.items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/40 rounded-xl p-4">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/30 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {c.benefits.map((b, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-border text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                    {b.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{b.title}</h3>
                  <p className="text-muted-foreground text-sm">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {c.steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white text-2xl font-bold mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-foreground text-background py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{c.cta.title}</h2>
            <p className="text-background/70 mb-8 text-lg">{c.cta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={openWhatsApp}
                size="lg"
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white text-lg px-8 py-6 rounded-xl"
              >
                <MessageCircle className="h-5 w-5 me-2" />
                {c.cta.whatsappLabel}
              </Button>
              <Button
                onClick={openBooking}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-foreground text-lg px-8 py-6 rounded-xl"
              >
                <Calendar className="h-5 w-5 me-2" />
                {c.cta.bookLabel}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
