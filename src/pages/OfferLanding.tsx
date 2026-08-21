import { useCallback } from "react";
import { MessageCircle, Phone, Tag, ShieldCheck, Sparkles, Users, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";

const WHATSAPP = "966537519929";
const PHONE_DISPLAY = "٠٥٣ ٧٥١ ٩٩٢٩";

// الأرقام هنا مطابقة لما هو معلن في بقية الموقع — لا تُضف ادعاءات من عندك.
// "مواد إيطالية" ادعاء أضافه المالك عن مورّده، وليس مذكوراً في بقية الموقع.
const FEATURES = [
  { icon: Users,       label: "فريق مدرّب ومعتمد" },
  { icon: ShieldCheck, label: "مواد إيطالية آمنة" },
  { icon: Sparkles,    label: "تنظيف عميق شامل" },
  { icon: Clock,       label: "التزام بالمواعيد" },
];

export default function OfferLanding() {
  const track = (event: string) => {
    const tracker = (window as unknown as { pixelTracker?: Record<string, () => void> }).pixelTracker;
    if (event === "whatsapp") tracker?.trackWhatsAppClick?.();
    else (tracker as unknown as { trackButtonClick?: (n: string) => void })?.trackButtonClick?.(event);
  };

  const handleWhatsApp = useCallback(() => {
    track("whatsapp");
    const msg = "مرحباً، أبغى أحجز خدمة تنظيف وأستفيد من خصم ١٠٪ لأول خدمة";
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  }, []);

  const handleCall = useCallback(() => {
    track("offer_call");
    window.location.href = `tel:+${WHATSAPP}`;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-blue-light/40 via-background to-background px-4 py-8" dir="rtl">
      <SEO
        title="خصم ١٠٪ على أول خدمة تنظيف | كلينولوجي الرياض"
        description="كلينولوجي — تنظيف احترافي للمنازل والمكاتب في الرياض. خصم ١٠٪ على خدمتك الأولى، فريق معتمد، مواد آمنة، وضمان الرضا ١٠٠٪."
        url="https://kleenology.me/offer"
        noindex
      />

      <main className="mx-auto w-full max-w-md rounded-3xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-6 pt-7 pb-8 text-center">
          {/* شريط العرض */}
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue-dark px-5 py-2.5 text-white shadow-md">
            <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-sm font-bold">
              خصم <span className="text-brand-yellow">١٠٪</span> لخدمتك الأولى
            </span>
          </div>

          <img
            src="/lovable-uploads/afda02d7-63e7-4998-92eb-dbe3d776cea3.png"
            alt="كلينولوجي"
            className="mx-auto mt-6 h-28 w-auto"
            width={224}
            height={112}
          />

          <p className="mt-5 inline-block rounded-full bg-brand-blue-light/50 px-4 py-1.5 text-sm font-semibold text-brand-blue-dark">
            الفرق يُرى في كل لمسة
          </p>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-brand-blue-dark">
            نظافة تليق بمكانك
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            {/* الفريق والمواد مذكوران في البطاقات تحت مباشرة — لا تُعدهما هنا. */}
            تنظيف عميق للمنازل والمكاتب في الرياض، بعناية{" "}
            <span className="font-bold text-foreground">تُلاحظ في كل تفصيلة</span>.
          </p>

          {/* المزايا */}
          <ul className="mt-7 grid grid-cols-2 gap-3 text-right">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-2xl border border-brand-blue-light bg-brand-blue-light/20 px-3 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                  <Icon className="h-4 w-4 text-brand-blue-dark" aria-hidden="true" />
                </span>
                <span className="text-[13px] font-semibold leading-snug text-brand-blue-dark">{label}</span>
              </li>
            ))}
          </ul>

          {/* الإجراء */}
          <button
            onClick={handleWhatsApp}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#20BA5A]"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            احجز خدمة التنظيف الآن
          </button>

          <button
            onClick={handleCall}
            className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-brand-blue-light px-6 py-3.5 text-base font-semibold text-brand-blue-dark transition-colors hover:bg-brand-blue-light/30"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
            اتصال مباشر: <span dir="ltr">{PHONE_DISPLAY}</span>
          </button>

          {/* الدليل الاجتماعي في سطر واحد بدل لوحة كاملة — أرقام معلنة في بقية الموقع */}
          <p className="mt-4 text-xs font-semibold text-brand-blue-dark">
            ٦٩٠+ عميل في الرياض · تقييم ٤.٩ · ضمان الرضا ١٠٠٪
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">نرد عادةً خلال أقل من ساعة</p>
        </div>
        {/* لا زر واتساب عائم هنا: WhatsAppChatWidget مركّب في App ويظهر
            على كل الصفحات، فإضافة زر ثانٍ تضع اثنين في نفس الزاوية. */}
      </main>
    </div>
  );
}
