import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, RefreshCw, Check, Trash2, Copy, MessageCircle, FileText, Ban, Play, X, Plus, Info, Pencil, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  loadPartnersData, updatePartner, updateLead, settleOrders, addOrder, removeOrder,
  deleteRecord, submitLead, unsettledOrders, unlockPartners,
  PartnersError, PARTNER_STATUS_LABEL, LEAD_STATUS_LABEL, LEAD_STATUS_ORDER,
  displayCode, partnerLink, approvalMessage, whatsappUrl, buildStatement, commissionOf, sar,
  type Partner, type Lead, type LeadStatus,
} from "@/lib/partners/api";

const fail = (error: unknown) =>
  toast.error(error instanceof PartnersError ? error.message : "تعذّر الاتصال بالخادم");

// نموذج فتح تبويب الشركاء بكلمة السر المنفصلة (يظهر فقط إذا فعّل المالك القفل)
function PartnersUnlock({ token, onUnlocked }: { token: string; onUnlocked: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    try {
      await unlockPartners(token, password);
      onUnlocked();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto text-center py-12">
      <div className="w-14 h-14 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto mb-4">
        <Lock className="h-7 w-7" />
      </div>
      <h2 className="text-lg font-bold mb-1">تبويب الشركاء مقفل</h2>
      <p className="text-sm text-muted-foreground mb-6">
        هذا القسم للمالك والمشرف المعتمد فقط. أدخل كلمة سر الشركاء للمتابعة.
      </p>
      <Input
        type="password" autoComplete="off" dir="ltr"
        className="h-12 text-center tracking-widest mb-3"
        placeholder="كلمة سر الشركاء"
        value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy}
      />
      <Button type="submit" className="w-full h-12" disabled={busy || !password.trim()}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "فتح التبويب"}
      </Button>
    </form>
  );
}

const dateAr = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "short", year: "numeric" }) : "";

const statusTone: Record<LeadStatus, string> = {
  new: "bg-sky-100 text-sky-800",
  quoted: "bg-indigo-100 text-indigo-800",
  active: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-700",
};

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card border rounded-2xl shadow-clean p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-bold text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatementView({ partner, leads, token, onClose, onSettled }: {
  partner: Partner; leads: Lead[]; token: string; onClose: () => void; onSettled: () => void;
}) {
  const { text, payable, total } = useMemo(() => buildStatement(partner, leads), [partner, leads]);
  const [busy, setBusy] = useState(false);

  const settle = async () => {
    if (!window.confirm(`تعليم ${payable.length} عمولة بإجمالي ${sar(total)} كمدفوعة؟`)) return;
    setBusy(true);
    try {
      await settleOrders(token, payable.map(({ lead, order }) => ({ id: lead.id, orderId: order.id })));
      onSettled();
      toast.success("تم تعليم العمولات كمدفوعة");
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-2 border-primary/30 rounded-xl p-4 bg-primary/5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">كشف {partner.company}</h3>
        <button type="button" onClick={onClose} aria-label="إغلاق"><X className="h-4 w-4" /></button>
      </div>
      <pre className="whitespace-pre-wrap text-sm bg-white border rounded-lg p-3 font-sans leading-relaxed max-h-80 overflow-y-auto">{text}</pre>
      <div className="flex flex-wrap gap-2">
        <a href={whatsappUrl(partner.phone, text)} target="_blank" rel="noopener noreferrer">
          <Button size="sm"><MessageCircle className="h-4 w-4 ml-1.5" />إرسال الكشف واتساب</Button>
        </a>
        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(text).then(() => toast.success("تم النسخ"))}>
          <Copy className="h-4 w-4 ml-1.5" />نسخ
        </Button>
        {payable.length > 0 && (
          <Button size="sm" variant="secondary" onClick={settle} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 ml-1.5" />تم التحويل — علّمها مدفوعة</>}
          </Button>
        )}
      </div>
      {partner.iban
        ? <p className="text-xs text-muted-foreground" dir="ltr">IBAN: {partner.iban}</p>
        : <p className="text-xs text-amber-700">ما فيه آيبان — أضفه من زر ✎ عند الشريك قبل التحويل.</p>}
    </div>
  );
}

