import { useCallback, useEffect, useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator, Lock, LogOut, Loader2, Copy, MessageCircle, RotateCcw,
  AlertTriangle, TrendingUp, Minus, Plus, Search, X, Package, PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { calculateQuote, flattenCatalogue } from "@/lib/pricing/calculate";
import {
  buildCustomerQuote, buildInternalSummary, toWhatsAppNumber,
  type CustomerInfo,
} from "@/lib/pricing/quoteMessage";
import type { Catalogue, QuoteInput } from "@/lib/pricing/types";

const TOKEN_KEY = "kleenology_pricing_token";

const sar = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded.toLocaleString("en-US")} ر.س`;
};

const emptyCustomer: CustomerInfo = {
  name: "", phone: "", neighborhood: "", visitDate: "", notes: "",
};

function buildInitialInput(catalogue: Catalogue): QuoteInput {
  return {
    items: [],
    discountType: "percent",
    discountValue: catalogue.defaultDiscountPercent,
    workers: catalogue.cost.defaultWorkers,
    hours: 0,
  };
}

/* ————————————————————————— شاشة الدخول ————————————————————————— */

function LoginCard({ onSuccess }: { onSuccess: (token: string, catalogue: Catalogue) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pricing/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.token && data?.catalogue) {
        onSuccess(data.token, data.catalogue);
        return;
      }
      if (res.status === 429) setError("محاولات كثيرة خاطئة. انتظر عشر دقائق ثم أعد المحاولة.");
      else if (res.status === 503) setError("الصفحة غير مهيأة بعد — يلزم ضبط كلمة المرور في إعدادات Netlify.");
      else setError("كلمة المرور غير صحيحة.");
    } catch {
      setError("تعذّر الاتصال بالخادم. تحقق من الإنترنت وأعد المحاولة.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-card border rounded-2xl shadow-sm p-7 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold mb-1">تسعير كلينولوجي</h1>
        <p className="text-sm text-muted-foreground mb-6">صفحة داخلية لمشرف التسعير</p>

        <div className="text-right space-y-2 mb-4">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password" type="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="text-center tracking-widest" disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-destructive mb-4 leading-relaxed">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading || !password.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "دخول"}
        </Button>
      </form>
    </div>
  );
}

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
  const [showCodes, setShowCodes] = useState(false);

  const startSession = useCallback((newToken: string, newCatalogue: Catalogue) => {
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setCatalogue(newCatalogue);
    setInput((current) => current ?? buildInitialInput(newCatalogue));
  }, []);

  const endSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCatalogue(null);
    setInput(null);
    setCustomer(emptyCustomer);
  }, []);

  // استعادة الجلسة عند إعادة التحميل — الخادم هو من يقرر صلاحية التوكن
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setRestoring(false);
      return;
    }
    let cancelled = false;
    fetch("/api/pricing/catalogue", { headers: { Authorization: `Bearer ${saved}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("unauthorized"))))
      .then((data) => { if (!cancelled) startSession(saved, data.catalogue); })
      .catch(() => { if (!cancelled) sessionStorage.removeItem(TOKEN_KEY); })
      .finally(() => { if (!cancelled) setRestoring(false); });
    return () => { cancelled = true; };
  }, [startSession]);

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

  const marginPct = Math.round(quote.cost.marginPercent * 100);

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
    setInput(buildInitialInput(catalogue));
    setCustomer(emptyCustomer);
    setSearch("");
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

  const discountPct = input.discountType === "percent"
    ? input.discountValue
    : quote.discountableTotal > 0
        ? Math.round((quote.discountAmount / quote.discountableTotal) * 100)
        : 0;

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
        <header className="bg-card border-b sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold leading-tight truncate">تسعير كلينولوجي</h1>
                <p className="text-[11px] text-muted-foreground truncate">{catalogue.version}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <RotateCcw className="h-4 w-4 sm:ml-1.5" />
                <span className="hidden sm:inline">تفريغ</span>
              </Button>
              <Button variant="outline" size="sm" onClick={endSession}>
                <LogOut className="h-4 w-4 sm:ml-1.5" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>

          {/* شريط السعر — يبقى ظاهراً مهما نزل المشرف في الكتالوج */}
          <div className="bg-primary/10 border-t">
            <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-sm font-bold shrink-0">الإجمالي</span>
                <span className="text-xl font-bold text-primary tabular-nums">
                  {sar(quote.total)}
                </span>
                {quote.discountAmount > 0 && (
                  <span className="text-xs text-muted-foreground line-through tabular-nums hidden sm:inline">
                    {sar(quote.listTotal)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                {quote.lines.length > 0 && <span>{quote.lines.length} بند</span>}
                {quote.total > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded font-semibold",
                      quote.cost.belowMinimum
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    هامش {marginPct}٪
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 pt-6 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ——— عمود الاختيار ——— */}
          <div className="space-y-5">
            {/* البحث */}
            <div className="bg-card border rounded-xl p-4">
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

            {!search && catalogue.groups.map((group) => (
              <section key={group.name} className="bg-card border rounded-xl p-5">
                <h2 className="font-bold mb-3 flex items-center gap-2">
                  {group.kind === "package"
                    ? <Package className="h-4 w-4 text-primary" />
                    : <PlusCircle className="h-4 w-4 text-muted-foreground" />}
                  {group.name}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {group.kind === "package" ? "باقة أساسية" : "بند إضافي"}
                  </span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-2">
                  {group.items.map((item) => renderItemRow(item))}
                </div>
              </section>
            ))}

            <section className="bg-card border rounded-xl p-5">
              <h2 className="font-bold mb-4">بيانات العميل</h2>
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
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-5">
                <h2 className="font-bold mb-3">
                  العرض
                  {quote.lines.length > 0 && (
                    <span className="text-xs font-normal text-muted-foreground mr-2">
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

              {/* الخصم */}
              <div className="px-5 py-4 border-t bg-muted/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Label className="text-sm">الخصم</Label>
                  <div className="flex gap-1">
                    {(["percent", "fixed"] as const).map((type) => (
                      <button
                        key={type} type="button"
                        onClick={() => patch({ discountType: type, discountValue: 0 })}
                        className={cn(
                          "px-2 py-1 rounded-md border text-[11px] font-medium",
                          input.discountType === type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {type === "percent" ? "نسبة ٪" : "مبلغ ر.س"}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  inputMode="decimal"
                  value={input.discountValue || ""}
                  placeholder="0"
                  onChange={(e) =>
                    patch({ discountValue: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })
                  }
                />
                {input.discountType === "percent" && input.discountValue !== catalogue.defaultDiscountPercent && (
                  <button
                    type="button"
                    className="text-[11px] text-primary underline mt-1.5"
                    onClick={() => patch({ discountValue: catalogue.defaultDiscountPercent })}
                  >
                    رجّع الخصم المعتاد ({catalogue.defaultDiscountPercent}٪)
                  </button>
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
                    <span>الخصم ({discountPct}٪)</span>
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

            {/* الربحية */}
            <div className={cn(
              "border rounded-xl p-5",
              quote.cost.belowMinimum ? "border-red-300 bg-red-50" : "border-emerald-300 bg-emerald-50",
            )}>
              <div className="flex items-center gap-2 mb-3">
                {quote.cost.belowMinimum
                  ? <AlertTriangle className="h-4 w-4 text-red-600" />
                  : <TrendingUp className="h-4 w-4 text-emerald-600" />}
                <h2 className="font-bold text-sm">الربحية — داخلي فقط</h2>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="space-y-1">
                  <Label htmlFor="workers" className="text-xs">عدد العمال</Label>
                  <Input id="workers" inputMode="numeric" className="h-8" value={input.workers}
                         onChange={(e) => patch({ workers: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="hours" className="text-xs">عدد الساعات</Label>
                  <Input id="hours" inputMode="decimal" className="h-8" value={input.hours || ""}
                         onChange={(e) => patch({ hours: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })} />
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">العمالة</span>
                  <span className="tabular-nums">{sar(quote.cost.labor)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النقل</span>
                  <span className="tabular-nums">{sar(quote.cost.transport)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المواد</span>
                  <span className="tabular-nums">{sar(quote.cost.supplies)}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 font-medium">
                  <span>إجمالي التكلفة</span>
                  <span className="tabular-nums">{sar(quote.cost.total)}</span>
                </div>
                <div className={cn(
                  "flex justify-between font-bold",
                  quote.cost.belowMinimum ? "text-red-700" : "text-emerald-700",
                )}>
                  <span>الربح</span>
                  <span className="tabular-nums">{sar(quote.cost.profit)} ({marginPct}٪)</span>
                </div>
              </div>

              {quote.cost.belowMinimum && (
                <p className="text-xs text-red-700 mt-3 leading-relaxed">
                  الهامش أقل من الحد المقبول ({Math.round(catalogue.cost.minMarginPercent * 100)}٪).
                  راجع الخصم أو عدد الساعات قبل إرسال العرض.
                </p>
              )}
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                أجر الساعة {sar(quote.hourlyWage)} — مشتق من رواتب{" "}
                {catalogue.cost.monthlyPayroll.toLocaleString("en-US")} ر.س شهرياً لفريق{" "}
                {catalogue.cost.crewSize} عمال بنسبة استغلال{" "}
                {Math.round(catalogue.cost.utilization * 100)}٪.
                <br />
                الهامش محسوب على الصافي بعد استبعاد الضريبة.
              </p>
            </div>

            {/* الإرسال */}
            <div className="bg-card border rounded-xl p-5 space-y-3">
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
                        buildInternalSummary(catalogue, quote, customer,
                          { workers: input.workers, hours: input.hours }),
                        "تم نسخ الملخص الداخلي")}>
                <Copy className="h-4 w-4 ml-2" />
                نسخ الملخص الداخلي
              </Button>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
