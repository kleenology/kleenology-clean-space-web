import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, MessageCircle, Gift, ShieldCheck, Camera, Clock } from "lucide-react";
import { toast } from "sonner";
import { lookupPartner, submitLead, PartnersError, CUSTOMER_DISCOUNT_PERCENT } from "@/lib/partners/api";

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
      ? `مرحباً، أبي أحجز خدمة تنظيف.\nوصلتكم عن طريق: ${partner.partnerName} (${partner.code})\nخصم الشريك ${CUSTOMER_DISCOUNT_PERCENT}٪ على أول طلب`
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
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-brand-blue-deep/10 via-background to-background flex items-center justify-center px-4 py-8">
      <SEO
        title="احجز تنظيفك مع كلينولوجي | خصم ١٠٪ على أول طلب"
        description="احجز خدمة تنظيف في الرياض عبر رابط شريك كلينولوجي واحصل على خصم ١٠٪ على أول طلب — منازل، شقق، فلل، مكاتب، وتنظيف بعد البناء."
        url={`https://kleenology.me/p/${code}`}
        noindex
      />
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-float border overflow-hidden">
          {/* ——— هيدر أزرق بالهوية ——— */}
          <div className="relative bg-gradient-to-l from-brand-blue-deeper to-brand-blue-deep px-6 pt-7 pb-14 text-center">
            <a href="/" className="inline-block bg-white rounded-xl px-4 py-2 shadow-clean">
              <img src="/logo.png" alt="كلينولوجي" className="h-9 w-auto" />
            </a>
            <p className="text-white/80 text-sm mt-3">خدمات التنظيف الاحترافي بالرياض</p>
            {partner && !loading && !done && (
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur text-white text-xs font-medium rounded-full px-3 py-1 mt-3">
                بالتعاون مع <b>{partner.partnerName}</b>
              </div>
            )}
          </div>

          <div className="px-6 pb-7 -mt-8">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : done ? (
              <div className="text-center bg-card rounded-2xl pt-8 pb-2">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-9 w-9 text-green-600" />
                </div>
                <h1 className="text-xl font-bold mb-2">وصلنا طلبك ✅</h1>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 px-2">
                  بنتواصل معك قريب على الواتس لتحديد الموعد وإرسال عرض السعر بعد خصم {CUSTOMER_DISCOUNT_PERCENT}٪.
                </p>
                <a href="/"><Button variant="outline" className="w-full">تعرّف على خدماتنا</Button></a>
              </div>
            ) : (
              <>
                {/* ——— كرت الخصم البارز المتداخل ——— */}
                {partner ? (
                  <div className="rounded-2xl bg-gradient-to-br from-brand-yellow to-amber-300 text-brand-blue-deeper shadow-float p-5 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center mx-auto mb-2">
                      <Gift className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-extrabold leading-none">خصم {CUSTOMER_DISCOUNT_PERCENT}٪</div>
                    <div className="text-sm font-semibold mt-1">على أول طلب</div>
                    <div className="text-xs mt-1 text-brand-blue-deeper/70">لأنك وصلت عن طريق {partner.partnerName}</div>
                  </div>
                ) : (
                  <div className="h-8" />
                )}

                <h1 className="text-2xl font-bold mt-6 mb-1 text-center">احجز خدمة التنظيف</h1>
                <p className="text-sm text-muted-foreground mb-5 text-center">اختر الأسرع لك — نرد عليك على طول.</p>

                {/* الواتساب أولاً وأبرز */}
                <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="block">
                  <Button size="lg" className="w-full h-14 text-base bg-[#25D366] hover:bg-[#1da851] text-white shadow-md">
                    <MessageCircle className="h-5 w-5 ml-2" />
                    احجز الآن عبر واتساب
                  </Button>
                </a>
                <p className="text-center text-xs text-muted-foreground mt-2">الأسرع — نرد عليك خلال دقائق في ساعات العمل</p>

                {partner ? (
                  <>
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
                        <Label htmlFor="r-name">الاسم *</Label>
                        <Input id="r-name" required className="h-12" value={form.customerName}
                               onChange={(e) => set({ customerName: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="r-phone">الجوال *</Label>
                        <Input id="r-phone" required type="tel" dir="ltr" className="h-12" placeholder="05xxxxxxxx"
                               value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="r-area">الحي</Label>
                        <Input id="r-area" className="h-12" value={form.neighborhood}
                               onChange={(e) => set({ neighborhood: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="r-service">الخدمة</Label>
                        <select id="r-service" className={selectClass} value={form.serviceType}
                                onChange={(e) => set({ serviceType: e.target.value })}>
                          {SERVICES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <Button type="submit" size="lg" variant="outline" className="w-full h-12" disabled={busy}>
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "أرسل الطلب"}
                      </Button>
                    </form>
                  </>
                ) : null}

                {/* ——— إشارات ثقة ——— */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t">
                  {[
                    { Icon: ShieldCheck, t: "فريق مؤمّن عليه" },
                    { Icon: Camera, t: "فحص جودة بالصور" },
                    { Icon: Clock, t: "رد خلال دقائق" },
                  ].map(({ Icon, t }) => (
                    <div key={t} className="flex flex-col items-center text-center gap-1.5">
                      <Icon className="h-5 w-5 text-brand-blue" />
                      <span className="text-[11px] text-muted-foreground leading-tight">{t}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">kleenology.me · خدمة كل أحياء الرياض</p>
      </div>
    </div>
  );
}
