// آراء العملاء — تُجمَع من صفحة التقييم وتُعرَض في الرئيسية بعد اعتماد الإدارة.
//   GET                      [عام] الآراء المعتمدة فقط (للرئيسية)
//   GET ?all=1  [إدارة]      كل الآراء بما فيها المعلّقة (للمراجعة)
//   POST {action:"submit"}   [عام] رأي جديد — يبقى معلّقاً حتى تعتمده الإدارة
//   POST {action:"moderate", id, status}  [إدارة] approved | hidden
//   DELETE ?id=X             [إدارة]

import { requireSession, sessionRole, jsonResponse } from "../lib/admin-auth.mjs";
import { rateLimited, clientIp } from "../lib/rate-limit.mjs";
import { recordStore, newKey, MAX_BODY_BYTES } from "../lib/blob-records.mjs";
import { allRecords } from "../lib/partners.mjs";
import { notifyAdmin } from "../lib/notify.mjs";

const STORE = "customer-reviews";
const clean = (s, n) => (typeof s === "string" ? s.replace(/\s+/g, " ").trim().slice(0, n) : "");

// للعميل في الرئيسية: الاسم الأول فقط حفاظاً على الخصوصية
function publicReview(r) {
  const first = (r.name || "").split(" ")[0] || "عميل";
  return { name: first, rating: r.rating, text: r.text, createdAt: r.createdAt };
}

export default async (request) => {
  const store = recordStore(STORE);
  const url = new URL(request.url);

  try {
    if (request.method === "GET") {
      const all = await allRecords(store); // مرتّبة بالأحدث
      // مسار الإدارة: كل الآراء للمراجعة
      if (url.searchParams.get("all")) {
        if (!requireSession(request) || sessionRole(request) !== "admin") {
          return jsonResponse({ error: "forbidden" }, 403);
        }
        return jsonResponse({ reviews: all });
      }
      // العام: المعتمدة فقط
      const approved = all.filter((r) => r.status === "approved").slice(0, 24).map(publicReview);
      return jsonResponse({ reviews: approved });
    }

    if (request.method === "POST") {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "too_large" }, 413);
      let payload;
      try { payload = JSON.parse(raw); } catch { return jsonResponse({ error: "invalid_body" }, 400); }

      // اعتماد/إخفاء رأي — إدارة فقط
      if (payload.action === "moderate") {
        if (!requireSession(request) || sessionRole(request) !== "admin") {
          return jsonResponse({ error: "forbidden" }, 403);
        }
        const id = clean(payload.id, 120);
        const status = payload.status === "approved" ? "approved" : "hidden";
        const current = await store.get(id, { type: "json" }).catch(() => null);
        if (!current) return jsonResponse({ error: "not_found" }, 404);
        await store.setJSON(id, { ...current, status, moderatedAt: new Date().toISOString() });
        return jsonResponse({ ok: true, id, status });
      }

      // رأي جديد من العميل — عام
      if (payload.action === "submit") {
        if (payload.website) return jsonResponse({ ok: true }); // فخ للبوتات
        if (rateLimited(`review:${clientIp(request)}`, { max: 10 })) {
          return jsonResponse({ error: "too_many_requests" }, 429);
        }
        const name = clean(payload.name, 60);
        const text = clean(payload.text, 500);
        const rating = Math.round(Number(payload.rating));
        if (!name || !text || !(rating >= 1 && rating <= 5)) {
          return jsonResponse({ error: "missing_fields" }, 400);
        }
        const id = newKey();
        await store.setJSON(id, {
          name, text, rating,
          service: clean(payload.service, 60),
          status: "pending",
          createdAt: new Date().toISOString(),
        });
        await notifyAdmin(
          `⭐ رأي عميل جديد (${rating}/5)\n\n${name}: ${text}\n\nاعتمده من لوحة الإدارة ← الآراء ليظهر بالموقع.`,
        );
        return jsonResponse({ ok: true });
      }

      return jsonResponse({ error: "unknown_action" }, 400);
    }

    if (request.method === "DELETE") {
      if (!requireSession(request) || sessionRole(request) !== "admin") {
        return jsonResponse({ error: "forbidden" }, 403);
      }
      const id = url.searchParams.get("id");
      if (!id) return jsonResponse({ error: "missing_id" }, 400);
      await store.delete(id);
      return jsonResponse({ deleted: id });
    }

    return jsonResponse({ error: "method_not_allowed" }, 405);
  } catch (error) {
    console.error("reviews store error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
