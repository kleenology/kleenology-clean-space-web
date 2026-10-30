import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Handshake, UserPlus, Send, Percent, CalendarCheck, CheckCircle2, Loader2, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  registerPartner, submitLead, PartnersError, PARTNER_TYPES,
  type PartnerApplication, type LeadSubmission,
} from "@/lib/partners/api";

const SERVICES = [
  "تنظيف ما بعد البناء",
  "تنظيف تسليم مشروع / وحدات",
  "تنظيف منازل وشقق",
  "تنظيف عميق",
  "تنظيف مكاتب وشركات",
  "تنظيف سجاد ومفروشات",
];

const STEPS = [
  { Icon: UserPlus, title: "سجّل مرة وحدة", text: "عبّ بيانات شركتك، ونعتمدك ونرسل لك كودك الخاص على الواتس." },
  { Icon: Send, title: "أرسل لنا عملاءك", text: "سجّل العميل من هذي الصفحة بكودك، أو أرسل له رابطك ويحجز منه مباشرة." },
  { Icon: Percent, title: "استلم عمولتك", text: "10٪ من قيمة كل طلب لكل عميل تحيله، بكشف شهري على الواتس وتحويل بنكي." },
];

const PARTNER_TERMS = [
  "العمولة 10٪ من قيمة كل طلب للعميل المحال، بعد الخصم وقبل ضريبة القيمة المضافة.",
  "العمولة على كل عميل تحيله، وعلى كل طلب يطلبه بعدها — مو أول طلب بس.",
  "تُستحق عمولة الطلب بعد ما يسدد العميل كامل مبلغه، وتُصرف مرة كل شهر بتحويل بنكي مع كشف حساب على الواتس.",
  "الطلبات الملغاة أو المستردة ما تُحسب لها عمولة.",
  "كلينولوجي تحتفظ بحق إيقاف أي حساب شريك عند إساءة الاستخدام أو الإحالات الوهمية.",
];

const emptyApplication: PartnerApplication = {
  company: "", contactName: "", phone: "", partnerType: PARTNER_TYPES[0],
  city: "الرياض", iban: "", notes: "", acceptedTerms: false, website: "",
};

