import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageCircle, User, Phone, MapPin,
  ChevronRight, ChevronLeft, CheckCircle2,
  Home, Building2, HardHat, LayoutGrid,
  Camera, X, Star, Shield, Clock, ClipboardList,
  AlertCircle, Info, Video,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "966537519929";

type Step = 1 | 2 | 3 | 4 | 5;
type Condition = "clean" | "medium" | "deep";

interface MediaItem {
  file: File;
  preview: string; // object URL
  isVideo: boolean;
}

interface RoomEntry {
  key: string;
  labelAr: string;
  labelEn: string;
  selected: boolean;
  condition: Condition;
  qty: number;
}

interface InspectionData {
  propertyType: string;
  area: string;
  floors: string;
  rooms: RoomEntry[];
  media: MediaItem[];
  name: string;
  phone: string;
  neighborhood: string;
  notes: string;
}

const PROPERTY_TYPES = {
  ar: [
    { key: "apartment", label: "شقة",          Icon: Home,       color: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "villa",     label: "فيلا / دوبلكس",  Icon: LayoutGrid, color: "text-primary",    bg: "bg-primary/10" },
    { key: "office",   label: "مكتب / شركة",    Icon: Building2,  color: "text-blue-600",   bg: "bg-blue-50"    },
    { key: "other",    label: "أخرى",            Icon: HardHat,    color: "text-slate-600",  bg: "bg-slate-50"   },
  ],
  en: [
    { key: "apartment", label: "Apartment",     Icon: Home,       color: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "villa",     label: "Villa / Duplex", Icon: LayoutGrid, color: "text-primary",    bg: "bg-primary/10" },
    { key: "office",   label: "Office",         Icon: Building2,  color: "text-blue-600",   bg: "bg-blue-50"    },
    { key: "other",    label: "Other",          Icon: HardHat,    color: "text-slate-600",  bg: "bg-slate-50"   },
  ],
};

const DEFAULT_ROOMS: RoomEntry[] = [
  { key: "livingroom", labelAr: "غرفة المعيشة",      labelEn: "Living Room",           selected: false, condition: "medium", qty: 1 },
  { key: "bedroom",    labelAr: "غرفة نوم",           labelEn: "Bedroom",               selected: false, condition: "medium", qty: 1 },
  { key: "kitchen",    labelAr: "مطبخ",               labelEn: "Kitchen",               selected: false, condition: "medium", qty: 1 },
  { key: "bathroom",   labelAr: "حمام / دورة مياه",   labelEn: "Bathroom",              selected: false, condition: "medium", qty: 1 },
  { key: "majlis",     labelAr: "مجلس / صالة",        labelEn: "Majlis / Hall",         selected: false, condition: "medium", qty: 1 },
  { key: "dining",     labelAr: "غرفة طعام",          labelEn: "Dining Room",           selected: false, condition: "medium", qty: 1 },
  { key: "balcony",    labelAr: "شرفة / بلكون",       labelEn: "Balcony",               selected: false, condition: "medium", qty: 1 },
  { key: "store",      labelAr: "مخزن / غرفة خادمة",  labelEn: "Storage / Maid's Room", selected: false, condition: "medium", qty: 1 },
];

