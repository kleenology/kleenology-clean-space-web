import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";

// إعدادات العداد — عدّل هذه الأرقام حسب رغبتك
const START_DATE = new Date("2024-01-01T00:00:00Z"); // تاريخ بداية العد
const START_COUNT = 8500; // عدد الزيارات عند تاريخ البداية
const VISITS_PER_DAY = 45; // متوسط الزيادة اليومية

// يحسب عدد الزيارات بناءً على الوقت الحالي: يزيد كل يوم وعلى مدار اليوم
function computeVisitors(now: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const elapsedDays = (now.getTime() - START_DATE.getTime()) / msPerDay;
  if (elapsedDays <= 0) return START_COUNT;
  return Math.floor(START_COUNT + elapsedDays * VISITS_PER_DAY);
}

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
  const [visitors, setVisitors] = useState(() => computeVisitors(new Date()));
  const [loaded, setLoaded] = useState(false);
  const animated = useCountUp(visitors);

  // بعد انتهاء حركة العد الأولى، يستمر الرقم بالزيادة أمام الزائر كل بضع ثوانٍ
  useEffect(() => {
    const initialDelay = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setVisitors((v) => v + 1);
      timer = setTimeout(tick, 5000 + Math.random() * 10000);
    };
    timer = setTimeout(tick, 5000 + Math.random() * 10000);
    return () => clearTimeout(timer);
  }, [loaded]);

  const display = loaded ? visitors : animated;

  return (
    <div className="mt-10 flex justify-center" dir={isRTL ? "rtl" : "ltr"}>
      <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted/50 px-6 py-3 shadow-sm">
        <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
          <Eye className="h-5 w-5 text-primary" />
          <span className="absolute top-0 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        </span>
        <span className="text-2xl font-bold text-foreground transition-all" dir="ltr">
          {display.toLocaleString(isRTL ? "ar-EG" : "en-US")}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {isRTL ? "زائر للموقع" : "Website Visitors"}
        </span>
      </div>
    </div>
  );
};
