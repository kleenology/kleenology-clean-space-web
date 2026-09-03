import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator, Lock, LogOut, Loader2, Copy, MessageCircle, RotateCcw,
  Minus, Plus, Search, X, Package, PlusCircle, ClipboardList, Eye, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { calculateQuote, flattenCatalogue } from "@/lib/pricing/calculate";
import {
  buildCustomerQuote, buildInternalSummary, toWhatsAppNumber,
  type CustomerInfo,
} from "@/lib/pricing/quoteMessage";
import type { Catalogue, QuoteInput } from "@/lib/pricing/types";
import { InspectionForm } from "@/components/pricing/InspectionForm";

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

/* ————————————————————————— شاشة الدخول ————————————————————————— */

function LoginCard({ onSuccess }: { onSuccess: (token: string, catalogue: Catalogue) => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
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
    <div className="min-h-screen relative flex items-center justify-center px-5 py-10 overflow-hidden bg-gradient-to-br from-brand-blue to-brand-blue-dark">
      {/* فقاعات خفيفة تعطي إحساس النظافة بلا تشتيت */}
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/10" aria-hidden />
      <div className="absolute -bottom-28 -left-20 w-96 h-96 rounded-full bg-white/5" aria-hidden />

      <form
        onSubmit={submit}
        className="relative w-full max-w-sm bg-card rounded-2xl shadow-2xl px-6 py-8 sm:px-8"
      >
        <img
          src="/logo.png"
          alt="كلينولوجي"
          className="h-16 mx-auto mb-5 object-contain"
          width={240}
          height={64}
        />

        <div className="text-center mb-6">
          <h1 className="text-lg font-bold">أداة التسعير والمعاينة</h1>
          <p className="text-sm text-muted-foreground mt-0.5">للاستخدام الداخلي فقط</p>
        </div>

        <div className="space-y-2 mb-5">
          <Label htmlFor="password">كلمة المرور</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-center tracking-widest pl-11"
              disabled={loading}
            />
            {/* إظهار الحرف يمنع الأخطاء المتكررة عند الكتابة على الجوال */}
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center mb-4 leading-relaxed bg-destructive/5 border border-destructive/20 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full h-12 text-base" disabled={loading || !password.trim()}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "دخول"}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center mt-5 flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3" />
          صفحة محمية — الأسعار لا تغادر الخادم قبل الدخول
        </p>
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
  // لا وضع مختاراً عند الدخول — المشرف يقرر أولاً ماذا يفعل
  const [mode, setMode] = useState<"quote" | "inspection" | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
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
              {mode === "quote" && (
                <Button variant="ghost" size="sm" onClick={resetForm} aria-label="تفريغ">
                  <RotateCcw className="h-4 w-4 sm:ml-1.5" />
                  <span className="hidden sm:inline">تفريغ</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={endSession} aria-label="خروج">
                <LogOut className="h-4 w-4 sm:ml-1.5" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          </div>

          {/* تبويبا الوضع — لا يظهران قبل الاختيار الأول */}
          {mode !== null && (
          <div className="border-t flex">
            {([
              { key: "quote", label: "تسعير", Icon: Calculator },
              { key: "inspection", label: "معاينة ميدانية", Icon: ClipboardList },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  mode === key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:bg-muted",
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
                {quote.discountAmount > 0 && (
                  <span className="px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-700">
                    خصم {catalogue.discountPercent}٪
                  </span>
                )}
              </div>
            </div>
          </div>
          )}
        </header>

        {mode === null ? (
          <main className="max-w-md mx-auto px-4 pt-10">
            <p className="text-center text-muted-foreground mb-6">وش تبي تسوي؟</p>
            <div className="space-y-3">
              {([
                {
                  key: "quote", Icon: Calculator, label: "تسعير",
                  desc: "اختر الباقات والبنود من قائمة الأسعار واطلع بعرض جاهز للعميل",
                },
                {
                  key: "inspection", Icon: ClipboardList, label: "معاينة ميدانية",
                  desc: "سجّل معاينة الموقع بالمستويات والغرف وأرسل التقرير",
                },
              ] as const).map(({ key, Icon, label, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                  className="w-full text-right bg-card border rounded-xl p-5 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg">{label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
          </main>
        ) : mode === "inspection" ? (
          <main className="max-w-2xl mx-auto px-4 pt-6">
            <InspectionForm token={token} />
          </main>
        ) : (
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
