import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Home, Building2, Stethoscope, UtensilsCrossed, BedDouble, HardHat,
} from "lucide-react";

// بطاقات موحّدة بأيقونة لكل قطاع — والقطاع اللي له صفحة خدمة يوديك لها
const sectors: { key: string; href?: string; Icon: typeof Home }[] = [
  { key: "homes", href: "/home-cleaning", Icon: Home },
  { key: "offices", href: "/office-cleaning", Icon: Building2 },
  { key: "medical", Icon: Stethoscope },
  { key: "restaurants", Icon: UtensilsCrossed },
  { key: "hotels", Icon: BedDouble },
  { key: "construction", href: "/post-construction-cleaning", Icon: HardHat },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sectors.map(({ key, href, Icon }) => {
            const sector = c.sectors[key as keyof typeof c.sectors];
            const card = (
              <div className={cardClass(!!href)}>
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground mb-1 flex items-center gap-1.5">
                    {sector.label}
                    {href && (
                      <Arrow className="h-3.5 w-3.5 text-brand-blue opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{sector.desc}</p>
                </div>
              </div>
            );
            return href ? (
              <Link key={key} to={href} className="group h-full">{card}</Link>
            ) : (
              <div key={key} className="h-full">{card}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

function cardClass(clickable: boolean) {
  return [
    "h-full bg-card border rounded-2xl p-5 shadow-clean transition-all flex items-start gap-4",
    clickable ? "hover:shadow-float hover:border-brand-blue/40 hover:-translate-y-0.5 cursor-pointer" : "",
  ].join(" ");
}
