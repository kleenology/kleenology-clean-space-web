// برنامج الشركاء — نداءات الخادم من الواجهة، وحساب العمولة وصياغة الكشف الشهري

import { toWhatsAppNumber } from "@/lib/pricing/quoteMessage";

/** عمولة الشريك: 10٪ من قيمة أول طلب للعميل بعد الخصم وقبل الضريبة */
export const COMMISSION_RATE = 0.1;

export type PartnerStatus = "pending" | "approved" | "suspended";
export type LeadStatus = "new" | "quoted" | "done" | "paid" | "settled" | "lost";

export const PARTNER_STATUS_LABEL: Record<PartnerStatus, string> = {
  pending: "بانتظار الاعتماد",
  approved: "معتمد",
  suspended: "موقوف",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "جديد",
  quoted: "تم التسعير",
  done: "تم التنفيذ",
  paid: "العميل دفع",
  settled: "العمولة مدفوعة",
  lost: "ما تم",
};

export const LEAD_STATUS_ORDER: LeadStatus[] = ["new", "quoted", "done", "paid", "settled", "lost"];

export const PARTNER_TYPES = ["مقاول", "شركة إنشاءات", "مكتب عقار", "شركة إدارة أملاك", "وسيط / فرد", "أخرى"];

export interface Partner {
  id: string; // الكود بلا البادئة
  company: string;
  contactName: string;
  phone: string;
  partnerType: string;
  city: string;
  iban: string;
  notes: string;
  status: PartnerStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface Lead {
  id: string;
  partnerCode: string;
  partnerName: string;
  customerName: string;
  phone: string;
  neighborhood: string;
  serviceType: string;
  notes: string;
  adminNotes?: string;
  source: "partner" | "link";
  status: LeadStatus;
  eligible: boolean;
  ineligibleReason: string;
  amount: number;
  createdAt: string;
  paidAt?: string;
  settledAt?: string;
}

export const displayCode = (code: string) => `P-${code}`;

export const commissionOf = (lead: Pick<Lead, "amount" | "eligible">) =>
  lead.eligible ? Math.round(lead.amount * COMMISSION_RATE * 100) / 100 : 0;

export const sar = (value: number) =>
  `${(Math.round(value * 100) / 100).toLocaleString("en-US")} ر.س`;

/** خطأ يحمل رسالة عربية جاهزة للعرض */
export class PartnersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PartnersError";
  }
}

function messageFor(status: number, code?: string): string {
  if (code === "invalid_code") return "كود الشريك غير صحيح أو غير مفعّل";
  if (code === "missing_fields") return "عبّ الحقول المطلوبة ورقم جوال صحيح";
  if (code === "terms_required") return "لازم توافق على الشروط";
  if (status === 429) return "طلبات كثيرة — حاول بعد دقائق";
  if (status === 401) return "انتهت الجلسة — سجّل الدخول من جديد";
  if (status === 503 || code === "store_unavailable")
    return "التخزين غير متاح — تأكد أن Netlify Blobs مفعّل على الموقع";
  if (status === 404) return "غير موجود";
  return "تعذّر الاتصال بالخادم";
}

async function call<T>(url: string, init: RequestInit = {}, token?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new PartnersError("تعذّر الاتصال بالخادم");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new PartnersError(messageFor(res.status, data?.error));
  return data as T;
}

/* ——— المسار العام ——— */

const PUBLIC = "/api/partners";

export interface PartnerApplication {
  company: string;
  contactName: string;
  phone: string;
  partnerType: string;
  city: string;
  iban: string;
  notes: string;
  acceptedTerms: boolean;
  website?: string; // حقل فخ للبوتات
}

export interface LeadSubmission {
  code: string;
  customerName: string;
  phone: string;
  neighborhood: string;
  serviceType: string;
  notes: string;
  source: "partner" | "link";
  website?: string;
}

export function lookupPartner(code: string) {
  return call<{ partnerName: string; code: string }>(`${PUBLIC}?code=${encodeURIComponent(code)}`);
}

export function registerPartner(application: PartnerApplication) {
  return call<{ ok: true }>(PUBLIC, {
    method: "POST",
    body: JSON.stringify({ action: "register", ...application }),
  });
}

export function submitLead(lead: LeadSubmission) {
  return call<{ ok: true; partnerName: string }>(PUBLIC, {
    method: "POST",
    body: JSON.stringify({ action: "lead", ...lead }),
  });
}

/* ——— الإدارة ——— */

const ADMIN = "/api/pricing/partners";

export function loadPartnersData(token: string) {
  return call<{ partners: Partner[]; leads: Lead[] }>(ADMIN, {}, token);
}

