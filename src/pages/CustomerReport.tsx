import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MessageCircle, CalendarCheck, ShieldCheck, MapPin, Calendar, ImageOff, Gift, Copy } from "lucide-react";
import { toast } from "sonner";
import { scoreOf, checklistOf, type QualityCheck } from "@/lib/pricing/qcReport";
import { kindLabel } from "@/lib/pricing/qcChecklist";

const WHATSAPP_NUMBER = "966537519929";
const FRIEND_DISCOUNT = 15;   // خصم الصديق
const REFERRER_REWARD = 15;   // مكافأة العميل على طلبه الجاي

interface ReportData {
  id: string;
  customerName: string;
  location: string;
  date: string;
  supervisor: string;
  kind?: QualityCheck["kind"];
  customItems?: QualityCheck["customItems"];
  results: QualityCheck["results"];
  photos: string[];
  referralCode: string | null;
  savedAt: string;
}

const photoSrc = (id: string, key: string) =>
  `/api/report/qc?id=${encodeURIComponent(id)}&photo=${encodeURIComponent(key)}`;

export default function CustomerReport() {
  const { id = "" } = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/report/qc?id=${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("not_found"))))
      .then((data) => { if (!cancelled) { setReport(data.report); setStatus("ready"); } })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [id]);

  const score = useMemo(() => {
    if (!report) return null;
    const check: QualityCheck = {
      kind: report.kind, customerName: report.customerName, phone: "",
      location: report.location, date: report.date, time: "", supervisor: report.supervisor,
      customItems: report.customItems, results: report.results, photos: [], notes: "",
    };
    return { score: scoreOf(check), itemCount: checklistOf(check).reduce((n, s) => n + s.items.length, 0) };
  }, [report]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <SEO
        title="تقرير جودة التنظيف | كلينولوجي"
        description="تقرير فحص جودة خدمة التنظيف من كلينولوجي — النتيجة والصور."
        url={`https://kleenology.me/report/${id}`}
        noindex
      />

      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <a href="/"><img src="/logo.png" alt="كلينولوجي" className="h-16 mx-auto mb-2" /></a>
          <p className="text-sm text-muted-foreground">خدمات التنظيف الاحترافي بالرياض</p>
        </div>

        {status === "loading" && (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        )}

        {status === "error" && (
          <div className="bg-card border rounded-2xl shadow-clean p-8 text-center">
            <ImageOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h1 className="text-lg font-bold mb-1">التقرير غير متاح</h1>
            <p className="text-sm text-muted-foreground mb-5">الرابط غير صحيح أو انتهت صلاحيته.</p>
            <a href="/"><Button variant="outline" className="w-full">زيارة الموقع</Button></a>
          </div>
        )}

        {status === "ready" && report && score && (
          <div className="space-y-4">
            {/* النتيجة */}
            <div className="bg-card border rounded-2xl shadow-clean overflow-hidden">
              <div className="bg-gradient-to-l from-brand-blue-deep to-brand-blue-deeper text-white p-5">
                <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                  <ShieldCheck className="h-4 w-4" /> تقرير فحص الجودة
                </div>
                <h1 className="text-xl font-bold">{report.customerName || "عميلنا العزيز"}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-white/80">
                  {report.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{report.location}</span>}
                  {report.date && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{report.date}</span>}
                </div>
              </div>
              <div className="p-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl font-bold leading-none tabular-nums">{score.score.percent}٪</span>
                  <span className="text-[10px]">الجاهزية</span>
                </div>
                <div className="min-w-0">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    {score.score.percent >= 100 ? "اكتمل الفحص بنجاح" : "تم فحص الجودة"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    فحصنا {score.score.checked} بند · {kindLabel(report.kind)}
                    {report.supervisor ? ` · المشرف ${report.supervisor}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* الصور */}
            {report.photos.length > 0 && (
              <div className="bg-card border rounded-2xl shadow-clean p-5">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-brand-yellow shrink-0" aria-hidden />
                  صور من الخدمة ({report.photos.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {report.photos.map((key) => (
                    <a key={key} href={photoSrc(report.id, key)} target="_blank" rel="noopener noreferrer"
                       className="block aspect-square rounded-xl overflow-hidden border bg-muted">
                      <img src={photoSrc(report.id, key)} alt="صورة من الخدمة" loading="lazy"
                           className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* شارك واربح — كود إحالة العميل */}
            {report.referralCode && (() => {
              const link = `${window.location.origin}/ref/${report.referralCode}`;
              const shareMsg = `أنصحك بكلينولوجي لخدمات التنظيف بالرياض 🌿\nاحجز من رابطي وخذ خصم ${FRIEND_DISCOUNT}٪ على أول طلب:\n${link}`;
              return (
                <div className="bg-brand-yellow/15 border border-brand-yellow/50 rounded-2xl shadow-clean p-5">
                  <h2 className="font-bold mb-1 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-brand-blue-deeper" /> شارك واربح
                  </h2>
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                    صديقك ياخذ خصم <b>{FRIEND_DISCOUNT}٪</b> على أول طلب لما يحجز من رابطك،
                    وأنت تاخذ خصم <b>{REFERRER_REWARD}٪</b> على طلبك الجاي. 🎉
                  </p>
                  <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2 mb-3">
                    <span className="text-xs text-muted-foreground truncate flex-1" dir="ltr">{link}</span>
                    <button type="button" aria-label="نسخ الرابط"
                            onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("تم نسخ الرابط"))}
                            className="shrink-0 text-muted-foreground hover:text-foreground">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareMsg)}`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full h-12 bg-[#25D366] hover:bg-[#1da851] text-white">
                      <MessageCircle className="h-4 w-4 ml-2" /> شارك مع أصدقائك عبر واتساب
                    </Button>
                  </a>
                </div>
              );
            })()}

            {/* شكر ودعوة لإعادة الحجز */}
            <div className="bg-card border rounded-2xl shadow-clean p-5 text-center">
              <h2 className="font-bold mb-1">شكراً لثقتك بكلينولوجي 🌿</h2>
              <p className="text-sm text-muted-foreground mb-4">نتمنى الخدمة نالت رضاك. احجزنا مرة ثانية في أي وقت.</p>
              <div className="flex flex-col gap-2">
                <a href="/booking">
                  <Button className="w-full h-12"><CalendarCheck className="h-4 w-4 ml-2" />احجز خدمة جديدة</Button>
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، حاب أستفسر عن خدمة تنظيف.")}`}
                   target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full h-12 border-[#25D366] text-[#1da851]">
                    <MessageCircle className="h-4 w-4 ml-2" />تواصل عبر واتساب
                  </Button>
                </a>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground pb-4">
              تقرير صادر من كلينولوجي لخدمات التنظيف — kleenology.me
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
