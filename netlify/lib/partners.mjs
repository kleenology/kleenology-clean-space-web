// أدوات مشتركة لبرنامج الشركاء (المقاولون والشركات اللي يحيلون عملاء)
// يستخدمها المسار العام (تسجيل شريك وإرسال عميل) ومسار الإدارة.

import crypto from "node:crypto";
import { recordStore, MAX_SEARCH_SCAN } from "./blob-records.mjs";
import { normalizePhone } from "./search-text.mjs";

export const PARTNERS_STORE = "partners";
export const LEADS_STORE = "partner-leads";

// حروف بلا التباس: لا O/0 ولا I/1، فالمقاول يمليها على الجوال بلا أخطاء
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const LEAD_STATUSES = ["new", "quoted", "active", "lost"];
export const PARTNER_STATUSES = ["pending", "approved", "suspended"];

export function partnersStore() {
  return recordStore(PARTNERS_STORE);
}

export function leadsStore() {
  return recordStore(LEADS_STORE);
}

/** يقص النص ويشذّبه — كل ما يصل من النماذج العامة يمر من هنا */
export function clean(value, max = 200) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

const CODE_LENGTH = 5;

/** يقبل "P-ABCDE" و"p abcde" و"ABCDE" — البادئة تُشال فقط إذا زاد الطول بها */
export function normalizeCode(value) {
  const raw = String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return raw.length === CODE_LENGTH + 1 && raw.startsWith("P") ? raw.slice(1) : raw;
}

export function displayCode(code) {
  return `P-${code}`;
}

/** كود جديد غير مستخدم — المفتاح في المخزن هو الكود نفسه */
export async function newPartnerCode(store) {
  for (let attempt = 0; attempt < 10; attempt++) {
    const bytes = crypto.randomBytes(CODE_LENGTH);
    const code = Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
    const existing = await store.get(code, { type: "json" }).catch(() => null);
    if (!existing) return code;
  }
  throw new Error("code_generation_failed");
}

/** كل سجلات المخزن، الأحدث أولاً حسب المفتاح أو تاريخ الإنشاء */
export async function allRecords(store, idField = "id") {
  const { blobs } = await store.list();
  const keys = blobs.map((entry) => entry.key).slice(0, MAX_SEARCH_SCAN);
  const rows = await Promise.all(
    keys.map(async (key) => {
      const record = await store.get(key, { type: "json" }).catch(() => null);
      return record ? { ...record, [idField]: key } : null;
    }),
  );
  return rows
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
}

/**
 * هل نفس العميل مسجّل عند شريك آخر؟ للعلم فقط — العمولة على كل عميل وكل
 * طلب بلا استبعاد، لكن المشرف يحتاج يعرف قبل ما يضيف طلباً حتى لا يُسجّل
 * نفس الطلب عند شريكين.
 */
export async function otherReferral(phone, partnerCode) {
  const target = normalizePhone(phone);
  if (target.length < 8) return "";
  const leads = await allRecords(leadsStore());
  const other = leads.find(
    (lead) => normalizePhone(lead.phone) === target && lead.partnerCode !== partnerCode,
  );
  return other ? `مسجّل أيضاً عند ${other.partnerName || displayCode(other.partnerCode)}` : "";
}

/**
 * طلبات العميل المدفوعة. السجلات الأقدم (قبل العمولة على كل طلب) فيها مبلغ
 * واحد بلا قائمة طلبات، فتُقرأ كطلب واحد حتى لا تضيع عمولتها.
 */
export function ordersOf(lead) {
  if (Array.isArray(lead?.orders)) return lead.orders;
  if (lead?.amount > 0 && ["paid", "settled"].includes(lead.status)) {
    return [{
      id: "legacy",
      amount: lead.amount,
      paidAt: lead.paidAt || lead.createdAt,
      ...(lead.settledAt ? { settledAt: lead.settledAt } : {}),
    }];
  }
  return [];
}

/** حالات العميل القديمة تُطابق الجديدة */
export function leadStatusOf(lead) {
  return ["done", "paid", "settled"].includes(lead?.status) ? "active" : lead?.status || "new";
}

/* ——— حد بسيط للطلبات العامة ———
   داخل الذاكرة مثل عدّاد محاولات الدخول: يبطئ الإغراق الآلي ولا يُعتمد عليه
   وحده، والمراجعة اليدوية للشركاء والعملاء هي الحماية الفعلية. */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map();

export function rateLimited(key) {
  const now = Date.now();
  const record = hits.get(key);
  if (!record || now > record.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  record.count += 1;
  return record.count > MAX_PER_WINDOW;
}
