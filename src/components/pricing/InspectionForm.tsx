import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2, MapPin, MessageCircle, Minus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  buildInspectionReport, emptyInspection, mapsLink, totalRooms,
  LEVEL_PRESETS, ROOM_PRESETS, SERVICE_TYPES,
  type Inspection, type Level,
} from "@/lib/pricing/inspectionReport";
import { toWhatsAppNumber } from "@/lib/pricing/quoteMessage";

const SUPERVISOR_KEY = "kleenology_supervisor_name";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border rounded-xl p-4 sm:p-5">
      <h2 className="font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button" onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted"
        aria-label="إنقاص"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center font-semibold tabular-nums">{value}</span>
      <button
        type="button" onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-md border flex items-center justify-center hover:bg-muted"
        aria-label="زيادة"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function InspectionForm() {
  // اسم المشرف يُحفظ محلياً — يكتبه مرة واحدة لا مع كل معاينة
  const [data, setData] = useState<Inspection>(() =>
    emptyInspection(localStorage.getItem(SUPERVISOR_KEY) ?? ""),
  );
  const [openLevel, setOpenLevel] = useState<string | null>(null);
  const [customLevel, setCustomLevel] = useState("");
  const openLevelRef = useRef<HTMLDivElement | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (data.supervisor.trim()) localStorage.setItem(SUPERVISOR_KEY, data.supervisor.trim());
  }, [data.supervisor]);

  // قائمة الغرف طويلة وشريط الأزرار ثابت أسفل الشاشة، فنمرّر للمستوى المفتوح
  useEffect(() => {
    if (openLevel) openLevelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openLevel]);

  const patch = (changes: Partial<Inspection>) => setData((d) => ({ ...d, ...changes }));

  const addLevel = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (data.levels.some((l) => l.name === clean)) {
      setOpenLevel(data.levels.find((l) => l.name === clean)!.id);
      return;
    }
    const level: Level = { id: `${Date.now()}-${clean}`, name: clean, rooms: [] };
    patch({ levels: [...data.levels, level] });
    setOpenLevel(level.id);
    setCustomLevel("");
  };

  const removeLevel = (id: string) =>
    patch({ levels: data.levels.filter((l) => l.id !== id) });

  const setRoomQty = (levelId: string, label: string, qty: number) => {
    patch({
      levels: data.levels.map((level) => {
        if (level.id !== levelId) return level;
        const exists = level.rooms.some((r) => r.label === label);
        if (qty <= 0) return { ...level, rooms: level.rooms.filter((r) => r.label !== label) };
        return {
          ...level,
          rooms: exists
            ? level.rooms.map((r) => (r.label === label ? { ...r, qty } : r))
            : [...level.rooms, { label, qty }],
        };
      }),
    });
  };

  const qtyOf = (level: Level, label: string) =>
    level.rooms.find((r) => r.label === label)?.qty ?? 0;

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("تعذّر النسخ — انسخ النص يدوياً");
    }
  };

  // التقاط الإحداثيات من الجهاز أسرع من فتح الخرائط ونسخ الرابط والرجوع
  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("جهازك لا يدعم تحديد الموقع — الصق الرابط يدوياً");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        patch({ mapsUrl: mapsLink(coords.latitude, coords.longitude) });
        setLocating(false);
        toast.success("تم تحديد الموقع");
      },
      (error) => {
        setLocating(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "رُفض إذن الموقع — فعّله من إعدادات المتصفح أو الصق الرابط يدوياً"
            : "تعذّر تحديد الموقع — الصق الرابط يدوياً",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const report = () => buildInspectionReport(data);

  const copyReport = () => copyText(report(), "تم نسخ تقرير المعاينة");

  const sendReport = () => {
    const number = toWhatsAppNumber(data.phone);
    const text = encodeURIComponent(report());
    window.open(number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`, "_blank");
  };

  const reset = () => {
    setData(emptyInspection(data.supervisor));
    setOpenLevel(null);
    toast.success("تم تفريغ المعاينة");
  };

  const rooms = totalRooms(data);

  return (
    <div className="space-y-4">
      <Section title="بيانات المعاينة">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="i-name">العميل</Label>
            <Input id="i-name" value={data.customerName}
                   onChange={(e) => patch({ customerName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-phone">رقم التواصل</Label>
            <Input id="i-phone" inputMode="tel" placeholder="05xxxxxxxx" value={data.phone}
                   onChange={(e) => patch({ phone: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="i-loc">الموقع / العنوان</Label>
            <Input id="i-loc" value={data.location}
                   onChange={(e) => patch({ location: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="i-maps">الموقع على خرائط قوقل</Label>
            <div className="flex gap-2">
              <Input
                id="i-maps" inputMode="url" dir="ltr" className="text-left"
                placeholder="https://maps.google.com/…"
                value={data.mapsUrl}
                onChange={(e) => patch({ mapsUrl: e.target.value })}
              />
              <Button type="button" variant="outline" onClick={locate} disabled={locating}
                      className="shrink-0" aria-label="تحديد موقعي الحالي">
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              </Button>
              <Button
                type="button" variant="outline" className="shrink-0"
                disabled={!data.mapsUrl.trim()}
                onClick={() => copyText(data.mapsUrl.trim(), "تم نسخ رابط الموقع")}
                aria-label="نسخ رابط الموقع"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              اضغط 📍 ليأخذ موقعك الحالي، أو الصق رابطاً من تطبيق الخرائط. زر النسخ
              يعطيك الرابط وحده لإرساله للقروب.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="i-date">تاريخ المعاينة</Label>
            <Input id="i-date" type="date" value={data.date}
                   onChange={(e) => patch({ date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-time">الوقت</Label>
            <Input id="i-time" type="time" value={data.time}
                   onChange={(e) => patch({ time: e.target.value })} />
          </div>
        </div>
      </Section>

      <Section title="نوع الخدمة">
        <div className="flex flex-wrap gap-2 mb-4">
          {SERVICE_TYPES.map((type) => (
            <button
              key={type} type="button" onClick={() => patch({ serviceType: type })}
              className={cn(
                "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                data.serviceType === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="i-site">نوع الموقع</Label>
          <Textarea id="i-site" rows={2} value={data.siteType}
                    placeholder="مثال: فيلا قديمة تم ترميمها — بدروم ودور أرضي وأول وثاني بالإضافة إلى شقة منفصلة"
                    onChange={(e) => patch({ siteType: e.target.value })} />
        </div>
      </Section>

      <Section title="التفاصيل — المستويات والغرف">
        <div className="flex flex-wrap gap-2 mb-3">
          {LEVEL_PRESETS.map((name) => {
            const added = data.levels.some((l) => l.name === name);
            return (
              <button
                key={name} type="button" onClick={() => addLevel(name)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                  added
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {added ? "✓ " : "+ "}{name}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            value={customLevel} placeholder="مستوى آخر…"
            onChange={(e) => setCustomLevel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLevel(customLevel); } }}
          />
          <Button type="button" variant="outline" onClick={() => addLevel(customLevel)}
                  disabled={!customLevel.trim()}>
            إضافة
          </Button>
        </div>

        {data.levels.length === 0 ? (
          <p className="text-sm text-muted-foreground">أضف مستوى ثم اختر غرفه.</p>
        ) : (
          <div className="space-y-2">
            {data.levels.map((level) => {
              const isOpen = openLevel === level.id;
              const count = level.rooms.reduce((s, r) => s + r.qty, 0);
              return (
                <div
                  key={level.id}
                  ref={isOpen ? openLevelRef : undefined}
                  className={cn(
                    "border rounded-lg overflow-hidden scroll-mt-32",
                    isOpen ? "border-primary" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between gap-2 p-3 bg-muted/40">
                    <button
                      type="button" className="text-right min-w-0 flex-1"
                      onClick={() => setOpenLevel(isOpen ? null : level.id)}
                    >
                      <span className="font-medium">{level.name}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {count > 0 ? `${count} غرفة` : "لا غرف بعد"}
                      </span>
                    </button>
                    <button type="button" onClick={() => removeLevel(level.id)}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            aria-label={`حذف ${level.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setOpenLevel(isOpen ? null : level.id)}
                            className="text-muted-foreground shrink-0" aria-label="فتح وإغلاق">
                      {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>

                  {!isOpen && level.rooms.length > 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      {level.rooms.map((r) => `${r.label} ${r.qty}`).join(" · ")}
                    </div>
                  )}

                  {isOpen && (
                    <div className="p-3 space-y-1.5">
                      {ROOM_PRESETS.map((label) => {
                        const qty = qtyOf(level, label);
                        return (
                          <div key={label} className={cn(
                            "flex items-center justify-between gap-3 rounded-lg border p-2",
                            qty > 0 ? "border-primary bg-primary/5" : "border-transparent",
                          )}>
                            <button type="button" className="text-right text-sm flex-1 min-w-0"
                                    onClick={() => setRoomQty(level.id, label, qty > 0 ? 0 : 1)}>
                              {label}
                            </button>
                            <Stepper value={qty} onChange={(n) => setRoomQty(level.id, label, n)} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="ملاحظات المعاينة">
        <Textarea
          rows={4} value={data.notes}
          placeholder="نوع الأرضيات، البوهيات، النعلات والنوافذ، النواقص في الحمامات…"
          onChange={(e) => patch({ notes: e.target.value })}
        />
      </Section>

      <Section title="التقدير والمشرف">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="space-y-1.5">
            <Label>أيام العمل</Label>
            <Stepper value={data.days} onChange={(n) => patch({ days: n })} />
          </div>
          <div className="space-y-1.5">
            <Label>عدد العمال</Label>
            <Stepper value={data.workers} onChange={(n) => patch({ workers: n })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="i-exec">تاريخ التنفيذ المقترح</Label>
            <Input id="i-exec" type="date" value={data.proposedDate}
                   onChange={(e) => patch({ proposedDate: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="i-sup">اسم المشرف</Label>
            <Input id="i-sup" value={data.supervisor}
                   onChange={(e) => patch({ supervisor: e.target.value })} />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          اسم المشرف يُحفظ على هذا الجهاز فلا يُعاد كتابته كل معاينة.
        </p>
      </Section>

      <div className="bg-card border rounded-xl p-4 sm:p-5 space-y-3 sticky bottom-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold">
            {data.levels.length} مستوى · {rooms} غرفة
          </span>
          <button type="button" onClick={reset}
                  className="text-xs text-muted-foreground hover:text-foreground underline">
            تفريغ المعاينة
          </button>
        </div>
        <Button className="w-full" onClick={sendReport}>
          <MessageCircle className="h-4 w-4 ml-2" />
          إرسال التقرير واتساب
        </Button>
        <Button variant="outline" className="w-full" onClick={copyReport}>
          <Copy className="h-4 w-4 ml-2" />
          نسخ التقرير
        </Button>
      </div>
    </div>
  );
}
