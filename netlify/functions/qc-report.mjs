// تقرير الجودة للعميل — نسخة عامة مختصرة من فحص الجودة، بلا تسجيل دخول.
// يُشارَك برابط kleenology.me/report/<id>. المعرّف عشوائي يصعب تخمينه.
//   GET ?id=X            بيانات التقرير للعميل (بلا جوال ولا ملاحظات داخلية)
//   GET ?id=X&photo=KEY  صورة من التقرير — فقط إذا كانت ضمن صور هذا التقرير
//
// لا نكشف: جوال العميل، الملاحظات الداخلية، توقيع العميل.

import { getStore } from "@netlify/blobs";
import { jsonResponse } from "../lib/admin-auth.mjs";
import { rateLimited, clientIp } from "../lib/rate-limit.mjs";
import { recordStore } from "../lib/blob-records.mjs";

const CHECKS_STORE = "pricing-quality-checks";
const PHOTOS_STORE = "pricing-qc-photos";
const REF_STORE = "customer-referrals";

function photoStore() {
  return getStore({ name: PHOTOS_STORE, consistency: "strong" });
}

// نُبقي الأحكام فقط (pass/redo/missed) بلا ملاحظات داخلية
function publicResults(results) {
  const out = {};
  if (results && typeof results === "object") {
    for (const [key, value] of Object.entries(results)) {
      if (value?.verdict) out[key] = { verdict: value.verdict };
    }
  }
  return out;
}

export default async (request) => {
  if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);
  if (rateLimited(`qc-report:${clientIp(request)}`, { max: 60 })) {
    return jsonResponse({ error: "too_many_requests" }, 429);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const photo = url.searchParams.get("photo");
  if (!id) return jsonResponse({ error: "missing_id" }, 400);

  try {
    const record = await recordStore(CHECKS_STORE).get(id, { type: "json" });
    if (!record) return jsonResponse({ error: "not_found" }, 404);

    const photoKeys = Array.isArray(record.photos)
      ? record.photos.map((p) => (typeof p === "string" ? p : p?.key)).filter(Boolean)
      : [];

    // صورة: تُسلَّم فقط إذا كانت ضمن صور هذا التقرير — فلا يُخمّن غيرها
    if (photo) {
      if (!photoKeys.includes(photo)) return jsonResponse({ error: "not_found" }, 404);
      const blob = await photoStore().getWithMetadata(photo, { type: "arrayBuffer" });
      if (!blob) return jsonResponse({ error: "not_found" }, 404);
      return new Response(blob.data, {
        status: 200,
        headers: {
          "Content-Type": blob.metadata?.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // كود إحالة العميل إن أُنشئ (مخزّن بفهرس عكسي بالتقرير)
    const refIdx = await recordStore(REF_STORE).get(`idx:${id}`, { type: "json" }).catch(() => null);

    // بيانات التقرير للعميل — منقّاة
    return jsonResponse({
      report: {
        id,
        customerName: record.customerName ?? "",
        location: record.location ?? "",
        date: record.date ?? "",
        supervisor: record.supervisor ?? "",
        kind: record.kind ?? "general",
        customItems: Array.isArray(record.customItems) ? record.customItems : undefined,
        results: publicResults(record.results),
        photos: photoKeys,
        referralCode: refIdx?.code ?? null,
        savedAt: record.savedAt ?? "",
      },
    });
  } catch (error) {
    console.error("qc public report error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
