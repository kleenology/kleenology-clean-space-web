import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ClientSectors } from "@/components/ClientSectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  UserPlus, Send, Wallet, CheckCircle2, Loader2, CalendarCheck, BadgePercent,
  FileText, ChevronDown, MessageCircle, ArrowLeft, Pencil, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/rehab-cleaning.jpg";
import { registerPartner, submitLead, PartnersError, COMMISSION_RATE } from "@/lib/partners/api";

const WHATSAPP_NUMBER = "966537519929";
// الكود يُحفظ على جهاز الشريك: يكتبه مرة، والمرات الجاية يسجّل العميل بالاسم والجوال فقط
const CODE_KEY = "kleenology_partner_code";

const SERVICES = [
  "تنظيف ما بعد البناء",
  "تنظيف تسليم مشروع / وحدات",
  "تنظيف منازل وشقق",
  "تنظيف عميق",
  "تنظيف مكاتب وشركات",
  "تنظيف سجاد ومفروشات",
];

// متوسطات تقديرية لقيمة الطلب قبل الضريبة — للحاسبة فقط، عدّلها لتطابق أسعاركم
const ORDER_PRESETS = [
  { label: "ما بعد البناء", value: 2500 },
  { label: "تسليم وحدات", value: 1200 },
  { label: "منازل وشقق", value: 600 },
  { label: "مكاتب", value: 1500 },
];

const STEPS = [
  { Icon: UserPlus, title: "سجّل في دقيقة", text: "اسمك وجوالك بس — نعتمدك ونرسل لك كودك ورابطك على الواتس." },
  { Icon: Send, title: "أرسل لنا عملاءك", text: "سجّل العميل بالاسم والجوال، أو أرسل له رابطك ويحجز بنفسه." },
  { Icon: Wallet, title: "استلم عمولتك", text: "10٪ من كل طلب يدفعه العميل، تحويل بنكي كل شهر مع كشف واضح." },
];

const FAQ = [
  {
    q: "كم العمولة؟ وعلى وش تنحسب؟",
    a: "10٪ من قيمة كل طلب للعميل اللي تحيله، بعد الخصم وقبل ضريبة القيمة المضافة. مو أول طلب بس — كل مرة يطلب نفس العميل تاخذ عمولتك.",
  },
  {
    q: "متى أستلم عمولتي؟",
    a: "بعد ما يسدد العميل كامل مبلغ الطلب. نجمع عمولاتك ونحوّلها مرة كل شهر على حسابك البنكي، ونرسل لك كشف على الواتس فيه كل عميل وكل طلب.",
  },
  {
    q: "وش لو العميل ما دفع أو ألغى؟",
    a: "الطلبات الملغاة أو المستردة ما تنحسب لها عمولة. أول ما يدفع العميل تنضاف عمولتك للكشف.",
  },
  {
    q: "هل فيه رسوم أو التزام؟",
    a: "لا. التسجيل مجاني وبدون عقد ولا حد أدنى. تحيل متى ما بغيت.",
  },
  {
    q: "كيف أعرف وين وصل عميلي؟",
    a: "الكشف الشهري يوضح كل عميل أحلته: جديد، تم التسعير، أو صار عميل وطلباته المدفوعة.",
  },
  {
    q: "متى ممكن يتوقف حسابي؟",
    a: "كلينولوجي تحتفظ بحق إيقاف أي حساب عند إساءة الاستخدام أو الإحالات الوهمية.",
  },
];

const sar = (value: number) => `${Math.round(value).toLocaleString("en-US")} ر.س`;

