// إدارة برنامج الشركاء — كل العمليات تتطلب جلسة مشرف صالحة.
//   GET                                   الشركاء والعملاء المحالون
//   POST {kind:"partner", id, changes}    اعتماد/إيقاف شريك أو تعديل بياناته
//   POST {kind:"lead", id, changes}       حالة العميل والمبلغ وأهلية العمولة
//   POST {kind:"settle", ids}             تعليم عمولات كمدفوعة بعد التحويل
//   DELETE ?kind=partner|lead&id=X

import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";
import { MAX_BODY_BYTES } from "../lib/blob-records.mjs";
import {
  partnersStore, leadsStore, allRecords, clean, LEAD_STATUSES, PARTNER_STATUSES,
} from "../lib/partners.mjs";

const PARTNER_FIELDS = ["company", "contactName", "phone", "partnerType", "city", "iban", "notes"];
const LEAD_FIELDS = ["customerName", "phone", "neighborhood", "serviceType", "notes", "adminNotes", "ineligibleReason"];

async function updatePartner(id, changes) {
  const store = partnersStore();
  const current = await store.get(id, { type: "json" });
  if (!current) return jsonResponse({ error: "not_found" }, 404);

  const next = { ...current };
  for (const field of PARTNER_FIELDS) {
    if (field in changes) next[field] = clean(changes[field], 500);
  }
  if (PARTNER_STATUSES.includes(changes.status)) {
    next.status = changes.status;
    if (changes.status === "approved" && !next.approvedAt) next.approvedAt = new Date().toISOString();
  }
  next.updatedAt = new Date().toISOString();
  await store.setJSON(id, next);
  return jsonResponse({ partner: { ...next, id } });
}

async function updateLead(id, changes) {
  const store = leadsStore();
  const current = await store.get(id, { type: "json" });
  if (!current) return jsonResponse({ error: "not_found" }, 404);

  const next = { ...current };
  for (const field of LEAD_FIELDS) {
    if (field in changes) next[field] = clean(changes[field], 500);
  }
  if ("amount" in changes) {
    const amount = Number(changes.amount);
    next.amount = Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) / 100 : 0;
  }
  if (typeof changes.eligible === "boolean") next.eligible = changes.eligible;
  if (LEAD_STATUSES.includes(changes.status)) {
    next.status = changes.status;
    // تاريخ السداد يحدد شهر الكشف، فيُثبت أول مرة فقط
    if (changes.status === "paid" && !next.paidAt) next.paidAt = new Date().toISOString();
  }
  next.updatedAt = new Date().toISOString();
  await store.setJSON(id, next);
  return jsonResponse({ lead: { ...next, id } });
}

async function settle(ids) {
  const store = leadsStore();
  const now = new Date().toISOString();
  const settled = [];
  for (const id of ids.slice(0, 200)) {
    const current = await store.get(id, { type: "json" }).catch(() => null);
    // لا تُصرف إلا عمولة عميل دفع ومؤهل — حماية من ضغطة بالخطأ
    if (!current || current.status !== "paid" || !current.eligible) continue;
    await store.setJSON(id, { ...current, status: "settled", settledAt: now, updatedAt: now });
    settled.push(id);
  }
  return jsonResponse({ settled, settledAt: now });
}

export default async (request) => {
  if (!isConfigured()) return jsonResponse({ error: "not_configured" }, 503);
  if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);

  const url = new URL(request.url);

  try {
    if (request.method === "GET") {
      const [partners, leads] = await Promise.all([
        allRecords(partnersStore()),
        allRecords(leadsStore()),
      ]);
      return jsonResponse({ partners, leads });
    }

    if (request.method === "POST") {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "too_large" }, 413);
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        return jsonResponse({ error: "invalid_body" }, 400);
      }
      const changes = payload.changes && typeof payload.changes === "object" ? payload.changes : {};

      if (payload.kind === "partner" && payload.id) return await updatePartner(payload.id, changes);
      if (payload.kind === "lead" && payload.id) return await updateLead(payload.id, changes);
      if (payload.kind === "settle" && Array.isArray(payload.ids)) return await settle(payload.ids);
      return jsonResponse({ error: "invalid_body" }, 400);
    }

    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      const kind = url.searchParams.get("kind");
      if (!id || !["partner", "lead"].includes(kind)) return jsonResponse({ error: "missing_id" }, 400);
      await (kind === "partner" ? partnersStore() : leadsStore()).delete(id);
      return jsonResponse({ deleted: id });
    }

    return jsonResponse({ error: "method_not_allowed" }, 405);
  } catch (error) {
    console.error("partners admin store error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
