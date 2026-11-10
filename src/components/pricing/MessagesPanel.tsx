import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MessageCircle, CalendarCheck, Bell, Car, Star, FileText, Search, Loader2, User, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toWhatsAppNumber } from "@/lib/pricing/quoteMessage";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface Match { name: string; phone: string; location?: string; date?: string; time?: string; service?: string }
interface Booking {
  id: string; customerName: string; phone: string; bookingNo: string; date: string;
  time: string; location: string; serviceType: string; savedAt: string;
  reminderSentAt: string; reviewSentAt: string; followupSentAt: string;
}

type Vals = Record<string, string>;
interface Field { key: string; label: string; placeholder?: string; optional?: boolean; kind?: "text" | "date" | "booking" | "time" }

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];
const selectCls = "flex h-11 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const composeTime = (h: string, m: string, p: string) => `${h}:${m} ${p}`;

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
      { key: "service", label: "نوع الخدمة", placeholder: "تنظيف ما بعد البناء", optional: true },
      { key: "date", label: "التاريخ", kind: "date" },
      { key: "time", label: "الوقت", kind: "time" },
      { key: "location", label: "الموقع / الحي", optional: true },
    ],
    build: (v) =>
      `مرحباً ${v.name || ""}،\n\n` +
      `تم تأكيد حجز موعد خدمة التنظيف 🧹 الخاصة بك:\n\n` +
      line("🔖", "رقم موعدك", v.bookingNo) +
      line("🧹", "الخدمة", v.service) +
      line("📅", "اليوم", v.day) +
      line("🗓️", "التاريخ", v.date) +
      line("⏰", "الوقت", v.time) +
      line("📍", "الموقع", v.location) +
      `\nشكراً لاختيارك كلينولوجي`,
  },
  {
    key: "reminder", label: "تذكير بالموعد", Icon: Bell,
    fields: [
      { key: "name", label: "اسم العميل" },
      { key: "date", label: "التاريخ", kind: "date" },
      { key: "time", label: "الوقت", kind: "time" },
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
      `فريق كلينولوجي في الطريق إليك 🚗\n\n` +
      `مرحباً ${v.name || ""}، فريقنا بيوصلك خلال ${v.minutes || "..."} دقيقة تقريباً.\n` +
      (v.supervisor ? `المشرف: ${v.supervisor}${v.supervisorPhone ? ` — جواله: ${v.supervisorPhone}` : ""}\n` : "") +
      `\nنرجو تجهيز مدخل المكان. شكراً لك 🙏`,
  },
  {
    key: "after", label: "بعد الخدمة + تقييم", Icon: Star,
    fields: [{ key: "name", label: "اسم العميل" }],
    build: (v) =>
      `تم إنجاز خدمتك ✅\n\n` +
      `شكراً لثقتك بكلينولوجي يا ${v.name || ""}\n` +
      `نتمنى الخدمة نالت رضاك.\n\n` +
      `رأيك يهمنا — قيّمنا في دقيقة:\nkleenology.github.io/Feedback/reviews.html\n\n` +
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
      `\n${v.validUntil ? `العرض ساري حتى ${v.validUntil}. ` : ""}للتأكيد ردّ بـ «أوافق» ونحجز لك الموعد`,
  },
];