function readSavedCode() {
  try {
    return localStorage.getItem(CODE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveCode(code: string) {
  try {
    localStorage.setItem(CODE_KEY, code);
  } catch {
    // التخزين محجوب (تصفح خاص) — يكتب الكود كل مرة، لا أكثر
  }
}

function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website"
      value={value} onChange={(e) => onChange(e.target.value)}
      className="absolute -left-[9999px] w-px h-px opacity-0"
    />
  );
}

function Done({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-9 w-9 text-green-600" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm mx-auto">{text}</p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">{children}</div>
    </div>
  );
}

/* ——————————————— الحاسبة ——————————————— */

function EarningsCalculator({ onJoin }: { onJoin: () => void }) {
  const [customers, setCustomers] = useState(5);
  const [orderValue, setOrderValue] = useState(ORDER_PRESETS[0].value);
  const monthly = customers * orderValue * COMMISSION_RATE;

  return (
    <div className="bg-card border rounded-3xl shadow-float p-6 sm:p-8">
      <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
        <TrendingUp className="h-4 w-4" />
        احسب أرباحك
      </div>
      <h2 className="text-2xl font-bold mb-6">كم بتكسب معنا؟</h2>

      <div className="space-y-7">
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <Label>عدد العملاء شهرياً</Label>
            <span className="text-2xl font-bold tabular-nums text-primary">{customers}</span>
          </div>
          <Slider
            dir="rtl" value={[customers]} min={1} max={30} step={1}
            onValueChange={([v]) => setCustomers(v)}
            aria-label="عدد العملاء شهرياً"
          />
        </div>

        <div>
          <Label className="block mb-3">نوع الشغل الغالب</Label>
          <div className="grid grid-cols-2 gap-2">
            {ORDER_PRESETS.map((preset) => (
              <button
                key={preset.label} type="button" onClick={() => setOrderValue(preset.value)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm text-right transition-all",
                  orderValue === preset.value
                    ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                    : "hover:border-primary/40 hover:bg-muted",
                )}
              >
                {preset.label}
                <span className="block text-[11px] text-muted-foreground font-normal">
                  متوسط {sar(preset.value)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-2xl bg-gradient-to-l from-brand-blue-deep to-brand-blue-deeper text-white p-5 text-center">
        <div className="text-sm text-white/75">أرباحك المتوقعة شهرياً</div>
        <div className="text-4xl sm:text-5xl font-bold text-brand-yellow tabular-nums my-1 transition-all">
          {sar(monthly)}
        </div>
        <div className="text-sm text-white/75">
          يعني <b className="text-white">{sar(monthly * 12)}</b> في السنة
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-3">
        أرقام تقديرية — العمولة الفعلية 10٪ من قيمة كل طلب قبل الضريبة.
      </p>
      <Button size="lg" className="w-full mt-4" onClick={onJoin}>
        ابدأ الحين — مجاناً
        <ArrowLeft className="h-4 w-4 mr-2" />
      </Button>
    </div>
  );
}

/* ——————————————— النماذج ——————————————— */

function RegisterForm({ onSwitchToLead }: { onSwitchToLead: () => void }) {
  const [form, setForm] = useState({ company: "", contactName: "", phone: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (changes: Partial<typeof form>) => setForm((f) => ({ ...f, ...changes }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      // الموافقة على الشروط بالإرسال نفسه، والنص ظاهر فوق الزر
      await registerPartner({
        ...form, partnerType: "", city: "", iban: "", notes: "", acceptedTerms: true,
      });
      setDone(true);
    } catch (error) {
      toast.error(error instanceof PartnersError ? error.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const msg = `مرحباً، سجّلت في برنامج الشركاء باسم ${form.company}.`;
    return (
      <Done title={`أهلاً ${form.contactName} 👋`} text="وصل طلبك. بنرسل لك كودك ورابطك الخاص على الواتس خلال يوم عمل.">
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
          <Button className="w-full"><MessageCircle className="h-4 w-4 ml-2" />سرّع الاعتماد على الواتس</Button>
        </a>
        <Button variant="outline" onClick={onSwitchToLead}>عندك الكود؟ سجّل عميل</Button>
      </Done>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 relative">
      <Honeypot value={form.website} onChange={(website) => set({ website })} />
      <div className="space-y-1.5">
        <Label htmlFor="p-company">اسم الشركة أو المؤسسة</Label>
        <Input id="p-company" required className="h-12 text-base" value={form.company}
               onChange={(e) => set({ company: e.target.value })} placeholder="مؤسسة البناء الحديث" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-contact">اسمك</Label>
          <Input id="p-contact" required className="h-12 text-base" value={form.contactName}
                 onChange={(e) => set({ contactName: e.target.value })} autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-phone">جوال الواتس</Label>
          <Input id="p-phone" required type="tel" dir="ltr" className="h-12 text-base text-right"
                 value={form.phone} onChange={(e) => set({ phone: e.target.value })}
                 placeholder="05xxxxxxxx" autoComplete="tel" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        بالتسجيل توافق على <a href="#faq" className="text-primary underline">شروط البرنامج</a>.
        الآيبان نطلبه منك وقت أول تحويل.
      </p>
      <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={busy}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "انضم الآن"}
      </Button>
    </form>
  );
}

function LeadForm() {
  const [savedCode, setSavedCode] = useState(readSavedCode);
  const [editingCode, setEditingCode] = useState(!savedCode);
  const [form, setForm] = useState({
    code: savedCode, customerName: "", phone: "", neighborhood: "",
    serviceType: SERVICES[0], notes: "", website: "",
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (changes: Partial<typeof form>) => setForm((f) => ({ ...f, ...changes }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitLead({ ...form, source: "partner" });
      // الكود صحيح ومعتمد — يُحفظ حتى لا يُكتب مرة ثانية
      const code = form.code.trim().toUpperCase();
      saveCode(code);
      setSavedCode(code);
      setEditingCode(false);
      setDone(true);
    } catch (error) {
      toast.error(error instanceof PartnersError ? error.message : "تعذّر الإرسال");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Done title="سجّلنا العميل ✅" text={`بنتواصل مع ${form.customerName} ونرسل له عرض السعر، وتشوف وين وصل في كشفك الشهري.`}>
        <Button onClick={() => {
          setForm((f) => ({ ...f, customerName: "", phone: "", neighborhood: "", notes: "" }));
          setDone(false);
        }}>
          سجّل عميل ثاني
        </Button>
      </Done>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 relative">
      <Honeypot value={form.website} onChange={(website) => set({ website })} />

      {editingCode ? (
        <div className="space-y-1.5">
          <Label htmlFor="l-code">كود الشريك</Label>
          <Input id="l-code" required dir="ltr" className="h-12 text-base uppercase tracking-widest text-right"
                 value={form.code} onChange={(e) => set({ code: e.target.value })} placeholder="P-XXXXX" />
          <p className="text-[11px] text-muted-foreground">نحفظه على جوالك، فما تكتبه مرة ثانية.</p>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
          <span className="text-sm">كودك: <b dir="ltr" className="tracking-widest">{savedCode}</b></span>
          <button type="button" onClick={() => setEditingCode(true)}
                  className="text-xs text-primary flex items-center gap-1 hover:underline">
            <Pencil className="h-3 w-3" />تغيير
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="l-name">اسم العميل</Label>
          <Input id="l-name" required className="h-12 text-base" value={form.customerName}
                 onChange={(e) => set({ customerName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="l-phone">جوال العميل</Label>
          <Input id="l-phone" required type="tel" dir="ltr" className="h-12 text-base text-right"
                 value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="05xxxxxxxx" />
        </div>
      </div>

      <button type="button" onClick={() => setMoreOpen((o) => !o)}
              className="text-sm text-primary flex items-center gap-1">
        <ChevronDown className={cn("h-4 w-4 transition-transform", moreOpen && "rotate-180")} />
        تفاصيل إضافية (اختياري)
      </button>
      {moreOpen && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="l-area">الحي</Label>
              <Input id="l-area" value={form.neighborhood}
                     onChange={(e) => set({ neighborhood: e.target.value })} placeholder="الملقا" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-service">نوع الشغل</Label>
              <select id="l-service" value={form.serviceType}
                      onChange={(e) => set({ serviceType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                {SERVICES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <Textarea rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })}
                    placeholder="مساحة تقريبية، موعد التسليم، عدد الوحدات..." aria-label="ملاحظات" />
        </div>
      )}

      <p className="text-xs text-muted-foreground">تأكد إن العميل موافق نتواصل معه — نكلمه باسم شركتك.</p>
      <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={busy}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "سجّل العميل"}
      </Button>
    </form>
  );
}

/* ——————————————— الصفحة ——————————————— */

export default function Partners() {
  // الشريك اللي سجّل عميلاً من قبل يرجع غالباً ليسجّل غيره، فيُفتح له تبويبه مباشرة
  const [tab, setTab] = useState<"register" | "lead">(() => (readSavedCode() ? "lead" : "register"));
  const formRef = useRef<HTMLDivElement>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [heroPassed, setHeroPassed] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // الزر الثابت يظهر بعد تجاوز الواجهة ويختفي والنموذج على الشاشة
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === formRef.current) setFormVisible(entry.isIntersecting);
        if (entry.target === heroRef.current) setHeroPassed(!entry.isIntersecting);
      }
    }, { threshold: 0.15 });
    if (formRef.current) observer.observe(formRef.current);
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  const goToForm = (which: "register" | "lead") => {
    setTab(which);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const trust = useMemo(() => [
    { Icon: BadgePercent, text: "10٪ على كل طلب" },
    { Icon: CalendarCheck, text: "تحويل شهري" },
    { Icon: FileText, text: "كشف واضح على الواتس" },
  ], []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title="برنامج شركاء كلينولوجي | عمولة 10٪ للمقاولين والشركات"
        description="انضم لبرنامج شركاء كلينولوجي: أحِل عملاء التنظيف من مشاريعك واحصل على 10٪ من قيمة كل طلب، بكشف شهري وتحويل بنكي."
        url="https://kleenology.me/partners"
      />
      <Header />

      {/* ——— الواجهة ——— */}
      <section ref={heroRef} className="relative overflow-hidden text-white">
        <img src={heroImage} alt="" aria-hidden="true"
             className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-brand-blue-deeper/95 via-brand-blue-deep/90 to-brand-blue-deep/70" />
        <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-20 sm:pt-32 sm:pb-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm font-medium mb-6">
              للمقاولين · شركات الإنشاءات · مكاتب العقار
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-5">
              عملاؤك يحتاجون تنظيف؟
              <br />
              <span className="text-brand-yellow">لك 10٪</span> من كل طلب.
            </h1>
            <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8">
              أحِل لنا عملاءك وخلّ الباقي علينا. نخدمهم باحترافية، وأنت تستلم عمولتك كل شهر —
              على كل طلب، مو أول طلب بس.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button size="lg" onClick={() => goToForm("register")}
                      className="h-14 px-8 text-lg bg-brand-yellow text-brand-blue-deeper hover:bg-brand-yellow/90 font-bold shadow-float">
                انضم مجاناً
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => goToForm("lead")}
                      className="h-14 px-8 text-lg bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white">
                عندي كود — سجّل عميل
              </Button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {trust.map(({ Icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-sm text-white/90">
                  <Icon className="h-5 w-5 text-brand-yellow" />
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ——— الخطوات ——— */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="text-3xl font-bold text-center mb-3">بسيطة: ثلاث خطوات</h2>
        <p className="text-muted-foreground text-center mb-12">بدون عقود ولا رسوم ولا حد أدنى</p>
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-10 right-[16%] left-[16%] h-0.5 bg-gradient-to-l from-primary/20 via-primary/50 to-primary/20" aria-hidden="true" />
          {STEPS.map(({ Icon, title, text }, i) => (
            <div key={title} className="relative text-center">
              <div className="relative w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center shadow-float">
                <Icon className="h-9 w-9" />
                <span className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-brand-yellow text-brand-blue-deeper font-bold flex items-center justify-center text-sm shadow">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ——— الحاسبة والنموذج ——— */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
          <EarningsCalculator onJoin={() => goToForm("register")} />

          <div ref={formRef} className="bg-card border rounded-3xl shadow-float overflow-hidden scroll-mt-24">
            <div className="grid grid-cols-2 p-1.5 m-4 mb-0 rounded-2xl bg-muted">
              {([
                { key: "register", label: "انضم كشريك", Icon: UserPlus },
                { key: "lead", label: "سجّل عميل", Icon: Send },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key} type="button" onClick={() => setTab(key)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                    tab === key ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="p-6 sm:p-8">
              {tab === "register" ? (
                <>
                  <h2 className="text-2xl font-bold mb-1">انضم في دقيقة</h2>
                  <p className="text-sm text-muted-foreground mb-6">ثلاث خانات بس، والباقي نكمله معك على الواتس.</p>
                  <RegisterForm onSwitchToLead={() => setTab("lead")} />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-1">سجّل عميل جديد</h2>
                  <p className="text-sm text-muted-foreground mb-6">الاسم والجوال يكفون، ونتواصل معه حنا.</p>
                  <LeadForm />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— القطاعات ——— */}
      <ClientSectors />

      {/* ——— الأسئلة ——— */}
      <section id="faq" className="max-w-3xl mx-auto px-4 py-16 sm:py-20 scroll-mt-24">
        <h2 className="text-3xl font-bold text-center mb-3">أسئلة الشركاء</h2>
        <p className="text-muted-foreground text-center mb-10">وهذي هي شروط البرنامج كاملة</p>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ.map(({ q, a }, i) => (
            <AccordionItem key={q} value={`q${i}`} className="bg-card border rounded-2xl px-5 shadow-clean">
              <AccordionTrigger className="text-right font-semibold hover:no-underline py-5">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-3">عندك سؤال ثاني؟</p>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("مرحباً، عندي استفسار عن برنامج الشركاء.")}`}
             target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg"><MessageCircle className="h-4 w-4 ml-2 text-green-600" />كلمنا واتساب</Button>
          </a>
        </div>
      </section>

      <Footer />

      {/* ——— زر ثابت للجوال ——— */}
      <div
        className={cn(
          "fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden transition-transform duration-300",
          heroPassed && !formVisible ? "translate-y-0" : "translate-y-full",
        )}
      >
        <Button size="lg" className="w-full h-12 text-base font-bold" onClick={() => goToForm(readSavedCode() ? "lead" : "register")}>
          {readSavedCode() ? "سجّل عميل جديد" : "انضم الآن ← 10٪ على كل طلب"}
        </Button>
      </div>
    </div>
  );
}
