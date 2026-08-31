import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calculator, Lock, LogOut, Loader2, Copy, MessageCircle, RotateCcw,
  Home, Building2, LayoutGrid, AlertTriangle, TrendingUp, Minus, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { calculateQuote, suggestHours } from "@/lib/pricing/calculate";
import {
  buildCustomerQuote, buildInternalSummary, toWhatsAppNumber,
  type CustomerInfo,
} from "@/lib/pricing/quoteMessage";
import type { PricingRates, QuoteInput } from "@/lib/pricing/types";

const TOKEN_KEY = "kleenology_pricing_token";

const PROPERTY_ICONS: Record<string, typeof Home> = {
  villa: LayoutGrid,
  apartment: Home,
  office: Building2,
};

const CONDITION_STYLES: Record<string, string> = {
  clean:  "border-emerald-300 bg-emerald-50 text-emerald-700",
  medium: "border-amber-300 bg-amber-50 text-amber-700",
  deep:   "border-red-300 bg-red-50 text-red-700",
};

const sar = (value: number) => `${value.toLocaleString("en-US")} ر.س`;

const emptyCustomer: CustomerInfo = {
  name: "", phone: "", neighborhood: "", visitDate: "", notes: "",
};

function buildInitialInput(rates: PricingRates): QuoteInput {
  return {
    propertyType: Object.keys(rates.propertyTypes)[0] ?? "",
    areaSqm: 0,
    floors: 1,
    serviceType: rates.serviceTypes[0]?.key ?? "",
    urgency: rates.urgencies[0]?.key ?? "",
    rooms: [],
    extras: [],
    discountType: "percent",
    discountValue: 0,
    workers: rates.cost.defaultWorkers,
    hours: 0,
  };
}

/* ————————————————————————— شاشة الدخول ————————————————————————— */

function LoginCard({ onSuccess }: { onSuccess: (token: string, rates: PricingRates) => void }) {
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

      if (res.ok && data?.token && data?.rates) {
        onSuccess(data.token, data.rates);
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
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-card border rounded-2xl shadow-sm p-7 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold mb-1">تسعير كلينولوجي</h1>
        <p className="text-sm text-muted-foreground mb-6">
          صفحة داخلية لمشرف التسعير
        </p>

        <div className="text-right space-y-2 mb-4">
          <Label htmlFor="password">كلمة المرور</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center tracking-widest"
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive mb-4 leading-relaxed">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading || !password.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "دخول"}
        </Button>
      </form>
    </div>
  );
}

/* ————————————————————————— عناصر مساعدة ————————————————————————— */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-card border rounded-xl p-5">
      <h2 className="font-bold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Chip({
  active, onClick, children, className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}

function QtyStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-muted"
        aria-label="إنقاص"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
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
  const [rates, setRates] = useState<PricingRates | null>(null);
  const [restoring, setRestoring] = useState(true);

  const [input, setInput] = useState<QuoteInput | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo>(emptyCustomer);
  const [itemized, setItemized] = useState(true);
  const hoursTouched = useRef(false);

  const startSession = useCallback((newToken: string, newRates: PricingRates) => {
    sessionStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setRates(newRates);
    setInput((current) => current ?? buildInitialInput(newRates));
  }, []);

  const endSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setRates(null);
    setInput(null);
    setCustomer(emptyCustomer);
    hoursTouched.current = false;
  }, []);

  // استعادة الجلسة عند إعادة تحميل الصفحة — الخادم هو من يقرر صلاحية التوكن
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setRestoring(false);
      return;
    }
    let cancelled = false;
    fetch("/api/pricing/rates", { headers: { Authorization: `Bearer ${saved}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("unauthorized"))))
      .then((data) => {
        if (cancelled) return;
        startSession(saved, data.rates);
      })
      .catch(() => {
        if (!cancelled) sessionStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });
    return () => { cancelled = true; };
  }, [startSession]);

  const patch = useCallback((changes: Partial<QuoteInput>) => {
    setInput((current) => (current ? { ...current, ...changes } : current));
  }, []);

  const quote = useMemo(
    () => (rates && input ? calculateQuote(rates, input) : null),
    [rates, input],
  );

  // اقتراح عدد الساعات تلقائياً ما لم يعدّله المشرف بنفسه
  useEffect(() => {
    if (!rates || !input || hoursTouched.current) return;
    const service = rates.serviceTypes.find((s) => s.key === input.serviceType);
    const suggested = suggestHours(input.areaSqm, input.workers, service?.sqmPerWorkerHour ?? 0);
    if (input.areaSqm > 0 && suggested !== input.hours) {
      patch({ hours: suggested });
    }
  }, [rates, input, patch]);

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!token || !rates || !input || !quote) {
    return (
      <>
        <SEO
          title="تسعير كلينولوجي"
          description="صفحة داخلية"
          url="https://kleenology.me/admin/pricing"
          noindex
        />
        <div dir="rtl">
          <LoginCard onSuccess={startSession} />
        </div>
      </>
    );
  }

  /* ——— معالجات النموذج ——— */

  const toggleRoom = (key: string) => {
    const exists = input.rooms.some((r) => r.key === key);
    patch({
      rooms: exists
        ? input.rooms.filter((r) => r.key !== key)
        : [...input.rooms, { key, qty: 1, condition: rates.conditions[1]?.key ?? "medium" }],
    });
  };

  const updateRoom = (key: string, changes: Partial<{ qty: number; condition: string }>) => {
    patch({ rooms: input.rooms.map((r) => (r.key === key ? { ...r, ...changes } : r)) });
  };

  const toggleExtra = (key: string) => {
    const exists = input.extras.some((e) => e.key === key);
    patch({
      extras: exists
        ? input.extras.filter((e) => e.key !== key)
        : [...input.extras, { key, qty: 1 }],
    });
  };

  const updateExtraQty = (key: string, qty: number) => {
    patch({ extras: input.extras.map((e) => (e.key === key ? { ...e, qty } : e)) });
  };

  const resetForm = () => {
    setInput(buildInitialInput(rates));
    setCustomer(emptyCustomer);
    hoursTouched.current = false;
    toast.success("تم تفريغ النموذج");
  };

  const customerQuote = () =>
    buildCustomerQuote(rates, input, quote, customer, { itemized });

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
    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(customerQuote())}`,
      "_blank",
    );
  };

  const marginPct = Math.round(quote.cost.marginPercent * 100);
  const service = rates.serviceTypes.find((s) => s.key === input.serviceType);

  return (
    <>
      <SEO
        title="تسعير كلينولوجي"
        description="صفحة داخلية"
        url="https://kleenology.me/admin/pricing"
        noindex
      />

      <div dir="rtl" className="min-h-screen bg-muted/30 pb-16">
        {/* الشريط العلوي */}
        <header className="bg-card border-b sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold leading-tight truncate">تسعير كلينولوجي</h1>
                <p className="text-[11px] text-muted-foreground truncate">
                  التسعيرة {rates.version}
                </p>
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
        </header>

        <main className="max-w-6xl mx-auto px-4 pt-6 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ——— عمود المدخلات ——— */}
          <div className="space-y-5">
            <Section title="نوع العقار">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(rates.propertyTypes).map(([key, type]) => {
                  const Icon = PROPERTY_ICONS[key] ?? Home;
                  return (
                    <Chip
                      key={key}
                      active={input.propertyType === key}
                      onClick={() => patch({ propertyType: key })}
                      className="flex flex-col items-center gap-1.5 py-3"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs leading-tight text-center">{type.label}</span>
                    </Chip>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="area">المساحة (م²)</Label>
                  <Input
                    id="area"
                    inputMode="numeric"
                    value={input.areaSqm || ""}
                    onChange={(e) => patch({ areaSqm: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                    placeholder="مثال: 250"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="floors">عدد الأدوار</Label>
                  <Input
                    id="floors"
                    inputMode="numeric"
                    value={input.floors}
                    onChange={(e) => patch({ floors: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) })}
                  />
                </div>
              </div>
            </Section>

            <Section title="نوع الخدمة والموعد">
              <div className="flex flex-wrap gap-2 mb-4">
                {rates.serviceTypes.map((type) => (
                  <Chip
                    key={type.key}
                    active={input.serviceType === type.key}
                    onClick={() => patch({ serviceType: type.key })}
                  >
                    {type.label}
                    <span className="text-[11px] opacity-70 mr-1.5">×{type.multiplier}</span>
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {rates.urgencies.map((urgency) => (
                  <Chip
                    key={urgency.key}
                    active={input.urgency === urgency.key}
                    onClick={() => patch({ urgency: urgency.key })}
                  >
                    {urgency.label}
                    {urgency.multiplier !== 1 && (
                      <span className="text-[11px] opacity-70 mr-1.5">
                        +{Math.round((urgency.multiplier - 1) * 100)}٪
                      </span>
                    )}
                  </Chip>
                ))}
              </div>
            </Section>

            <Section title="الغرف وحالتها">
              <div className="flex flex-wrap gap-2 mb-4">
                {rates.rooms.map((room) => (
                  <Chip
                    key={room.key}
                    active={input.rooms.some((r) => r.key === room.key)}
                    onClick={() => toggleRoom(room.key)}
                  >
                    {room.label}
                  </Chip>
                ))}
              </div>

              {input.rooms.length === 0 ? (
                <p className="text-sm text-muted-foreground">اختر الغرف المشمولة في الخدمة.</p>
              ) : (
                <div className="space-y-2">
                  {input.rooms.map((selected) => {
                    const room = rates.rooms.find((r) => r.key === selected.key);
                    if (!room) return null;
                    return (
                      <div
                        key={selected.key}
                        className="flex flex-wrap items-center justify-between gap-3 border rounded-lg p-3 bg-background"
                      >
                        <span className="font-medium text-sm">{room.label}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {rates.conditions.map((condition) => (
                              <button
                                key={condition.key}
                                type="button"
                                onClick={() => updateRoom(selected.key, { condition: condition.key })}
                                className={cn(
                                  "px-2 py-1 rounded-md border text-[11px] font-medium transition-colors",
                                  selected.condition === condition.key
                                    ? CONDITION_STYLES[condition.key]
                                    : "border-border text-muted-foreground hover:bg-muted",
                                )}
                              >
                                {condition.label}
                              </button>
                            ))}
                          </div>
                          <QtyStepper
                            value={selected.qty}
                            onChange={(qty) => updateRoom(selected.key, { qty })}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            <Section title="إضافات">
              <div className="flex flex-wrap gap-2 mb-4">
                {rates.extras.map((extra) => (
                  <Chip
                    key={extra.key}
                    active={input.extras.some((e) => e.key === extra.key)}
                    onClick={() => toggleExtra(extra.key)}
                  >
                    {extra.label}
                  </Chip>
                ))}
              </div>

              {input.extras.length > 0 && (
                <div className="space-y-2">
                  {input.extras.map((selected) => {
                    const extra = rates.extras.find((e) => e.key === selected.key);
                    if (!extra) return null;
                    return (
                      <div
                        key={selected.key}
                        className="flex items-center justify-between gap-3 border rounded-lg p-3 bg-background"
                      >
                        <span className="text-sm">
                          <span className="font-medium">{extra.label}</span>
                          <span className="text-muted-foreground text-xs mr-2">
                            {extra.price} ر.س / {extra.unit}
                          </span>
                        </span>
                        <QtyStepper
                          value={selected.qty}
                          onChange={(qty) => updateExtraQty(selected.key, qty)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            <Section title="الخصم">
              <div className="flex items-end gap-3">
                <div className="flex gap-2">
                  <Chip
                    active={input.discountType === "percent"}
                    onClick={() => patch({ discountType: "percent" })}
                  >
                    نسبة ٪
                  </Chip>
                  <Chip
                    active={input.discountType === "fixed"}
                    onClick={() => patch({ discountType: "fixed" })}
                  >
                    مبلغ ر.س
                  </Chip>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="discount">القيمة</Label>
                  <Input
                    id="discount"
                    inputMode="numeric"
                    value={input.discountValue || ""}
                    onChange={(e) =>
                      patch({ discountValue: Number(e.target.value.replace(/\D/g, "")) || 0 })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </Section>

            <Section title="الطاقم والتكلفة (داخلي)">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="workers">عدد العمال</Label>
                  <Input
                    id="workers"
                    inputMode="numeric"
                    value={input.workers}
                    onChange={(e) =>
                      patch({ workers: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hours">عدد الساعات</Label>
                  <Input
                    id="hours"
                    inputMode="decimal"
                    value={input.hours || ""}
                    onChange={(e) => {
                      hoursTouched.current = true;
                      patch({ hours: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 });
                    }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                المقترح لهذه المساحة: <strong>{quote.suggestedHours} ساعة</strong>
                {service && ` (${service.label} — ${service.sqmPerWorkerHour} م² للعامل في الساعة)`}
                {hoursTouched.current && (
                  <button
                    type="button"
                    className="text-primary underline mr-2"
                    onClick={() => {
                      hoursTouched.current = false;
                      patch({ hours: quote.suggestedHours });
                    }}
                  >
                    استخدم المقترح
                  </button>
                )}
              </p>
            </Section>

            <Section title="بيانات العميل">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">الجوال</Label>
                  <Input
                    id="phone"
                    inputMode="tel"
                    placeholder="05xxxxxxxx"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="neighborhood">الحي / الموقع</Label>
                  <Input
                    id="neighborhood"
                    value={customer.neighborhood}
                    onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="visitDate">تاريخ الزيارة</Label>
                  <Input
                    id="visitDate"
                    type="date"
                    value={customer.visitDate}
                    onChange={(e) => setCustomer({ ...customer, visitDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5 mt-3">
                <Label htmlFor="notes">ملاحظات تظهر للعميل</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={customer.notes}
                  onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                />
              </div>
            </Section>
          </div>

          {/* ——— عمود النتيجة ——— */}
          <aside className="lg:sticky lg:top-20 space-y-4">
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="p-5">
                <h2 className="font-bold mb-3">تفصيل السعر</h2>

                {quote.lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    أدخل المساحة واختر الغرف ليظهر السعر.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-sm">
                    {quote.lines.map((line, index) => (
                      <div key={index} className="flex justify-between gap-3">
                        <span className="text-muted-foreground min-w-0">
                          {line.label}
                          {line.detail && (
                            <span className="block text-[11px] opacity-70">{line.detail}</span>
                          )}
                        </span>
                        <span className="tabular-nums shrink-0">{sar(line.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t mt-4 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">مجموع البنود</span>
                    <span className="tabular-nums">{sar(quote.itemsSubtotal)}</span>
                  </div>
                  {quote.serviceMultiplier !== 1 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">معامل الخدمة</span>
                      <span className="tabular-nums">×{quote.serviceMultiplier}</span>
                    </div>
                  )}
                  {quote.urgencyMultiplier !== 1 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">معامل الاستعجال</span>
                      <span className="tabular-nums">×{quote.urgencyMultiplier}</span>
                    </div>
                  )}
                  {quote.minChargeApplied && (
                    <div className="flex justify-between text-amber-600">
                      <span>رُفع للحد الأدنى</span>
                      <span className="tabular-nums">{sar(rates.minCharge)}</span>
                    </div>
                  )}
                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>الخصم</span>
                      <span className="tabular-nums">−{sar(quote.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الصافي قبل الضريبة</span>
                    <span className="tabular-nums">{sar(quote.netBeforeVat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      ضريبة {Math.round(rates.vatRate * 100)}٪
                    </span>
                    <span className="tabular-nums">{sar(quote.vatAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 px-5 py-4 border-t">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold">الإجمالي النهائي</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">
                    {sar(quote.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>العربون ({Math.round(rates.depositPercent * 100)}٪)</span>
                  <span className="tabular-nums">{sar(quote.deposit)}</span>
                </div>
              </div>
            </div>

            {/* الربحية — داخلي */}
            <div
              className={cn(
                "border rounded-xl p-5",
                quote.cost.belowMinimum ? "border-red-300 bg-red-50" : "border-emerald-300 bg-emerald-50",
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                {quote.cost.belowMinimum ? (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                )}
                <h2 className="font-bold text-sm">الربحية — داخلي فقط</h2>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    العمالة ({input.workers}×{input.hours} ساعة)
                  </span>
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
                <div
                  className={cn(
                    "flex justify-between font-bold",
                    quote.cost.belowMinimum ? "text-red-700" : "text-emerald-700",
                  )}
                >
                  <span>الربح</span>
                  <span className="tabular-nums">
                    {sar(quote.cost.profit)} ({marginPct}٪)
                  </span>
                </div>
              </div>

              {quote.cost.belowMinimum && (
                <p className="text-xs text-red-700 mt-3 leading-relaxed">
                  الهامش أقل من الحد المقبول ({Math.round(rates.cost.minMarginPercent * 100)}٪).
                  راجع الخصم أو عدد الساعات قبل إرسال العرض.
                </p>
              )}
            </div>

            {/* الإرسال */}
            <div className="bg-card border rounded-xl p-5 space-y-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemized}
                  onChange={(e) => setItemized(e.target.checked)}
                  className="rounded border-border"
                />
                إظهار تفصيل البنود للعميل
              </label>

              <Button className="w-full" onClick={sendToCustomer} disabled={quote.total <= 0}>
                <MessageCircle className="h-4 w-4 ml-2" />
                إرسال العرض واتساب
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copy(customerQuote(), "تم نسخ عرض العميل")}
                disabled={quote.total <= 0}
              >
                <Copy className="h-4 w-4 ml-2" />
                نسخ عرض العميل
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() =>
                  copy(buildInternalSummary(rates, input, quote, customer), "تم نسخ الملخص الداخلي")
                }
                disabled={quote.total <= 0}
              >
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
