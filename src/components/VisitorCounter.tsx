import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";

const COUNTER_URL = "https://abacus.jasoncameron.dev";
const NAMESPACE = "kleenology-me";
const KEY = "homepage-visits";
// يُضاف هذا الرقم إلى قراءة العداد لاحتساب الزوار قبل تركيب العداد — عدّله أو اجعله 0
const BASE_VISITORS = 0;

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target <= 0) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

export const VisitorCounter = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [visitors, setVisitors] = useState<number>(0);
  const animated = useCountUp(visitors);

  useEffect(() => {
    let cancelled = false;
    const alreadyCounted = sessionStorage.getItem("kleenology-visit-counted");
    const endpoint = alreadyCounted ? "get" : "hit";
    fetch(`${COUNTER_URL}/${endpoint}/${NAMESPACE}/${KEY}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (cancelled || typeof data.value !== "number") return;
        if (!alreadyCounted) {
          sessionStorage.setItem("kleenology-visit-counted", "1");
        }
        setVisitors(data.value + BASE_VISITORS);
      })
      .catch(() => {
        // خدمة العداد غير متاحة — نخفي العداد بدلاً من عرض رقم خاطئ
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (visitors <= 0) return null;

  return (
    <div className="mt-10 flex justify-center" dir={isRTL ? "rtl" : "ltr"}>
      <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/50 px-6 py-3 shadow-sm">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
          <Eye className="h-5 w-5 text-primary" />
        </span>
        <span className="text-2xl font-bold text-foreground" dir="ltr">
          {animated.toLocaleString(isRTL ? "ar-EG" : "en-US")}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {isRTL ? "زائر للموقع" : "Website Visitors"}
        </span>
      </div>
    </div>
  );
};
