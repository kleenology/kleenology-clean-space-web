import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Calendar, MapPin, Star } from "lucide-react";

const stats = [
  { icon: Calendar, valueAr: "٣", valueEn: "3", suffixAr: " سنوات", suffixEn: " Years", labelAr: "خبرة في السوق", labelEn: "In the Market", count: 3 },
  { icon: Users, valueAr: "٦٩٠+", valueEn: "690+", suffixAr: "", suffixEn: "", labelAr: "عميل سعيد", labelEn: "Happy Clients", count: 690 },
  { icon: Star, valueAr: "٩٨٪", valueEn: "98%", suffixAr: "", suffixEn: "", labelAr: "نسبة رضا العملاء", labelEn: "Client Satisfaction", count: 98 },
  { icon: MapPin, valueAr: "", valueEn: "", suffixAr: "", suffixEn: "", labelAr: "نخدم مدينة الرياض", labelEn: "Serving Riyadh", count: 0 },
];

function useCountUp(target: number, duration = 1500, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const StatCard = ({ icon: Icon, valueAr, valueEn, suffixAr, suffixEn, labelAr, labelEn, count, isRTL, start }: any) => {
  const animated = useCountUp(count, 1500, start);
  const displayValue = count === 0
    ? (isRTL ? "الرياض" : "Riyadh")
    : count === 690
    ? `${animated}+`
    : count === 98
    ? `${animated}%`
    : isRTL ? valueAr : valueEn;

  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 mx-auto">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div className="text-4xl font-bold text-foreground mb-1" dir="ltr">
        {count === 3 ? (isRTL ? "٣" : "3") + (isRTL ? suffixAr : suffixEn) : displayValue}
      </div>
      <p className="text-muted-foreground text-sm font-medium">
        {isRTL ? labelAr : labelEn}
      </p>
    </div>
  );
};

export const Stats = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-white border-y border-border" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <StatCard key={s.labelAr} {...s} isRTL={isRTL} start={visible} />
          ))}
        </div>
      </div>
    </section>
  );
};
