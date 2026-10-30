import { useTranslation } from "react-i18next";
import teamPhoto from "@/assets/deep-cleaning.jpg";

// وعودنا بجانب صورة حقيقية لفريقنا بالزي — بدل أربع بطاقات بأيقونات ملونة
// كانت تبان قالباً جاهزاً.
const badges = [
  {
    titleAr: "ضمان ١٠٠٪",
    titleEn: "100% Guarantee",
    descAr: "راضٍ أو نعود مجاناً",
    descEn: "Satisfied or we return free",
  },
  {
    titleAr: "فريق معتمد",
    titleEn: "Certified Team",
    descAr: "خبرة ومهنية عالية",
    descEn: "Highly trained professionals",
  },
  {
    titleAr: "مواد آمنة",
    titleEn: "Eco-Friendly",
    descAr: "آمنة لعائلتك والبيئة",
    descEn: "Safe for family & environment",
  },
  {
    titleAr: "خدمة سريعة",
    titleEn: "Fast Service",
    descAr: "نصل في الوقت المحدد دائماً",
    descEn: "Always on time delivery",
  },
];

export const TrustBadges = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  return (
    <section className="py-14 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <img
          src={teamPhoto}
          alt={isRTL ? "عامل من فريق كلينولوجي أثناء التنظيف" : "A Kleenology team member at work"}
          loading="lazy"
          className="w-full aspect-[4/3] object-cover rounded-lg"
        />
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-5">
            {isRTL ? "وش تضمن لما تحجز معنا" : "What you get when you book with us"}
          </h2>
          <ol className="divide-y border-y">
            {badges.map((b, i) => (
              <li key={b.titleEn} className="py-4 flex gap-4">
                <span className="text-sm font-bold text-brand-blue tabular-nums pt-0.5">0{i + 1}</span>
                <div>
                  <h3 className="font-bold text-foreground">{isRTL ? b.titleAr : b.titleEn}</h3>
                  <p className="text-sm text-muted-foreground">{isRTL ? b.descAr : b.descEn}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
