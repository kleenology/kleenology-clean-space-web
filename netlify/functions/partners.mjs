// المسار العام لبرنامج الشركاء — بلا تسجيل دخول:
//   GET  ?code=X                 اسم الشريك المعتمد (لصفحة رابط الإحالة)
//   POST {action:"register",...} طلب انضمام شريك — يبقى معلّقاً حتى تعتمده الإدارة
//   POST {action:"lead",...}     عميل محال بكود شريك معتمد
//   POST {action:"account", code, phone}  حساب الشريك: عملاؤه وعمولاته فقط،
//        ولا يُفتح إلا إذا طابق الجوال جوال الشريك المسجّل
// بيانات الإدارة الكاملة في مسار الإدارة المحمي.

import { jsonResponse, clientKey } from "../lib/admin-auth.mjs";
import { newKey, MAX_BODY_BYTES } from "../lib/blob-records.mjs";
import { normalizePhone } from "../lib/search-text.mjs";
import {
  partnersStore, leadsStore, newPartnerCode, normalizeCode, displayCode,
  otherReferral, clean, rateLimited, allRecords, ordersOf, leadStatusOf,
  CUSTOMER_DISCOUNT_PERCENT,
} from "../lib/partners.mjs";

async function approvedPartner(rawCode) {
  const code = normalizeCode(rawCode);
  if (!code) return null;
  const partner = await partnersStore().get(code, { type: "json" }).catch(() => null);
  return partner?.status === "approved" ? { ...partner, code } : null;
}

function validPhone(phone) {
  return normalizePhone(phone).length >= 9;
}

async function register(payload) {
  const record = {
    company: clean(payload.company, 120),
    contactName: clean(payload.contactName, 80),
    phone: clean(payload.phone, 20),
    partnerType: clean(payload.partnerType, 40),
    city: clean(payload.city, 60),
    iban: clean(payload.iban, 40).toUpperCase().replace(/\s/g, ""),
    notes: clean(payload.notes, 500),
  };
  if (!record.company || !record.contactName || !validPhone(record.phone)) {
    return jsonResponse({ error: "missing_fields" }, 400);
  }
  if (!payload.acceptedTerms) {
    return jsonResponse({ error: "terms_required" }, 400);
  }

  const store = partnersStore();
  const code = await newPartnerCode(store);
  await store.setJSON(code, {
    ...record,
    status: "pending",
    acceptedTermsAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  // الكود لا يُرسل الآن: لا يعمل قبل الاعتماد، والإدارة ترسله مع الموافقة
  return jsonResponse({ ok: true });
}

async function submitLead(payload) {
  const partner = await approvedPartner(payload.code);
  if (!partner) return jsonResponse({ error: "invalid_code" }, 404);

  const lead = {
    customerName: clean(payload.customerName, 80),
    phone: clean(payload.phone, 20),
    neighborhood: clean(payload.neighborhood, 80),
    serviceType: clean(payload.serviceType, 80),
    notes: clean(payload.notes, 500),
  };
  if (!lead.customerName || !validPhone(lead.phone)) {
    return jsonResponse({ error: "missing_fields" }, 400);
  }

  const id = newKey();
  await leadsStore().setJSON(id, {
    ...lead,
    partnerCode: partner.code,
    partnerName: partner.company,
    source: payload.source === "link" ? "link" : "partner",
    status: "new",
    eligible: true,
    duplicateNote: await otherReferral(lead.phone, partner.code),
    customerDiscount: CUSTOMER_DISCOUNT_PERCENT,
    orders: [],
    createdAt: new Date().toISOString(),
  });
  return jsonResponse({ ok: true, partnerName: partner.company });
}

async function account(payload) {
  const partner = await approvedPartner(payload.code);
  // نفس الرد للكود الخطأ والجوال الخطأ — حتى لا يصير النموذج أداة لتخمين الأكواد
  if (!partner || normalizePhone(partner.phone) !== normalizePhone(payload.phone) || !validPhone(payload.phone)) {
    return jsonResponse({ error: "invalid_login" }, 404);
  }

  const leads = (await allRecords(leadsStore()))
    .filter((lead) => lead.partnerCode === partner.code)
    .map((lead) => ({
      // جوال العميل لا يُرجع — الشريك أعطانا إياه ولا يحتاج يشوفه هنا
      customerName: lead.customerName,
      neighborhood: lead.neighborhood ?? "",
      status: leadStatusOf(lead),
      eligible: lead.eligible !== false,
      createdAt: lead.createdAt,
      orders: ordersOf(lead).map(({ amount, paidAt, settledAt }) => ({ amount, paidAt, settledAt: settledAt ?? null })),
    }));

  return jsonResponse({
    partner: { company: partner.company, contactName: partner.contactName, code: displayCode(partner.code) },
    leads,
  });
}

export default async (request) => {
  try {
    if (request.method === "GET") {
      const partner = await approvedPartner(new URL(request.url).searchParams.get("code"));
      if (!partner) return jsonResponse({ error: "invalid_code" }, 404);
      return jsonResponse({ partnerName: partner.company, code: displayCode(partner.code) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "method_not_allowed" }, 405);
    }

    if (rateLimited(clientKey(request))) {
      return jsonResponse({ error: "too_many_requests" }, 429);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "too_large" }, 413);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return jsonResponse({ error: "invalid_body" }, 400);
    }

    // حقل مخفي لا يعبّيه إلا البوتات
    if (payload.website) return jsonResponse({ ok: true });

    if (payload.action === "register") return await register(payload);
    if (payload.action === "lead") return await submitLead(payload);
    if (payload.action === "account") return await account(payload);
    return jsonResponse({ error: "unknown_action" }, 400);
  } catch (error) {
    console.error("partners store error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
