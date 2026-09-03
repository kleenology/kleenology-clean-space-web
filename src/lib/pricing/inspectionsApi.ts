import type { Inspection } from "./inspectionReport";

const ENDPOINT = "/api/pricing/inspections";

/** ملخّص معاينة محفوظة كما ترجعه القائمة */
export interface SavedInspectionSummary {
  id: string;
  customerName: string;
  location: string;
  date: string;
  time: string;
  serviceType: string;
  supervisor: string;
  levelCount: number;
  roomCount: number;
  savedAt: string;
}

export interface ListResult {
  inspections: SavedInspectionSummary[];
  total: number;
  truncated: boolean;
}

/** خطأ يحمل رسالة عربية جاهزة للعرض */
export class InspectionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InspectionsError";
  }
}

function messageFor(status: number, code?: string): string {
  if (status === 401) return "انتهت الجلسة — سجّل الدخول من جديد";
  if (status === 503 || code === "store_unavailable")
    return "التخزين غير متاح — تأكد أن Netlify Blobs مفعّل على الموقع";
  if (status === 413) return "المعاينة كبيرة جداً على الحفظ";
  if (status === 404) return "المعاينة غير موجودة";
  return "تعذّر الاتصال بالخادم";
}

async function request<T>(
  token: string,
  init: RequestInit & { query?: string } = {},
): Promise<T> {
  const { query, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}${query ?? ""}`, {
      ...rest,
      headers: { ...rest.headers, Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new InspectionsError("تعذّر الاتصال بالخادم");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new InspectionsError(messageFor(res.status, data?.error));
  return data as T;
}

export function listInspections(token: string) {
  return request<ListResult>(token);
}

export function loadInspection(token: string, id: string) {
  return request<{ inspection: Inspection & { id: string } }>(token, {
    query: `?id=${encodeURIComponent(id)}`,
  });
}

/** يحفظ معاينة جديدة، أو يحدّث القائمة إذا مُرّر id */
export function saveInspection(token: string, inspection: Inspection, id?: string) {
  return request<{ id: string; savedAt: string }>(token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(id ? { ...inspection, id } : inspection),
  });
}

export function deleteInspection(token: string, id: string) {
  return request<{ deleted: string }>(token, {
    method: "DELETE",
    query: `?id=${encodeURIComponent(id)}`,
  });
}
