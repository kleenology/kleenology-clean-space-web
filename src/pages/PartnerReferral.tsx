import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, MessageCircle, Handshake } from "lucide-react";
import { toast } from "sonner";
import { lookupPartner, submitLead, PartnersError } from "@/lib/partners/api";

const WHATSAPP_NUMBER = "966537519929";

const SERVICES = [
  "تنظيف ما بعد البناء",
  "تنظيف منازل وشقق",
  "تنظيف عميق",
  "تنظيف مكاتب وشركات",
  "تنظيف سجاد ومفروشات",
];

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * رابط إحالة الشريك: kleenology.me/p/P-XXXXX
 * العميل يسجّل بياناته هنا فتُربط بالشريك تلقائياً، أو يكمل على الواتس
 * والرسالة فيها كود الشريك.
 */
export default function PartnerReferral() {
  const { code = "" } = useParams();
  const [partner, setPartner] = useState<{ partnerName: string; code: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customerName: "", phone: "", neighborhood: "", serviceType: SERVICES[0], website: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    lookupPartner(code)
      .then(setPartner)
      .catch(() => setPartner(null))
      .finally(() => setLoading(false));
  }, [code]);

  const set = (changes: Partial<typeof form>) => setForm((f) => ({ ...f, ...changes }));

  const whatsappHref = () => {
    const msg = partner
      ? `مرحباً، أبي أحجز خدمة تنظيف.\nوصلتكم عن طريق: ${partner.partnerName} (${partner.code})`
      : "مرحباً، أبي أحجز خدمة تنظيف.";
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitLead({ ...form, code, notes: "", source: "link" });
      setDone(true);
    } catch (error) {
      toast.error(error instanceof PartnersError ? error.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-4 py-10">
      <SEO title="احجز تنظيفك | كلينولوجي" description="خدمات التنظيف الاحترافي بالرياض"
           url={`https://kleenology.me/p/${code}`} noindex />
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <a href="/"><img src="/logo.png" alt="كلينولوجي" className="h-16 mx-auto mb-2" /></a>
          <p className="text-sm text-muted-foreground">خدمات التنظيف الاحترافي بالرياض</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border p-6 sm:p-8">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : done ? (
            <div className="text-center py-6">
              <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">وصلنا طلبك ✅</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                بنتواصل معك قريب على الواتس لتحديد الموعد وإرسال عرض السعر.
              </p>
              <a href="/"><Button variant="outline" className="w-full">تعرّف على خدماتنا</Button></a>
            </div>
          ) : (
            <>
              {partner && (
                <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 mb-5 text-sm">
                  <Handshake className="h-4 w-4 text-primary shrink-0" />
                  <span>بالتعاون مع <b>{partner.partnerName}</b></span>
                </div>
              )}
              <h1 className="text-xl font-bold mb-1">احجز خدمة التنظيف</h1>
              <p className="text-sm text-muted-foreground mb-5">اترك بياناتك ونتواصل معك خلال ساعات العمل.</p>

              {partner ? (
                <form onSubmit={submit} className="space-y-4 relative">
                  <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website"
                         value={form.website} onChange={(e) => set({ website: e.target.value })}
                         className="absolute -left-[9999px] w-px h-px opacity-0" />
                  <div className="space-y-1.5">
                    <Label htmlFor="r-name">الاسم *</Label>
                    <Input id="r-name" required value={form.customerName}
                           onChange={(e) => set({ customerName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-phone">الجوال *</Label>
                    <Input id="r-phone" required type="tel" dir="ltr" placeholder="05xxxxxxxx"
                           value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-area">الحي</Label>
                    <Input id="r-area" value={form.neighborhood}
                           onChange={(e) => set({ neighborhood: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="r-service">الخدمة</Label>
                    <select id="r-service" className={selectClass} value={form.serviceType}
                            onChange={(e) => set({ serviceType: e.target.value })}>
                      {SERVICES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "أرسل الطلب"}
                  </Button>
                </form>
              ) : null}

              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="block mt-3">
                <Button variant={partner ? "outline" : "default"} size="lg" className="w-full">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  {partner ? "أو احجز مباشرة عبر واتساب" : "احجز عبر واتساب"}
                </Button>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
