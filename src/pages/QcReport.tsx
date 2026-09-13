import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoginCard } from "@/components/pricing/LoginCard";
import { AuthImage } from "@/components/pricing/AuthImage";
import { PhotoLightbox } from "@/components/pricing/PhotoLightbox";
import { CHECKLIST, VERDICTS } from "@/lib/pricing/qcChecklist";
import { buildManagementReport, scoreOf, type QualityCheck } from "@/lib/pricing/qcReport";
import { loadCheck, QcError } from "@/lib/pricing/qcApi";

const TOKEN_KEY = "kleenology_pricing_token";

const VERDICT_STYLE = {
  pass: "text-emerald-700 bg-emerald-50 border-emerald-200",
  redo: "text-amber-700 bg-amber-50 border-amber-200",
  missed: "text-red-700 bg-red-50 border-red-200",
} as const;

/**
 * صفحة تقرير فحص الجودة الكامل — رابطها يُشارَك مع الإدارة، ومحمي بنفس
 * كلمة مرور الأداة حتى لا تُفتح صور منازل العملاء بمجرد تسريب الرابط.
 */
export default function QcReport() {
  const { id = "" } = useParams();
  // البحث الذي أوصل إلى هنا، ليعود إليه زر الرجوع بدل مربع فارغ
  const [searchParams] = useSearchParams();
  const backTo = searchParams.get("q")
    ? `/admin/pricing?q=${encodeURIComponent(searchParams.get("q")!)}`
    : "/admin/pricing";
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [check, setCheck] = useState<QualityCheck | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const load = useCallback(async (activeToken: string) => {
    setLoading(true);
    setError("");
    try {
      const { check: loaded } = await loadCheck(activeToken, id);
      setCheck(loaded);
    } catch (caught) {
      const message = caught instanceof QcError ? caught.message : "تعذّر فتح التقرير";
      // انتهاء الجلسة يعيد بطاقة الدخول بدل رسالة خطأ لا يفهمها القارئ
      if (message.includes("الجلسة")) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    load(token);
  }, [token, load]);

  const onLogin = (next: string) => {
    localStorage.setItem(TOKEN_KEY, next);
    setToken(next);
  };

  const seo = (
    <SEO title="تقرير فحص الجودة" description="صفحة داخلية"
         url="https://kleenology.me/admin/pricing" noindex />
  );

  if (!token) {
    return (
      <>
        {seo}
        <div dir="rtl"><LoginCard onSuccess={onLogin} /></div>
      </>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !check) {
    return (
      <>
        {seo}
        <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-muted-foreground">{error || "التقرير غير موجود"}</p>
          <Button asChild variant="outline">
            <Link to={backTo}>رجوع</Link>
          </Button>
        </div>
      </>
    );
  }

  const score = scoreOf(check);
  const photoKeys = check.photos.map((p) => p.key);

  return (
    <>
      {seo}
      <div dir="rtl" className="min-h-screen bg-muted/30 pb-16">
        <header className="bg-card border-b sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold leading-tight truncate">تقرير فحص الجودة</h1>
                <p className="text-[11px] text-muted-foreground truncate">
                  {check.customerName || check.location || check.date}
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" aria-label="رجوع">
              <Link to={backTo}><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 pt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
          {/* النتيجة */}
          <div className="bg-card border rounded-xl p-5 text-center">
            <div className={cn(
              "text-4xl font-bold tabular-nums",
              score.percent === 100 ? "text-emerald-600"
                : score.percent >= 80 ? "text-amber-600" : "text-red-600",
            )}>
              {score.percent}٪
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {score.passed} مقبول · {score.redo} يحتاج إعادة · {score.missed} لم يُنفَّذ
            </p>
          </div>

          <section className="bg-card border rounded-xl p-5">
            <h2 className="font-bold mb-3">بيانات الوظيفة</h2>
            <dl className="text-sm space-y-1.5">
              {[
                ["العميل", check.customerName],
                ["رقم التواصل", check.phone],
                ["الموقع", check.location],
                ["تاريخ الفحص", [check.date, check.time].filter(Boolean).join(" ")],
                ["المشرف", check.supervisor],
              ].filter(([, value]) => value?.trim()).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-left">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          </div>

          {score.pending.length > 0 && (
            <section className="border border-amber-300 bg-amber-50 rounded-xl p-5">
              <h2 className="font-bold mb-2 text-amber-900">يحتاج عملاً</h2>
              <ul className="text-sm space-y-1.5 text-amber-900">
                {score.pending.map((item, index) => (
                  <li key={index}>
                    <span className="text-amber-700">{item.section}:</span> {item.label}
                    {item.note?.trim() && <span className="block text-xs opacity-80">— {item.note}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* البنود */}
          {CHECKLIST.map((section) => {
            const rows = section.items
              .map((item) => ({ item, result: check.results[item.key] }))
              .filter((row) => row.result);
            if (rows.length === 0) return null;
            return (
              <section key={section.key} className="bg-card border rounded-xl p-5">
                <h2 className="font-bold mb-3">{section.title}</h2>
                <ul className="grid gap-1.5 md:grid-cols-2">
                  {rows.map(({ item, result }) => {
                    const verdict = VERDICTS.find((v) => v.key === result!.verdict);
                    return (
                      <li key={item.key} className={cn(
                        "text-sm rounded-lg border px-3 py-2",
                        VERDICT_STYLE[result!.verdict],
                      )}>
                        <span>{verdict?.short} {item.label}</span>
                        {result!.note?.trim() && (
                          <span className="block text-xs opacity-80 mt-0.5">{result!.note}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}

          {check.notes.trim() && (
            <section className="bg-card border rounded-xl p-5">
              <h2 className="font-bold mb-2">ملاحظات</h2>
              <p className="text-sm whitespace-pre-wrap">{check.notes}</p>
            </section>
          )}

          {photoKeys.length > 0 && (
            <section className="bg-card border rounded-xl p-5">
              <h2 className="font-bold mb-3">الصور ({photoKeys.length})</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {photoKeys.map((key, index) => (
                  <button key={key} type="button" onClick={() => setViewerIndex(index)}
                          className="aspect-square rounded-lg overflow-hidden border"
                          aria-label={`فتح الصورة ${index + 1}`}>
                    <AuthImage token={token} photoKey={key} alt={`صورة ${index + 1}`}
                               className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="bg-card border rounded-xl p-5">
            <h2 className="font-bold mb-3">توقيع العميل</h2>
            {check.signatureKey ? (
              <>
                <div className="rounded-lg border bg-white overflow-hidden">
                  <AuthImage token={token} photoKey={check.signatureKey} alt="توقيع العميل"
                             className="w-full h-40 object-contain" />
                </div>
                {check.signedAt && (
                  <p className="text-[11px] text-muted-foreground mt-2">
                    وُقّع في {new Date(check.signedAt).toLocaleString("en-GB")}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">لم يوقّع العميل على هذا الفحص.</p>
            )}
          </section>

          <Button variant="outline" className="w-full"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(buildManagementReport(check));
                      toast.success("تم نسخ التقرير");
                    } catch {
                      toast.error("تعذّر النسخ");
                    }
                  }}>
            <Copy className="h-4 w-4 ml-2" />
            نسخ التقرير نصاً
          </Button>
        </main>

        {viewerIndex !== null && (
          <PhotoLightbox token={token} keys={photoKeys} index={viewerIndex}
                         onClose={() => setViewerIndex(null)} onIndexChange={setViewerIndex} />
        )}
      </div>
    </>
  );
}
