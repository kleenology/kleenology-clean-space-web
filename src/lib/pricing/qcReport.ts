import {
  checklistFor, kindLabel, VERDICTS,
  type ServiceKind, type Verdict,
} from "./qcChecklist";

export interface QcResults {
  /** مفتاح البند ← الحكم عليه؛ البنود غير المفحوصة لا ترد هنا */
  [itemKey: string]: { verdict: Verdict; note?: string } | undefined;
}

export interface QcPhoto {
  /** مفتاح الصورة في المخزن */
  key: string;
  /** البند المرتبط بها إن وُجد */
  itemKey?: string;
}

export interface QualityCheck {
  /** نوع التنظيف — يحدد أي قائمة فحص تُستخدم */
  kind?: ServiceKind;
  customerName: string;
  phone: string;
  location: string;
  date: string;
  time: string;
  supervisor: string;
  /** معاينة محفوظة استُوردت منها بيانات الموقع */
  inspectionId?: string;
  results: QcResults;
  photos: QcPhoto[];
  notes: string;
  /** مفتاح صورة توقيع العميل — اختياري، فقد لا يكون العميل حاضراً */
  signatureKey?: string;
  signedAt?: string;
  savedAt?: string;
}

export interface QcScore {
  checked: number;
  passed: number;
  redo: number;
  missed: number;
  /** نسبة المقبول من المفحوص */
  percent: number;
  /** البنود التي تحتاج عملاً، مرتّبة بأقسامها */
  pending: { section: string; label: string; verdict: Verdict; note?: string }[];
}

export function scoreOf(check: QualityCheck): QcScore {
  const checklist = checklistFor(check.kind);
  let passed = 0;
  let redo = 0;
  let missed = 0;
  const pending: QcScore["pending"] = [];

  for (const section of checklist) {
    for (const item of section.items) {
      const result = check.results[item.key];
      if (!result) continue;
      if (result.verdict === "pass") passed += 1;
      else {
        if (result.verdict === "redo") redo += 1;
        else missed += 1;
        pending.push({
          section: section.title,
          label: item.label,
          verdict: result.verdict,
          note: result.note,
        });
      }
    }
  }

  const checked = passed + redo + missed;
  return {
    checked,
    passed,
    redo,
    missed,
    percent: checked > 0 ? Math.round((passed / checked) * 100) : 0,
    pending,
  };
}

const dash = (value: string) => (value.trim() ? value.trim() : "—");
const verdictLabel = (verdict: Verdict) =>
  VERDICTS.find((v) => v.key === verdict)?.label ?? verdict;

/** تقرير الإدارة — كل بند بحكمه وملاحظته، لمتابعة الفريق */
export function buildManagementReport(check: QualityCheck): string {
  const score = scoreOf(check);
  const lines: string[] = [];

  lines.push("🔒 فحص جودة — تقرير الإدارة");
  lines.push(`العميل: ${dash(check.customerName)} | ${dash(check.phone)}`);
  lines.push(`الموقع: ${dash(check.location)}`);
  lines.push(`التاريخ: ${dash(check.date)} ${check.time.trim()}`.trim());
  lines.push(`المشرف: ${dash(check.supervisor)}`);
  lines.push(`نوع التنظيف: ${kindLabel(check.kind)}`);
  lines.push("");
  lines.push(
    `النتيجة: ${score.passed} مقبول · ${score.redo} يحتاج إعادة · ${score.missed} لم يُنفَّذ — ${score.percent}٪`,
  );
  if (check.photos.length > 0) lines.push(`الصور المرفقة: ${check.photos.length}`);
  lines.push(check.signatureKey ? "توقيع العميل: مُعتمد ✅" : "توقيع العميل: لم يُوقَّع");

  for (const section of checklistFor(check.kind)) {
    const rows = section.items
      .map((item) => ({ item, result: check.results[item.key] }))
      .filter((row) => row.result);
    if (rows.length === 0) continue;

    lines.push("");
    lines.push(`— ${section.title} —`);
    for (const { item, result } of rows) {
      const mark = VERDICTS.find((v) => v.key === result!.verdict)?.short ?? "";
      const note = result!.note?.trim() ? ` — ${result!.note.trim()}` : "";
      lines.push(`${mark} ${item.label}${note}`);
    }
  }

  if (score.pending.length > 0) {
    lines.push("");
    lines.push("— يحتاج عملاً —");
    for (const item of score.pending) {
      lines.push(`${item.section}: ${item.label} (${verdictLabel(item.verdict)})`);
    }
  }

  if (check.notes.trim()) {
    lines.push("");
    lines.push(`ملاحظات: ${check.notes.trim()}`);
  }

  return lines.join("\n");
}

export function emptyCheck(
  supervisor = "", date = "", time = "", kind: ServiceKind = "general",
): QualityCheck {
  return {
    kind,
    customerName: "",
    phone: "",
    location: "",
    date,
    time,
    supervisor,
    results: {},
    photos: [],
    notes: "",
  };
}

/** رابط صفحة التقرير الكامل — محمي بنفس كلمة مرور الأداة */
export function reportUrl(id: string): string {
  return `${window.location.origin}/admin/pricing/qc/${encodeURIComponent(id)}`;
}
