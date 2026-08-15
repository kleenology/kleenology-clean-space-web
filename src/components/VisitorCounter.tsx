import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";

// المصدر الأساسي: بيانات Google Analytics الحقيقية عبر دالة Netlify
const GA_ENDPOINT = "/api/visitors";
// المصدر الاحتياطي: عداد Abacus المجاني (يزيد مرة واحدة لكل جلسة تصفح)
const COUNTER_URL = "https://abacus.jasoncameron.dev";
const NAMESPACE = "kleenology-me";
const KEY = "homepage-visits";

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

async function fetchGaVisitors(): Promise<number> {
  const res = await fetch(GA_ENDPOINT);
  if (!res.ok) throw new Error("ga endpoint unavailable");
  const data = await res.json();
  if (typeof data.visitors !== "number") throw new Error("bad response");
  return data.visitors;
}

async function fetchFallbackVisitors(): Promise<number> {
  const alreadyCounted = sessionStorage.getItem("kleenology-visit-counted");
  const endpoint = alreadyCounted ? "get" : "hit";
  const res = await fetch(`${COUNTER_URL}/${endpoint}/${NAMESPACE}/${KEY}`);
  if (!res.ok) throw new Error("counter unavailable");
  const data = await res.json();
  if (typeof data.value !== "number") throw new Error("bad response");
  if (!alreadyCounted) {
    sessionStorage.setItem("kleenology-visit-counted", "1");
  }
  return data.value;
}

export const VisitorCounter = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [visitors, setVisitors] = useState<number>(0);
  const animated = useCountUp(visitors);

  useEffect(() => {
    let cancelled = false;
    fetchGaVisitors()
      .catch(() => fetchFallbackVisitors())
      .then((value) => {
        if (!cancelled) setVisitors(value);
      })
      .catch(() => {
        // لا مصدر متاح — نخفي العداد بدلاً من عرض رقم غير صحيح
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
