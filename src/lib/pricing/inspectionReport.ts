// نموذج المعاينة الميدانية — يعبّيه المشرف على جواله في الموقع.
// لا يحسب سعراً: التسعير قرار المدير بعد قراءة المعاينة.

export interface RoomEntry {
  /** اسم الغرفة كما يظهر في التقرير */
  label: string;
  qty: number;
}

export interface Level {
  id: string;
  name: string;
  rooms: RoomEntry[];
}

export interface Inspection {
  customerName: string;
  phone: string;
  location: string;
  /** رابط الموقع على خرائط قوقل — يُلتقط من الجوال أو يُلصق يدوياً */
  mapsUrl: string;
  date: string;
  time: string;
  siteType: string;
  serviceType: string;
  levels: Level[];
  notes: string;
  days: number;
  workers: number;
  supervisor: string;
  proposedDate: string;
}

export const SERVICE_TYPES = [
  "تنظيف تأهيلي بعد البناء",
  "تنظيف عام",
  "تسليم / استلام سكن",
  "تنظيف دوري",
];

/** مستويات جاهزة — الضغط عليها أسرع من الكتابة على الجوال */
export const LEVEL_PRESETS = [
  "بدروم",
  "الدور الأرضي",
  "الدور الأول",
  "الدور الثاني",
  "الدور الثالث",
  "السطح",
  "الشقة",
  "الملحق",
  "الحوش",
];

/** غرف جاهزة مأخوذة من نموذج المعاينة الورقي */
export const ROOM_PRESETS = [
  "صالة كبيرة",
  "صالة",
  "غرفة كبيرة",
  "غرفة",
  "غرفة نوم",
  "مجلس",
  "حمام",
  "مطبخ",
  "غرفة خادمة",
  "غرفة غسيل",
  "ممر",
  "سلم (مراحل)",
  "حوش كبير",
  "سطح",
  "بلكونة",
  "مخزن",
];

/** رابط خرائط قوقل من إحداثيات الجهاز */
export function mapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/** تاريخ اليوم بصيغة yyyy-mm-dd لحقل التاريخ */
export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** الوقت الحالي بصيغة hh:mm لحقل الوقت */
export function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function emptyInspection(supervisor = ""): Inspection {
  return {
    customerName: "",
    phone: "",
    location: "",
    mapsUrl: "",
    date: today(),
    time: now(),
    siteType: "",
    serviceType: SERVICE_TYPES[0],
    levels: [],
    notes: "",
    days: 0,
    workers: 0,
    supervisor,
    proposedDate: "",
  };
}

/** مجموع الغرف عبر كل المستويات — مؤشر سريع لحجم الوظيفة */
export function totalRooms(inspection: Inspection): number {
  return inspection.levels.reduce(
    (sum, level) => sum + level.rooms.reduce((s, room) => s + room.qty, 0),
    0,
  );
}

const dash = (value: string) => (value.trim() ? value.trim() : "—");

/**
 * نص التقرير بنفس ترتيب النموذج الورقي، حتى يقرأه المدير بلا إعادة تعلّم.
 * بدل التوقيع اليدوي يُختم باسم المشرف ووقت الإرسال.
 */
export function buildInspectionReport(inspection: Inspection): string {
  const parts: string[] = [];

  parts.push("🧾 *نموذج معاينة*");
  parts.push("");
  parts.push(`العميل: ${dash(inspection.customerName)}`);
  parts.push(`رقم التواصل: ${dash(inspection.phone)}`);
  parts.push(`الموقع / العنوان: ${dash(inspection.location)}`);
  if (inspection.mapsUrl.trim()) parts.push(`الموقع على الخريطة: ${inspection.mapsUrl.trim()}`);
  parts.push(`تاريخ المعاينة: ${dash(inspection.date)}`);
  parts.push(`الوقت: ${dash(inspection.time)}`);
  parts.push(`نوع الموقع: ${dash(inspection.siteType)}`);
  parts.push(`نوع الخدمة المطلوبة: ${dash(inspection.serviceType)}`);

  if (inspection.notes.trim()) {
    parts.push("");
    parts.push("*ملاحظات من المعاينة:*");
    parts.push(inspection.notes.trim());
  }

  const levels = inspection.levels.filter((level) => level.rooms.length > 0);
  if (levels.length > 0) {
    parts.push("");
    parts.push("*التفاصيل:*");
    for (const level of levels) {
      parts.push(`${level.name}:`);
      for (const room of level.rooms) {
        parts.push(`  • ${room.label} ${room.qty}`);
      }
    }
  }

  parts.push("");
  parts.push(`تقدير أولي للوقت المطلوب: ${inspection.days || "—"} أيام عمل`);
  parts.push(`عدد العمال المقترح: ${inspection.workers || "—"}`);
  parts.push(`تاريخ التنفيذ المقترح: ${dash(inspection.proposedDate) === "—" ? "غير معلوم" : inspection.proposedDate}`);
  parts.push("");
  parts.push(`اسم المشرف: ${dash(inspection.supervisor)}`);
  parts.push(`أُرسل: ${today()} ${now()}`);

  return parts.join("\n");
}
