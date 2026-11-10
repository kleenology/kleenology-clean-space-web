import { useEffect, useState } from "react";
import { Loader2, CalendarDays, CalendarClock, Star, ClipboardList, ShieldCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Booking {
  customerName: string; phone: string; bookingNo: string;
  date: string; time: string; serviceType: string; location: string;
}
interface Review { name: string; rating: number; text: string; status: string; createdAt: string }
interface Data {
  counts: { bookings: number; inspections: number; qc: number; reviews: number; reviewsPending: number };
  avgRating: number;
  todayBookings: Booking[];
  weekBookings: Booking[];
  recentReviews: Review[];
}

const Tile = ({ Icon, label, value, accent, sub }: {
  Icon: typeof Star; label: string; value: React.ReactNode; accent?: string; sub?: string;
}) => (
  <div className="bg-card border rounded-2xl p-4 shadow-clean">
    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1.5">
      <Icon className={cn("h-4 w-4", accent)} />{label}
    </div>
    <div className="text-2xl font-extrabold">{value}</div>
    {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
  </div>
);

const BookingRow = ({ b }: { b: Booking }) => (
  <div className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
    <div className="min-w-0">
      <div className="font-semibold text-sm truncate">{b.customerName || "—"}</div>
      <div className="text-[11px] text-muted-foreground truncate">
        {[b.serviceType, b.location].filter(Boolean).join(" · ")}
      </div>
    </div>
    <div className="text-left shrink-0">
      <div className="text-xs font-medium">{b.time || "—"}</div>
      <div className="text-[11px] text-muted-foreground" dir="ltr">{b.date}</div>
    </div>
  </div>
);

export function DashboardPanel({ token }: { token: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/pricing/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive) setData(d); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }
  if (!data) return null;

  const { counts } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile Icon={CalendarDays} label="مواعيد اليوم" value={data.todayBookings.length} accent="text-brand-blue" />
        <Tile Icon={CalendarClock} label="مواعيد الأسبوع" value={data.weekBookings.length} accent="text-brand-blue" />
        <Tile Icon={Star} label="متوسط التقييم" accent="text-amber-500"
              value={data.avgRating ? <>{data.avgRating} <span className="text-base text-muted-foreground">/5</span></> : "—"} />
        <Tile Icon={MessageSquare} label="آراء بانتظار الاعتماد" value={counts.reviewsPending}
              accent="text-brand-blue" sub={counts.reviewsPending ? "تحتاج مراجعة" : "لا شيء معلّق"} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Tile Icon={CalendarDays} label="الحجوزات" value={counts.bookings} />
        <Tile Icon={ClipboardList} label="المعاينات" value={counts.inspections} />
        <Tile Icon={ShieldCheck} label="فحوصات الجودة" value={counts.qc} />
      </div>

      {data.todayBookings.length > 0 && (
        <div className="bg-card border rounded-2xl p-4 shadow-clean">
          <h3 className="font-bold mb-1">مواعيد اليوم</h3>
          <div>{data.todayBookings.map((b, i) => <BookingRow key={i} b={b} />)}</div>
        </div>
      )}

      {data.weekBookings.length > 0 && (
        <div className="bg-card border rounded-2xl p-4 shadow-clean">
          <h3 className="font-bold mb-1">قادم هذا الأسبوع</h3>
          <div>{data.weekBookings.map((b, i) => <BookingRow key={i} b={b} />)}</div>
        </div>
      )}

      {data.recentReviews.length > 0 && (
        <div className="bg-card border rounded-2xl p-4 shadow-clean">
          <h3 className="font-bold mb-2">آخر التقييمات</h3>
          <div className="space-y-2">
            {data.recentReviews.map((r, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5 border-b last:border-0">
                <span className="text-amber-500 text-sm shrink-0">{"★".repeat(Math.max(1, Math.min(5, r.rating)))}</span>
                <div className="min-w-0">
                  <div className="text-sm"><b>{r.name}</b> <span className="text-[11px] text-muted-foreground">
                    {r.status === "approved" ? "· معتمد" : r.status === "pending" ? "· بانتظار" : "· مخفي"}</span></div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{r.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
