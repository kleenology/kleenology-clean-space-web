import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { CheckCircle2, XCircle, Loader2, MessageCircle, FlaskConical } from "lucide-react";

const WHATSAPP_NUMBER = "966537519929";

interface PaymentStatus {
  mode: "mock" | "test" | "live";
  paid: boolean;
  status: string;
  amountSar: number | null;
  reference: string;
  booking: Record<string, string> | null;
}

export default function PaymentResult() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const [params] = useSearchParams();
  const [result, setResult] = useState<PaymentStatus | null>(null);
  const [failed, setFailed] = useState(false);

  const paymentId = params.get("id");

  useEffect(() => {
    if (!paymentId) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    fetch(`/api/payment/status?id=${encodeURIComponent(paymentId)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  const sendWhatsApp = () => {
    const b = result?.booking ?? {};
    const lines = isRTL
      ? [
          "مرحباً، أكملت دفع عربون الحجز 🧹",
          b.service && `الخدمة: ${b.service}`,
          b.date && `التاريخ: ${b.date}`,
          b.timeSlot && `الوقت: ${b.timeSlot}`,
          b.name && `الاسم: ${b.name}`,
          b.phone && `الجوال: ${b.phone}`,
          b.neighborhood && `العنوان: ${b.neighborhood}`,
          b.notes && `ملاحظات: ${b.notes}`,
          `رقم عملية الدفع: ${result?.reference ?? ""}`,
        ]
      : [
          "Hello! I've paid the booking deposit 🧹",
          b.service && `Service: ${b.service}`,
          b.date && `Date: ${b.date}`,
          b.timeSlot && `Time: ${b.timeSlot}`,
          b.name && `Name: ${b.name}`,
          b.phone && `Phone: ${b.phone}`,
          b.neighborhood && `Address: ${b.neighborhood}`,
          b.notes && `Notes: ${b.notes}`,
          `Payment reference: ${result?.reference ?? ""}`,
        ];
    const msg = lines.filter(Boolean).join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const loading = !result && !failed;
  const success = result?.paid === true;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={isRTL ? "نتيجة الدفع | كلينولوجي" : "Payment Result | Kleenology"}
        description={isRTL ? "نتيجة عملية دفع عربون الحجز." : "Booking deposit payment result."}
        url="https://kleenology.me/payment/result"
      />
      <Header />

      <main className="pt-28 pb-20 px-4">
        <div className="max-w-md mx-auto bg-white border border-border rounded-2xl shadow-sm p-8 text-center">
          {loading && (
            <>
              <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">
                {isRTL ? "جارٍ التحقق من عملية الدفع..." : "Verifying your payment..."}
              </p>
            </>
          )}

          {!loading && success && (
            <>
              <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isRTL ? "تم استلام العربون" : "Deposit Received"}
              </h1>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {isRTL
                  ? "تم تثبيت موعدك بنجاح. أرسل تفاصيل الحجز عبر واتساب ليؤكدها فريقنا معك."
                  : "Your appointment is confirmed. Send the booking details on WhatsApp so our team can confirm with you."}
              </p>

              {result?.mode === "mock" && (
                <div className="flex items-start gap-3 bg-slate-100 border border-slate-300 rounded-xl p-4 mb-6 text-start">
                  <FlaskConical className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {isRTL
                      ? "وضع محاكاة محلي: لم تجرِ أي عملية دفع فعلية — هذه معاينة للشكل النهائي فقط."
                      : "Local mock mode: no actual payment took place — this is a preview of the final look only."}
                  </p>
                </div>
              )}

              {result?.mode === "test" && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 text-start">
                  <FlaskConical className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900 leading-relaxed">
                    {isRTL
                      ? "وضع تجريبي: هذه عملية اختبار ولم يتم خصم أي مبلغ حقيقي."
                      : "Test mode: this was a test transaction and no real amount was charged."}
                  </p>
                </div>
              )}

              <div className="text-sm text-muted-foreground mb-6 space-y-1">
                {result?.amountSar !== null && (
                  <p>
                    {isRTL ? "المبلغ" : "Amount"}:{" "}
                    <span className="font-semibold text-foreground">
                      {result?.amountSar} {isRTL ? "ر.س" : "SAR"}
                    </span>
                  </p>
                )}
                <p className="break-all">
                  {isRTL ? "رقم العملية" : "Reference"}:{" "}
                  <span className="font-mono text-xs">{result?.reference}</span>
                </p>
              </div>

              <Button
                onClick={sendWhatsApp}
                className="w-full h-13 py-3 text-base bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold rounded-xl"
              >
                <MessageCircle className="h-5 w-5 me-2" />
                {isRTL ? "إرسال التفاصيل عبر واتساب" : "Send Details via WhatsApp"}
              </Button>
            </>
          )}

          {!loading && !success && (
            <>
              <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isRTL ? "لم تكتمل عملية الدفع" : "Payment Not Completed"}
              </h1>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {isRTL
                  ? "لم يتم تأكيد الدفع. يمكنك المحاولة مرة أخرى أو إرسال طلبك عبر واتساب مباشرة ولن يتأثر حجزك."
                  : "The payment was not confirmed. You can try again or simply send your request on WhatsApp — your booking is not affected."}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full h-12 rounded-xl">
                  <Link to="/booking">{isRTL ? "العودة للحجز" : "Back to Booking"}</Link>
                </Button>
                <Button
                  onClick={sendWhatsApp}
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                >
                  <MessageCircle className="h-5 w-5 me-2" />
                  {isRTL ? "التواصل عبر واتساب" : "Contact via WhatsApp"}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