function AddLead({ partners, onAdded }: { partners: Partner[]; onAdded: () => void }) {
  const approved = partners.filter((p) => p.status === "approved");
  const [form, setForm] = useState({ code: "", customerName: "", phone: "", neighborhood: "" });
  const [busy, setBusy] = useState(false);
  const set = (c: Partial<typeof form>) => setForm((f) => ({ ...f, ...c }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitLead({ ...form, serviceType: "", notes: "أضيف من لوحة الإدارة", source: "partner" });
      toast.success("أضيف العميل");
      setForm({ code: form.code, customerName: "", phone: "", neighborhood: "" });
      onAdded();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  };

  if (!approved.length) return null;
  return (
    <form onSubmit={submit} className="grid sm:grid-cols-5 gap-2 items-end mb-4 p-3 rounded-xl bg-muted/50">
      <div className="space-y-1">
        <Label className="text-xs">الشريك</Label>
        <select required value={form.code} onChange={(e) => set({ code: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
          <option value="">اختر…</option>
          {approved.map((p) => <option key={p.id} value={p.id}>{p.company}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">اسم العميل</Label>
        <Input required className="h-9" value={form.customerName} onChange={(e) => set({ customerName: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">الجوال</Label>
        <Input required className="h-9" dir="ltr" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">الحي</Label>
        <Input className="h-9" value={form.neighborhood} onChange={(e) => set({ neighborhood: e.target.value })} />
      </div>
      <Button type="submit" size="sm" className="h-9" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 ml-1" />إضافة</>}
      </Button>
      <p className="sm:col-span-5 text-[11px] text-muted-foreground">
        لعميل حجز على الواتس وذكر كود شريك.
      </p>
    </form>
  );
}

function LeadRow({ lead, token, onChange, onDelete }: {
  lead: Lead; token: string; onChange: (lead: Lead) => void; onDelete: (id: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = async (request: Promise<{ lead: Lead }>) => {
    try {
      const { lead: next } = await request;
      onChange({ ...next, id: lead.id });
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  };

  const addPaidOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("اكتب مبلغ الطلب قبل الضريبة");
      return;
    }
    setBusy(true);
    if (await apply(addOrder(token, lead.id, value))) {
      setAmount("");
      toast.success(`أضيف الطلب — عمولة ${sar(commissionOf(value))}`);
    }
    setBusy(false);
  };

  const remove = async () => {
    if (!window.confirm(`حذف ${lead.customerName}؟ لا يمكن التراجع.`)) return;
    try {
      await deleteRecord(token, "lead", lead.id);
      onDelete(lead.id);
    } catch (error) {
      fail(error);
    }
  };

  const total = lead.orders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className={cn("border rounded-xl p-3 space-y-2", !lead.eligible && "bg-muted/60")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold">{lead.customerName}
            <span className="text-xs text-muted-foreground font-normal mr-2" dir="ltr">{lead.phone}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {[lead.partnerName, lead.neighborhood, lead.serviceType, dateAr(lead.createdAt),
              lead.source === "link" ? "من رابط الشريك" : ""].filter(Boolean).join(" · ")}
          </div>
          {lead.notes && <div className="text-xs mt-1">{lead.notes}</div>}
        </div>
        <span className={cn("text-xs font-semibold rounded-full px-2.5 py-1", statusTone[lead.status])}>
          {LEAD_STATUS_LABEL[lead.status]}
        </span>
      </div>

      {lead.customerDiscount && lead.orders.length === 0 ? (
        <div className="text-xs font-semibold text-brand-blue-deeper bg-brand-yellow/25 rounded px-2 py-1 w-fit">
          🎁 للعميل خصم {lead.customerDiscount}٪ على أول طلب — اخصمه قبل ما تكتب المبلغ
        </div>
      ) : null}

      {lead.duplicateNote && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700">
          <Info className="h-3.5 w-3.5" />
          {lead.duplicateNote} — انتبه لا تسجّل نفس الطلب عند الاثنين
        </div>
      )}

      {lead.orders.length > 0 && (
        <div className="rounded-lg border bg-background divide-y text-xs">
          {lead.orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5">
              <span>{dateAr(order.paidAt)} · {sar(order.amount)}</span>
              <span className="flex items-center gap-2">
                <span className={order.settledAt ? "text-muted-foreground" : "text-green-700 font-semibold"}>
                  عمولة {sar(commissionOf(order.amount))} {order.settledAt ? `· صُرفت ${dateAr(order.settledAt)}` : "· مستحقة"}
                </span>
                {!order.settledAt && (
                  <button type="button" aria-label="حذف الطلب"
                          onClick={() => window.confirm("حذف هذا الطلب؟") && apply(removeOrder(token, lead.id, order.id))}>
                    <X className="h-3.5 w-3.5 text-red-600" />
                  </button>
                )}
              </span>
            </div>
          ))}
          {lead.orders.length > 1 && (
            <div className="px-2.5 py-1.5 font-semibold">
              {lead.orders.length} طلبات · {sar(total)} · عمولة {sar(commissionOf(total))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select value={lead.status}
                onChange={(e) => apply(updateLead(token, lead.id, { status: e.target.value as LeadStatus }))}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs">
          {LEAD_STATUS_ORDER.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>)}
        </select>
        <form onSubmit={addPaidOrder} className="flex items-center gap-1">
          <Input className="h-8 w-28 text-xs" inputMode="decimal" dir="ltr" placeholder="مبلغ الطلب"
                 value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs" disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5 ml-1" />طلب مدفوع</>}
          </Button>
        </form>
        <label className="flex items-center gap-1 text-xs cursor-pointer mr-auto"
               title="ألغِه لعميل وهمي أو إحالة غير صحيحة">
          <input type="checkbox" checked={lead.eligible}
                 onChange={(e) => apply(updateLead(token, lead.id, { eligible: e.target.checked }))} />
          يستحق عمولة
        </label>
        <a href={whatsappUrl(lead.phone, `أهلاً ${lead.customerName} 👋 معك كلينولوجي للتنظيف`)}
           target="_blank" rel="noopener noreferrer" aria-label="واتساب العميل"
           className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-muted">
          <MessageCircle className="h-4 w-4 text-green-600" />
        </a>
        <button type="button" onClick={remove} aria-label="حذف العميل"
                className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-red-50">
          <Trash2 className="h-4 w-4 text-red-600" />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">المبلغ قبل الضريبة — أضف طلباً كل ما دفع العميل.</p>
    </div>
  );
}

export function PartnersPanel({ token }: { token: string }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [statementFor, setStatementFor] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeadStatus | "all" | "open">("open");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadPartnersData(token);
      setPartners(data.partners);
      setLeads(data.leads);
      setLocked(false);
    } catch (error) {
      // التبويب مقفل بكلمة سر منفصلة — نعرض نموذج الفتح بدل رسالة خطأ
      if (error instanceof PartnersError && error.code === "partners_locked") {
        setLocked(true);
      } else {
        fail(error);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (locked) {
    return <PartnersUnlock token={token} onUnlocked={load} />;
  }

  const changePartner = async (partner: Partner, changes: Partial<Partner>) => {
    try {
      const { partner: next } = await updatePartner(token, partner.id, changes);
      setPartners((list) => list.map((p) => (p.id === partner.id ? { ...next, id: partner.id } : p)));
      return { ...next, id: partner.id };
    } catch (error) {
      fail(error);
      return null;
    }
  };

  const approve = async (partner: Partner) => {
    const next = await changePartner(partner, { status: "approved" });
    if (next) {
      toast.success("تم الاعتماد — أرسل له كوده");
      window.open(whatsappUrl(next.phone, approvalMessage(next)), "_blank");
    }
  };

  const removePartner = async (partner: Partner) => {
    if (!window.confirm(`حذف طلب ${partner.company}؟`)) return;
    try {
      await deleteRecord(token, "partner", partner.id);
      setPartners((list) => list.filter((p) => p.id !== partner.id));
    } catch (error) {
      fail(error);
    }
  };

  const pending = partners.filter((p) => p.status === "pending");
  const active = partners.filter((p) => p.status !== "pending");
  const payableTotal = unsettledOrders(leads).reduce((sum, { order }) => sum + commissionOf(order.amount), 0);

  const visibleLeads = leads.filter((l) =>
    filter === "all" ? true
      : filter === "open" ? l.status !== "lost"
        : l.status === filter);

  if (loading && !partners.length && !leads.length) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "شركاء معتمدون", value: String(partners.filter((p) => p.status === "approved").length) },
          { label: "عملاء محالون", value: String(leads.filter((l) => l.status !== "lost").length) },
          { label: "عمولات مستحقة", value: sar(payableTotal) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border rounded-2xl p-4 text-center shadow-clean">
            <div className="text-xl font-bold tabular-nums">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <Card title={`طلبات انضمام (${pending.length})`}>
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <div className="font-semibold">{p.company} <span className="text-xs text-muted-foreground">· {p.partnerType} · {p.city}</span></div>
                  <div className="text-xs text-muted-foreground">
                    {p.contactName} · <span dir="ltr">{p.phone}</span> · {dateAr(p.createdAt)}
                  </div>
                  {p.notes && <div className="text-xs mt-1">{p.notes}</div>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approve(p)}><Check className="h-4 w-4 ml-1" />اعتماد</Button>
                  <Button size="sm" variant="outline" onClick={() => removePartner(p)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card
        title="الشركاء"
        action={
          <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        }
      >
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            ما فيه شركاء معتمدين بعد. أرسل رابط التسجيل للمقاولين: <b dir="ltr">kleenology.me/partners</b>
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((p) => {
              const mine = leads.filter((l) => l.partnerCode === p.id);
              const due = unsettledOrders(mine).reduce((s, { order }) => s + commissionOf(order.amount), 0);
              const earned = mine.flatMap((l) => l.orders.filter((o) => o.settledAt))
                .reduce((s, o) => s + commissionOf(o.amount), 0);
              return (
                <div key={p.id} className="border rounded-xl p-3 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="text-sm">
                      <div className="font-semibold">
                        {p.company}
                        <span className="mr-2 text-xs font-mono bg-muted rounded px-1.5 py-0.5" dir="ltr">{displayCode(p.id)}</span>
                        {p.status === "suspended" && <span className="mr-1 text-xs text-red-600">({PARTNER_STATUS_LABEL.suspended})</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.contactName} · <span dir="ltr">{p.phone}</span> · {mine.length} عميل ·
                        مستحق {sar(due)} · مصروف {sar(earned)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => setStatementFor(statementFor === p.id ? null : p.id)}>
                        <FileText className="h-4 w-4 ml-1" />الكشف
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="الآيبان" title={p.iban || "أضف الآيبان"}
                              onClick={() => {
                                const iban = window.prompt(`آيبان ${p.company}`, p.iban || "SA");
                                if (iban !== null) changePartner(p, { iban: iban.toUpperCase().replace(/\s/g, "") });
                              }}>
                        <Pencil className={cn("h-4 w-4", !p.iban && "text-amber-600")} />
                      </Button>
                      <Button size="sm" variant="ghost" aria-label="نسخ الرابط"
                              onClick={() => navigator.clipboard.writeText(partnerLink(p.id)).then(() => toast.success("تم نسخ رابط الشريك"))}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <a href={whatsappUrl(p.phone, approvalMessage(p))} target="_blank" rel="noopener noreferrer"
                         aria-label="إرسال الكود والرابط">
                        <Button size="sm" variant="ghost"><MessageCircle className="h-4 w-4 text-green-600" /></Button>
                      </a>
                      <Button size="sm" variant="ghost"
                              aria-label={p.status === "suspended" ? "تفعيل" : "إيقاف"}
                              onClick={() => changePartner(p, { status: p.status === "suspended" ? "approved" : "suspended" })}>
                        {p.status === "suspended" ? <Play className="h-4 w-4" /> : <Ban className="h-4 w-4 text-red-600" />}
                      </Button>
                    </div>
                  </div>
                  {statementFor === p.id && (
                    <StatementView
                      partner={p} leads={leads} token={token}
                      onClose={() => setStatementFor(null)}
                      onSettled={load}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="العملاء المحالون">
        <AddLead partners={partners} onAdded={load} />
        <div className="flex flex-wrap gap-1.5 mb-3">
          {([["open", "الحاليون"], ...LEAD_STATUS_ORDER.map((s) => [s, LEAD_STATUS_LABEL[s]]), ["all", "الكل"]] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setFilter(key as typeof filter)}
                    className={cn("text-xs rounded-full px-3 py-1 border",
                      filter === key ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}>
              {label}
            </button>
          ))}
        </div>
        {visibleLeads.length === 0 ? (
          <p className="text-sm text-muted-foreground">ما فيه عملاء هنا.</p>
        ) : (
          <div className="space-y-2.5">
            {visibleLeads.map((lead) => (
              <LeadRow
                key={lead.id} lead={lead} token={token}
                onChange={(next) => setLeads((list) => list.map((l) => (l.id === next.id ? next : l)))}
                onDelete={(id) => setLeads((list) => list.filter((l) => l.id !== id))}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
