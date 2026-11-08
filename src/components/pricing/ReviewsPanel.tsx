import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Check, EyeOff, Trash2, Star, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  status: "pending" | "approved" | "hidden";
  createdAt: string;
}

const dateAr = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("ar-SA-u-ca-gregory", { day: "numeric", month: "short" }) : "";

const STATUS = {
  pending: { label: "بانتظار المراجعة", tone: "bg-amber-100 text-amber-800" },
  approved: { label: "ظاهر بالموقع", tone: "bg-emerald-100 text-emerald-700" },
  hidden: { label: "مخفي", tone: "bg-muted text-muted-foreground" },
};

export function ReviewsPanel({ token }: { token: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const postAction = useCallback(
    (body: object) =>
      fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      }),
    [token],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews?all=1", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // المعلّقة أولاً، ثم الأحدث
      const order = { pending: 0, approved: 1, hidden: 2 } as Record<string, number>;
      setReviews(
        (data.reviews as Review[]).sort(
          (a, b) => (order[a.status] - order[b.status]) || String(b.createdAt).localeCompare(String(a.createdAt)),
        ),
      );
    } catch {
      toast.error("تعذّر تحميل الآراء");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id: string, status: "approved" | "hidden") => {
    try {
      const res = await postAction({ action: "moderate", id, status });
      if (!res.ok) throw new Error();
      setReviews((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(status === "approved" ? "اعتُمد الرأي — ظاهر بالموقع" : "أُخفي الرأي");
    } catch {
      toast.error("تعذّر التحديث");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("حذف هذا الرأي نهائياً؟")) return;
    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setReviews((list) => list.filter((r) => r.id !== id));
    } catch {
      toast.error("تعذّر الحذف");
    }
  };

  if (loading && !reviews.length) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">آراء العملاء</h2>
          <p className="text-sm text-muted-foreground">
            {pending > 0 ? `${pending} رأي بانتظار اعتمادك` : "كل الآراء مُراجَعة"}
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-card border rounded-2xl shadow-clean p-8 text-center text-sm text-muted-foreground">
          ما فيه آراء بعد. تجي هنا تلقائياً لما عميل يقيّم من صفحة <b dir="ltr">kleenology.me/review</b>.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={cn(
              "border rounded-2xl p-4 shadow-clean",
              r.status === "pending" ? "bg-amber-50/40 border-amber-200" : "bg-card",
            )}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{r.name}</span>
                    <span className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-brand-yellow fill-brand-yellow" />
                      ))}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{dateAr(r.createdAt)}
                    </span>
                  </div>
                </div>
                <span className={cn("text-[11px] font-semibold rounded-full px-2 py-0.5 shrink-0", STATUS[r.status].tone)}>
                  {STATUS[r.status].label}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">{r.text}</p>
              <div className="flex items-center gap-1.5">
                {r.status !== "approved" && (
                  <Button size="sm" onClick={() => moderate(r.id, "approved")} className="h-9">
                    <Check className="h-4 w-4 ml-1.5" />اعتمد وأظهر
                  </Button>
                )}
                {r.status === "approved" && (
                  <Button size="sm" variant="outline" onClick={() => moderate(r.id, "hidden")} className="h-9">
                    <EyeOff className="h-4 w-4 ml-1.5" />إخفاء
                  </Button>
                )}
                <button type="button" onClick={() => remove(r.id)} aria-label="حذف"
                        className="h-9 w-9 rounded-lg border flex items-center justify-center hover:bg-red-50 mr-auto">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
