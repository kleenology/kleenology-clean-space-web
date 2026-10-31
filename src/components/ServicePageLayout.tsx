import { useEffect, useRef, useState, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
// صور فريق كلينولوجي الحقيقية بالزي — نفس أسلوب صفحة المكاتب، بلا صور مولّدة
import teamGlass from "@/assets/deep-cleaning.jpg";
import teamShelves from "@/assets/home-cleaning.jpg";
import teamWindow from "@/assets/windows-cleaning.jpg";
import teamStairs from "@/assets/rehab-cleaning.jpg";
import teamMove from "@/assets/move-cleaning.jpg";

export interface ServiceContent {
  seo: { title: string; description: string; keywords: string; url: string };
  // الأيقونات و heroGradient باقية في النوع حتى لا تنكسر الصفحات، والتصميم ما يستخدمها
  hero: { icon?: ReactNode; title: string; subtitle: string; whatsappText: string };
  stats: { value: string; label: string }[];
  includes: { title: string; items: string[] };
  benefits: { icon?: ReactNode; title: string; desc: string }[];
  steps: { num: string; title: string; desc: string }[];
  cta: { title: string; subtitle: string; whatsappLabel: string; bookLabel: string };
  breadcrumb: string;
  heroGradient?: string;
  /** أسئلة شائعة — تظهر في الصفحة وتُضاف كبيانات FAQPage لقوقل والذكاء الاصطناعي */
  faq?: { q: string; a: string }[];
  /** روابط لخدمات قريبة — تربط الصفحات ببعض وتساعد ترتيبها */
  related?: { title: string; href: string }[];
}

interface ServicePageLayoutProps {
  ar: ServiceContent;
  en: ServiceContent;
  /** صورة الواجهة — صورة حقيقية من شغل الفريق تناسب الخدمة */
  photo: string;
  photoAlt: { ar: string; en: string };
}

const WHATSAPP_NUMBER = "966537519929";
const TEAM_PHOTOS = [teamShelves, teamWindow, teamStairs, teamMove, teamGlass];

export const ServicePageLayout = ({ ar, en, photo, photoAlt }: ServicePageLayoutProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const c = isRTL ? ar : en;

  const heroRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  // زر الحجز الثابت على الجوال يظهر بعد ما يتجاوز الزائر الواجهة
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting), { threshold: 0.1 });
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const openWhatsApp = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).pixelTracker?.trackWhatsAppClick?.();
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
  // نفس الأسئلة الظاهرة في الصفحة — قوقل يتجاهل FAQ مخفية عن الزائر
  const faqJsonLd = c.faq?.length
    ? {
        "@type": "FAQPage",
        "mainEntity": c.faq.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      }
    : null;
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@graph": faqJsonLd ? [breadcrumbJsonLd, faqJsonLd] : [breadcrumbJsonLd],
  };
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // صور الشريط: كل صور الفريق ما عدا صورة الواجهة
  const gallery = TEAM_PHOTOS.filter((src) => src !== photo).slice(0, 4);

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO {...c.seo} jsonLd={pageJsonLd} />
      <Header />

      <main>
        {/* ——— الواجهة ——— */}
        <section ref={heroRef} className="max-w-6xl mx-auto px-4 pt-28 pb-12 sm:pt-36 sm:pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-3">{isRTL ? "كلينولوجي للتنظيف · الرياض" : "Kleenology Cleaning · Riyadh"}</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.3] mb-5 text-brand-blue-deeper">{c.hero.title}</h1>
            <p className="text-lg text-foreground/80 leading-relaxed mb-7 max-w-xl">{c.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <Button onClick={openWhatsApp} size="lg"
                      className="h-12 px-7 text-base font-bold bg-[#25D366] hover:bg-[#20BA5A] text-white">
                <MessageCircle className="h-5 w-5 me-2" />
                {c.cta.whatsappLabel}
              </Button>
              <Button onClick={openBooking} size="lg" variant="outline" className="h-12 px-7 text-base">
                <Calendar className="h-5 w-5 me-2" />
                {c.cta.bookLabel}
              </Button>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-3">
              {c.stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-xl font-bold text-brand-blue-deeper">{s.value}</dd>
                  <dd className="text-xs text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <img src={photo} alt={isRTL ? photoAlt.ar : photoAlt.en}
               className="w-full aspect-[4/3] object-cover rounded-lg" />
        </section>

        {/* ——— صور الفريق ——— */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {gallery.map((src) => (
              <img key={src} src={src} alt="" aria-hidden="true" loading="lazy"
                   className="w-full aspect-square object-cover rounded-md" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{isRTL ? "فريقنا في الشغل" : "Our team at work"}</p>
        </section>

        {/* ——— وش يشمل ——— */}
        <section className="border-y bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{c.includes.title}</h2>
            <ul className="grid sm:grid-cols-2 gap-x-12 border-t">
              {c.includes.items.map((item) => (
                <li key={item} className="flex items-start gap-3 py-3.5 border-b">
                  <Check className="h-4 w-4 text-brand-blue mt-1 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ——— ليش نحن + الخطوات ——— */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold mb-6">{isRTL ? "ليش كلينولوجي" : "Why Kleenology"}</h2>
            <ol className="divide-y border-y">
              {c.benefits.map((b, i) => (
                <li key={b.title} className="py-5 flex gap-5">
                  <span className="text-sm font-bold text-brand-blue tabular-nums pt-0.5">0{i + 1}</span>
                  <div>
                    <h3 className="font-bold mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">{isRTL ? "كيف نشتغل" : "How it works"}</h2>
            <ol className="space-y-6">
              {c.steps.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="w-9 h-9 rounded-full border-2 border-brand-blue text-brand-blue font-bold flex items-center justify-center shrink-0 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-bold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ——— أسئلة شائعة ——— */}
        {c.faq?.length ? (
          <section className="max-w-3xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold mb-6">{isRTL ? "أسئلة شائعة" : "Common questions"}</h2>
            <Accordion type="single" collapsible className="border-t">
              {c.faq.map(({ q, a }, i) => (
                <AccordionItem key={q} value={`q${i}`}>
                  <AccordionTrigger className="text-start font-semibold hover:no-underline py-5">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        {/* ——— خدمات قريبة ——— */}
        {c.related?.length ? (
          <section className="max-w-6xl mx-auto px-4 pb-16">
            <h2 className="text-xl font-bold mb-4">{isRTL ? "خدمات قد تحتاجها" : "Related services"}</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 border-t">
              {c.related.map(({ title, href }) => (
                <li key={href} className="border-b">
                  <Link to={href} className="group flex items-center justify-between py-4 font-medium hover:text-brand-blue">
                    {title}
                    <Arrow className="h-4 w-4 text-brand-blue shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ——— الختام ——— */}
        <section className="bg-brand-blue-deeper text-white py-14 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{c.cta.title}</h2>
              <p className="text-white/75">{c.cta.subtitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button onClick={openWhatsApp} size="lg"
                      className="h-12 px-7 text-base font-bold bg-[#25D366] hover:bg-[#20BA5A] text-white">
                <MessageCircle className="h-5 w-5 me-2" />
                {c.cta.whatsappLabel}
              </Button>
              <Button onClick={openBooking} size="lg"
                      className="h-12 px-7 text-base bg-white text-brand-blue-deeper hover:bg-white/90">
                {c.cta.bookLabel}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ——— زر ثابت للجوال ——— */}
      <div className={cn(
        "fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur border-t md:hidden transition-transform duration-300",
        showSticky ? "translate-y-0" : "translate-y-full",
      )}>
        <Button onClick={openWhatsApp} size="lg" className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#20BA5A] text-white">
          <MessageCircle className="h-5 w-5 me-2" />
          {c.cta.whatsappLabel}
        </Button>
      </div>
    </div>
  );
};
