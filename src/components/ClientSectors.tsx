import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

// قائمة نصية بدل ست بطاقات بأيقونات — والقطاع اللي له صفحة خدمة يوديك لها
const sectors: { key: string; href?: string }[] = [
  { key: "homes", href: "/home-cleaning" },
  { key: "offices", href: "/office-cleaning" },
  { key: "medical" },
  { key: "restaurants" },
  { key: "hotels" },
  { key: "construction", href: "/post-construction-cleaning" },
];

const content = {
  ar: {
    title: "من نخدم؟",
    subtitle: "نقدم خدماتنا لمختلف القطاعات بأعلى معايير النظافة والاحترافية",
    sectors: {
      homes: { label: "المنازل والشقق", desc: "تنظيف منازل وشقق سكنية بكل أحجامها" },
      offices: { label: "الشركات والمكاتب", desc: "بيئة عمل نظيفة تعكس احترافية شركتك" },
      medical: { label: "العيادات والمستشفيات", desc: "تعقيم وتنظيف بمعايير طبية عالية" },
      restaurants: { label: "المطاعم والكافيهات", desc: "نظافة مطابخ وصالات بمعايير الصحة العامة" },
      hotels: { label: "الفنادق والشقق المفروشة", desc: "تنظيف احترافي يليق بضيوفك" },
      construction: { label: "المقاولات والتشطيبات", desc: "تنظيف ما بعد البناء وتسليم جاهز" },
    },
  },
  en: {
    title: "Who We Serve",
    subtitle: "We deliver cleaning services across all sectors with the highest standards of quality",
    sectors: {
      homes: { label: "Homes & Apartments", desc: "Cleaning for residential spaces of all sizes" },
      offices: { label: "Companies & Offices", desc: "A clean workplace that reflects your professionalism" },
      medical: { label: "Clinics & Hospitals", desc: "Sanitization and cleaning to medical-grade standards" },
      restaurants: { label: "Restaurants & Cafes", desc: "Kitchen and dining area cleaning to health standards" },
      hotels: { label: "Hotels & Furnished Apartments", desc: "Professional cleaning worthy of your guests" },
      construction: { label: "Construction & Finishing", desc: "Post-construction cleanup, ready for handover" },
    },
  },
};

export const ClientSectors = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const c = isRTL ? content.ar : content.en;

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 bg-muted/30 border-y" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{c.title}</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl">{c.subtitle}</p>

        <ul className="grid md:grid-cols-2 gap-x-12 border-t">
          {sectors.map(({ key, href }) => {
            const sector = c.sectors[key as keyof typeof c.sectors];
            const body = (
              <>
                <div>
                  <h3 className="font-bold text-foreground">{sector.label}</h3>
                  <p className="text-sm text-muted-foreground">{sector.desc}</p>
                </div>
                {href && <Arrow className="h-4 w-4 text-brand-blue shrink-0 transition-transform rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />}
              </>
            );
            return (
              <li key={key} className="border-b">
                {href ? (
                  <Link to={href} className="group flex items-center justify-between gap-4 py-4 hover:text-brand-blue">
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center justify-between gap-4 py-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};
