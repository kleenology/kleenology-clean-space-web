// إدارة برنامج الشركاء — كل العمليات تتطلب جلسة مشرف صالحة.
//   GET                                   الشركاء والعملاء المحالون
//   POST {kind:"partner", id, changes}    اعتماد/إيقاف شريك أو تعديل بياناته
//   POST {kind:"lead", id, changes}       بيانات العميل وحالته وأهليته
//   POST {kind:"order", id, amount}       طلب مدفوع جديد للعميل — عمولة على كل طلب
//   POST {kind:"order", id, orderId, remove:true}  حذف طلب لم تُصرف عمولته
//   POST {kind:"settle", items:[{id, orderId}]}    تعليم عمولات كمدفوعة بعد التحويل
//   DELETE ?kind=partner|lead&id=X

import {
  isConfigured, requireSession, jsonResponse,
  isPartnersLocked, checkPartnersPassword, createPartnersToken,
  verifyPartnersToken, partnersTokenFromRequest,
} from "../lib/admin-auth.mjs";
import crypto from "node:crypto";
import { MAX_BODY_BYTES } from "../lib/blob-records.mjs";
import {
  partnersStore, leadsStore, allRecords, clean, ordersOf, leadStatusOf,
  LEAD_STATUSES, PARTNER_STATUSES,
} from "../lib/partners.mjs";

const PARTNER_FIELDS = ["company", "contactName", "phone", "partnerType", "city", "iban", "notes"];
const LEAD_FIELDS = ["customerName", "phone", "neighborhood", "serviceType", "notes", "adminNotes"];

/** السجل كما تراه الواجهة: قائمة طلبات وحالة بالصيغة الجديدة حتى للسجلات الأقدم */
function normalizeLead(lead) {
  const { amount: _amount, paidAt: _paidAt, settledAt: _settledAt, ineligibleReason: _reason, ...rest } = lead;
  return { ...rest, status: leadStatusOf(lead), orders: ordersOf(lead) };
}

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

  const next = normalizeLead(current);
  for (const field of LEAD_FIELDS) {
    if (field in changes) next[field] = clean(changes[field], 500);
  }
  if (typeof changes.eligible === "boolean") next.eligible = changes.eligible;
  if (LEAD_STATUSES.includes(changes.status)) next.status = changes.status;
  next.updatedAt = new Date().toISOString();
  await store.setJSON(id, next);
  return jsonResponse({ lead: { ...next, id } });
}

async function changeOrder(id, payload) {
  const store = leadsStore();
  const current = await store.get(id, { type: "json" });
  if (!current) return jsonResponse({ error: "not_found" }, 404);

  const next = normalizeLead(current);
  const now = new Date().toISOString();

  if (payload.remove) {
    const order = next.orders.find((o) => o.id === payload.orderId);
    // الطلب اللي صُرفت عمولته يبقى — حذفه يخرب كشوف الأشهر الماضية
    if (!order || order.settledAt) return jsonResponse({ error: "not_found" }, 404);
    next.orders = next.orders.filter((o) => o.id !== payload.orderId);
  } else {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) return jsonResponse({ error: "invalid_amount" }, 400);
    next.orders = [...next.orders, {
      id: crypto.randomBytes(4).toString("hex"),
      amount: Math.round(amount * 100) / 100,
      note: clean(payload.note, 120),
      paidAt: now,
    }];
    // أول طلب مدفوع يعني أن العميل صار فعّالاً
    if (next.status === "new" || next.status === "quoted") next.status = "active";
  }
  next.updatedAt = now;
  await store.setJSON(id, next);
  return jsonResponse({ lead: { ...next, id } });
}

async function settle(items) {
  const store = leadsStore();
  const now = new Date().toISOString();
  const byLead = new Map();
  for (const { id, orderId } of items.slice(0, 500)) {
    if (typeof id !== "string" || typeof orderId !== "string") continue;
    byLead.set(id, [...(byLead.get(id) ?? []), orderId]);
  }

  const settled = [];
  for (const [id, orderIds] of byLead) {
    const current = await store.get(id, { type: "json" }).catch(() => null);
    // لا تُصرف إلا عمولة عميل مؤهل — حماية من ضغطة بالخطأ
    if (!current || current.eligible === false) continue;
    const next = normalizeLead(current);
    next.orders = next.orders.map((order) => {
      if (!orderIds.includes(order.id) || order.settledAt) return order;
      settled.push({ id, orderId: order.id });
      return { ...order, settledAt: now };
    });
    next.updatedAt = now;
    await store.setJSON(id, next);
  }
  return jsonResponse({ settled, settledAt: now });
}

export default async (request) => {
  if (!isConfigured()) return jsonResponse({ error: "not_configured" }, 503);
  if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);

  const url = new URL(request.url);

  // نقرأ جسم POST مرة واحدة حتى نفحص «فتح القفل» قبل بوابة القفل
  let payload = null;
  if (request.method === "POST") {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "too_large" }, 413);
    try {
      payload = JSON.parse(raw);
    } catch {
      return jsonResponse({ error: "invalid_body" }, 400);
    }
  }

  try {
    // فتح القفل: جلسة إدارة صالحة + كلمة سر الشركاء ← توكن وصول للتبويب
    if (payload?.action === "unlock") {
      if (!isPartnersLocked()) return jsonResponse({ unlocked: true, locked: false });
      if (!checkPartnersPassword(payload.password)) {
        return jsonResponse({ error: "invalid_partners_password" }, 401);
      }
      return jsonResponse({ unlocked: true, ...createPartnersToken() });
    }

    // بوابة القفل: إذا فُعّل القفل يلزم توكن وصول صالح لكل العمليات
    if (isPartnersLocked() && !verifyPartnersToken(partnersTokenFromRequest(request))) {
      return jsonResponse({ error: "partners_locked" }, 403);
    }

    if (request.method === "GET") {
      const [partners, leads] = await Promise.all([
        allRecords(partnersStore()),
        allRecords(leadsStore()),
      ]);
      return jsonResponse({ partners, leads: leads.map(normalizeLead) });
    }

    if (request.method === "POST") {
      const changes = payload.changes && typeof payload.changes === "object" ? payload.changes : {};

      if (payload.kind === "partner" && payload.id) return await updatePartner(payload.id, changes);
      if (payload.kind === "lead" && payload.id) return await updateLead(payload.id, changes);
      if (payload.kind === "order" && payload.id) return await changeOrder(payload.id, payload);
      if (payload.kind === "settle" && Array.isArray(payload.items)) return await settle(payload.items);
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
