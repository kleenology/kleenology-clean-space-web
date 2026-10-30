import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// مقدّمة الصفحة الرئيسية: الشاشة كلها «زجاج» مغبّر شبه شفاف، ومسّاحة صفراء
// تروح وتجي عليه سطراً سطراً مثل تنظيف النوافذ حتى يظهر الموقع تحته.
// تظهر مرة واحدة في الزيارة، تُتخطى بضغطة، ولا تظهر لمن يفضّل تقليل الحركة.

const SEEN_KEY = "kleenology_intro_seen";
// كل سطر ثانية: بطيء كفاية يشوف الزائر المسح، والمقدّمة كلها حوالي ٣٫٥ ثانية
const PASS_MS = 1000;
const DROP_MS = 260;

const copy = {
  ar: { working: "جاري التنظيف", skip: "تخطّي", scrawl: "نظّفني" },
  en: { working: "Cleaning", skip: "Skip", scrawl: "Clean me" },
};

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function shouldPlay() {
  try {
    if (navigator.userAgent === "ReactSnap") return false; // لقطة التصيير المسبق تبقى نظيفة
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return false;
  }
}

/** يرسم طبقة الغبار على كامل اللوحة */
function paintGrime(ctx: CanvasRenderingContext2D, w: number, h: number, scrawl: string, rtl: boolean) {
  // رقعة تشويش صغيرة تتكرر — أسرع بكثير من رسم كل نقطة على الشاشة
  const tile = document.createElement("canvas");
  tile.width = tile.height = 160;
  const t = tile.getContext("2d")!;
  const img = t.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random();
    img.data[i] = 70 + v * 40;
    img.data[i + 1] = 55 + v * 30;
    img.data[i + 2] = 35 + v * 20;
    img.data[i + 3] = 30 + v * 60;
  }
  t.putImageData(img, 0, 0);

  // شفافة نوعاً ما: الموقع يبان تحتها مثل زجاج مغبّر
  ctx.fillStyle = "rgba(120, 98, 68, 0.55)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = ctx.createPattern(tile, "repeat")!;
  ctx.fillRect(0, 0, w, h);

  // بقع داكنة
  for (let i = 0; i < 9; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 60 + Math.random() * 160;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(60, 42, 22, 0.3)");
    g.addColorStop(1, "rgba(60, 42, 22, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // آثار مسح قديمة: خطوط مائلة باهتة مثل زجاج ما انمسح زين
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 7; i++) {
    const x = Math.random() * w, y = Math.random() * h, len = 120 + Math.random() * 260;
    ctx.strokeStyle = "rgba(255, 245, 225, 0.07)";
    ctx.lineWidth = 18 + Math.random() * 30;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len * 0.8, y + len * 0.35);
    ctx.stroke();
  }
  ctx.restore();

  // «نظّفني» مكتوبة بالإصبع على الوساخة
  ctx.save();
  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 ${Math.min(w / 5, 120)}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.translate(w / 2, h * 0.38);
  ctx.rotate(-0.06);
  ctx.fillStyle = "rgba(255, 245, 225, 0.35)";
  ctx.fillText(scrawl, 0, 0);
  ctx.restore();
}

/** مسّاحة: شفرة مطاط عمودية وحامل ومقبض أصفر للخلف */
function Squeegee({ flip }: { flip: boolean }) {
  return (
    <svg viewBox="0 0 120 200" className="h-full w-auto drop-shadow-2xl"
         style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden="true">
      <rect x="62" y="88" width="58" height="22" rx="11" className="fill-brand-yellow" transform="rotate(-12 62 99)" />
      <rect x="30" y="6" width="34" height="188" rx="10" className="fill-brand-yellow" />
      <rect x="36" y="14" width="6" height="172" rx="3" fill="rgba(255,255,255,0.35)" />
      <rect x="8" y="0" width="26" height="200" rx="6" fill="#1f2937" />
      <rect x="12" y="6" width="4" height="188" rx="2" fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

export const CleanIntro = () => {
  const { i18n } = useTranslation();
  const rtl = i18n.dir() === "rtl";
  const c = rtl ? copy.ar : copy.en;

  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [percent, setPercent] = useState(0);
  const [blade, setBlade] = useState({ x: 0, y: 0, h: 0, flip: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  // يُقرر بعد التحميل لا أثناء التصيير، حتى تطابق الصفحة لقطة التصيير المسبق
  useEffect(() => {
    if (shouldPlay()) setActive(true);
  }, []);

  const finish = useCallback(() => {
    cancelAnimationFrame(frame.current);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // تصفح خاص — تظهر مرة ثانية فقط
    }
    setPercent(100);
    setLeaving(true);
    window.setTimeout(() => setActive(false), 450);
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    paintGrime(ctx, w, h, c.scrawl, rtl);
    ctx.globalCompositeOperation = "destination-out";
    // الممحاة لازم تكون معتمة: destination-out يمسح بقدر شفافية لون التعبئة
    ctx.fillStyle = "#000";

    const passes = 3;
    const band = h / passes;
    const pad = 6; // تداخل بسيط بين الأسطر حتى لا يبقى خط وسخ
    const total = passes * PASS_MS + (passes - 1) * DROP_MS;
    const start = performance.now() + 250;
    let lastX: number | null = null;
    let lastPass = -1;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - start);
      const cycle = PASS_MS + DROP_MS;
      const pass = Math.min(passes - 1, Math.floor(elapsed / cycle));
      const within = Math.min(1, (elapsed - pass * cycle) / PASS_MS);
      // السطر الأول مع اتجاه القراءة، والذي بعده عكسه — رايح جاي
      const forward = (pass % 2 === 0) === rtl ? -1 : 1; // -1: من اليمين لليسار
      const p = easeInOut(within);
      const x = forward === 1 ? p * w : w - p * w;
      const top = pass * band;

      if (pass !== lastPass) {
        lastX = forward === 1 ? 0 : w;
        lastPass = pass;
      }
      const from = Math.min(lastX ?? x, x);
      const to = Math.max(lastX ?? x, x);
      ctx.fillRect(from - 2, top - pad, to - from + 4, band + pad * 2);
      lastX = x;

      setBlade({ x, y: top, h: band, flip: forward === -1 });
      setPercent(Math.min(99, Math.round(((pass + within) / passes) * 100)));

      if (elapsed >= total) {
        finish();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    // الصفحة ما تتحرك تحت المقدّمة
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame.current);
      document.body.style.overflow = previous;
    };
  }, [active, c.scrawl, rtl, finish]);

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
      onClick={finish}
      role="presentation"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {!leaving && blade.h > 0 && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: blade.y - 8,
            height: blade.h + 16,
            // الشفرة (حافة الرسم) تنطبق على حد المسح
            left: blade.x,
            transform: blade.flip ? "translateX(-14%)" : "translateX(-86%)",
          }}
        >
          <Squeegee flip={!blade.flip} />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-3 rounded-full bg-brand-blue-deeper/85 backdrop-blur px-5 py-2.5 text-white shadow-float">
          <span className="text-sm">{c.working}</span>
          <span className="text-xl font-bold tabular-nums w-14 text-center">{percent}٪</span>
          <div className="w-24 h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div className="h-full bg-brand-yellow" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute top-4 end-4 rounded-full bg-black/35 backdrop-blur px-4 py-1.5 text-sm text-white hover:bg-black/50"
      >
        {c.skip}
      </button>
    </div>
  );
};
