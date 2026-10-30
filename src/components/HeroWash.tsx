import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import cleanRoom from "@/assets/clean-apartment-bg.jpg";

// بطاقة الواجهة: مسّاحة صفراء تمسح الرغوة والوساخة عن الصورة وعدّاد دائري
// يعبّي حتى ١٠٠٪. الوساخة طبقة رسومية فوق نفس الصورة، لا صورة «قبل» حقيقية.

const DURATION = 3600;
const DELAY = 700;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

const GRIME = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
    <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 0.33  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 1.1 -0.38'/></filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`,
)}")`;

const STAINS =
  "radial-gradient(ellipse 25% 18% at 20% 75%, rgba(70,50,25,.5), transparent 70%)," +
  "radial-gradient(ellipse 16% 12% at 65% 82%, rgba(60,45,25,.45), transparent 70%)," +
  "radial-gradient(ellipse 22% 26% at 82% 28%, rgba(80,60,30,.3), transparent 70%)";

// فقاعات الرغوة — مواقع ثابتة حتى تطابق الصورة المُصيَّرة مسبقاً كل مرة
const BUBBLES = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 100, y: 45 + r(2) * 55, s: 6 + r(3) * 22 };
});

const copy = {
  ar: { working: "جاري التنظيف", done: "نظيف ✨", replay: "شوفها مرة ثانية" },
  en: { working: "Cleaning", done: "Spotless ✨", replay: "Watch again" },
};

function ProgressRing({ value, label }: { value: number; label: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-blue-deeper/90 backdrop-blur shadow-float flex items-center justify-center">
      <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
        <circle cx="40" cy="40" r={radius} fill="none" strokeWidth="5" strokeLinecap="round"
                className="stroke-brand-yellow"
                strokeDasharray={circumference} strokeDashoffset={circumference * (1 - value)} />
      </svg>
      <div className="relative text-center text-white leading-none">
        <div className="text-2xl sm:text-3xl font-bold tabular-nums">{Math.round(value * 100)}٪</div>
        <div className="text-[10px] mt-1 text-white/75">{label}</div>
      </div>
    </div>
  );
}

/** المسّاحة: مقبض أصفر وشفرة مطاط داكنة */
function Squeegee() {
  return (
    <svg viewBox="0 0 60 220" className="h-full w-auto drop-shadow-xl" aria-hidden="true">
      <rect x="22" y="0" width="16" height="120" rx="8" className="fill-brand-yellow" />
      <rect x="22" y="100" width="16" height="20" className="fill-black/10" />
      <rect x="8" y="118" width="44" height="14" rx="4" className="fill-brand-yellow" />
      <rect x="12" y="130" width="36" height="88" rx="5" fill="#1f2937" />
      <rect x="16" y="134" width="6" height="80" rx="3" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

export const HeroWash = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const c = isRTL ? copy.ar : copy.en;
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);

  const play = useCallback(() => {
    cancelAnimationFrame(frame.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    setProgress(0);
    const start = performance.now() + DELAY;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / DURATION));
      setProgress(easeInOut(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    play();
    return () => cancelAnimationFrame(frame.current);
  }, [play]);

  // الحافة مائلة قليلاً مثل حركة اليد، وتمشي مع اتجاه القراءة
  const edge = progress * 115 - 7; // تبدأ وتنتهي خارج البطاقة
  const tilt = 6;
  const dirtyClip = isRTL
    ? `polygon(0 0, ${100 - edge - tilt}% 0, ${100 - edge + tilt}% 100%, 0 100%)`
    : `polygon(${edge + tilt}% 0, 100% 0, 100% 100%, ${edge - tilt}% 100%)`;
  const bladePos = isRTL ? { right: `${edge}%` } : { left: `${edge}%` };
  const done = progress >= 1;

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-float ring-1 ring-black/5 bg-muted">
        <img src={cleanRoom} alt={isRTL ? "غرفة نظيفة بعد خدمة كلينولوجي" : "A clean room after a Kleenology service"}
             className="absolute inset-0 w-full h-full object-cover" />

        {!done && (
          <div className="absolute inset-0" style={{ clipPath: dirtyClip }} aria-hidden="true">
            <img src={cleanRoom} alt="" className="absolute inset-0 w-full h-full object-cover"
                 style={{ filter: "sepia(.55) saturate(.5) brightness(.7) contrast(1.15)" }} />
            <div className="absolute inset-0 mix-blend-multiply opacity-90" style={{ backgroundImage: GRIME }} />
            <div className="absolute inset-0" style={{ backgroundImage: STAINS }} />
            {/* رغوة الصابون */}
            <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-white/45 via-white/20 to-transparent" />
            {BUBBLES.map((b, i) => (
              <span key={i}
                    className="absolute rounded-full border-2 border-white/70 bg-white/15"
                    style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s }} />
            ))}
          </div>
        )}

        {progress > 0 && !done && (
          <div className="absolute inset-y-0 w-0 pointer-events-none" style={bladePos} aria-hidden="true">
            <div className="absolute inset-y-0 left-0 -translate-x-1/2 w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm" />
            {/* ارتفاع صريح: العنصر المطلق بلا ارتفاع يطوي النسبة المئوية لصفر */}
            <div className="absolute left-0 top-[14%] h-[72%]" style={{ transform: `translateX(-50%) rotate(${isRTL ? -tilt : tilt}deg)` }}>
              <Squeegee />
            </div>
          </div>
        )}

        {done && (
          <button type="button" onClick={play}
                  className="absolute bottom-4 start-4 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3.5 py-2 text-xs font-semibold text-brand-blue-deeper shadow-clean hover:bg-white animate-in fade-in duration-500">
            <RotateCcw className="h-3.5 w-3.5" />
            {c.replay}
          </button>
        )}
      </div>

      <div className="absolute -top-5 end-4 sm:-top-7 sm:-end-6">
        <ProgressRing value={progress} label={done ? c.done : c.working} />
      </div>
    </div>
  );
};
