import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// useLayoutEffect ما يشتغل وقت التصيير المسبق ويطبع تحذير — هناك useEffect يكفي
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * يدخل القسم بحركة خفيفة أول ما يظهر في الشاشة.
 * يُخفى فقط بعد التحميل وفقط لو كان تحت الشاشة — فالمحتوى ظاهر في HTML
 * المُصيَّر مسبقاً ولمحركات البحث، وما يختفي لو تعطل السكربت.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top > window.innerHeight) setState("hidden");
  }, []);

  useEffect(() => {
    if (state !== "hidden" || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [state]);

  return (
    <div
      ref={ref}
      className={
        state === "static" ? undefined
          : `transition-all duration-700 ease-out ${state === "hidden" ? "opacity-0 translate-y-10" : "opacity-100 translate-y-0"}`
      }
    >
      {children}
    </div>
  );
}

/** شريط رفيع أعلى الشاشة يتعبأ مع التمرير */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // تحديث مباشر للعنصر بلا إعادة رسم React مع كل حركة
      const bar = barRef.current;
      if (!bar) return;
      // يتعبأ من جهة بداية القراءة: يمين في العربي ويسار في الإنجليزي
      bar.style.transformOrigin = getComputedStyle(document.documentElement).direction === "rtl" ? "right" : "left";
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
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
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 h-1 z-[60] pointer-events-none" aria-hidden="true">
      <div ref={barRef} className="h-full bg-gradient-to-l from-brand-yellow to-brand-blue"
           style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
