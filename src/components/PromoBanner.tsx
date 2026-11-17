import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

const itemsAr = [
  "✨ خدمة تنظيف احترافية",
  "🏅 فريق معتمد ذو خبرة +٣ سنوات",
  "✅ ضمان الرضا أو نعود مجاناً",
  "🌿 مواد تنظيف آمنة وصديقة للبيئة",
  "📞 تواصل معنا الآن واحجز موعدك",
];

const itemsEn = [
  "✨ Professional cleaning service",
  "🏅 Certified team with 3+ years experience",
  "✅ Satisfaction guarantee or we return free",
  "🌿 Safe & eco-friendly cleaning products",
  "📞 Contact us now and book your appointment",
];

export const PromoBanner = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const items = isRTL ? itemsAr : itemsEn;
  const repeated = [...items, ...items];

  return (
    <div className="bg-foreground overflow-hidden py-2.5 border-b border-white/10">
      <div className="flex animate-marquee-left whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-8 text-brand-yellow text-sm font-semibold">
            <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
