import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * يدخل القسم بحركة خفيفة (GSAP) أول ما يظهر في الشاشة.
 * الحركة تعمل في المتصفح فقط — فالمحتوى ظاهر في HTML المُصيَّر مسبقاً
 * ولمحركات البحث، وما يختفي لو تعطل السكربت. ويُحترم تقليل الحركة.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  }, { scope: ref });

  return <div ref={ref}>{children}</div>;
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
