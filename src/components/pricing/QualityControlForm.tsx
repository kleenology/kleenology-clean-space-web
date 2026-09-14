import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight, Camera, Copy, FileText, Link2, Loader2, PenLine, RefreshCw,
  Save, Sparkles, Trash2, X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  checklistFor, kindLabel, SERVICE_KINDS, VERDICTS,
  type ServiceKind, type Verdict,
} from "@/lib/pricing/qcChecklist";
import {
  buildManagementReport, emptyCheck, reportUrl, scoreOf,
  type QualityCheck,
} from "@/lib/pricing/qcReport";
import {
  deleteCheck, deletePhoto, listChecks, loadCheck, saveCheck, uploadBlob, uploadPhoto,
  QcError, type SavedCheckSummary,
} from "@/lib/pricing/qcApi";
import { today, now } from "@/lib/pricing/inspectionReport";
import { AuthImage } from "./AuthImage";
import { PhotoLightbox } from "./PhotoLightbox";
import { SignaturePad } from "./SignaturePad";

const SUPERVISOR_KEY = "kleenology_supervisor_name";

const VERDICT_STYLE: Record<Verdict, string> = {
  pass: "border-emerald-400 bg-emerald-50 text-emerald-700",
  redo: "border-amber-400 bg-amber-50 text-amber-700",
  missed: "border-red-400 bg-red-50 text-red-700",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border rounded-xl p-4 sm:p-5">
      <h2 className="font-bold mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function QualityControlForm({ token }: { token: string }) {
  const [data, setData] = useState<QualityCheck>(() =>
    emptyCheck(localStorage.getItem(SUPERVISOR_KEY) ?? "", today(), now()),
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // لا نوع مختاراً عند الفتح: المشرف يحدد نوع التنظيف أولاً فتُبنى القائمة عليه
  const [kind, setKind] = useState<ServiceKind | null>(null);
  const checklist = kind ? checklistFor(kind) : [];
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [saved, setSaved] = useState<SavedCheckSummary[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [signing, setSigning] = useState(false);
  const [signPadOpen, setSignPadOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.supervisor.trim()) localStorage.setItem(SUPERVISOR_KEY, data.supervisor.trim());
  }, [data.supervisor]);

  const patch = (changes: Partial<QualityCheck>) => setData((d) => ({ ...d, ...changes }));
  const score = useMemo(() => scoreOf(data), [data]);

  const setVerdict = (itemKey: string, verdict: Verdict) => {
    setData((d) => {
      const current = d.results[itemKey];
      // الضغط على نفس الحكم يلغيه، فيرجع البند غير مفحوص
      const next = { ...d.results };
      if (current?.verdict === verdict) delete next[itemKey];
      else next[itemKey] = { ...current, verdict };
      return { ...d, results: next };
    });
  };

  const setNote = (itemKey: string, note: string) => {
    setData((d) => {
      const current = d.results[itemKey];
      if (!current) return d;
      return { ...d, results: { ...d.results, [itemKey]: { ...current, note } } };
    });
  };

  const markAllPass = (sectionKey: string) => {
    const section = checklist.find((s) => s.key === sectionKey);
    if (!section) return;
    setData((d) => {
      const next = { ...d.results };
      for (const item of section.items) {
        next[item.key] = { ...next[item.key], verdict: "pass" };
      }
      return { ...d, results: next };
    });
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let added = 0;
    for (const file of Array.from(files)) {
      try {
        const { key } = await uploadPhoto(token, file);
        setData((d) => ({ ...d, photos: [...d.photos, { key }] }));
        added += 1;
      } catch (error) {
        toast.error(error instanceof QcError ? error.message : "تعذّر رفع الصورة");
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (added > 0) toast.success(`أُضيفت ${added} صورة`);
  };

  const removePhoto = async (key: string) => {
    setData((d) => ({ ...d, photos: d.photos.filter((p) => p.key !== key) }));
    // الحذف من المخزن ثانوي: البند اختفى من التقرير على كل حال
    deletePhoto(token, key).catch(() => {});
  };

  const refreshSaved = async () => {
    setLoadingList(true);
    try {
      const { checks } = await listChecks(token);
      setSaved(checks);
    } catch (error) {
      setSaved([]);
      toast.error(error instanceof QcError ? error.message : "تعذّر جلب الفحوصات");
    } finally {
      setLoadingList(false);
    }
  };

  const toggleSaved = async () => {
    const next = !showSaved;
    setShowSaved(next);
    if (next && saved === null) await refreshSaved();
  };

  const save = async () => {
    setSaving(true);
    try {
      const { id } = await saveCheck(token, data, savedId ?? undefined);
      setSavedId(id);
      setSaved(null);
      toast.success(savedId ? "تم تحديث الفحص" : "تم حفظ الفحص");
    } catch (error) {
      toast.error(error instanceof QcError ? error.message : "تعذّر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const open = async (id: string) => {
    try {
      const { check } = await loadCheck(token, id);
      const { id: loadedId, ...rest } = check;
      const loadedKind = rest.kind ?? "general";
      setData({ ...emptyCheck(), ...rest, kind: loadedKind });
      setKind(loadedKind);
      setOpenSection(checklistFor(loadedKind)[0]?.key ?? null);
      setSavedId(loadedId);
      setShowSaved(false);
      toast.success("فُتح الفحص");
    } catch (error) {
      toast.error(error instanceof QcError ? error.message : "تعذّر الفتح");
    }
  };

  const remove = async (id: string, label: string) => {
    if (!window.confirm(`حذف فحص ${label}؟ لا يمكن التراجع.`)) return;
    try {
      await deleteCheck(token, id);
      setSaved((list) => (list ?? []).filter((item) => item.id !== id));
      if (savedId === id) setSavedId(null);
      toast.success("تم الحذف");
    } catch (error) {
      toast.error(error instanceof QcError ? error.message : "تعذّر الحذف");
    }
  };

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("تعذّر النسخ — انسخ النص يدوياً");
    }
  };

  const saveSignature = async (blob: Blob) => {
    setSigning(true);
    try {
      const { key } = await uploadBlob(token, blob, "image/png");
      patch({ signatureKey: key, signedAt: new Date().toISOString() });
      setSignPadOpen(false);
      toast.success("اعتُمد توقيع العميل");
    } catch (error) {
      toast.error(error instanceof QcError ? error.message : "تعذّر حفظ التوقيع");
    } finally {
      setSigning(false);
    }
  };

  const clearSignature = () => {
    const key = data.signatureKey;
    patch({ signatureKey: undefined, signedAt: undefined });
    if (key) deletePhoto(token, key).catch(() => {});
  };

  const copyLink = () => {
    if (!savedId) return;
    copy(reportUrl(savedId), "تم نسخ رابط التقرير");
  };

  const reset = () => {
    setData(emptyCheck(data.supervisor, today(), now(), kind ?? "general"));
    setSavedId(null);
    setOpenSection(checklist[0]?.key ?? null);
    setViewerIndex(null);
    toast.success("تم تفريغ الفحص");
  };

  const chooseKind = (next: ServiceKind) => {
    setKind(next);
    setData((d) => ({ ...d, kind: next }));
    setOpenSection(checklistFor(next)[0]?.key ?? null);
  };

  // تغيير النوع يعني قائمة أخرى، فالأحكام المسجّلة لا تنطبق عليها
  const changeKind = () => {
    const answered = Object.keys(data.results).length;
    if (answered > 0 && !window.confirm(
      `تغيير نوع التنظيف يمسح ${answered} بنداً مفحوصاً لأن القائمة تختلف. تكمل؟`,
    )) return;
    setData((d) => ({ ...d, results: {} }));
    setKind(null);
    setOpenSection(null);
  };

  // شاشة اختيار النوع — تسبق كل شيء لأن القائمة كلها تُبنى عليه
  if (!kind) {
    return (
      <div className="max-w-2xl mx-auto">
        <p className="text-center text-muted-foreground mb-6">وش نوع التنظيف اللي تفحصه؟</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {SERVICE_KINDS.map(({ key, label, desc }) => (
            <button
              key={key}
              type="button"
              onClick={() => chooseKind(key)}
              className="h-full text-right bg-card border rounded-xl p-5 hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-bold">{label}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                {checklistFor(key).reduce((n, sec) => n + sec.items.length, 0)} بند فحص
              </p>
            </button>
          ))}
        </div>

        {/* السجل متاح قبل اختيار النوع: قد يكون المقصود فتح فحص قديم لا إنشاء جديد */}
        <button
          type="button"
          onClick={toggleSaved}
          className="w-full mt-4 bg-card border rounded-xl p-4 flex items-center gap-2 font-bold text-sm"
        >
          <FileText className="h-4 w-4 text-primary" />
          الفحوصات المحفوظة
          {saved && <span className="text-muted-foreground font-normal">({saved.length})</span>}
        </button>

        {showSaved && (
          <div className="bg-card border rounded-xl mt-2 p-3 space-y-2">
            {loadingList && saved === null ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : (saved?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">ما فيه فحوصات محفوظة بعد.</p>
            ) : (
              saved!.map((item) => {
                const label = item.customerName || item.location || item.date || "بلا اسم";
                return (
                  <button key={item.id} type="button" onClick={() => open(item.id)}
                          className="w-full text-right border rounded-lg p-2.5 hover:border-primary hover:bg-primary/5">
                    <div className="text-sm font-medium truncate">{label}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {[item.date, `${item.percent}٪`, `${item.checked} بند`].filter(Boolean).join(" · ")}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start">
      <div className="space-y-4">
      {/* النوع المختار مع إمكانية تغييره */}
      <div className="bg-primary/5 border border-primary/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-sm truncate">{kindLabel(kind)}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {checklist.reduce((n, sec) => n + sec.items.length, 0)} بند
          </span>
        </span>
        <button type="button" onClick={changeKind}
                className="text-xs text-primary underline shrink-0 flex items-center gap-1">
          <ArrowRight className="h-3.5 w-3.5" />
          تغيير النوع
        </button>
      </div>

      {/* السجل */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 p-4">
          <button type="button" onClick={toggleSaved} className="flex items-center gap-2 font-bold text-sm">
            <FileText className="h-4 w-4 text-primary" />
            الفحوصات المحفوظة
            {saved && <span className="text-muted-foreground font-normal">({saved.length})</span>}
          </button>
          <div className="flex items-center gap-2">
            {savedId && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                محفوظ
              </span>
            )}
            {showSaved && (
              <button type="button" onClick={refreshSaved} disabled={loadingList}
                      className="text-muted-foreground hover:text-foreground" aria-label="تحديث القائمة">
                <RefreshCw className={cn("h-4 w-4", loadingList && "animate-spin")} />
              </button>
            )}
          </div>
        </div>

        {showSaved && (
          <div className="border-t p-3 space-y-2">
            {loadingList && saved === null ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : (saved?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">ما فيه فحوصات محفوظة بعد.</p>
            ) : (
              saved!.map((item) => {
                const label = item.customerName || item.location || item.date || "بلا اسم";
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2 border rounded-lg p-2.5">
                    <button type="button" onClick={() => open(item.id)} className="text-right min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{label}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {[item.date, `${item.percent}٪`, `${item.checked} بند`,
                          item.photoCount ? `${item.photoCount} صورة` : ""].filter(Boolean).join(" · ")}
                      </div>
                    </button>
                    <button type="button" onClick={() => remove(item.id, label)}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                            aria-label={`حذف فحص ${label}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <Section title="بيانات الوظيفة">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="q-name">العميل</Label>
            <Input id="q-name" value={data.customerName}
                   onChange={(e) => patch({ customerName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-phone">رقم التواصل</Label>
            <Input id="q-phone" inputMode="tel" placeholder="05xxxxxxxx" value={data.phone}
                   onChange={(e) => patch({ phone: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="q-loc">الموقع</Label>
            <Input id="q-loc" value={data.location} onChange={(e) => patch({ location: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-date">تاريخ الفحص</Label>
            <Input id="q-date" type="date" value={data.date} onChange={(e) => patch({ date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="q-sup">المشرف</Label>
            <Input id="q-sup" value={data.supervisor} onChange={(e) => patch({ supervisor: e.target.value })} />
          </div>
        </div>
      </Section>

      {/* قائمة الفحص */}
      {checklist.map((section) => {
        const isOpen = openSection === section.key;
        const done = section.items.filter((i) => data.results[i.key]).length;
        const failed = section.items.filter((i) => {
          const v = data.results[i.key]?.verdict;
          return v === "redo" || v === "missed";
        }).length;
        return (
          <div key={section.key} className={cn(
            "bg-card border rounded-xl overflow-hidden",
            failed > 0 ? "border-amber-300" : isOpen ? "border-primary" : "border-border",
          )}>
            <div className="flex items-center justify-between gap-2 p-4">
              <button type="button" onClick={() => setOpenSection(isOpen ? null : section.key)}
                      className="text-right min-w-0 flex-1">
                <span className="font-bold">{section.title}</span>
                <span className="text-xs text-muted-foreground mr-2">
                  {done}/{section.items.length}
                  {failed > 0 && <span className="text-amber-600"> · {failed} يحتاج عملاً</span>}
                </span>
              </button>
              {isOpen && (
                <button type="button" onClick={() => markAllPass(section.key)}
                        className="text-[11px] text-emerald-700 border border-emerald-300 bg-emerald-50 rounded px-2 py-1 shrink-0">
                  الكل مقبول
                </button>
              )}
            </div>

            {isOpen && (
              <div className="border-t p-3 grid gap-2 xl:grid-cols-2">
                {section.items.map((item) => {
                  const result = data.results[item.key];
                  return (
                    <div key={item.key} className={cn(
                      "rounded-lg border p-2.5",
                      result ? VERDICT_STYLE[result.verdict] : "border-border",
                    )}>
                      <div className="text-sm font-medium mb-2">{item.label}</div>
                      <div className="flex gap-1.5">
                        {VERDICTS.map((v) => (
                          <button
                            key={v.key} type="button"
                            onClick={() => setVerdict(item.key, v.key)}
                            className={cn(
                              "flex-1 py-1.5 rounded-md border text-xs font-medium transition-colors",
                              result?.verdict === v.key
                                ? "border-current bg-white/70"
                                : "border-border bg-background text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {v.short} {v.label}
                          </button>
                        ))}
                      </div>
                      {result && result.verdict !== "pass" && (
                        <Input
                          className="mt-2 h-9 bg-white/70"
                          placeholder="ملاحظة — وش المطلوب بالضبط؟"
                          value={result.note ?? ""}
                          onChange={(e) => setNote(item.key, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <Section title="الصور">
        <input
          ref={fileRef} type="file" accept="image/*" multiple capture="environment"
          className="hidden" onChange={(e) => addPhotos(e.target.files)}
        />
        <Button type="button" variant="outline" className="w-full"
                onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Camera className="h-4 w-4 ml-2" />}
          {uploading ? "يرفع…" : "إضافة صور"}
        </Button>
        <p className="text-[11px] text-muted-foreground mt-2">
          تُصغَّر الصور على جوالك قبل الرفع، فلا تستهلك باقتك ولا تبطئ الحفظ.
          اضغط أي صورة لتكبيرها.
        </p>

        {data.photos.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2 mt-3">
            {data.photos.map((photo, index) => (
              <div key={photo.key} className="relative aspect-square rounded-lg overflow-hidden border">
                <button type="button" onClick={() => setViewerIndex(index)}
                        className="block w-full h-full" aria-label={`فتح الصورة ${index + 1}`}>
                  <AuthImage token={token} photoKey={photo.key} alt="صورة الفحص"
                             className="w-full h-full object-cover" />
                </button>
                <button type="button" onClick={() => removePhoto(photo.key)}
                        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                        aria-label="حذف الصورة">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="توقيع العميل">
        {data.signatureKey ? (
          <div className="space-y-2">
            <div className="rounded-lg border bg-white overflow-hidden">
              <AuthImage token={token} photoKey={data.signatureKey} alt="توقيع العميل"
                         className="w-full h-40 object-contain" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="text-emerald-700 font-medium">✅ مُعتمد</span>
              <button type="button" onClick={clearSignature} className="underline hover:text-foreground">
                إعادة التوقيع
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5" />
              أعطِ الجوال للعميل ليوقّع بعد اطلاعه على الفحص — اختياري.
            </p>
            <Button type="button" variant="outline" className="w-full h-12"
                    onClick={() => setSignPadOpen(true)}>
              <PenLine className="h-4 w-4 ml-2" />
              فتح شاشة التوقيع
            </Button>
          </>
        )}
      </Section>

      <Section title="ملاحظات عامة">
        <Textarea rows={3} value={data.notes} onChange={(e) => patch({ notes: e.target.value })}
                  placeholder="أي شيء يخص الوظيفة كاملة…" />
      </Section>

      </div>

      {/* النتيجة والإجراءات — شريط سفلي على الجوال، وعمود جانبي على اللابتوب
          حيث كان الشريط الثابت يطفو فوق قائمة البنود ويغطيها */}
      <div className="bg-card border rounded-xl p-4 sm:p-5 space-y-3 sticky bottom-4 mt-4 lg:mt-0 lg:sticky lg:top-32 lg:bottom-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className={cn(
              "text-2xl font-bold tabular-nums",
              score.checked === 0 ? "text-muted-foreground"
                : score.percent === 100 ? "text-emerald-600"
                : score.percent >= 80 ? "text-amber-600" : "text-red-600",
            )}>
              {score.percent}٪
            </span>
            <span className="text-xs text-muted-foreground mr-2">
              {score.passed} من {score.checked} مقبول
            </span>
          </div>
          <button type="button" onClick={reset}
                  className="text-xs text-muted-foreground hover:text-foreground underline">
            تفريغ الفحص
          </button>
        </div>

        {score.pending.length > 0 && (
          <div className="text-[11px] bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-800">
            <strong>{score.pending.length} بند يحتاج عملاً:</strong>{" "}
            {score.pending.slice(0, 3).map((p) => p.label).join(" · ")}
            {score.pending.length > 3 && ` +${score.pending.length - 3}`}
          </div>
        )}

        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
          {savedId ? "تحديث الفحص" : "حفظ الفحص"}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={copyLink} disabled={!savedId}>
            <Link2 className="h-4 w-4 ml-2" />
            نسخ الرابط
          </Button>
          <Button variant="outline" disabled={score.checked === 0}
                  onClick={() => copy(buildManagementReport(data), "تم نسخ تقرير الإدارة")}>
            <Copy className="h-4 w-4 ml-2" />
            نسخ التقرير
          </Button>
        </div>
        {!savedId && (
          <p className="text-[11px] text-muted-foreground text-center">
            احفظ الفحص أولاً ليصير له رابط.
          </p>
        )}
      </div>
      {signPadOpen && (
        <SignaturePad
          onSave={saveSignature}
          onCancel={() => setSignPadOpen(false)}
          saving={signing}
        />
      )}

      {viewerIndex !== null && (
        <PhotoLightbox
          token={token}
          keys={data.photos.map((p) => p.key)}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={setViewerIndex}
        />
      )}
    </div>
  );
}
