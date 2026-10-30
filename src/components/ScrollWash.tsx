import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Droplets, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import cleanRoom from "@/assets/clean-apartment-bg.jpg";

// «الغسيل بالتمرير»: الصفحة تثبت على صورة مكان متّسخ، وكل ما نزل الزائر
// يمسح خط ماء الوساخة ويطلع المكان نظيفاً تحته. الوساخة طبقة رسومية فوق
// نفس الصورة (فلتر وتشويش)، لا صورة «قبل» حقيقية — ولذلك النص لا يدّعي
// أنها نتيجة عميل.

const clamp = (v: number) => Math.min(1, Math.max(0, v));

const copy = {
  ar: {
    steps: ["كذا يكون المكان قبلنا…", "ننظف كل زاوية بدقة", "وكذا نسلّمك إياه ✨"],
    hint: "مرّر للأسفل",
    clean: "نظافة",
    cta: "احجز تنظيفك",
  },
  en: {
    steps: ["This is where we start…", "Every corner, done right", "And this is how we hand it back ✨"],
    hint: "Scroll down",
    clean: "Clean",
    cta: "Book your cleaning",
  },
};

// تشويش بنّي يشبه الغبار والبقع — SVG مضمّن فلا يحتاج طلب شبكة
const GRIME = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
    <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 0.32  0 0 0 0 0.24  0 0 0 0 0.14  0 0 0 1.1 -0.35'/></filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`,
)}")`;

const STAINS =
  "radial-gradient(ellipse 22% 16% at 18% 72%, rgba(70,50,25,.55), transparent 70%)," +
  "radial-gradient(ellipse 14% 10% at 62% 80%, rgba(60,45,25,.5), transparent 70%)," +
  "radial-gradient(ellipse 18% 22% at 85% 30%, rgba(80,60,30,.35), transparent 70%)," +
  "radial-gradient(ellipse 30% 18% at 40% 25%, rgba(90,70,40,.3), transparent 70%)";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export const ScrollWash = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const c = isRTL ? copy.ar : copy.en;
  const reduced = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      setProgress(travel > 0 ? clamp(-rect.top / travel) : 0);
    };
    // حدّث مرة واحدة لكل إطار مهما كثرت أحداث التمرير — يبقى ناعماً على الجوال
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  // الغسيل يبدأ بعد لحظة من التثبيت وينتهي قبل آخر القسم، فيشوف الزائر البداية والنهاية
  const wash = reduced ? 1 : clamp((progress - 0.12) / 0.7);
  const step = wash < 0.08 ? 0 : wash < 0.92 ? 1 : 2;
  const percent = Math.round(wash * 100);
  // في العربي يمشي الماء من اليمين لليسار مع اتجاه القراءة
  const edge = `${wash * 100}%`;
  const dirtyClip = isRTL ? `inset(0 ${edge} 0 0)` : `inset(0 0 0 ${edge})`;
  const lineSide = isRTL ? { right: edge } : { left: edge };
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const goBook = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).pixelTracker?.trackButtonClick?.("scroll_wash_booking");
    window.location.href = "/booking";
  };

  return (
    <section
      ref={sectionRef}
      dir={isRTL ? "rtl" : "ltr"}
      className={reduced ? "relative" : "relative h-[260vh] md:h-[300vh]"}
      aria-label={c.steps[2]}
    >
      <div className={reduced ? "relative h-[80vh]" : "sticky top-0 h-[100svh] overflow-hidden"}>
        {/* النظيف تحت */}
        <img src={cleanRoom} alt="" aria-hidden="true" loading="lazy"
             className="absolute inset-0 w-full h-full object-cover" />

        {/* المتّسخ فوق، ينقص من جهة الماء */}
        {wash < 1 && (
          <div className="absolute inset-0" style={{ clipPath: dirtyClip }} aria-hidden="true">
            <img src={cleanRoom} alt="" loading="lazy"
                 className="absolute inset-0 w-full h-full object-cover"
                 style={{ filter: "sepia(.55) saturate(.55) brightness(.68) contrast(1.15)" }} />
            <div className="absolute inset-0 mix-blend-multiply opacity-90" style={{ backgroundImage: GRIME }} />
            <div className="absolute inset-0" style={{ backgroundImage: STAINS }} />
          </div>
        )}

        {/* خط الماء */}
        {wash > 0 && wash < 1 && (
          <div className="absolute inset-y-0 w-0 pointer-events-none" style={lineSide} aria-hidden="true">
            <div className="absolute inset-y-0 left-0 -translate-x-1/2 w-1.5 bg-white/90 shadow-[0_0_25px_8px_rgba(186,230,253,0.9)]" />
            <div className="absolute inset-y-0 left-0 -translate-x-1/2 w-24 bg-gradient-to-r from-transparent via-sky-200/25 to-transparent blur-md" />
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-float flex items-center justify-center">
              <Droplets className="h-7 w-7 text-brand-blue" />
            </div>
          </div>
        )}

        {/* تظليل خفيف حتى يقرأ النص فوق أي جزء من الصورة */}
        <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/55 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col justify-between py-10 sm:py-16 text-white">
          {/* المسافة العلوية تترك مكان الشريط الثابت فوق */}
          <div className="text-center pt-16 sm:pt-20">
            <div className="relative h-12 sm:h-16">
              {c.steps.map((text, i) => (
                <h2
                  key={text}
                  className={`absolute inset-x-0 text-3xl sm:text-5xl font-bold drop-shadow-lg transition-all duration-500 ${
                    i === step ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  {text}
                </h2>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3 rounded-full bg-white/15 backdrop-blur-md px-5 py-2.5 border border-white/25">
              <Sparkles className="h-5 w-5 text-brand-yellow" />
              <span className="text-sm">{c.clean}</span>
              <span className="text-2xl font-bold tabular-nums w-16 text-center">{percent}٪</span>
              <div className="w-24 sm:w-40 h-2 rounded-full bg-white/25 overflow-hidden">
                <div className="h-full bg-brand-yellow rounded-full" style={{ width: `${percent}%` }} />
              </div>
            </div>

            <div className="h-14 flex items-center">
              {step === 2 ? (
                <Button size="lg" onClick={goBook}
                        className="h-14 px-8 text-lg font-bold bg-brand-yellow text-brand-blue-deeper hover:bg-brand-yellow/90 shadow-float animate-in fade-in zoom-in-95 duration-300">
                  {c.cta}
                  <Arrow className={`h-5 w-5 ${isRTL ? "mr-2" : "ml-2"}`} />
                </Button>
              ) : (
                <span className="text-sm text-white/80 animate-bounce">↓ {c.hint}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
