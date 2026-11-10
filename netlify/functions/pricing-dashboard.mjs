// لوحة نظرة سريعة للإدارة: مواعيد اليوم والأسبوع + أعداد + آخر التقييمات.
// قراءة فقط، تتطلب جلسة مشرف/إدارة.

import { recordStore, MAX_SEARCH_SCAN } from "../lib/blob-records.mjs";
import { isConfigured, requireSession, jsonResponse } from "../lib/admin-auth.mjs";

// تاريخ اليوم بتوقيت الرياض YYYY-MM-DD
function riyadhDate(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

async function countOf(store) {
  const { blobs } = await store.list();
  return blobs.length;
}

async function readAll(store, cap = MAX_SEARCH_SCAN) {
  const { blobs } = await store.list();
  const keys = blobs.map((e) => e.key).sort((a, b) => b.localeCompare(a)).slice(0, cap);
  const rows = await Promise.all(keys.map((k) => store.get(k, { type: "json" }).catch(() => null)));
  return { records: rows.filter(Boolean), total: blobs.length };
}

const bookingView = (r) => ({
  customerName: r.customerName ?? "",
  phone: r.phone ?? "",
  bookingNo: r.bookingNo ?? "",
  date: r.date ?? "",
  time: r.time ?? "",
  serviceType: r.serviceType ?? "",
  location: r.location ?? "",
});

export default async (request) => {
  if (!isConfigured()) return jsonResponse({ error: "not_configured" }, 503);
  if (!requireSession(request)) return jsonResponse({ error: "unauthorized" }, 401);
  if (request.method !== "GET") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const today = riyadhDate(0);
    const weekEnd = riyadhDate(7);

    const bookingsStore = recordStore("pricing-bookings");
    const reviewsStore = recordStore("customer-reviews");

    const [bk, rv, inspections, qc] = await Promise.all([
      readAll(bookingsStore),
      readAll(reviewsStore),
      countOf(recordStore("pricing-inspections")),
      countOf(recordStore("pricing-quality-checks")),
    ]);

    const todayBookings = bk.records
      .filter((r) => r.date === today)
      .map(bookingView)
      .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

    const weekBookings = bk.records
      .filter((r) => r.date > today && r.date <= weekEnd)
      .map(bookingView)
      .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

    const ratings = rv.records.map((r) => Number(r.rating)).filter((n) => n >= 1 && n <= 5);
    const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0;
    const reviewsPending = rv.records.filter((r) => r.status === "pending").length;
    const recentReviews = rv.records
      .slice()
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      .slice(0, 5)
      .map((r) => ({ name: (r.name || "عميل").split(" ")[0], rating: r.rating, text: r.text, status: r.status, createdAt: r.createdAt }));

    return jsonResponse({
      counts: { bookings: bk.total, inspections, qc, reviews: rv.total, reviewsPending },
      avgRating,
      todayBookings,
      weekBookings,
      recentReviews,
    });
  } catch (error) {
    console.error("dashboard error:", error);
    return jsonResponse({ error: "store_unavailable" }, 503);
  }
};
