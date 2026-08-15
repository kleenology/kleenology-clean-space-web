import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageCircle, Calendar, User, Phone, MapPin,
  ChevronRight, ChevronLeft, CheckCircle2,
  Home, Building2, Sparkles, Droplets, Wind, HardHat,
  Star, Shield, Clock, CreditCard, FlaskConical, Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "966537519929";

type Step = 1 | 2 | 3 | 4;

interface FormData {
  service: string;
  date: string;
  timeSlot: string;
  name: string;
  phone: string;
  neighborhood: string;
  notes: string;
}

interface DepositConfig {
  enabled: boolean;
  mode: "test" | "live" | null;
  amountSar: number | null;
}

const SERVICES = {
  ar: [
    { key: "home",    label: "تنظيف المنازل",         desc: "غرف، مطبخ، حمامات",          Icon: Home,      color: "text-emerald-600", bg: "bg-emerald-50"  },
    { key: "deep",    label: "تنظيف عميق",             desc: "من الأعلى للأسفل لكل زاوية", Icon: Sparkles,  color: "text-primary",     bg: "bg-primary/10"  },
    { key: "office",  label: "تنظيف المكاتب",          desc: "بيئة عمل نظيفة باستمرار",    Icon: Building2, color: "text-blue-600",    bg: "bg-blue-50"     },
    { key: "carpet",  label: "تنظيف السجاد",           desc: "بخار وإزالة بقع",             Icon: Droplets,  color: "text-amber-600",   bg: "bg-amber-50"    },
    { key: "windows", label: "تنظيف النوافذ",          desc: "زجاج لامع وخالٍ من الأتربة", Icon: Wind,      color: "text-sky-600",     bg: "bg-sky-50"      },
    { key: "post",    label: "تنظيف ما بعد البناء",    desc: "مكانك جاهز للسكن",           Icon: HardHat,   color: "text-slate-600",   bg: "bg-slate-50"    },
  ],
  en: [
    { key: "home",    label: "Home Cleaning",          desc: "Rooms, kitchen & bathrooms",  Icon: Home,      color: "text-emerald-600", bg: "bg-emerald-50"  },
    { key: "deep",    label: "Deep Cleaning",          desc: "Top-to-bottom every corner",  Icon: Sparkles,  color: "text-primary",     bg: "bg-primary/10"  },
    { key: "office",  label: "Office Cleaning",        desc: "Clean & sanitized workspace", Icon: Building2, color: "text-blue-600",    bg: "bg-blue-50"     },
    { key: "carpet",  label: "Carpet Cleaning",        desc: "Steam & stain removal",       Icon: Droplets,  color: "text-amber-600",   bg: "bg-amber-50"    },
    { key: "windows", label: "Window Cleaning",        desc: "Sparkling glass surfaces",    Icon: Wind,      color: "text-sky-600",     bg: "bg-sky-50"      },
    { key: "post",    label: "Post-Construction",      desc: "Move-in ready handover",      Icon: HardHat,   color: "text-slate-600",   bg: "bg-slate-50"    },
  ],
};

const TIME_SLOTS = {
  ar: [
    { key: "morning",   label: "صباحاً",  range: "٨:٠٠ — ١٢:٠٠",  emoji: "🌅" },
    { key: "afternoon", label: "ظهراً",   range: "١٢:٠٠ — ١٦:٠٠", emoji: "☀️" },
    { key: "evening",   label: "مساءً",   range: "١٦:٠٠ — ٢٠:٠٠", emoji: "🌇" },
  ],
  en: [
    { key: "morning",   label: "Morning",   range: "8:00 — 12:00",  emoji: "🌅" },
    { key: "afternoon", label: "Afternoon", range: "12:00 — 16:00", emoji: "☀️" },
    { key: "evening",   label: "Evening",   range: "16:00 — 20:00", emoji: "🌇" },
  ],
};

const STEP_LABELS = {
  ar: ["الخدمة", "الموعد", "بياناتك", "تأكيد"],
  en: ["Service", "Schedule", "Details", "Confirm"],
};

