// صور فحص الجودة — تُخزَّن في Netlify Blobs كملفات ثنائية منفصلة عن التقرير
// حتى لا ينتفخ سجل JSON، ولا تُسلَّم إلا لجلسة مشرف صالحة.

import { getStore } from "@netlify/blobs";
import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";

const STORE = "pricing-qc-photos";
// الواجهة تضغط الصورة قبل الرفع؛ هذا سقف أمان لا حجم متوقَّع
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function photoStore() {
  return getStore({ name: STORE, consistency: "strong" });
}

export default async (request) => {
  if (!isConfigured()) return jsonResponse({ error: "not_configured" }, 503);
  if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);

  const key = new URL(request.url).searchParams.get("key");

  try {
    const store = photoStore();

    if (request.method === "GET") {
      if (!key) return jsonResponse({ error: "missing_key" }, 400);
      const blob = await store.getWithMetadata(key, { type: "arrayBuffer" });
      if (!blob) return jsonResponse({ error: "not_found" }, 404);
      return new Response(blob.data, {
        status: 200,
        headers: {
          "Content-Type": blob.metadata?.contentType || "image/jpeg",
          // الصورة ثابتة تحت مفتاحها، لكنها خاصة فلا تُخزَّن في وسيط مشترك
          "Cache-Control": "private, max-age=86400",
        },
      });
    }

    if (request.method === "POST") {
      const contentType = request.headers.get("content-type") || "";
      if (!ALLOWED.has(contentType)) {
        return jsonResponse({ error: "unsupported_type" }, 415);
      }
      const bytes = await request.arrayBuffer();
      if (bytes.byteLength === 0) return jsonResponse({ error: "empty" }, 400);
      if (bytes.byteLength > MAX_PHOTO_BYTES) return jsonResponse({ error: "too_large" }, 413);

      const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
      const photoKey = `${new Date().toISOString()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await store.set(photoKey, bytes, { metadata: { contentType } });
      return jsonResponse({ key: photoKey, bytes: bytes.byteLength });
    }

    if (request.method === "DELETE") {
      if (!key) return jsonResponse({ error: "missing_key" }, 400);
      await store.delete(key);
      return jsonResponse({ deleted: key });
    }

    return jsonResponse({ error: "method_not_allowed" }, 405);
  } catch (error) {
    console.error("qc photo store error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
