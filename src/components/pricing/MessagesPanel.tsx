import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MessageCircle, CalendarCheck, Bell, Car, Star, FileText, Search, Loader2, User, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toWhatsAppNumber } from "@/lib/pricing/quoteMessage";

interface Match { name: string; phone: string; location?: string; date?: string; time?: string; service?: string }

type Vals = Record<string, string>;
interface Field { key: string; label: string; placeholder?: string; optional?: boolean; kind?: "text" | "date" | "booking" }

// التاريخ جاهز (اليوم) ويتحدّث اسم اليوم تلقائياً، ورقم الطلب يتولّد من جديد بعد كل رسالة
const pad = (n: number) => String(n).padStart(2, "0");
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const arWeekday = (iso: string) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString("ar", { weekday: "long" });
};
const genBooking = () => `AP-${Math.floor(100000 + Math.random() * 900000)}`;
interface Template {
  key: string; label: string; Icon: typeof Bell;
  fields: Field[];
  build: (v: Vals) => string;
}

const line = (emoji: string, label: string, value: string) => (value ? `${emoji} ${label}: ${value}\n` : "");

const TEMPLATES: Template[] = [
  {
    key: "confirm", label: "تأكيد حجز", Icon: CalendarCheck,
    fields: [
      { key: "name", label: "اسم العميل" },
      { key: "bookingNo", label: "رقم الطلب", kind: "booking" },
      { key: "date", label: "التاريخ", kind: "date" },
      { key: "time", label: "الوقت", placeholder: "بين 4 و 6 مساءً" },
      { key: "location", label: "الموقع / الحي", optional: true },
    ],
    build: (v) =>
      `مرحباً ${v.name || ""}،\n\n` +
      `تم تأكيد حجز موعد خدمة التنظيف 🧹 الخاصة بك:\n\n` +
      line("🔖", "رقم موعدك", v.bookingNo) +
      line("📅", "اليوم", v.day) +
      line("🗓️", "التاريخ", v.date) +
      line("⏰", "الوقت", v.time) +
      line("📍", "الموقع", v.location) +
      `\nشكراً لاختيارك كلينولوجي 🌿\n\n` +
      `تُطبّق الشروط والأحكام: kleenology.me/terms-and-conditions`,
  },
  {
    key: "reminder", label: "تذكير بالموعد", Icon: Bell,
    fields: [
      { key: "name", label: "اسم العميل" },
      { key: "date", label: "التاريخ", kind: "date" },
      { key: "time", label: "الوقت", placeholder: "بين 4 و 6 مساءً" },
      { key: "location", label: "الموقع / الحي", optional: true },
    ],
    build: (v) =>
      `تذكير ودّي 🔔 من كلينولوجي\n\n` +
      `مرحباً ${v.name || ""}، نذكّرك بموعد خدمتك:\n\n` +
      line("🗓️", "التاريخ", v.date) +
      line("⏰", "الوقت", v.time) +
      line("📍", "الموقع", v.location) +
      `\nجاهزين نخدمك! لو تحتاج تغيّر الموعد، ردّ على الرسالة.`,
  },
  {
    key: "onway", label: "في الطريق", Icon: Car,
    fields: [
      { key: "name", label: "اسم العميل" },
      { key: "minutes", label: "الوصول خلال (دقيقة)", placeholder: "30" },
      { key: "supervisor", label: "اسم المشرف", optional: true },
      { key: "supervisorPhone", label: "جوال المشرف", optional: true },
    ],
    build: (v) =>
      `فريق كلينولوجي في الطريق إليك 🚗🌿\n\n` +
      `مرحباً ${v.name || ""}، فريقنا بيوصلك خلال ${v.minutes || "..."} دقيقة تقريباً.\n` +
      (v.supervisor ? `المشرف: ${v.supervisor}${v.supervisorPhone ? ` — جواله: ${v.supervisorPhone}` : ""}\n` : "") +
      `\nنرجو تجهيز مدخل المكان. شكراً لك 🙏`,
  },
  {
    key: "after", label: "بعد الخدمة + تقييم", Icon: Star,
    fields: [{ key: "name", label: "اسم العميل" }],
    build: (v) =>
      `تم إنجاز خدمتك ✅\n\n` +
      `شكراً لثقتك بكلينولوجي يا ${v.name || ""} 🌿\n` +
      `نتمنى الخدمة نالت رضاك.\n\n` +
      `رأيك يهمنا — قيّمنا في دقيقة:\nkleenology.me/review\n\n` +
      `وإذا تبي تحجز مرة ثانية، إحنا جاهزين 💙`,
  },
  {
    key: "quote", label: "عرض سعر", Icon: FileText,
    fields: [
      { key: "name", label: "اسم العميل" },
      { key: "service", label: "الخدمة", placeholder: "تنظيف ما بعد البناء" },
      { key: "location", label: "الموقع / الحي", optional: true },
      { key: "amount", label: "المبلغ (ر.س)", placeholder: "900" },
      { key: "duration", label: "مدة التنفيذ", placeholder: "يوم عمل", optional: true },
      { key: "validUntil", label: "العرض ساري حتى", optional: true, kind: "date" },
    ],
    build: (v) =>
      `عرض سعر من كلينولوجي 🧾\n\n` +
      `مرحباً ${v.name || ""}،\n` +
      line("🧹", "الخدمة", v.service) +
      line("📍", "الموقع", v.location) +
      (v.amount ? `💰 المبلغ: ${v.amount} ر.س شامل الضريبة\n` : "") +
      line("⏱️", "مدة التنفيذ", v.duration) +
      `\n${v.validUntil ? `العرض ساري حتى ${v.validUntil}. ` : ""}للتأكيد ردّ بـ «أوافق» ونحجز لك الموعد 🌿`,
  },
];

