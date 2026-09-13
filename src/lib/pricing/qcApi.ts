import type { QualityCheck } from "./qcReport";

const ENDPOINT = "/api/pricing/qc";
const PHOTO_ENDPOINT = "/api/pricing/qc-photo";

export interface SavedCheckSummary {
  id: string;
  customerName: string;
  phone: string;
  location: string;
  date: string;
  supervisor: string;
  checked: number;
  passed: number;
  percent: number;
  photoCount: number;
  savedAt: string;
}

export class QcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QcError";
  }
}

function messageFor(status: number, code?: string): string {
  if (status === 401) return "انتهت الجلسة — سجّل الدخول من جديد";
  if (status === 503 || code === "store_unavailable")
    return "التخزين غير متاح — تأكد أن Netlify Blobs مفعّل على الموقع";
  if (status === 413) return "الملف كبير جداً";
  if (status === 415) return "صيغة الصورة غير مدعومة";
  if (status === 404) return "غير موجود";
  return "تعذّر الاتصال بالخادم";
}

async function call<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new QcError("تعذّر الاتصال بالخادم");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new QcError(messageFor(res.status, data?.error));
  return data as T;
}

export function listChecks(token: string) {
  return call<{ checks: SavedCheckSummary[]; total: number; truncated: boolean }>(token, ENDPOINT);
}

/** يبحث في كل الفحوصات المحفوظة لا آخر خمسين */
export function searchChecks(token: string, query: string) {
  return call<{ checks: SavedCheckSummary[]; total: number }>(
    token, `${ENDPOINT}?q=${encodeURIComponent(query)}`,
  );
}

export function loadCheck(token: string, id: string) {
  return call<{ check: QualityCheck & { id: string } }>(
    token, `${ENDPOINT}?id=${encodeURIComponent(id)}`,
  );
}

export function saveCheck(token: string, check: QualityCheck, id?: string) {
  return call<{ id: string; savedAt: string }>(token, ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(id ? { ...check, id } : check),
  });
}

export function deleteCheck(token: string, id: string) {
  return call<{ deleted: string }>(token, `${ENDPOINT}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

const MAX_EDGE = 1600;
const QUALITY = 0.75;

/**
 * يصغّر الصورة على الجهاز قبل الرفع.
 * صور الجوال تصل ٥ ميجابايت، وهو حجم يخنق دالة Netlify ويستهلك باقة المشرف
 * وهو واقف في الموقع. التصغير إلى ١٦٠٠ بكسل يكفي تماماً لإثبات حالة غرفة.
 */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  // لو فشل الترميز نرفع الأصل بدل أن نفقد الصورة
  return blob ?? file;
}

/** يرفع بيانات صورة جاهزة — يستخدمه التوقيع الذي لا يحتاج ضغطاً */
export function uploadBlob(token: string, blob: Blob, type: string) {
  return call<{ key: string; bytes: number }>(token, PHOTO_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": type },
    body: blob,
  });
}

export async function uploadPhoto(token: string, file: File) {
  const blob = await compressImage(file);
  return uploadBlob(token, blob, blob.type || "image/jpeg");
}

export function deletePhoto(token: string, key: string) {
  return call<{ deleted: string }>(token, `${PHOTO_ENDPOINT}?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}

/**
 * يجلب الصورة كرابط محلي.
 * وسم <img> لا يرسل ترويسة Authorization، ووضع التوكن في الرابط يسرّبه في
 * السجلات، فنجلبها بـfetch ونعرضها من object URL.
 */
export async function fetchPhotoUrl(token: string, key: string): Promise<string> {
  const res = await fetch(`${PHOTO_ENDPOINT}?key=${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new QcError(messageFor(res.status));
  return URL.createObjectURL(await res.blob());
}
