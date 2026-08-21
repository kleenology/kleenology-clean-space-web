import { useState } from "react";
import { Star, MessageSquare, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const GOOGLE_REVIEW_URL = "https://g.page/r/CVBs3ysRpq-WEAE/review";
const WHATSAPP = "966537519929";

export default function ReviewGate() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [stage, setStage] = useState<"stars" | "positive" | "feedback" | "thanks">("stars");
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      setStage("positive");
    } else {
      setStage("feedback");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `ملاحظة عميل (${rating} نجوم)\nالاسم: ${form.name}\nالهاتف: ${form.phone}\nالملاحظة: ${form.message}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
    setStage("thanks");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/">
            <img src="/logo.png" alt="كلينولوجي" className="h-20 mx-auto mb-2" />
          </a>
          <p className="text-sm text-muted-foreground">خدمات التنظيف الاحترافي بالرياض</p>
        </div>

        {/* Stars Stage */}
        {stage === "stars" && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">كيف كانت تجربتك معنا؟</h1>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
              رأيك يهمنا كثيراً ويساعدنا على تقديم خدمة أفضل
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="flex flex-col items-center gap-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-12 w-12 transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                  <span className={`text-sm font-bold transition-colors ${
                    star <= (hovered || rating) ? "text-yellow-500" : "text-gray-300"
                  }`}>{star}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-2">اضغط على النجوم لتقييمنا</p>
          </div>
        )}

        {/* Positive Stage */}
        {stage === "positive" && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">ممتاز! يسعدنا إنك راضٍ</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
              شكراً لتقييمك الإيجابي 🙏<br />
              اضغط الزر أدناه وشاركنا تجربتك على قوقل — ما يأخذ إلا دقيقة
            </p>
            {/* Selected stars */}
            <div className="flex justify-center gap-1 mb-6">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-6 w-6 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}`} />
              ))}
            </div>
            <Button
              onClick={() => window.open(GOOGLE_REVIEW_URL, "_blank")}
              className="w-full mb-4"
              size="lg"
            >
              اكتب تقييمك على قوقل ←
            </Button>
            <p className="text-xs text-muted-foreground">
              ستحتاج تختار النجوم مرة ثانية على صفحة قوقل
            </p>
          </div>
        )}

        {/* Feedback Stage */}
        {stage === "feedback" && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">شكراً على وقتك</h2>
              <p className="text-sm text-muted-foreground">
                نأسف أن تجربتك لم تكن مثالية — ساعدنا نتحسن بملاحظتك
              </p>
              {/* Show selected rating */}
              <div className="flex justify-center gap-1 mt-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`h-5 w-5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">الاسم</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="اسمك الكريم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">رقم الجوال</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">ملاحظتك</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="أخبرنا بما حدث وكيف نتحسن..."
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                إرسال الملاحظة
              </Button>
            </form>
          </div>
        )}

        {/* Thanks Stage */}
        {stage === "thanks" && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">شكراً جزيلاً</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
              وصلتنا ملاحظتك وسيتواصل معك فريقنا قريباً لحل المشكلة
            </p>
            <a href="/">
              <Button variant="outline" className="w-full">العودة للرئيسية</Button>
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
