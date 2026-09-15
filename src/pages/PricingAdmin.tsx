import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator, LogOut, Loader2, Copy, MessageCircle, RotateCcw,
  Minus, Plus, Search, X, Package, PlusCircle, ClipboardList, ShieldCheck, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { calculateQuote, flattenCatalogue } from "@/lib/pricing/calculate";
import {
  buildCustomerQuote, buildInternalSummary, toWhatsAppNumber,
  type CustomerInfo,
} from "@/lib/pricing/quoteMessage";
import type { Catalogue, QuoteInput } from "@/lib/pricing/types";
import { LoginCard } from "@/components/pricing/LoginCard";
import { CustomerSearch } from "@/components/pricing/CustomerSearch";
import { InspectionForm } from "@/components/pricing/InspectionForm";
import { QualityControlForm } from "@/components/pricing/QualityControlForm";

// التوكن في localStorage لا sessionStorage: الأخير ينمسح بإغلاق التبويب،
// فيضطر المشرف لكتابة كلمة المرور كل مرة يفتح فيها الأداة على جواله.
const TOKEN_KEY = "kleenology_pricing_token";

const sar = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("en-US")} ر.س`;
};

const emptyCustomer: CustomerInfo = {
  name: "", phone: "", neighborhood: "", visitDate: "", notes: "",
};

const emptyInput: QuoteInput = { items: [] };

/* ————————————————————————— عناصر مساعدة ————————————————————————— */

function QtyStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button" onClick={() => onChange(Math.max(1, value - 1))}
        className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-muted"
        aria-label="إنقاص"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button" onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-muted"
        aria-label="زيادة"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ————————————————————————— الصفحة ————————————————————————— */

export default function PricingAdmin() {
  const [token, setToken] = useState<string | null>(null);
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [restoring, setRestoring] = useState(true);

  const [input, setInput] = useState<QuoteInput | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo>(emptyCustomer);
  const [search, setSearch] = useState("");
  // لا وضع مختاراً عند الدخول — المشرف يقرر أولاً ماذا يفعل
  const [mode, setMode] = useState<"quote" | "inspection" | "qc" | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openInspectionId, setOpenInspectionId] = useState<string | null>(null);
  // البحث في الرابط: يعود كما هو بعد فتح سجل، ويصلح للحفظ والمشاركة
  const [searchParams, setSearchParams] = useSearchParams();
  const customerQuery = searchParams.get("q") ?? "";
  const openPanelRef = useRef<HTMLElement | null>(null);
  const [showCodes, setShowCodes] = useState(false);

  const startSession = useCallback((newToken: string, newCatalogue: Catalogue) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setCatalogue(newCatalogue);
    setInput((current) => current ?? emptyInput);
  }, []);

  const endSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCatalogue(null);
    setInput(null);
    setCustomer(emptyCustomer);
  }, []);

  // استعادة الجلسة عند إعادة التحميل — الخادم هو من يقرر صلاحية التوكن
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setRestoring(false);
      return;
    }
    let cancelled = false;
    fetch("/api/pricing/catalogue", { headers: { Authorization: `Bearer ${saved}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("unauthorized"))))
      .then((data) => { if (!cancelled) startSession(saved, data.catalogue); })
      .catch(() => { if (!cancelled) localStorage.removeItem(TOKEN_KEY); })
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
  }, [startSession]);

  useEffect(() => {
    if (openGroup) openPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openGroup]);

  const patch = useCallback((changes: Partial<QuoteInput>) => {
    setInput((current) => (current ? { ...current, ...changes } : current));
  }, []);

  const quote = useMemo(
    () => (catalogue && input ? calculateQuote(catalogue, input) : null),
    [catalogue, input],
  );

  // نتائج البحث عبر كل الكتالوج — الاسم أو المجموعة أو كود الخدمة
  const searchResults = useMemo(() => {
    if (!catalogue) return [];
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return flattenCatalogue(catalogue).filter((item) =>
      `${item.group} ${item.label} ${item.code}`.toLowerCase().includes(term),
    );
  }, [catalogue, search]);

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !catalogue || !input || !quote) {
    return (
      <>
        <SEO title="تسعير كلينولوجي" description="صفحة داخلية"
             url="https://kleenology.me/admin/pricing" noindex />
        <div dir="rtl"><LoginCard onSuccess={startSession} /></div>
      </>
    );
  }

  /* ——— معالجات ——— */

  const qtyOf = (code: string) => input.items.find((i) => i.code === code)?.qty ?? 0;

  const setQty = (code: string, qty: number) => {
    if (qty <= 0) {
      patch({ items: input.items.filter((i) => i.code !== code) });
      return;
    }
    const exists = input.items.some((i) => i.code === code);
    patch({
      items: exists
        ? input.items.map((i) => (i.code === code ? { ...i, qty } : i))
        : [...input.items, { code, qty }],
    });
  };

  const toggleItem = (code: string) => setQty(code, qtyOf(code) > 0 ? 0 : 1);

  const resetForm = () => {
    setInput(emptyInput);
    setCustomer(emptyCustomer);
    setSearch("");
    setOpenGroup(null);
    toast.success("تم تفريغ العرض");
  };

  const customerQuote = () => buildCustomerQuote(catalogue, quote, customer, { showCodes });

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error("تعذّر النسخ — انسخ النص يدوياً");
    }
  };

  const sendToCustomer = () => {
    const number = toWhatsAppNumber(customer.phone);
    if (!number) {
      toast.error("أدخل رقم جوال العميل أولاً");
      return;
    }
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(customerQuote())}`, "_blank");
  };


  const renderItemRow = (
    item: { code: string; label: string; price: number; time: string; note?: string; noDiscount?: boolean },
    groupName?: string,
  ) => {
    const qty = qtyOf(item.code);
    const selected = qty > 0;
    return (
      <div
        key={item.code}
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-colors",
          selected ? "border-primary bg-primary/5" : "border-border bg-background",
        )}
      >
        <button
          type="button"
          onClick={() => toggleItem(item.code)}
          className="text-right min-w-0 flex-1"
        >
          <div className="text-sm font-medium truncate">
            {groupName && <span className="text-muted-foreground">{groupName} — </span>}
            {item.label}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {sar(item.price)} · {item.code} · {item.time}
            {item.noDiscount && (
              <span className="mr-1.5 text-amber-600 font-medium">· سعر ثابت بلا خصم</span>
            )}
          </div>
          {item.note && (
            <div className="text-[11px] text-amber-600 mt-0.5">ملاحظة: {item.note}</div>
          )}
        </button>
        {selected && <QtyStepper value={qty} onChange={(n) => setQty(item.code, n)} />}
      </div>
    );
  };

  return (
    <>
      <SEO title="تسعير كلينولوجي" description="صفحة داخلية"
           url="https://kleenology.me/admin/pricing" noindex />

      <div dir="rtl" className="min-h-screen bg-muted/30 pb-16">
        <header className="bg-gradient-to-l from-brand-blue-deep to-brand-blue-deeper text-white sticky top-0 z-20 shadow-clean">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {mode !== null && (
                <button
                  type="button"
                  onClick={() => { setMode(null); setOpenInspectionId(null); }}
                  className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 transition-colors"
                  aria-label="رجوع للبحث"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
              {/* الشعار نفسه لا أيقونة عامة: المشرف يفتحها يومياً فتُعرف من أول نظرة */}
              <div className="bg-white rounded-xl px-3 py-1.5 shrink-0 shadow-clean">
                <img src="/logo.png" alt="كلينولوجي" className="h-9 w-auto object-contain"
                     width={135} height={36} />
              </div>
              <div className="min-w-0 hidden md:block">
                <h1 className="font-bold leading-tight truncate text-sm">أداة المشرف</h1>
                <p className="text-[11px] text-white/70 truncate">{catalogue.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode === "quote" && (
                <button type="button" onClick={resetForm} aria-label="تفريغ"
                        className="h-9 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-medium flex items-center transition-colors">
                  <RotateCcw className="h-4 w-4 sm:ml-1.5" />
                  <span className="hidden sm:inline">تفريغ</span>
                </button>
              )}
              <button type="button" onClick={endSession} aria-label="خروج"
                      className="h-9 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-sm font-medium flex items-center transition-colors">
                <LogOut className="h-4 w-4 sm:ml-1.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>

          {/* تبويبا الوضع — لا يظهران قبل الاختيار الأول */}
          {mode !== null && (
          <div className="border-t border-white/20 flex">
            {([
              { key: "quote", label: "تسعير", Icon: Calculator },
              { key: "inspection", label: "معاينة", Icon: ClipboardList },
              { key: "qc", label: "فحص الجودة", Icon: ShieldCheck },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-medium border-b-[3px] transition-colors",
                  // الأصفر علامة الهوية، ويقرأ بوضوح على الأزرق — وهو خارج
                  // قائمة الفحص فلا يلتبس بحكم «يحتاج إعادة»
                  mode === key
                    ? "border-brand-yellow text-white bg-white/10"
                    : "border-transparent text-white/80 hover:bg-white/10",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
          )}

          {/* شريط السعر — يبقى ظاهراً مهما نزل المشرف في الكتالوج */}
          {mode === "quote" && (
          <div className="bg-black/15 border-t border-white/15">
            <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-sm font-bold shrink-0 text-white/80">الإجمالي</span>
                <span className="text-xl font-bold text-brand-yellow tabular-nums">
                  {sar(quote.total)}
                </span>
                {quote.discountAmount > 0 && (
                  <span className="text-xs text-white/60 line-through tabular-nums hidden sm:inline">
                    {sar(quote.listTotal)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/70 shrink-0">
                {quote.lines.length > 0 && <span>{quote.lines.length} بند</span>}
                {quote.discountAmount > 0 && (
                  <span className="px-1.5 py-0.5 rounded font-semibold bg-white/20 text-white">
                    خصم {catalogue.discountPercent}٪
                  </span>
                )}
              </div>
            </div>
          </div>
          )}
        </header>

        {mode === null ? (
          <main className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
            {/* البحث أولاً: أكثر ما يُفتح له هذا الشاشة شكوى تحتاج ملف عميل */}
            <CustomerSearch
              token={token}
              initialQuery={customerQuery}
              onQueryChange={(next) => {
                setSearchParams(next ? { q: next } : {}, { replace: true });
              }}
              onOpenInspection={(inspectionId) => {
                setOpenInspectionId(inspectionId);
                setMode("inspection");
              }}
            />

            <div>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">وش تبي تسوي؟</h2>
              <span className="block w-12 h-1 rounded-full bg-brand-yellow mx-auto mt-2" aria-hidden />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                {
                  key: "quote", Icon: Calculator, label: "تسعير",
                  desc: "اختر الباقات والبنود من قائمة الأسعار واطلع بعرض جاهز للعميل",
                },
                {
                  key: "inspection", Icon: ClipboardList, label: "معاينة ميدانية",
                  desc: "سجّل معاينة الموقع بالمستويات والغرف وأرسل التقرير",
                },
                {
                  key: "qc", Icon: ShieldCheck, label: "فحص الجودة",
                  desc: "افحص الشغل بعد انتهائه بند بند مع الصور قبل التسليم للعميل",
                },
              ] as const).map(({ key, Icon, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className="group w-full h-full text-right bg-card border rounded-2xl p-5 shadow-clean hover:shadow-float hover:border-brand-blue hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center shrink-0 shadow-clean">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg">{label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue-dark opacity-0 group-hover:opacity-100 transition-opacity">
                    ابدأ
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
            </div>
          </main>
        ) : mode === "inspection" ? (
          <main className="max-w-6xl mx-auto px-4 pt-6">
            <InspectionForm token={token} openId={openInspectionId} />
          </main>
        ) : mode === "qc" ? (
          <main className="max-w-6xl mx-auto px-4 pt-6">
            <QualityControlForm token={token} />
          </main>
        ) : (
        <main className="max-w-6xl mx-auto px-4 pt-6 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ——— عمود الاختيار ——— */}
          <div className="space-y-5">
            {/* البحث */}
            <div className="bg-card border rounded-2xl shadow-clean p-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث في الكتالوج — اسم الخدمة أو كود KLN"
                  className="pr-9 pl-9"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="مسح البحث"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {search && (
                <div className="mt-3 space-y-1.5">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">لا توجد نتائج.</p>
                  ) : (
                    searchResults.map((item) => renderItemRow(item, item.group))
                  )}
                </div>
              )}
            </div>

            {!search && (
              <>
                {/* بلاطات المجموعات — الضغط على بلاطة يفتح بنودها بالأسفل */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {catalogue.groups.map((group) => {
                    const chosen = group.items.filter((item) => qtyOf(item.code) > 0).length;
                    const isOpen = openGroup === group.name;
                    return (
                      <button
                        key={group.name}
                        type="button"
                        onClick={() => setOpenGroup(isOpen ? null : group.name)}
                        className={cn(
                          "relative text-right rounded-xl border p-3 transition-colors",
                          isOpen
                            ? "border-primary bg-primary/10"
                            : chosen > 0
                              ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                              : "border-border bg-card hover:bg-muted",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {group.kind === "package"
                            ? <Package className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            : <PlusCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />}
                          <span className="text-sm font-medium leading-tight">{group.name}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1.5 pr-6">
                          {group.items.length} بند
                        </div>
                        {chosen > 0 && (
                          <span className="absolute top-2 left-2 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
                            {chosen}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* بنود المجموعة المفتوحة */}
                {openGroup && (() => {
                  const group = catalogue.groups.find((g) => g.name === openGroup);
                  if (!group) return null;
                  return (
                    <section
                      ref={openPanelRef}
                      className="bg-card border-2 border-primary/30 rounded-xl p-5 scroll-mt-32"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h2 className="font-bold flex items-center gap-2 min-w-0">
                          {group.kind === "package"
                            ? <Package className="h-4 w-4 text-primary shrink-0" />
                            : <PlusCircle className="h-4 w-4 text-muted-foreground shrink-0" />}
                          <span className="truncate">{group.name}</span>
                          <span className="text-[11px] font-normal text-muted-foreground shrink-0">
                            {group.kind === "package" ? "باقة أساسية" : "بند إضافي"}
                          </span>
                        </h2>
                        <button
                          type="button"
                          onClick={() => setOpenGroup(null)}
                          className="text-muted-foreground hover:text-foreground shrink-0"
                          aria-label="إغلاق المجموعة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {group.items.map((item) => renderItemRow(item))}
                      </div>
                    </section>
                  );
                })()}
              </>
            )}

            <section className="bg-card border rounded-2xl shadow-clean p-5">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-brand-yellow shrink-0" aria-hidden />
                بيانات العميل
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">الاسم</Label>
                  <Input id="name" value={customer.name}
                         onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">الجوال</Label>
                  <Input id="phone" inputMode="tel" placeholder="05xxxxxxxx" value={customer.phone}
                         onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="neighborhood">الحي / الموقع</Label>
                  <Input id="neighborhood" value={customer.neighborhood}
                         onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visitDate">تاريخ الزيارة</Label>
                  <Input id="visitDate" type="date" value={customer.visitDate}
                         onChange={(e) => setCustomer({ ...customer, visitDate: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5 mt-3">
                <Label htmlFor="notes">ملاحظات تظهر للعميل</Label>
                <Textarea id="notes" rows={2} value={customer.notes}
                          onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} />
              </div>
            </section>
          </div>

          {/* ——— عمود النتيجة ——— */}
          <aside className="lg:sticky lg:top-32 space-y-4">
            <div className="bg-card border rounded-2xl shadow-clean overflow-hidden">
              <div className="p-5">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-brand-yellow shrink-0" aria-hidden />
                  العرض
                  {quote.lines.length > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {quote.lines.length} بند
                    </span>
                  )}
                </h2>

                {quote.lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">اختر باقة أو بنداً من الكتالوج.</p>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    {quote.lines.map((line) => (
                      <div key={line.code} className="flex justify-between gap-3">
                        <span className="text-muted-foreground min-w-0">
                          {line.label}{line.qty > 1 && ` ×${line.qty}`}
                          <span className="block text-[11px] opacity-70">{line.group}</span>
                        </span>
                        <span className="tabular-nums shrink-0">{sar(line.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">قبل الخصم</span>
                  <span className="tabular-nums">{sar(quote.listTotal)}</span>
                </div>
                {quote.fixedTotal > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>منها بسعر ثابت (بلا خصم)</span>
                    <span className="tabular-nums">{sar(quote.fixedTotal)}</span>
                  </div>
                )}
                {quote.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>الخصم ({catalogue.discountPercent}٪)</span>
                    <span className="tabular-nums">−{sar(quote.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="bg-primary/10 px-5 py-4 border-t">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">الإجمالي</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">{sar(quote.total)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  شامل ضريبة {Math.round(catalogue.vatRate * 100)}٪ ({sar(quote.vatAmount)}) ·
                  الصافي {sar(quote.netBeforeVat)}
                </p>
                <div className="flex justify-between text-sm text-muted-foreground mt-1.5">
                  <span>العربون ({Math.round(catalogue.depositPercent * 100)}٪)</span>
                  <span className="tabular-nums">{sar(quote.deposit)}</span>
                </div>
              </div>
            </div>

            {/* الإرسال */}
            <div className="bg-card border rounded-2xl shadow-clean p-5 space-y-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={showCodes}
                       onChange={(e) => setShowCodes(e.target.checked)}
                       className="rounded border-border" />
                إظهار أكواد الخدمات للعميل
              </label>

              <Button className="w-full" onClick={sendToCustomer} disabled={quote.total <= 0}>
                <MessageCircle className="h-4 w-4 ml-2" />
                إرسال العرض واتساب
              </Button>
              <Button variant="outline" className="w-full" disabled={quote.total <= 0}
                      onClick={() => copy(customerQuote(), "تم نسخ عرض العميل")}>
                <Copy className="h-4 w-4 ml-2" />
                نسخ عرض العميل
              </Button>
              <Button variant="ghost" className="w-full" disabled={quote.total <= 0}
                      onClick={() => copy(
                        buildInternalSummary(catalogue, quote, customer),
                        "تم نسخ الملخص الداخلي")}>
                <Copy className="h-4 w-4 ml-2" />
                نسخ الملخص الداخلي
              </Button>
            </div>
          </aside>
        </main>
        )}
      </div>
    </>
  );
}