export function updatePartner(token: string, id: string, changes: Partial<Partner>) {
  return call<{ partner: Partner }>(ADMIN, {
    method: "POST",
    body: JSON.stringify({ kind: "partner", id, changes }),
  }, token);
}

export function updateLead(token: string, id: string, changes: Partial<Lead>) {
  return call<{ lead: Lead }>(ADMIN, {
    method: "POST",
    body: JSON.stringify({ kind: "lead", id, changes }),
  }, token);
}

export function settleLeads(token: string, ids: string[]) {
  return call<{ settled: string[]; settledAt: string }>(ADMIN, {
    method: "POST",
    body: JSON.stringify({ kind: "settle", ids }),
  }, token);
}

export function deleteRecord(token: string, kind: "partner" | "lead", id: string) {
  return call<{ deleted: string }>(
    `${ADMIN}?kind=${kind}&id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
    token,
  );
}

/* ——— الرسائل ——— */

export function partnerLink(code: string) {
  return `https://kleenology.me/p/${displayCode(code)}`;
}

export function approvalMessage(partner: Partner) {
  return [
    `أهلاً ${partner.contactName} 👋`,
    `تم اعتماد ${partner.company} شريكاً لكلينولوجي ✅`,
    "",
    `كودك: *${displayCode(partner.id)}*`,
    "",
    "طريقتين ترسل لنا فيها عميل:",
    `١. رابطك الخاص — أرسله للعميل ويحجز منه مباشرة:`,
    partnerLink(partner.id),
    "٢. تسجّل العميل بنفسك من صفحة الشركاء:",
    "https://kleenology.me/partners",
    "",
    "عمولتك 10٪ من قيمة أول طلب لكل عميل (بعد الخصم وقبل الضريبة)، وتصلك بكشف شهري بعد سداد العميل.",
  ].join("\n");
}

export function whatsappUrl(phone: string, text: string) {
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(text)}`;
}

const dateAr = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "short" }) : "";

/**
 * الكشف الشهري: العمولات المستحقة (العميل دفع ولم تُصرف بعد) مع ملخص
 * العملاء اللي ما زالوا في الطريق، حتى يعرف الشريك وين وصل كل عميل.
 */
export function buildStatement(partner: Partner, leads: Lead[]) {
  const mine = leads.filter((lead) => lead.partnerCode === partner.id);
  const payable = mine.filter((lead) => lead.status === "paid" && lead.eligible);
  const pending = mine.filter((lead) => ["new", "quoted", "done"].includes(lead.status) && lead.eligible);
  // المستبعدون يظهرون في كشف شهر إحالتهم والشهر اللي بعده فقط، لا كل شهر
  const recent = Date.now() - 45 * 24 * 60 * 60 * 1000;
  const excluded = mine.filter((lead) => !lead.eligible && Date.parse(lead.createdAt) > recent);
  const total = payable.reduce((sum, lead) => sum + commissionOf(lead), 0);

  const month = new Date().toLocaleDateString("ar-SA-u-ca-gregory", { month: "long", year: "numeric" });
  const lines = [
    `كشف عمولات كلينولوجي — ${month}`,
    `${partner.company} (${displayCode(partner.id)})`,
    "",
  ];

  if (payable.length) {
    lines.push("*العمولات المستحقة:*");
    payable.forEach((lead, i) => {
      lines.push(`${i + 1}. ${lead.customerName}${lead.neighborhood ? ` — ${lead.neighborhood}` : ""}`);
      lines.push(`   قيمة الطلب ${sar(lead.amount)} ← عمولتك ${sar(commissionOf(lead))}`);
    });
    lines.push("", `*الإجمالي: ${sar(total)}*`);
    if (partner.iban) lines.push(`يُحوّل على الآيبان المنتهي بـ ${partner.iban.slice(-4)}`);
  } else {
    lines.push("ما فيه عمولات مستحقة هذا الشهر.");
  }

  if (pending.length) {
    lines.push("", "*عملاء في الطريق* (تُستحق عمولتهم بعد السداد):");
    pending.forEach((lead) => {
      lines.push(`• ${lead.customerName} — ${LEAD_STATUS_LABEL[lead.status]} (${dateAr(lead.createdAt)})`);
    });
  }

  if (excluded.length) {
    lines.push("", "*غير مشمولين بالعمولة:*");
    excluded.forEach((lead) => {
      // سبب عام: السبب الداخلي قد يذكر اسم شريك آخر
      lines.push(`• ${lead.customerName} — عميل مسجّل لدينا قبل الإحالة`);
    });
  }

  lines.push("", "شكراً لثقتك 🤝 كلينولوجي");
  return { text: lines.join("\n"), payable, total };
}