const emptyLead: LeadSubmission = {
  code: "", customerName: "", phone: "", neighborhood: "",
  serviceType: SERVICES[0], notes: "", source: "partner", website: "",
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Honeypot({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
      value={value} onChange={(e) => onChange(e.target.value)}
      className="absolute -left-[9999px] w-px h-px opacity-0" name="website"
    />
  );
}

function Done({ title, text, onAgain, againLabel }: {
  title: string; text: string; onAgain: () => void; againLabel: string;
}) {
  return (
    <div className="text-center py-8">
      <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6">{text}</p>
      <Button variant="outline" onClick={onAgain}>{againLabel}</Button>
    </div>
  );
}

function RegisterForm() {
  const [form, setForm] = useState(emptyApplication);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (changes: Partial<PartnerApplication>) => setForm((f) => ({ ...f, ...changes }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.acceptedTerms) {
      toast.error("لازم توافق على شروط البرنامج");
      return;
    }
    setBusy(true);
    try {
      await registerPartner(form);
      setDone(true);
    } catch (error) {
      toast.error(error instanceof PartnersError ? error.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Done
        title="وصل طلبك ✅"
        text="بنراجع بياناتك ونرسل لك كودك الخاص ورابط الإحالة على الواتس خلال يوم عمل."
        againLabel="تسجيل شريك آخر"
        onAgain={() => { setForm(emptyApplication); setDone(false); }}
      />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 relative">
      <Honeypot value={form.website} onChange={(website) => set({ website })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-company">اسم الشركة / المؤسسة *</Label>
          <Input id="p-company" required value={form.company}
                 onChange={(e) => set({ company: e.target.value })} placeholder="مؤسسة البناء الحديث" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-type">نوع النشاط</Label>
          <select id="p-type" className={selectClass} value={form.partnerType}
                  onChange={(e) => set({ partnerType: e.target.value })}>
            {PARTNER_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-contact">اسم المسؤول *</Label>
          <Input id="p-contact" required value={form.contactName}
                 onChange={(e) => set({ contactName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-phone">جوال الواتس *</Label>
          <Input id="p-phone" required type="tel" dir="ltr" value={form.phone}
                 onChange={(e) => set({ phone: e.target.value })} placeholder="05xxxxxxxx" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-city">المدينة</Label>
          <Input id="p-city" value={form.city} onChange={(e) => set({ city: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-iban">الآيبان (لتحويل العمولة)</Label>
          <Input id="p-iban" dir="ltr" value={form.iban}
                 onChange={(e) => set({ iban: e.target.value })} placeholder="SA00 0000 0000 0000 0000 0000" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="p-notes">نبذة مختصرة (اختياري)</Label>
        <Textarea id="p-notes" rows={2} value={form.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="مثلاً: نسلّم 10 فلل شهرياً في شمال الرياض" />
      </div>
      <label className="flex items-start gap-2 text-sm cursor-pointer">
        <input type="checkbox" className="mt-1" checked={form.acceptedTerms}
               onChange={(e) => set({ acceptedTerms: e.target.checked })} />
        <span>قرأت <a href="#terms" className="text-primary underline">شروط البرنامج</a> وأوافق عليها</span>
      </label>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "أرسل طلب الانضمام"}
      </Button>
    </form>
  );
}

function LeadForm() {
  const [form, setForm] = useState(emptyLead);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (changes: Partial<LeadSubmission>) => setForm((f) => ({ ...f, ...changes }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitLead(form);
      setDone(true);
    } catch (error) {
      toast.error(error instanceof PartnersError ? error.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Done
        title="سجّلنا العميل ✅"
        text="بنتواصل معه ونرسل له عرض السعر، وتشوف وين وصل في كشفك الشهري."
        againLabel="تسجيل عميل آخر"
        // الكود يبقى: الشريك غالباً يسجّل أكثر من عميل ورا بعض
        onAgain={() => { setForm({ ...emptyLead, code: form.code }); setDone(false); }}
      />
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 relative">
      <Honeypot value={form.website} onChange={(website) => set({ website })} />
      <div className="space-y-1.5">
        <Label htmlFor="l-code">كود الشريك *</Label>
        <Input id="l-code" required dir="ltr" value={form.code} className="uppercase tracking-wider"
               onChange={(e) => set({ code: e.target.value })} placeholder="P-XXXXX" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="l-name">اسم العميل *</Label>
          <Input id="l-name" required value={form.customerName}
                 onChange={(e) => set({ customerName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="l-phone">جوال العميل *</Label>
          <Input id="l-phone" required type="tel" dir="ltr" value={form.phone}
                 onChange={(e) => set({ phone: e.target.value })} placeholder="05xxxxxxxx" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="l-area">الحي / الموقع</Label>
          <Input id="l-area" value={form.neighborhood}
                 onChange={(e) => set({ neighborhood: e.target.value })} placeholder="الملقا" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="l-service">نوع الشغل</Label>
          <select id="l-service" className={selectClass} value={form.serviceType}
                  onChange={(e) => set({ serviceType: e.target.value })}>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="l-notes">تفاصيل (اختياري)</Label>
        <Textarea id="l-notes" rows={2} value={form.notes}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="مساحة تقريبية، موعد التسليم، عدد الوحدات..." />
      </div>
      <p className="text-xs text-muted-foreground">
        تأكد إن العميل موافق نتواصل معه — نكلمه باسم شركتك.
      </p>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "سجّل العميل"}
      </Button>
    </form>
  );
}

export default function Partners() {
  const [tab, setTab] = useState<"register" | "lead">("register");

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <SEO
        title="برنامج شركاء كلينولوجي | عمولة 10٪ للمقاولين والشركات"
        description="انضم لبرنامج شركاء كلينولوجي: أحِل عملاء التنظيف من مشاريعك واحصل على 10٪ من قيمة كل طلب، بكشف شهري وتحويل بنكي."
        url="https://kleenology.me/partners"
      />
      <Header />

      <section className="bg-gradient-to-l from-brand-blue-deep to-brand-blue-deeper text-white pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
            <Handshake className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">برنامج شركاء كلينولوجي</h1>
          <p className="text-white/85 text-lg leading-relaxed">
            مقاول، شركة إنشاءات، أو مكتب عقار؟ أرسل لنا عملاءك اللي يحتاجون تنظيف،
            واستلم <span className="text-brand-yellow font-bold">10٪</span> من قيمة كل طلب لكل عميل.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 -mt-8 pb-16 space-y-8">
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map(({ Icon, title, text }, i) => (
            <div key={title} className="bg-card border rounded-2xl p-5 shadow-clean">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-bold">{i + 1}. {title}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-2xl shadow-clean overflow-hidden">
          <div className="flex border-b">
            {([
              { key: "register", label: "انضم كشريك", Icon: UserPlus },
              { key: "lead", label: "سجّل عميل", Icon: Send },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key} type="button" onClick={() => setTab(key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold border-b-[3px] transition-colors",
                  tab === key ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          <div className="p-5 sm:p-7">
            {tab === "register" ? <RegisterForm /> : <LeadForm />}
          </div>
        </div>

        <div id="terms" className="bg-card border rounded-2xl shadow-clean p-5 sm:p-7 scroll-mt-24">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            شروط البرنامج
          </h2>
          <ul className="space-y-2.5">
            {PARTNER_TERMS.map((term) => (
              <li key={term} className="flex gap-2 text-sm leading-relaxed">
                <CalendarCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {term}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
