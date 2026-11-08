import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const ALL_REVIEWS_URL = "https://kleenology.github.io/Feedback/reviews.html";

interface Review { nameAr: string; nameEn: string; textAr: string; textEn: string; rating: number; }

const DEFAULT_REVIEWS: Review[] = [
  {
    nameAr: "ياسر بن مضواح",
    nameEn: "Yaser bin Mudwah",
    textAr: "الله يوفقكم، فريق عمل متميز وشغل مرتب ونظيف",
    textEn: "May God bless you, an outstanding team with neat and clean work",
    rating: 5,
  },
  {
    nameAr: "آلاء القرشي",
    nameEn: "Alaa Al-Qurashi",
    textAr: "خدمتهم جداً رائعة، يستحقون التجربة",
    textEn: "Their service is truly wonderful, they deserve to be tried",
    rating: 5,
  },
  {
    nameAr: "حسن العتيبي",
    nameEn: "Hassan Al-Otaibi",
    textAr: "شكراً كلينولوجي على الخدمة والتجربة الرائعة. والله دقة متناهية، اهتمام بأدق التفاصيل، واستعداد دائم لتقبل الملاحظات بصدر رحب والتأكد من رضا العميل. استخدموا مواد تنظيف متخصصة لإزالة أصعب البقايا والرواسب، وعملوا يومين متتاليين لتنظيف الفيلا. إدارة وإشراف سعودي لمتابعة كل التفاصيل. خدمة حقيقية تستحق التجربة وبقوة!",
    textEn: "Thank you Kleenology for the amazing experience. Incredible precision, attention to the finest details, and always ready to receive feedback. They worked two consecutive days on the villa. A service that truly deserves a try!",
    rating: 5,
  },
  {
    nameAr: "الزين",
    nameEn: "AlZain",
    textAr: "الله يعطيهم الف عافية، رائع شغلهم وإحترافي ماشاء الله، إن شاء الله مو آخر تعامل معاكم",
    textEn: "May God bless them, their work is wonderful and professional mashallah. Definitely not our last deal with you!",
    rating: 5,
  },
  {
    nameAr: "ف",
    nameEn: "F",
    textAr: "من افضل شركات التنظيف في الرياض، تعاملت مع شركات كثيرة لكن للأسف بعد ما ينظفون ويمشون تلقى ملاحظات. لكن شركة كلينولوجي كسرت هذي القاعدة، مهتمين برضا العميل. أنصحكم بالتعامل معهم وبقوة عن تجربة!",
    textEn: "One of the best cleaning companies in Riyadh. Kleenology broke the pattern — they truly care about client satisfaction. Highly recommend from experience!",
    rating: 5,
  },
  {
    nameAr: "Om Faisal 20",
    nameEn: "Om Faisal 20",
    textAr: "ماشاء الله طلبتهم والحمدلله متوفرين في نفس اليوم، سعر منطقي، وأخذوا وقتهم وهم ينظفون. العمالة مع مشرف من الجنسية السودانية.",
    textEn: "Mashallah, I called them and they were available the same day. Reasonable price, they took their time cleaning.",
    rating: 5,
  },
];

export const Testimonials = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [current, setCurrent] = useState(0);
  const [dynamic, setDynamic] = useState<Review[]>([]);

  // الآراء المعتمدة من العملاء تُعرض أولاً، ثم الآراء الأساسية
  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled || !Array.isArray(data.reviews)) return;
        const mapped: Review[] = data.reviews
          .filter((r: { text?: string; rating?: number }) => r.text && r.rating)
          .map((r: { name?: string; text: string; rating: number }) => ({
            nameAr: r.name || "عميل", nameEn: r.name || "Client",
            textAr: r.text, textEn: r.text, rating: r.rating,
          }));
        if (mapped.length) setDynamic(mapped);
      })
      .catch(() => { /* نكتفي بالآراء الأساسية */ });
    return () => { cancelled = true; };
  }, []);

  const reviews = useMemo(() => [...dynamic, ...DEFAULT_REVIEWS], [dynamic]);

  const prev = () => setCurrent((c) => (c === 0 ? reviews.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === reviews.length - 1 ? 0 : c + 1));

  const review = reviews[current] ?? reviews[0];

  return (
    <section className="py-20 bg-muted/30" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Star className="h-4 w-4 text-brand-yellow fill-brand-yellow" />
            {isRTL ? "آراء عملائنا" : "Client Reviews"}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isRTL ? "ماذا يقول عملاؤنا؟" : "What Our Clients Say"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {isRTL ? "تجارب حقيقية من عملاء وثقوا بكلينولوجي" : "Real experiences from clients who trusted Kleenology"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-clean border border-border p-8 md:p-12 relative">

          {/* Quote */}
          <Quote className="h-12 w-12 text-primary/10 mb-6" />

          {/* Stars */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: review.rating }).map((_, i) => (
              <Star key={i} className="h-5 w-5 text-brand-yellow fill-brand-yellow" />
            ))}
          </div>

          {/* Text */}
          <p className="text-foreground/80 text-lg leading-relaxed mb-10 min-h-[80px]">
            {isRTL ? review.textAr : review.textEn}
          </p>

          {/* Author */}
          <div className="flex items-center gap-4 border-t border-border pt-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
              {(isRTL ? review.nameAr : review.nameEn).charAt(0)}
            </div>
            <div>
              <p className="font-bold text-foreground">
                {isRTL ? review.nameAr : review.nameEn}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "عميل موثق" : "Verified Client"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={prev}
            className="w-11 h-11 rounded-full bg-white border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-6 h-3 bg-primary" : "w-3 h-3 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-11 h-11 rounded-full bg-white border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* رابط صفحة جميع الآراء */}
        <div className="text-center mt-8">
          <a href={ALL_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 bg-white border border-border hover:border-primary hover:text-primary px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-colors">
            <Star className="h-4 w-4 text-brand-yellow fill-brand-yellow" />
            {isRTL ? "شاهد جميع آراء عملائنا" : "See all our reviews"}
          </a>
        </div>

      </div>
    </section>
  );
};