export function MessagesPanel({ token }: { token: string }) {
  const [active, setActive] = useState(TEMPLATES[0].key);
  const [phone, setPhone] = useState("");
  const [vals, setVals] = useState<Vals>(() => {
    const date = todayISO();
    return { bookingNo: genBooking(), date, day: arWeekday(date), time: composeTime("4", "00", "مساءً") };
  });
  const [timeH, setTimeH] = useState("4");
  const [timeM, setTimeM] = useState("00");
  const [timeP, setTimeP] = useState("مساءً");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [view, setView] = useState<"compose" | "bookings">("compose");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingB, setLoadingB] = useState(false);

  const loadBookings = async () => {
    setLoadingB(true);
    try {
      const res = await fetch("/api/pricing/bookings", { headers: { Authorization: `Bearer ${token}` } });
      const data = res.ok ? await res.json() : { bookings: [] };
      setBookings(data.bookings ?? []);
    } catch {
      toast.error("تعذّر جلب الحجوزات");
    } finally {
      setLoadingB(false);
    }
  };

  const openBookings = () => { setView("bookings"); loadBookings(); };

  const [bQuery, setBQuery] = useState("");
  const [bFilter, setBFilter] = useState<"all" | "upcoming" | "past">("all");
  const [editing, setEditing] = useState<Booking | null>(null);
  const [editH, setEditH] = useState("4");
  const [editM, setEditM] = useState("00");
  const [editP, setEditP] = useState("مساءً");

  const filteredBookings = useMemo(() => {
    const today = todayISO();
    const q = bQuery.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (bFilter === "upcoming" && b.date && b.date < today) return false;
        if (bFilter === "past" && (!b.date || b.date >= today)) return false;
        if (q) {
          const hay = `${b.customerName} ${b.phone} ${b.bookingNo} ${b.serviceType} ${b.location}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => (bFilter === "past" ? (b.date || "").localeCompare(a.date || "") : (a.date || "").localeCompare(b.date || "")));
  }, [bookings, bQuery, bFilter]);

  // يبني رسالة من قالب لحجز محفوظ ويفتح واتساب العميل
  const sendForBooking = (b: Booking, key: string) => {
    const t = TEMPLATES.find((x) => x.key === key);
    if (!t) return;
    const v: Vals = {
      name: b.customerName, bookingNo: b.bookingNo, service: b.serviceType,
      date: b.date, day: arWeekday(b.date), time: b.time, location: b.location,
    };
    const msg = t.build(v).trim();
    const number = toWhatsAppNumber(b.phone);
    window.open((number ? `https://wa.me/${number}?text=` : `https://wa.me/?text=`) + encodeURIComponent(msg), "_blank");
  };

  const deleteBooking = async (b: Booking) => {
    if (!window.confirm(`حذف حجز ${b.customerName || b.bookingNo}؟`)) return;
    try {
      const res = await fetch(`/api/pricing/bookings?id=${encodeURIComponent(b.id)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setBookings((bs) => bs.filter((x) => x.id !== b.id)); toast.success("حُذف الحجز"); }
      else toast.error("تعذّر الحذف");
    } catch { toast.error("تعذّر الحذف"); }
  };

  const startEdit = (b: Booking) => {
    // نفكّك الوقت المحفوظ (مثل "4:30 مساءً") للقوائم، وإلا الافتراضي
    const mt = (b.time || "").match(/(\d{1,2}):(\d{2})\s*(صباحاً|مساءً)/);
    setEditH(mt?.[1] ?? "4");
    setEditM(mt?.[2] ?? "00");
    setEditP(mt?.[3] ?? "مساءً");
    setEditing({ ...b });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const body = {
      customerName: editing.customerName, phone: editing.phone, bookingNo: editing.bookingNo,
      date: editing.date, time: composeTime(editH, editM, editP),
      location: editing.location, serviceType: editing.serviceType,
    };
    try {
      const res = await fetch(`/api/pricing/bookings?id=${encodeURIComponent(editing.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { toast.error("تعذّر الحفظ"); return; }
      toast.success("تم تحديث الحجز");
      setEditing(null);
      loadBookings();
    } catch { toast.error("تعذّر الحفظ"); }
  };

  const tpl = TEMPLATES.find((t) => t.key === active)!;
  const message = useMemo(() => tpl.build(vals).trim(), [tpl, vals]);
  const set = (k: string, v: string) =>
    setVals((prev) => ({ ...prev, [k]: v, ...(k === "date" ? { day: arWeekday(v) } : {}) }));
  const regenBooking = () => setVals((prev) => ({ ...prev, bookingNo: genBooking() }));
  const onTime = (patch: { h?: string; m?: string; p?: string }) => {
    const h = patch.h ?? timeH, m = patch.m ?? timeM, p = patch.p ?? timeP;
    setTimeH(h); setTimeM(m); setTimeP(p);
    set("time", composeTime(h, m, p));
  };

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

  // حفظ الحجز في السجل + تنبيه الجروب على تليجرام، وجدولة التذكير والتقييم تلقائياً.
  // في الخلفية بدون await حتى لا يحجب المتصفح نافذة الواتس.
  const saveBooking = () => {
    const b = {
      customerName: vals.name || "",
      phone,
      bookingNo: vals.bookingNo || "",
      date: vals.date || "",
      time: vals.time || "",
      location: vals.location || "",
      serviceType: vals.service || "",
    };
    fetch("/api/pricing/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(b),
    })
      .then((r) => { if (r.ok) toast.success("حُفظ الحجز وأُرسل للجروب — بيوصلك تذكير قبل الموعد بيوم"); })
      .catch(() => {});
  };

  const send = () => {
    const number = toWhatsAppNumber(phone);
    const base = number ? `https://wa.me/${number}?text=` : `https://wa.me/?text=`;
    window.open(base + encodeURIComponent(message), "_blank"); // أولاً داخل نقرة المستخدم
    if (active === "confirm") saveBooking(); // يحفظ الحجز للتذكير والتقييم التلقائي
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

      {/* تبديل: إنشاء رسالة أو عرض الحجوزات */}
      <div className="flex gap-2 bg-muted/50 p-1 rounded-xl w-full sm:w-fit">
        <button type="button" onClick={() => setView("compose")}
          className={cn("flex-1 sm:flex-none text-sm rounded-lg px-4 py-2 font-medium transition-colors",
            view === "compose" ? "bg-card shadow-clean text-foreground" : "text-muted-foreground")}>
          إنشاء رسالة
        </button>
        <button type="button" onClick={openBookings}
          className={cn("flex-1 sm:flex-none text-sm rounded-lg px-4 py-2 font-medium transition-colors",
            view === "bookings" ? "bg-card shadow-clean text-foreground" : "text-muted-foreground")}>
          الحجوزات
        </button>
      </div>

      {view === "bookings" ? (
        <div className="space-y-3">
          {/* بحث + تحديث */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input className="h-10 pr-9" placeholder="دوّر بالاسم أو الجوال أو رقم الطلب"
                     value={bQuery} onChange={(e) => setBQuery(e.target.value)} />
            </div>
            <Button type="button" variant="outline" className="h-10 shrink-0 px-3"
                    onClick={loadBookings} disabled={loadingB} title="تحديث">
              {loadingB ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          {/* فلترة */}
          <div className="flex gap-2">
            {([["all", "الكل"], ["upcoming", "القادمة"], ["past", "المنتهية"]] as const).map(([k, label]) => (
              <button key={k} type="button" onClick={() => setBFilter(k)}
                className={cn("text-xs rounded-full px-3 py-1.5 border transition-colors",
                  bFilter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted")}>
                {label}
              </button>
            ))}
          </div>

          {loadingB ? (
            <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              {bookings.length === 0 ? "ما فيه حجوزات محفوظة بعد. احجز من قالب «تأكيد حجز» وتظهر هنا." : "ما فيه حجوزات مطابقة."}
            </p>
          ) : (
            <div className="space-y-2.5">
              {filteredBookings.map((b) => (
                <div key={b.id} className="bg-card border rounded-2xl p-4 shadow-clean">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{b.customerName || "—"}</div>
                      {b.phone && <div className="text-xs text-muted-foreground" dir="ltr">{b.phone}</div>}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0" dir="ltr">{b.bookingNo}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                    {b.serviceType && <div>🧹 {b.serviceType}</div>}
                    <div>🗓️ {b.date}{b.time ? ` — ${b.time}` : ""}</div>
                    {b.location && <div>📍 {b.location}</div>}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className={cn("text-[11px] rounded-full px-2 py-0.5",
                      b.reminderSentAt ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                      {b.reminderSentAt ? "✓ تذكير أُرسل" : "تذكير قبل الموعد بيوم"}
                    </span>
                    <span className={cn("text-[11px] rounded-full px-2 py-0.5",
                      b.reviewSentAt ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                      {b.reviewSentAt ? "✓ تقييم أُرسل" : "تقييم بعد الخدمة"}
                    </span>
                    {b.followupSentAt && (
                      <span className="text-[11px] rounded-full px-2 py-0.5 bg-green-100 text-green-700">✓ متابعة أُرسلت</span>
                    )}
                  </div>

                  {/* أزرار واتساب سريعة */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    <Button type="button" size="sm" variant="outline" className="h-9 text-xs px-1"
                            onClick={() => sendForBooking(b, "confirm")}>
                      <MessageCircle className="h-3.5 w-3.5 ml-1" />التأكيد
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-9 text-xs px-1"
                            onClick={() => sendForBooking(b, "reminder")}>
                      <Bell className="h-3.5 w-3.5 ml-1" />تذكير
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="h-9 text-xs px-1"
                            onClick={() => sendForBooking(b, "after")}>
                      <Star className="h-3.5 w-3.5 ml-1" />تقييم
                    </Button>
                  </div>
                  {/* تعديل / حذف */}
                  <div className="mt-1.5 flex gap-1.5">
                    <Button type="button" size="sm" variant="ghost" className="h-8 flex-1 text-xs text-muted-foreground"
                            onClick={() => startEdit(b)}>
                      <Pencil className="h-3.5 w-3.5 ml-1" />تعديل
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="h-8 flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteBooking(b)}>
                      <Trash2 className="h-3.5 w-3.5 ml-1" />حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* نافذة التعديل */}
          <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
            <DialogContent dir="rtl" className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل الحجز</DialogTitle>
              </DialogHeader>
              {editing && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="e-name">اسم العميل</Label>
                    <Input id="e-name" className="h-11" value={editing.customerName}
                           onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-phone">الجوال</Label>
                    <Input id="e-phone" dir="ltr" className="h-11 text-right" value={editing.phone}
                           onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-service">نوع الخدمة</Label>
                    <Input id="e-service" className="h-11" value={editing.serviceType}
                           onChange={(e) => setEditing({ ...editing, serviceType: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-date">التاريخ</Label>
                    <Input id="e-date" type="date" dir="ltr" className="h-11 text-right" value={editing.date}
                           onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>الوقت</Label>
                    <div className="flex gap-2">
                      <select aria-label="صباحاً أو مساءً" className={cn(selectCls, "flex-[1.2]")} value={editP}
                              onChange={(e) => setEditP(e.target.value)}>
                        <option>صباحاً</option>
                        <option>مساءً</option>
                      </select>
                      <select aria-label="الساعة" className={cn(selectCls, "flex-1")} value={editH}
                              onChange={(e) => setEditH(e.target.value)}>
                        {HOURS.map((h) => <option key={h}>{h}</option>)}
                      </select>
                      <select aria-label="الدقائق" className={cn(selectCls, "flex-1")} value={editM}
                              onChange={(e) => setEditM(e.target.value)}>
                        {MINUTES.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e-loc">الموقع / الحي</Label>
                    <Input id="e-loc" className="h-11" value={editing.location}
                           onChange={(e) => setEditing({ ...editing, location: e.target.value })} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">لو غيّرت التاريخ، يُعاد جدولة التذكير والتقييم تلقائياً.</p>
                </div>
              )}
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
                <Button onClick={saveEdit}>حفظ التعديلات</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
      <>
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
              ) : f.kind === "time" ? (
                <div className="flex gap-2">
                  <select aria-label="صباحاً أو مساءً" className={cn(selectCls, "flex-[1.2]")} value={timeP}
                          onChange={(e) => onTime({ p: e.target.value })}>
                    <option>صباحاً</option>
                    <option>مساءً</option>
                  </select>
                  <select aria-label="الساعة" className={cn(selectCls, "flex-1")} value={timeH}
                          onChange={(e) => onTime({ h: e.target.value })}>
                    {HOURS.map((h) => <option key={h}>{h}</option>)}
                  </select>
                  <select aria-label="الدقائق" className={cn(selectCls, "flex-1")} value={timeM}
                          onChange={(e) => onTime({ m: e.target.value })}>
                    {MINUTES.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
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
              <MessageCircle className="h-4 w-4 ml-1.5" />{active === "confirm" ? "احجز وأرسل واتساب" : "إرسال واتساب"}
            </Button>
            <Button variant="outline" onClick={copy}>
              <Copy className="h-4 w-4 ml-1.5" />نسخ
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">
            {active === "confirm"
              ? "يُحفظ الحجز ويوصلك على تليجرام تذكير قبل الموعد بيوم ورسالة تقييم بعده — جاهزة تنسخها وترسلها."
              : "بدون جوال، يفتح الواتس وتختار العميل بنفسك."}
          </p>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