const CONDITIONS = {
  ar: [
    { key: "clean",  label: "نظيف",            color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300" },
    { key: "medium", label: "متوسط",            color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-300"   },
    { key: "deep",   label: "يحتاج تنظيف عميق", color: "text-red-600",    bg: "bg-red-50",     border: "border-red-300"     },
  ],
  en: [
    { key: "clean",  label: "Clean",      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300" },
    { key: "medium", label: "Moderate",   color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-300"   },
    { key: "deep",   label: "Needs Deep", color: "text-red-600",    bg: "bg-red-50",     border: "border-red-300"     },
  ],
};

const STEP_LABELS = {
  ar: ["النوع", "الغرف", "الوسائط", "بياناتك", "إرسال"],
  en: ["Type", "Rooms", "Media",   "Details", "Send"],
};

export default function SelfInspection() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const lang = isRTL ? "ar" : "en";

  const [step, setStep]       = useState<Step>(1);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [data, setData] = useState<InspectionData>({
    propertyType: "",
    area: "",
    floors: "1",
    rooms: DEFAULT_ROOMS.map(r => ({ ...r })),
    media: [],
    name: "",
    phone: "",
    neighborhood: "",
    notes: "",
  });

  const fileRef = useRef<HTMLInputElement>(null);

  const propertyTypes = PROPERTY_TYPES[lang];
  const conditions    = CONDITIONS[lang];
  const stepLabels    = STEP_LABELS[lang];
  const selectedRooms = data.rooms.filter(r => r.selected);

  const canNext: Record<number, boolean> = {
    1: !!data.propertyType && !!data.area.trim(),
    2: selectedRooms.length > 0,
    3: true,
    4: !!data.name.trim() && !!data.phone.trim() && !!data.neighborhood.trim(),
  };

  const next = () => setStep(s => Math.min(s + 1, 5) as Step);
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);

  const toggleRoom = (key: string) =>
    setData(d => ({ ...d, rooms: d.rooms.map(r => r.key === key ? { ...r, selected: !r.selected } : r) }));

  const setRoomCondition = (key: string, condition: Condition) =>
    setData(d => ({ ...d, rooms: d.rooms.map(r => r.key === key ? { ...r, condition } : r) }));

  const setRoomQty = (key: string, qty: number) =>
    setData(d => ({ ...d, rooms: d.rooms.map(r => r.key === key ? { ...r, qty: Math.max(1, qty) } : r) }));

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newItems: MediaItem[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isVideo: file.type.startsWith("video/"),
    }));
    setData(d => ({ ...d, media: [...d.media, ...newItems] }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeMedia = (idx: number) => {
    setData(d => {
      URL.revokeObjectURL(d.media[idx].preview);
      return { ...d, media: d.media.filter((_, i) => i !== idx) };
    });
  };

  const buildMessage = () => {
    const propLabel = propertyTypes.find(p => p.key === data.propertyType)?.label ?? "";
    const roomLines = selectedRooms.map(r => {
      const condLabel = conditions.find(c => c.key === r.condition)?.label ?? "";
      const roomLabel = isRTL ? r.labelAr : r.labelEn;
      return `  • ${roomLabel}${r.qty > 1 ? ` ×${r.qty}` : ""} — ${condLabel}`;
    }).join("\n");

    if (isRTL) {
      return (
        `مرحباً، أرسل لكم معاينة ذاتية لمكاني 🏠✨\n\n` +
        `📋 *تفاصيل المكان:*\n` +
        `النوع: ${propLabel}\n` +
        `المساحة: ${data.area} م²\n` +
        `عدد الطوابق: ${data.floors}\n\n` +
        `🛋️ *الغرف والحالة:*\n${roomLines}\n\n` +
        `👤 *بيانات التواصل:*\n` +
        `الاسم: ${data.name}\n` +
        `الجوال: ${data.phone}\n` +
        `الموقع: ${data.neighborhood}` +
        (data.notes ? `\nملاحظات: ${data.notes}` : "")
      );
    }
    return (
      `Hello! I'm sending a self-inspection for my property 🏠✨\n\n` +
      `📋 *Property Details:*\n` +
      `Type: ${propLabel}\nArea: ${data.area} m²\nFloors: ${data.floors}\n\n` +
      `🛋️ *Rooms & Condition:*\n${roomLines}\n\n` +
      `👤 *Contact Info:*\n` +
      `Name: ${data.name}\nPhone: ${data.phone}\nLocation: ${data.neighborhood}` +
      (data.notes ? `\nNotes: ${data.notes}` : "")
    );
  };

  const openWhatsApp = () => {
    const msg = buildMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const sendWhatsApp = () => {
    if (data.media.length > 0) {
      // Show modal first so user knows to attach files in the WhatsApp chat that opens
      setShowMediaModal(true);
    } else {
      openWhatsApp();
    }
  };

  const progressPct = ((step - 1) / 4) * 100;
  const conditionOf  = (key: string) => conditions.find(c => c.key === key)!;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={isRTL ? "معاينة ذاتية | كلينولوجي" : "Self Inspection | Kleenology"}
        description={isRTL
          ? "قيّم مكانك بنفسك وأرسل لنا التفاصيل لتحصل على عرض سعر دقيق بدون انتظار."
          : "Inspect your space yourself and send us the details for an accurate quote without waiting."}
        url="https://kleenology.me/self-inspection"
        noindex={true}
      />
      <Header />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 to-brand-blue/5 py-10 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              <ClipboardList className="h-4 w-4" />
              {isRTL ? "خدمة جديدة — توفير وقتك" : "New — Save Your Time"}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isRTL ? "معاينة ذاتية" : "Self Inspection"}
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {isRTL
                ? "قيّم مكانك بنفسك، أرسل لنا التفاصيل والصور، وسنُرسل لك سعراً دقيقاً فوراً."
                : "Evaluate your space, send details & photos, and get an accurate quote instantly."}
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
                      done   ? "bg-primary text-white"                              : "",
                      active ? "bg-primary text-white ring-4 ring-primary/20 scale-110" : "",
                      !done && !active ? "bg-muted text-muted-foreground"           : "",
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

            {/* ── Step 1: Property Type ── */}
            {step === 1 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "نوع المكان والمساحة" : "Property Type & Size"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "ما نوع المكان الذي تريد تنظيفه؟" : "What type of property needs cleaning?"}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {propertyTypes.map(({ key, label, Icon, color, bg }) => {
                    const selected = data.propertyType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setData(d => ({ ...d, propertyType: key }))}
                        className={cn(
                          "relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-start transition-all duration-200",
                          "hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          selected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-white",
                        )}
                      >
                        {selected && <CheckCircle2 className="absolute top-2.5 end-2.5 h-4 w-4 text-primary" />}
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", bg)}>
                          <Icon className={cn("h-5 w-5", color)} />
                        </div>
                        <span className="font-semibold text-sm text-foreground">{label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold mb-2 block">
                      {isRTL ? "المساحة (م²) *" : "Area (m²) *"}
                    </Label>
                    <Input
                      type="number" min="10"
                      placeholder={isRTL ? "مثال: 150" : "e.g. 150"}
                      value={data.area}
                      onChange={e => setData(d => ({ ...d, area: e.target.value }))}
                      className="h-12" dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">
                      {isRTL ? "عدد الطوابق" : "No. of Floors"}
                    </Label>
                    <Input
                      type="number" min="1" max="10"
                      value={data.floors}
                      onChange={e => setData(d => ({ ...d, floors: e.target.value }))}
                      className="h-12" dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Rooms ── */}
            {step === 2 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "الغرف والمناطق" : "Rooms & Areas"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "اختر الغرف وحدد حالتها" : "Select rooms and rate their condition"}
                </p>
                <div className="space-y-3">
                  {data.rooms.map(room => {
                    const label = isRTL ? room.labelAr : room.labelEn;
                    return (
                      <div key={room.key} className={cn(
                        "rounded-xl border-2 transition-all duration-200",
                        room.selected ? "border-primary bg-primary/5" : "border-border",
                      )}>
                        <button
                          type="button"
                          onClick={() => toggleRoom(room.key)}
                          className="w-full flex items-center justify-between px-4 py-3 text-start"
                        >
                          <span className="font-semibold text-sm">{label}</span>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            room.selected ? "bg-primary border-primary" : "border-muted-foreground/40",
                          )}>
                            {room.selected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          </div>
                        </button>
                        {room.selected && (
                          <div className="px-4 pb-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground font-medium w-12">
                                {isRTL ? "العدد" : "Qty"}
                              </span>
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setRoomQty(room.key, room.qty - 1)}
                                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-bold hover:bg-muted">−</button>
                                <span className="w-5 text-center font-semibold text-sm">{room.qty}</span>
                                <button type="button" onClick={() => setRoomQty(room.key, room.qty + 1)}
                                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-bold hover:bg-muted">+</button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground font-medium w-12 shrink-0">
                                {isRTL ? "الحالة" : "State"}
                              </span>
                              {conditions.map(c => (
                                <button key={c.key} type="button"
                                  onClick={() => setRoomCondition(room.key, c.key as Condition)}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all",
                                    room.condition === c.key
                                      ? `${c.bg} ${c.color} ${c.border}`
                                      : "border-border text-muted-foreground hover:border-muted-foreground/50",
                                  )}
                                >{c.label}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedRooms.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {isRTL ? "اختر غرفة واحدة على الأقل" : "Select at least one room to continue"}
                  </p>
                )}
              </div>
            )}

            {/* ── Step 3: Media (photos + videos) ── */}
            {step === 3 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "صور وفيديوهات المكان" : "Photos & Videos"}
                </h2>
                <p className="text-muted-foreground text-sm mb-2">
                  {isRTL ? "اختياري — تساعدنا على تقديم أفضل عرض سعر" : "Optional — helps us give a more accurate quote"}
                </p>

                {/* How sharing works */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-5">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    {isRTL
                      ? "عند الإرسال سيُفتح واتساب مباشرة على رقمنا — ستظهر لك الصور والفيديوهات لترسلها في نفس المحادثة."
                      : "On send, WhatsApp will open directly on our number — your media will be shown so you can attach it in the same chat."}
                  </p>
                </div>

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "w-full border-2 border-dashed border-primary/40 rounded-xl py-8 flex flex-col items-center gap-3",
                    "hover:border-primary hover:bg-primary/5 transition-all cursor-pointer",
                  )}
                >
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center">
                      <Camera className="h-5 w-5 text-primary" />
                    </div>
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-foreground">
                      {isRTL ? "اضغط لإضافة صور أو فيديوهات" : "Tap to add photos or videos"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isRTL
                        ? `${data.media.length} ملف مضاف`
                        : `${data.media.length} file(s) added`}
                    </p>
                  </div>
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaAdd}
                />

                {/* Media grid */}
                {data.media.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {data.media.map((item, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-black">
                        {item.isVideo ? (
                          <video
                            src={item.preview}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img src={item.preview} alt="" className="w-full h-full object-cover" />
                        )}
                        {item.isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                              <Video className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 end-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                    {/* Add more button */}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <span className="text-2xl text-primary/50">+</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4: Contact Info ── */}
            {step === 4 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "بيانات التواصل" : "Contact Details"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "حتى نرسل لك العرض بسرعة" : "So we can send you the quote quickly"}
                </p>
                <div className="space-y-4">
                  <div>
                    <Label className="font-semibold flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary" />
                      {isRTL ? "الاسم الكامل *" : "Full Name *"}
                    </Label>
                    <Input
                      placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                      value={data.name}
                      onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-primary" />
                      {isRTL ? "رقم الجوال *" : "Phone Number *"}
                    </Label>
                    <Input
                      type="tel"
                      placeholder={isRTL ? "05X XXX XXXX" : "+966 5X XXX XXXX"}
                      value={data.phone}
                      onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                      className="h-12" dir="ltr"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {isRTL ? "الحي / المنطقة *" : "Neighborhood / Area *"}
                    </Label>
                    <Input
                      placeholder={isRTL ? "مثال: حي العليا، الرياض" : "e.g. Al Olaya, Riyadh"}
                      value={data.neighborhood}
                      onChange={e => setData(d => ({ ...d, neighborhood: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label className="font-semibold mb-2 block">
                      {isRTL ? "ملاحظات إضافية (اختياري)" : "Additional Notes (optional)"}
                    </Label>
                    <Textarea
                      placeholder={isRTL ? "مثال: أحتاج اهتمام خاص بالمطبخ..." : "e.g. Need extra focus on kitchen..."}
                      value={data.notes}
                      onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
                      rows={3} className="resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 5: Summary & Send ── */}
            {step === 5 && (
              <div className="p-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-bold mb-0.5">
                  {isRTL ? "ملخص المعاينة" : "Inspection Summary"}
                </h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {isRTL ? "راجع تفاصيل معاينتك قبل الإرسال" : "Review your inspection before sending"}
                </p>

                {/* Property */}
                <div className="bg-muted/40 rounded-xl p-4 mb-3 space-y-1.5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    {isRTL ? "المكان" : "Property"}
                  </p>
                  {[
                    { label: isRTL ? "النوع"    : "Type",   value: propertyTypes.find(p => p.key === data.propertyType)?.label ?? "—" },
                    { label: isRTL ? "المساحة"  : "Area",   value: `${data.area} م²` },
                    { label: isRTL ? "الطوابق"  : "Floors", value: data.floors },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Rooms */}
                <div className="bg-muted/40 rounded-xl p-4 mb-3">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    {isRTL ? "الغرف" : "Rooms"}
                  </p>
                  <div className="space-y-1.5">
                    {selectedRooms.map(room => {
                      const cond  = conditionOf(room.condition);
                      const label = isRTL ? room.labelAr : room.labelEn;
                      return (
                        <div key={room.key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{label}{room.qty > 1 ? ` ×${room.qty}` : ""}</span>
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", cond.bg, cond.color)}>{cond.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Media thumbnails */}
                {data.media.length > 0 && (
                  <div className="bg-muted/40 rounded-xl p-4 mb-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                      {isRTL
                        ? `الوسائط (${data.media.length} ملف)`
                        : `Media (${data.media.length} file${data.media.length > 1 ? "s" : ""})`}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {data.media.map((item, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border bg-black">
                          {item.isVideo
                            ? <video src={item.preview} className="w-full h-full object-cover" muted />
                            : <img src={item.preview} alt="" className="w-full h-full object-cover" />}
                          {item.isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Video className="h-3.5 w-3.5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                <div className="bg-muted/40 rounded-xl p-4 mb-4 space-y-1.5">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">
                    {isRTL ? "التواصل" : "Contact"}
                  </p>
                  {[
                    { label: isRTL ? "الاسم"  : "Name",     value: data.name         },
                    { label: isRTL ? "الجوال" : "Phone",    value: data.phone        },
                    { label: isRTL ? "الموقع" : "Location", value: data.neighborhood },
                    ...(data.notes ? [{ label: isRTL ? "ملاحظات" : "Notes", value: data.notes }] : []),
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-end max-w-[60%] break-words">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Guarantee */}
                <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                  <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isRTL
                      ? "سيتواصل معك فريقنا خلال أقل من ساعة بعرض سعر دقيق بناءً على معاينتك."
                      : "Our team will contact you within an hour with an accurate quote based on your inspection."}
                  </p>
                </div>

                <Button
                  onClick={sendWhatsApp}
                  className="w-full h-14 text-lg bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl shadow-lg"
                >
                  <MessageCircle className="h-5 w-5 me-2" />
                  {isRTL ? "إرسال المعاينة عبر واتساب" : "Send Inspection via WhatsApp"}
                </Button>
              </div>
            )}

            {/* Navigation footer */}
            <div className={cn(
              "px-6 pb-5 flex items-center",
              step > 1 ? "justify-between" : "justify-end",
            )}>
              {step > 1 && (
                <Button variant="ghost" onClick={back} className="text-muted-foreground hover:text-foreground">
                  {isRTL
                    ? <><ChevronRight className="h-4 w-4 me-1" /> رجوع</>
                    : <><ChevronLeft  className="h-4 w-4 me-1" /> Back</>}
                </Button>
              )}
              {step < 5 && (
                <Button onClick={next} disabled={!canNext[step]} className="px-8 h-11 rounded-xl">
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
              { Icon: Star,   text: isRTL ? "٤.٩ تقييم"    : "4.9 Rating"      },
              { Icon: Shield, text: isRTL ? "ضمان ١٠٠٪"    : "100% Guarantee"  },
              { Icon: Clock,  text: isRTL ? "رد خلال ساعة" : "Reply within 1hr" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 border border-border text-center">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{text}</span>
              </div>
            ))}
          </div>

        </section>
      </main>

      <Footer />

      {/* ── Media attach modal ── */}
      {showMediaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowMediaModal(false); }}
        >
          <div className={`bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h3 className="font-bold text-base">
                  {isRTL ? "أرفق الملفات في واتساب" : "Attach files in WhatsApp"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRTL
                    ? "سيُفتح واتساب على رقمنا مباشرة — أرسل هذه الملفات في نفس المحادثة"
                    : "WhatsApp will open on our number — send these files in the same chat"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center ms-3 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Steps */}
            <div className="px-5 pb-4 space-y-2">
              {[
                isRTL ? "اضغط «فتح واتساب» أدناه" : "Tap \"Open WhatsApp\" below",
                isRTL ? "ستجد رسالة المعاينة جاهزة — أرسلها" : "Your inspection message is ready — send it",
                isRTL ? "ثم أرفق الصور والفيديوهات التالية في نفس المحادثة" : "Then attach the photos/videos below in the same chat",
              ].map((txt, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground leading-snug">{txt}</p>
                </div>
              ))}
            </div>

            {/* Media preview strip */}
            <div className="px-5 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {data.media.map((item, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-border bg-black">
                    {item.isVideo
                      ? <video src={item.preview} className="w-full h-full object-cover" muted />
                      : <img src={item.preview} alt="" className="w-full h-full object-cover" />}
                    {item.isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-4 w-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5">
              <Button
                onClick={() => { openWhatsApp(); setShowMediaModal(false); }}
                className="w-full h-12 text-base bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl"
              >
                <MessageCircle className="h-5 w-5 me-2" />
                {isRTL ? "فتح واتساب الآن" : "Open WhatsApp Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
