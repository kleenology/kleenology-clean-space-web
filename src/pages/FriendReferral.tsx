import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, MessageCircle, Gift } from "lucide-react";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "966537519929";

export default function FriendReferral() {
  const { code = "" } = useParams();
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [discount, setDiscount] = useState(15);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/referral?code=${encodeURIComponent(code)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("invalid"))))
      .then((data) => { if (!cancelled) { setReferrerName(data.referrerName || ""); setDiscount(data.friendDiscount || 15); setValid(true); } })
      .catch(() => { if (!cancelled) setValid(false); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [code]);

  const set = (c: Partial<typeof form>) => setForm((f) => ({ ...f, ...c }));

  const whatsappHref = () => {
    const via = referrerName ? `\nوصلتكم عن طريق صديقي: ${referrerName}` : "";
    const msg = `مرحباً، أبي أحجز خدمة تنظيف.${via}\nكود الإحالة: ${code}\nخصم ${discount}٪ على أول طلب`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "friend", code, ...form }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
    } catch {
      toast.error("تعذّر الإرسال، جرّب الواتساب");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-4 py-10">
      <SEO
        title={`احجز تنظيفك مع كلينولوجي | خصم ${discount}٪ على أول طلب`}
        description={`احجز خدمة تنظيف في الرياض عبر توصية صديق واحصل على خصم ${discount}٪ على أول طلب.`}
        url={`https://kleenology.me/ref/${code}`}
        noindex
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <a href="/"><img src="/logo.png" alt="كلينولوجي" className="h-16 mx-auto mb-2" /></a>
          <p className="text-sm text-muted-foreground">خدمات التنظيف الاحترافي بالرياض</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !valid ? (
            <div className="text-center py-6">
              <h1 className="text-lg font-bold mb-2">رابط غير صالح</h1>
              <p className="text-sm text-muted-foreground mb-5">الكود غير صحيح أو انتهت صلاحيته.</p>
              <a href="/"><Button variant="outline" className="w-full">زيارة الموقع</Button></a>
            </div>
          ) : done ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">وصلنا طلبك ✅</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                بنتواصل معك قريب على الواتس لتحديد الموعد وإرسال عرض السعر بعد خصم {discount}٪.
              </p>
              <a href="/"><Button variant="outline" className="w-full">تعرّف على خدماتنا</Button></a>
            </div>
          ) : (
            <>
              {/* الخصم أول شي يشوفه الصديق */}
              <div className="flex items-center gap-3 rounded-lg bg-brand-yellow/20 border border-brand-yellow/60 px-4 py-3 mb-5">
                <Gift className="h-6 w-6 text-brand-blue-deeper shrink-0" />
                <div>
                  <div className="font-bold text-brand-blue-deeper">خصم {discount}٪ على أول طلب</div>
                  <div className="text-xs text-foreground/70">
                    {referrerName ? `لأن صديقك ${referrerName} رشّحك` : "لأنك جاي بتوصية صديق"}
                  </div>
                </div>
              </div>

              <h1 className="text-xl font-bold mb-1">احجز خدمة التنظيف</h1>
              <p className="text-sm text-muted-foreground mb-5">اختر الأسرع لك — نرد عليك على طول.</p>

              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="block">
                <Button size="lg" className="w-full h-14 text-base bg-[#25D366] hover:bg-[#1da851] text-white shadow-md">
                  <MessageCircle className="h-5 w-5 ml-2" /> احجز الآن عبر واتساب
                </Button>
              </a>
              <p className="text-center text-xs text-muted-foreground mt-2">الأسرع — نرد عليك خلال دقائق في ساعات العمل</p>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">أو اترك بياناتك ونكلمك</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={submit} className="space-y-4 relative">
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website"
                       value={form.website} onChange={(e) => set({ website: e.target.value })}
                       className="absolute -left-[9999px] w-px h-px opacity-0" />
                <div className="space-y-1.5">
                  <Label htmlFor="f-name">الاسم *</Label>
                  <Input id="f-name" required value={form.name} onChange={(e) => set({ name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="f-phone">الجوال *</Label>
                  <Input id="f-phone" required type="tel" dir="ltr" placeholder="05xxxxxxxx"
                         value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
                </div>
                <Button type="submit" size="lg" variant="outline" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "أرسل الطلب"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