export function MessagesPanel({ token }: { token: string }) {
  const [active, setActive] = useState(TEMPLATES[0].key);
  const [phone, setPhone] = useState("");
  const [vals, setVals] = useState<Vals>(() => {
    const date = todayISO();
    return { bookingNo: genBooking(), date, day: arWeekday(date) };
  });
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);

  const tpl = TEMPLATES.find((t) => t.key === active)!;
  const message = useMemo(() => tpl.build(vals).trim(), [tpl, vals]);
  const set = (k: string, v: string) =>
    setVals((prev) => ({ ...prev, [k]: v, ...(k === "date" ? { day: arWeekday(v) } : {}) }));
  const regenBooking = () => setVals((prev) => ({ ...prev, bookingNo: genBooking() }));

  // أسهل طريقة: ابحث عن العميل في سجلات المعاينة/فحص الجودة فتتعبّى بياناته تلقائياً
  const lookup = async () => {
    const q = term.trim();
    if (!q) return;
    setSearching(true);
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [insp, qc] = await Promise.all([
        fetch(`/api/pricing/inspections?q=${encodeURIComponent(q)}`, auth).then((r) => (r.ok ? r.json() : { inspections: [] })).catch(() => ({ inspections: [] })),
        fetch(`/api/pricing/qc?q=${encodeURIComponent(q)}`, auth).then((r) => (r.ok ? r.json() : { checks: [] })).catch(() => ({ checks: [] })),
      ]);
      const rows: Match[] = [
        ...(insp.inspections ?? []).map((m: Record<string, string>) => ({ name: m.customerName, phone: m.phone, location: m.location, date: m.date, time: m.time, service: m.serviceType })),
        ...(qc.checks ?? []).map((m: Record<string, string>) => ({ name: m.customerName, phone: m.phone, location: m.location, date: m.date })),
      ].filter((r) => r.name || r.phone);
      const seen = new Set<string>();
      const uniq = rows.filter((r) => {
        const k = `${r.phone || ""}|${r.name || ""}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setResults(uniq.slice(0, 8));
      if (uniq.length === 0) toast.info("ما لقينا عميل بهذا الاسم/الجوال");
    } finally {
      setSearching(false);
    }
  };

  const pick = (m: Match) => {
    if (m.phone) setPhone(m.phone);
    setVals((v) => ({
      ...v,
      name: m.name || v.name,
      location: m.location || v.location,
      date: m.date || v.date,
      day: m.date ? (arWeekday(m.date) || v.day) : v.day,
      time: m.time || v.time,
      service: m.service || v.service,
    }));
    setResults([]);
    setTerm("");
    toast.success(`تعبّت بيانات ${m.name || "العميل"}`);
  };

  const send = () => {
    const number = toWhatsAppNumber(phone);
    const base = number ? `https://wa.me/${number}?text=` : `https://wa.me/?text=`;
    window.open(base + encodeURIComponent(message), "_blank");
    regenBooking(); // رقم طلب جديد للرسالة الجاية
  };

  const copy = () =>
    navigator.clipboard.writeText(message).then(() => { toast.success("تم نسخ الرسالة"); regenBooking(); });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-lg">رسائل جاهزة للعميل</h2>
        <p className="text-sm text-muted-foreground">التاريخ جاهز ورقم الطلب يتولّد تلقائياً (ويتجدّد بعد كل إرسال). ابحث عن العميل أو عبّي يدوياً ثم أرسل واتساب.</p>
      </div>

      {/* أسرع طريقة: البحث عن العميل */}
      <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-3 sm:p-4">
        <form onSubmit={(e) => { e.preventDefault(); lookup(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input className="h-11 pr-9" placeholder="ابحث عن العميل — بالاسم أو الجوال"
                   value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
          <Button type="submit" className="h-11 shrink-0" disabled={searching || !term.trim()}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "بحث"}
          </Button>
        </form>
        {results.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {results.map((m, i) => (
              <button key={i} type="button" onClick={() => pick(m)}
                      className="w-full flex items-center gap-3 text-right rounded-xl border bg-card px-3 py-2.5 hover:border-brand-blue transition-colors">
                <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{m.name || "بلا اسم"}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {[m.phone, m.location, m.date].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* اختيار القالب */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map(({ key, label, Icon }) => (
          <button key={key} type="button" onClick={() => setActive(key)}
            className={cn("flex items-center gap-1.5 text-sm rounded-full px-3.5 py-2 border transition-colors",
              active === key ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted")}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        {/* الخانات */}
        <div className="bg-card border rounded-2xl shadow-clean p-4 sm:p-5 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="m-phone">جوال العميل (للإرسال)</Label>
            <Input id="m-phone" type="tel" dir="ltr" className="h-11 text-right" placeholder="05xxxxxxxx"
                   value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {tpl.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`m-${f.key}`}>
                {f.label} {f.optional && <span className="text-xs text-muted-foreground">(اختياري)</span>}
              </Label>
              {f.kind === "booking" ? (
                <div className="flex gap-2">
                  <Input id={`m-${f.key}`} dir="ltr" className="h-11 text-right font-mono tracking-wide"
                         value={vals[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  <Button type="button" variant="outline" className="h-11 shrink-0 px-3"
                          onClick={regenBooking} title="توليد رقم جديد">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              ) : f.kind === "date" ? (
                <Input id={`m-${f.key}`} type="date" dir="ltr" className="h-11 text-right"
                       value={vals[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
              ) : (
                <Input id={`m-${f.key}`} className="h-11" placeholder={f.placeholder}
                       value={vals[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>

        {/* المعاينة والإرسال */}
        <div className="lg:sticky lg:top-28 space-y-3">
          <div className="bg-muted/50 border rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-2">معاينة الرسالة</p>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{message}</pre>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={send} className="bg-[#25D366] hover:bg-[#1da851] text-white">
              <MessageCircle className="h-4 w-4 ml-1.5" />إرسال واتساب
            </Button>
            <Button variant="outline" onClick={copy}>
              <Copy className="h-4 w-4 ml-1.5" />نسخ
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">
            بدون جوال، يفتح الواتس وتختار العميل بنفسك.
          </p>
        </div>
      </div>
    </div>
  );
}
