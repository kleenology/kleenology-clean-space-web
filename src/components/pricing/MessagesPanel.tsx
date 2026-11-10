import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, MessageCircle, CalendarCheck, Bell, Car, Star, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toWhatsAppNumber } from "@/lib/pricing/quoteMessage";

type Vals = Record<string, string>;
interface Field { key: string; label: string; placeholder?: string; optional?: boolean }
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
      { key: "bookingNo", label: "رقم الموعد", placeholder: "AP-XXXXXX" },
      { key: "day", label: "اليوم", placeholder: "الخميس" },
      { key: "date", label: "التاريخ", placeholder: "2026-05-21" },
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
      { key: "date", label: "التاريخ", placeholder: "الخميس 2026-05-21" },
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
      { key: "validUntil", label: "العرض ساري حتى", optional: true },
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

export function MessagesPanel() {
  const [active, setActive] = useState(TEMPLATES[0].key);
  const [phone, setPhone] = useState("");
  const [vals, setVals] = useState<Vals>({});

  const tpl = TEMPLATES.find((t) => t.key === active)!;
  const message = useMemo(() => tpl.build(vals).trim(), [tpl, vals]);
  const set = (k: string, v: string) => setVals((prev) => ({ ...prev, [k]: v }));

  const send = () => {
    const number = toWhatsAppNumber(phone);
    const base = number ? `https://wa.me/${number}?text=` : `https://wa.me/?text=`;
    window.open(base + encodeURIComponent(message), "_blank");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-lg">رسائل جاهزة للعميل</h2>
        <p className="text-sm text-muted-foreground">اختر نوع الرسالة، عبّي الخانات، وأرسلها واتساب مباشرة.</p>
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
              <Input id={`m-${f.key}`} className="h-11" placeholder={f.placeholder}
                     value={vals[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
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
            <Button variant="outline"
                    onClick={() => navigator.clipboard.writeText(message).then(() => toast.success("تم نسخ الرسالة"))}>
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
