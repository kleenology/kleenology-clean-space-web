import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import type { Catalogue } from "@/lib/pricing/types";

// بطاقة دخول مشتركة بين صفحة الأداة وصفحة تقرير الجودة، حتى لا يتفرّع
// شكل الدخول ولا منطق رسائل الخطأ في مكانين.
export function LoginCard({ onSuccess }: { onSuccess: (token: string, catalogue: Catalogue) => void }) {
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
