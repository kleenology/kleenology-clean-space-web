import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Star, Quote, Loader2, PenLine, CalendarCheck } from "lucide-react";

interface Review { name: string; rating: number; text: string; createdAt: string; }

// آراء أساسية حقيقية تظهر دائماً، وتُضاف فوقها الآراء المعتمدة الجديدة
const DEFAULT_REVIEWS: Review[] = [
  { name: "ياسر", rating: 5, text: "الله يوفقكم، فريق عمل متميز وشغل مرتب ونظيف.", createdAt: "" },
  { name: "آلاء", rating: 5, text: "خدمتهم جداً رائعة، يستحقون التجربة.", createdAt: "" },
  { name: "حسن", rating: 5, text: "دقة متناهية واهتمام بأدق التفاصيل، وعملوا يومين متتاليين لتنظيف الفيلا. خدمة حقيقية تستحق التجربة وبقوة!", createdAt: "" },
  { name: "الزين", rating: 5, text: "الله يعطيهم ألف عافية، رائع شغلهم واحترافي ماشاء الله. مو آخر تعامل معكم.", createdAt: "" },
  { name: "ف", rating: 5, text: "من أفضل شركات التنظيف في الرياض، مهتمين برضا العميل. أنصحكم بالتعامل معهم وبقوة عن تجربة!", createdAt: "" },
  { name: "أم فيصل", rating: 5, text: "متوفرين في نفس اليوم، سعر منطقي، وأخذوا وقتهم وهم ينظفون. عمالة مع مشرف.", createdAt: "" },
];

const dateAr = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function Reviews() {
  const [dynamic, setDynamic] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && Array.isArray(data.reviews)) {
          setDynamic(data.reviews.filter((r: Review) => r.text && r.rating));
        }
      })
      .catch(() => { /* نكتفي بالأساسية */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const reviews = useMemo(() => [...dynamic, ...DEFAULT_REVIEWS], [dynamic]);
  const avg = 5; // كل الآراء المعروضة ٥ نجوم

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title="آراء عملاء كلينولوجي | تقييمات خدمات التنظيف بالرياض"
        description="تجارب حقيقية من عملاء كلينولوجي لخدمات التنظيف في الرياض — تنظيف منازل وفلل ومكاتب وتنظيف تأهيلي بعد البناء. اقرأ آراءهم واحجز بثقة."
        keywords="آراء عملاء كلينولوجي, تقييمات شركة تنظيف الرياض, تجارب تنظيف"
        url="https://kleenology.me/reviews"
      />
      <Header />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 to-brand-blue/5 py-12 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map((s) => <Star key={s} className="h-6 w-6 text-brand-yellow fill-brand-yellow" />)}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">آراء عملائنا</h1>
            <p className="text-muted-foreground text-lg">
              تجارب حقيقية من عملاء وثقوا بكلينولوجي في الرياض — نفتخر بكل كلمة منهم.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 mt-10">
          {loading && reviews.length === DEFAULT_REVIEWS.length && (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-clean border border-border p-5 flex flex-col">
                <Quote className="h-7 w-7 text-primary/10 mb-2" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-brand-yellow fill-brand-yellow" />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed flex-1">{r.text}</p>
                <div className="flex items-center gap-3 border-t border-border pt-4 mt-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {r.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.createdAt ? dateAr(r.createdAt) : "عميل موثّق"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-l from-brand-blue-deep to-brand-blue-deeper text-white rounded-3xl p-8 mt-12 text-center">
            <h2 className="text-2xl font-bold mb-2">جرّبت خدمتنا؟ شاركنا رأيك</h2>
            <p className="text-white/80 mb-6">رأيك يساعدنا نتحسّن ويشجّع غيرك.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="/review">
                <Button size="lg" className="bg-white text-brand-blue-deep hover:bg-white/90 w-full sm:w-auto">
                  <PenLine className="h-4 w-4 ml-2" /> اكتب رأيك
                </Button>
              </a>
              <a href="/booking">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  <CalendarCheck className="h-4 w-4 ml-2" /> احجز خدمة
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