export default function Booking() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const lang = isRTL ? "ar" : "en";

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    service: "", date: "", timeSlot: "",
    name: "", phone: "", neighborhood: "", notes: "",
  });

  const services  = SERVICES[lang];
  const timeSlots = TIME_SLOTS[lang];
  const stepLabels = STEP_LABELS[lang];

  const selectedService  = services.find(s => s.key === form.service);
  const selectedTimeSlot = timeSlots.find(t => t.key === form.timeSlot);

  const canNext: Record<number, boolean> = {
    1: !!form.service,
    2: !!form.date && !!form.timeSlot,
    3: !!form.name.trim() && !!form.phone.trim() && !!form.neighborhood.trim(),
  };

  const next = () => setStep(s => Math.min(s + 1, 4) as Step);
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);

  const sendWhatsApp = () => {
    const svc  = selectedService?.label  ?? "";
    const time = selectedTimeSlot ? `${selectedTimeSlot.label} (${selectedTimeSlot.range})` : "";
    const msg  = isRTL
      ? `مرحباً، أود حجز خدمة تنظيف 🧹\n\nالخدمة: ${svc}\nالتاريخ: ${form.date}\nالوقت: ${time}\nالاسم: ${form.name}\nالجوال: ${form.phone}\nالعنوان: ${form.neighborhood}${form.notes ? `\nملاحظات: ${form.notes}` : ""}`
      : `Hello! I'd like to book a cleaning service 🧹\n\nService: ${svc}\nDate: ${form.date}\nTime: ${time}\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.neighborhood}${form.notes ? `\nNotes: ${form.notes}` : ""}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // خيار العربون يظهر فقط إذا كانت بوابة الدفع مهيأة على الخادم
  const [deposit, setDeposit] = useState<DepositConfig | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/deposit/config")
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(data => { if (!cancelled) setDeposit(data); })
      .catch(() => { /* البوابة غير مهيأة — نكتفي بالحجز عبر واتساب */ });
    return () => { cancelled = true; };
  }, []);

  const payDeposit = async () => {
    setPayLoading(true);
    setPayError(false);
    try {
      const res = await fetch("/api/deposit/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService?.label ?? "",
          date: form.date,
          timeSlot: selectedTimeSlot
            ? `${selectedTimeSlot.label} (${selectedTimeSlot.range})`
            : "",
          name: form.name,
          phone: form.phone,
          neighborhood: form.neighborhood,
          notes: form.notes,
        }),
      });
      if (!res.ok) throw new Error("create failed");
      const data = await res.json();
      if (!data.url) throw new Error("no url");
      window.location.href = data.url;
    } catch {
      setPayError(true);
      setPayLoading(false);
    }
  };

  const progressPct = ((step - 1) / 3) * 100;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={isRTL ? "احجز خدمة تنظيف | كلينولوجي" : "Book a Cleaning Service | Kleenology"}
        description={isRTL ? "احجز خدمة التنظيف الاحترافية مع كلينولوجي في خطوات بسيطة." : "Book your professional cleaning service with Kleenology in simple steps."}
        keywords="حجز تنظيف, booking cleaning, kleenology"
        url="https://kleenology.me/booking"
      />
      <Header />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 to-brand-blue/5 py-10 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isRTL ? "احجز خدمتك الآن" : "Book Your Service"}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? "٤ خطوات بسيطة وسنتواصل معك عبر واتساب" : "4 simple steps and we'll reach you on WhatsApp"}
            </p>
          </div>
        </section>

        <section className="max-w-xl mx-auto px-4 mt-8">

          {/* Step indicators */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-3">
              {stepLabels.map((label, i) => {
                const n = (i + 1) as Step;
                const done   = step > n;
                const active = step === n;
                return (
                  <div key={n} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300",
                      done   ? "bg-primary text-white"                     : "",
                      active ? "bg-primary text-white ring-4 ring-primary/20 scale-110" : "",
                      !done && !active ? "bg-muted text-muted-foreground"  : "",
                    )}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : n}
                    </div>
                    <span className={cn(
                      "text-[11px] font-medium text-center leading-tight hidden sm:block",
                      active ? "text-primary" : "text-muted-foreground",
                    )}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-lg border border-border">

            {/* ── Step 1: Service ── */}
            {step === 1 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "اختر الخدمة" : "Choose a Service"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "ما الذي تحتاجه اليوم؟" : "What do you need today?"}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {services.map(({ key, label, desc, Icon, color, bg }) => {
                    const selected = form.service === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, service: key }))}
                        className={cn(
                          "relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-start transition-all duration-200",
                          "hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          selected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-white",
                        )}
                      >
                        {selected && (
                          <CheckCircle2 className="absolute top-2.5 end-2.5 h-4 w-4 text-primary" />
                        )}
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", bg)}>
                          <Icon className={cn("h-5 w-5", color)} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 2: Date & Time ── */}
            {step === 2 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "اختر الموعد" : "Choose Date & Time"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "متى يناسبك؟" : "When works for you?"}
                </p>
                <div className="space-y-5">
                  <div>
                    <Label className="font-semibold flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {isRTL ? "التاريخ" : "Date"}
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-12"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold mb-3 block">
                      {isRTL ? "الوقت المفضل" : "Preferred Time"}
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {timeSlots.map(({ key, label, range, emoji }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, timeSlot: key }))}
                          className={cn(
                            "flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            form.timeSlot === key
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                        >
                          <span className="text-2xl">{emoji}</span>
                          <span className="font-semibold text-sm">{label}</span>
                          <span className="text-[11px] text-muted-foreground">{range}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Personal Info ── */}
            {step === 3 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "بياناتك" : "Your Details"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "حتى نتواصل معك" : "So we can reach you"}
                </p>
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary" />
                      {isRTL ? "الاسم الكامل" : "Full Name"}
                    </Label>
                    <Input
                      placeholder={isRTL ? "أدخل اسمك الكامل" : "Enter your full name"}
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-primary" />
                      {isRTL ? "رقم الجوال" : "Phone Number"}
                    </Label>
                    <Input
                      type="tel"
                      placeholder={isRTL ? "05X XXX XXXX" : "+966 5X XXX XXXX"}
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="h-12"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {isRTL ? "الحي / العنوان" : "Neighborhood / Address"}
                    </Label>
                    <Input
                      placeholder={isRTL ? "مثال: حي العليا، الرياض" : "e.g. Al Olaya, Riyadh"}
                      value={form.neighborhood}
                      onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">
                      {isRTL ? "ملاحظات (اختياري)" : "Notes (optional)"}
                    </Label>
                    <Textarea
                      placeholder={isRTL ? "أي طلبات خاصة أو تفاصيل..." : "Any special requests or details..."}
                      value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Confirmation ── */}
            {step === 4 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "تأكيد الحجز" : "Confirm Booking"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "راجع تفاصيل طلبك" : "Review your booking details"}
                </p>

                {/* Summary rows */}
                <div className="space-y-2 mb-5">
                  {[
                    {
                      label: isRTL ? "الخدمة"  : "Service",
                      value: selectedService ? (
                        <span className="flex items-center gap-2">
                          <selectedService.Icon className={cn("h-4 w-4", selectedService.color)} />
                          {selectedService.label}
                        </span>
                      ) : "—",
                    },
                    {
                      label: isRTL ? "التاريخ" : "Date",
                      value: form.date,
                    },
                    {
                      label: isRTL ? "الوقت"   : "Time",
                      value: selectedTimeSlot
                        ? `${selectedTimeSlot.emoji} ${selectedTimeSlot.label} · ${selectedTimeSlot.range}`
                        : "—",
                    },
                    { label: isRTL ? "الاسم"   : "Name",    value: form.name         },
                    { label: isRTL ? "الجوال"  : "Phone",   value: form.phone        },
                    { label: isRTL ? "العنوان" : "Address", value: form.neighborhood },
                    ...(form.notes
                      ? [{ label: isRTL ? "ملاحظات" : "Notes", value: form.notes }]
                      : []),
                  ].map(row => (
                    <div
                      key={row.label}
                      className="flex items-center gap-3 px-4 py-3 bg-muted/40 rounded-xl"
                    >
                      <span className="text-xs text-muted-foreground w-16 flex-shrink-0 font-medium">
                        {row.label}
                      </span>
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Guarantee note */}
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isRTL
                      ? "سيتواصل معك فريقنا عبر واتساب لتأكيد الموعد وتفاصيل الخدمة خلال أقل من ساعة."
                      : "Our team will contact you via WhatsApp to confirm the appointment within less than an hour."}
                  </p>
                </div>

                <Button
                  onClick={sendWhatsApp}
                  className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl shadow-lg"
                >
                  <MessageCircle className="h-5 w-5 me-2" />
                  {isRTL ? "إرسال الطلب عبر واتساب" : "Send Request via WhatsApp"}
                </Button>

                {/* خيار اختياري: دفع عربون لتثبيت الموعد */}
                {deposit?.enabled && (
                  <div className="mt-5 pt-5 border-t border-border">
                    {deposit.mode === "test" && (
                      <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4">
                        <FlaskConical className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-900 leading-relaxed">
                          {isRTL
                            ? "وضع تجريبي: خيار الدفع تحت التجربة حالياً ولن يتم خصم أي مبلغ حقيقي. للحجز الفعلي استخدم زر واتساب أعلاه."
                            : "Test mode: the payment option is under testing and no real amount will be charged. For an actual booking, use the WhatsApp button above."}
                        </p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {isRTL
                        ? `أو ثبّت موعدك بدفع عربون ${deposit.amountSar} ر.س يُخصم من قيمة الفاتورة النهائية.`
                        : `Or secure your slot with a ${deposit.amountSar} SAR deposit, deducted from your final invoice.`}
                    </p>

                    <Button
                      onClick={payDeposit}
                      disabled={payLoading}
                      variant="outline"
                      className="w-full h-12 rounded-xl font-semibold"
                    >
                      {payLoading ? (
                        <Loader2 className="h-5 w-5 me-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-5 w-5 me-2" />
                      )}
                      {isRTL
                        ? `دفع عربون ${deposit.amountSar} ر.س`
                        : `Pay ${deposit.amountSar} SAR Deposit`}
                    </Button>

                    {payError && (
                      <p className="text-sm text-destructive mt-3">
                        {isRTL
                          ? "تعذّر فتح صفحة الدفع حالياً. جرّب مرة أخرى أو أرسل طلبك عبر واتساب."
                          : "Could not open the payment page. Please try again or send your request on WhatsApp."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation footer */}
            <div className={cn(
              "px-6 pb-5 flex items-center",
              step > 1 ? "justify-between" : "justify-end",
            )}>
              {step > 1 && (
                <Button
                  variant="ghost"
                  onClick={back}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isRTL
                    ? <><ChevronRight className="h-4 w-4 me-1" /> رجوع</>
                    : <><ChevronLeft  className="h-4 w-4 me-1" /> Back</>}
                </Button>
              )}

              {step < 4 && (
                <Button
                  onClick={next}
                  disabled={!canNext[step]}
                  className="px-8 h-11 rounded-xl"
                >
                  {isRTL
                    ? <>التالي <ChevronLeft  className="h-4 w-4 ms-1" /></>
                    : <>Next   <ChevronRight className="h-4 w-4 ms-1" /></>}
                </Button>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { Icon: Star,   text: isRTL ? "٤.٩ تقييم"    : "4.9 Rating"       },
              { Icon: Shield, text: isRTL ? "ضمان ١٠٠٪"    : "100% Guarantee"   },
              { Icon: Clock,  text: isRTL ? "رد خلال ساعة" : "Reply within 1hr" },
            ].map(({ Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 border border-border text-center"
              >
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{text}</span>
              </div>
            ))}
          </div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
