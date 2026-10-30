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
  ar: { working: "جاري التنظيف", skip: "تخطّي" },
  en: { working: "Cleaning", skip: "Skip" },
};

// منحنى جيبي: يبدأ ويوقف بنعومة بدون تسارع حاد في النص
const easeInOut = (t: number) => (1 - Math.cos(Math.PI * t)) / 2;

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
function paintGrime(ctx: CanvasRenderingContext2D, w: number, h: number) {
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

}

/** مسّاحة: شفرة مطاط عمودية وحامل ومقبض أصفر للخلف */
function Squeegee() {
  return (
    <svg viewBox="0 0 120 200" className="h-full w-auto drop-shadow-2xl" aria-hidden="true">
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // الحركة تُكتب مباشرة على العناصر كل إطار بدل حالة React — إعادة الرسم
  // ستين مرة في الثانية هي اللي كانت تقطّع الحركة على اللابتوب
  const bladeRef = useRef<HTMLDivElement>(null);
  const bladeSvgRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
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
    if (percentRef.current) percentRef.current.textContent = "100٪";
    if (barRef.current) barRef.current.style.width = "100%";
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
    // الشاشات الكبيرة ما تحتاج دقة ٢x للغبار، وتخفيفها يريّح المعالج
    const dpr = Math.min(window.devicePixelRatio || 1, w > 1024 ? 1.25 : 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    paintGrime(ctx, w, h);
    ctx.globalCompositeOperation = "destination-out";
    // الممحاة لازم تكون معتمة: destination-out يمسح بقدر شفافية لون التعبئة
    ctx.fillStyle = "#000";

    const passes = 3;
    const band = h / passes;
    const pad = 6; // تداخل بسيط بين الأسطر حتى لا يبقى خط وسخ
    const cycle = PASS_MS + DROP_MS;
    const total = passes * PASS_MS + (passes - 1) * DROP_MS;
    // ساعة داخلية: لو تأخر إطار (تحميل صور أو سكربتات) تبطئ المسّاحة لحظة
    // بدل ما تقفز قفزة تبان كتقطيع
    let elapsed = 0;
    let previous: number | null = null;
    const bladeEl = bladeRef.current;
    const svgEl = bladeSvgRef.current;
    if (bladeEl) bladeEl.style.height = `${band + 16}px`;
    const bladeWidth = bladeEl?.offsetWidth ?? 0;
    let lastX: number | null = null;
    let lastPass = -1;
    let lastPercent = -1;

    const tick = (now: number) => {
      elapsed += previous === null ? 0 : Math.min(now - previous, 34);
      previous = now;
      const pass = Math.min(passes - 1, Math.floor(elapsed / cycle));
      const inPass = elapsed - pass * cycle;
      const within = Math.min(1, inPass / PASS_MS);
      // السطر الأول مع اتجاه القراءة، والذي بعده عكسه — رايح جاي
      const forward = (pass % 2 === 0) === rtl ? -1 : 1; // -1: من اليمين لليسار
      const x = forward === 1 ? easeInOut(within) * w : w - easeInOut(within) * w;

      // بين سطرين تنزل المسّاحة بنعومة بدل ما تقفز
      const dropping = inPass > PASS_MS && pass < passes - 1;
      const drop = dropping ? easeInOut((inPass - PASS_MS) / DROP_MS) : 0;
      const top = (pass + drop) * band;

      if (pass !== lastPass) {
        lastX = forward === 1 ? 0 : w;
        lastPass = pass;
        // الشفرة تتقدم والمقبض خلفها: يُقلب الرسم مع كل تغيير اتجاه
        if (svgEl) svgEl.style.transform = forward === 1 ? "scaleX(-1)" : "none";
      }
      if (!dropping) {
        const from = Math.min(lastX ?? x, x);
        const to = Math.max(lastX ?? x, x);
        ctx.fillRect(from - 2, pass * band - pad, to - from + 4, band + pad * 2);
        lastX = x;
      }

      if (bladeEl) {
        // حافة الشفرة على حد المسح: ٨٦٪ من العرض لما تمشي يمين و١٤٪ لما تمشي يسار
        const offset = bladeWidth * (forward === 1 ? 0.86 : 0.14);
        bladeEl.style.transform = `translate3d(${x - offset}px, ${top - 8}px, 0)`;
      }
      const percent = Math.min(99, Math.round(((pass + within) / passes) * 100));
      if (percent !== lastPercent) {
        lastPercent = percent;
        if (percentRef.current) percentRef.current.textContent = `${percent}٪`;
        if (barRef.current) barRef.current.style.width = `${percent}%`;
      }

      if (elapsed >= total) {
        finish();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    // تبدأ المسحة بعد ما يخلص تحميل الصفحة — التحميل هو اللي كان يقطّع أول
    // جزء من الحركة. حد أقصى ثانيتين حتى لا ينتظر الزائر على اتصال بطيء.
    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      window.setTimeout(() => { frame.current = requestAnimationFrame(tick); }, 200);
    };
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    const fallback = window.setTimeout(begin, 2000);

    // الصفحة ما تتحرك تحت المقدّمة
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      started = true;
      window.clearTimeout(fallback);
      window.removeEventListener("load", begin);
      cancelAnimationFrame(frame.current);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, rtl, finish]);

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
      onClick={finish}
      role="presentation"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {!leaving && (
        <div ref={bladeRef} className="absolute top-0 left-0 pointer-events-none will-change-transform"
             style={{ transform: "translate3d(-200px, -200px, 0)" }}>
          <div ref={bladeSvgRef} className="h-full">
            <Squeegee />
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3 pointer-events-none">
        <div className="flex items-center gap-3 rounded-full bg-brand-blue-deeper/85 backdrop-blur px-5 py-2.5 text-white shadow-float">
          <span className="text-sm">{c.working}</span>
          <span ref={percentRef} className="text-xl font-bold tabular-nums w-14 text-center">0٪</span>
          <div className="w-24 h-1.5 rounded-full bg-white/25 overflow-hidden">
            <div ref={barRef} className="h-full bg-brand-yellow" style={{ width: "0%" }} />
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
