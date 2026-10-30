import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MessageCircle, Clock, ShieldCheck, Users, Camera, ClipboardCheck, PenLine,
  CalendarClock, Building2, Coffee, DoorOpen, Monitor, Bath, Sparkles,
  UserX, TrendingDown, MessageSquareWarning, CheckCircle2, ArrowLeft, ArrowRight, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/professional-cleaning-hero.jpg";
import resultImage from "@/assets/office-cleaning-bg.jpg";

// صفحة تنظيف المكاتب لها تصميمها الخاص بدل قالب الخدمات العام: صاحب القرار
// هنا مدير مكتب أو مسؤول مرافق، وسؤاله «ليش أوقّع معكم؟» لا «وش تنظفون؟».
// كل الادعاءات هنا موجودة أصلاً في الموقع (الأرقام، التأمين، الجدولة) أو في
// أداة فحص الجودة الفعلية (قائمة بنود، صور، توقيع العميل، سجل محفوظ).
// لا تضف هنا «نرسل التقرير على الواتس» — رابط التقرير للإدارة فقط.

const WHATSAPP_NUMBER = "966537519929";

const content = {
  ar: {
    seo: {
      title: "تنظيف مكاتب وشركات في الرياض | فحص جودة بالصور | كلينولوجي",
      description: "تنظيف مكاتب وشركات في الرياض بفريق ثابت ومشرف، جدولة قبل أو بعد الدوام، وفحص جودة موثّق بالصور بعد كل زيارة. اطلب عرض سعر خلال أقل من ساعة.",
      keywords: "تنظيف مكاتب الرياض, شركة تنظيف مكاتب, تنظيف شركات, عقد تنظيف مكاتب, تنظيف تجاري, كلينولوجي",
    },
    breadcrumb: "تنظيف المكاتب",
    hero: {
      eyebrow: "تنظيف مكاتب وشركات · الرياض",
      title: "مكتبك نظيف كل يوم",
      titleAccent: "بدون ما تتابع أحد",
      subtitle: "فريق ثابت يعرف مكتبك، يشتغل قبل أو بعد الدوام، ويوثّق كل زيارة بفحص جودة بالصور.",
      primary: "اطلب عرض سعر",
      secondary: "كيف نضمن الجودة؟",
      proof: ["+150 شركة عميلة", "رد خلال أقل من ساعة", "فريق مؤمَّن عليه"],
    },
    pains: {
      title: "تعاملت مع شركة تنظيف قبل؟ أكيد مرّيت بهذا:",
      items: [
        { icon: UserX, title: "عامل يتغير كل أسبوع", desc: "وكل مرة تشرح من جديد وين المطبخ ووين المستودع." },
        { icon: TrendingDown, title: "أول أسبوعين ممتاز… وبعدين؟", desc: "النظافة تنزل شوي شوي ومحد ينتبه إلا أنت." },
        { icon: MessageSquareWarning, title: "ملاحظات ما تنحل", desc: "تكلّم، يوعدون، وترجع نفس المشكلة الأسبوع اللي بعده." },
      ],
      answer: "عشان كذا بنينا طريقة شغلنا على ثلاث أشياء:",
    },
    pillars: [
      { icon: Users, title: "فريق ثابت ومشرف", desc: "نفس الفريق يجي مكتبك كل مرة، ومعه مشرف يتابع الشغل ويستقبل ملاحظاتك مباشرة." },
      { icon: Camera, title: "فحص جودة بالصور", desc: "بعد كل زيارة المشرف يمر على قائمة فحص بند بند ويصوّر النتيجة قبل التسليم." },
      { icon: CalendarClock, title: "على وقتك أنت", desc: "قبل الدوام، بعده، أو في الويكند — موظفينك ما يحسون فينا." },
    ],
    qc: {
      eyebrow: "اللي يميزنا",
      title: "فحص موثّق بعد كل زيارة… مو كلام",
      desc: "كل زيارة تنتهي بفحص جودة موثّق: قائمة بنود لكل منطقة، صور للنتيجة، وتوقيعك على الاستلام. وأي بند يحتاج إعادة نرجع له قبل ما نطلع.",
      points: ["قائمة فحص لكل منطقة: الاستقبال، المكاتب، الاجتماعات، المطبخ، الحمامات", "صور للنتيجة مرفقة بالفحص", "أي بند ناقص يُعاد قبل التسليم", "توقيعك على الاستلام، وسجل محفوظ لكل زيارة"],
      card: {
        title: "تقرير فحص الجودة",
        rows: [["الاستقبال", true], ["قاعة الاجتماعات", true], ["المطبخ", true], ["الحمامات", true], ["المكاتب", true]] as [string, boolean][],
        score: "مطابق",
        example: "شكل توضيحي لفحص الجودة",
        photos: "صور النتيجة",
        signed: "توقيع العميل على الاستلام",
      },
    },
    areas: {
      title: "وش ننظف في مكتبك؟",
      items: [
        { icon: DoorOpen, title: "الاستقبال والمداخل", desc: "أول انطباع لعملائك — أرضيات، زجاج، وكاونتر." },
        { icon: Monitor, title: "المكاتب ومحطات العمل", desc: "تعقيم الأسطح والشاشات المشتركة وأسطح التلامس." },
        { icon: Users, title: "قاعات الاجتماعات", desc: "طاولات، كراسي، وزجاج جاهز لأي اجتماع." },
        { icon: Coffee, title: "المطبخ والاستراحة", desc: "أجهزة، مغاسل، وطاولات بدون بقع ولا روائح." },
        { icon: Bath, title: "الحمامات", desc: "تنظيف وتعقيم كامل وتعبئة المستلزمات." },
        { icon: Building2, title: "الممرات والسلالم والمصاعد", desc: "ونفرّغ السلال ونرتّب المناطق المشتركة." },
      ],
    },
    why: {
      title: "ليش الشركات تختارنا؟",
      items: ["فريق ثابت ومشرف يعرف مكتبك", "فحص جودة موثّق بالصور بعد كل زيارة", "جدولة قبل الدوام أو بعده أو في الويكند", "عرض سعر خلال أقل من ساعة"],
    },
    form: {
      title: "عرض سعر لمكتبك",
      subtitle: "عبّ البيانات ونرد عليك بعرض سعر خلال أقل من ساعة في أوقات العمل.",
      company: "اسم الشركة",
      name: "اسمك",
      area: "مساحة المكتب تقريباً",
      areas: ["أقل من 150 م²", "150 – 400 م²", "400 – 1000 م²", "أكثر من 1000 م²"],
      frequency: "كم مرة تحتاج التنظيف؟",
      frequencies: ["يومي", "مرتين إلى ثلاث بالأسبوع", "أسبوعي", "مرة وحدة"],
      time: "الوقت المناسب",
      times: ["قبل الدوام", "بعد الدوام", "الويكند", "مرن"],
      submit: "أرسل الطلب على الواتس",
      note: "يفتح الواتس والرسالة جاهزة — اضغط إرسال بس.",
      message: (f: QuoteForm) =>
        `مرحباً، أبي عرض سعر لتنظيف مكتب:\n• الشركة: ${f.company}\n• الاسم: ${f.name}\n• المساحة: ${f.area}\n• التكرار: ${f.frequency}\n• الوقت: ${f.time}`,
    },
    faq: {
      title: "أسئلة الشركات",
      items: [
        { q: "كيف تحددون السعر؟", a: "حسب مساحة المكتب وعدد مرات التنظيف ونوع المناطق. نعطيك عرض سعر مبدئي على الواتس، ونزور المكتب لو احتاج الأمر قبل ما نثبت السعر." },
        { q: "تقدرون تشتغلون خارج الدوام؟", a: "إيه، قبل الدوام أو بعده أو في الويكند — نتفق على الوقت اللي ما يأثر على شغل موظفينك." },
        { q: "هل نفس الفريق يجي كل مرة؟", a: "إيه، نخصص فريق ثابت لمكتبك مع مشرف، عشان يعرفون المكان وتفاصيله وما تحتاج تشرح كل مرة." },
        { q: "وش يصير لو فيه ملاحظة؟", a: "ترسلها للمشرف مباشرة. والأفضل إن فحص الجودة بعد كل زيارة يكشف الناقص قبل ما تشوفه أنت، ونعيده قبل ما نطلع." },
        { q: "وش عن سرية المستندات والأجهزة؟", a: "فريقنا مدرّب على العمل في بيئات الشركات، وما يلمس المستندات ولا الأجهزة الخاصة إلا بطلبك." },
      ],
    },
    cta: {
      title: "خلّ النظافة علينا، وركّز على شغلك",
      subtitle: "عرض سعر لمكتبك خلال أقل من ساعة.",
      button: "اطلب عرض سعر",
    },
    sticky: "اطلب عرض سعر لمكتبك",
  },
  en: {
    seo: {
      title: "Office & Commercial Cleaning in Riyadh | Photo Quality Reports | Kleenology",
      description: "Office cleaning in Riyadh with a dedicated team and supervisor, before or after hours, and a documented photo quality check after every visit. Get a quote in under an hour.",
      keywords: "office cleaning riyadh, commercial cleaning, corporate cleaning, office cleaning contract, kleenology",
    },
    breadcrumb: "Office Cleaning",
    hero: {
      eyebrow: "Office & Commercial Cleaning · Riyadh",
      title: "A spotless office, every day",
      titleAccent: "without chasing anyone",
      subtitle: "A dedicated team that knows your office, works before or after hours, and documents every visit with a photo quality check.",
      primary: "Get a quote",
      secondary: "How we guarantee quality",
      proof: ["150+ business clients", "Reply in under an hour", "Insured team"],
    },
    pains: {
      title: "Worked with a cleaning company before? You've probably seen this:",
      items: [
        { icon: UserX, title: "A different cleaner every week", desc: "And every time you explain where the kitchen and storage are." },
        { icon: TrendingDown, title: "Great for two weeks… then?", desc: "Standards slip slowly and nobody notices but you." },
        { icon: MessageSquareWarning, title: "Feedback that never sticks", desc: "You raise it, they promise, and it's back next week." },
      ],
      answer: "So we built how we work around three things:",
    },
    pillars: [
      { icon: Users, title: "Dedicated team + supervisor", desc: "The same team comes every time, with a supervisor who checks the work and takes your feedback directly." },
      { icon: Camera, title: "Photo quality checks", desc: "After each visit the supervisor goes through a checklist item by item and photographs the result before handover." },
      { icon: CalendarClock, title: "On your schedule", desc: "Before hours, after hours or weekends — your staff won't notice we were there." },
    ],
    qc: {
      eyebrow: "What sets us apart",
      title: "A documented check after every visit — not promises",
      desc: "Every visit ends with a documented quality check: a checklist per area, photos of the result, and your sign-off on handover. Anything that needs redoing is fixed before we leave.",
      points: ["A checklist per area: reception, offices, meeting rooms, kitchen, restrooms", "Photos of the result attached to the check", "Anything missed is redone before handover", "Your sign-off on handover, and a saved record of every visit"],
      card: {
        title: "Quality check report",
        rows: [["Reception", true], ["Meeting room", true], ["Kitchen", true], ["Restrooms", true], ["Offices", true]] as [string, boolean][],
        score: "Passed",
        example: "Illustration of a quality check",
        photos: "Result photos",
        signed: "Client sign-off on handover",
      },
    },
    areas: {
      title: "What we clean in your office",
      items: [
        { icon: DoorOpen, title: "Reception & entrances", desc: "Your clients' first impression — floors, glass and counter." },
        { icon: Monitor, title: "Offices & workstations", desc: "Disinfecting surfaces, shared screens and touch points." },
        { icon: Users, title: "Meeting rooms", desc: "Tables, chairs and glass ready for any meeting." },
        { icon: Coffee, title: "Kitchen & break room", desc: "Appliances, sinks and tables without stains or smells." },
        { icon: Bath, title: "Restrooms", desc: "Full cleaning, disinfection and restocking." },
        { icon: Building2, title: "Hallways, stairs & lifts", desc: "Plus emptying bins and tidying shared areas." },
      ],
    },
    why: {
      title: "Why businesses choose us",
      items: ["A dedicated team and supervisor who know your office", "A documented photo quality check after every visit", "Scheduling before hours, after hours or weekends", "A quote in under an hour"],
    },
    form: {
      title: "A quote for your office",
      subtitle: "Fill in the details and we'll reply with a quote in under an hour during working hours.",
      company: "Company name",
      name: "Your name",
      area: "Approximate office size",
      areas: ["Under 150 m²", "150 – 400 m²", "400 – 1,000 m²", "Over 1,000 m²"],
      frequency: "How often?",
      frequencies: ["Daily", "2–3 times a week", "Weekly", "One-off"],
      time: "Preferred time",
      times: ["Before hours", "After hours", "Weekends", "Flexible"],
      submit: "Send on WhatsApp",
      note: "Opens WhatsApp with the message ready — just hit send.",
      message: (f: QuoteForm) =>
        `Hello, I'd like a quote for office cleaning:\n• Company: ${f.company}\n• Name: ${f.name}\n• Size: ${f.area}\n• Frequency: ${f.frequency}\n• Time: ${f.time}`,
    },
    faq: {
      title: "Questions from businesses",
      items: [
        { q: "How do you price?", a: "By office size, how often you need cleaning, and the types of areas. We send an initial quote on WhatsApp and visit the office if needed before confirming." },
        { q: "Can you work outside business hours?", a: "Yes — before hours, after hours or weekends. We agree on a time that doesn't disturb your team." },
        { q: "Is it the same team every time?", a: "Yes. We assign a dedicated team and supervisor to your office so they know the space and you don't have to re-explain." },
        { q: "What if something isn't right?", a: "Tell the supervisor directly. Better still, the quality check after every visit catches gaps before you see them, and we fix them before leaving." },
        { q: "What about confidential documents and devices?", a: "Our team is trained for corporate environments and doesn't touch documents or personal devices unless you ask." },
      ],
    },
    cta: {
      title: "Leave the cleaning to us — focus on your business",
      subtitle: "A quote for your office in under an hour.",
      button: "Get a quote",
    },
    sticky: "Get a quote for your office",
  },
};

interface QuoteForm {
  company: string;
  name: string;
  area: string;
  frequency: string;
  time: string;
}

function ChipGroup({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="block mb-2">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option} type="button" onClick={() => onChange(option)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-sm transition-all",
              value === option
                ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary"
                : "hover:border-primary/40 hover:bg-muted",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const OfficeCleaning = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const c = isRTL ? content.ar : content.en;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const [form, setForm] = useState<QuoteForm>({
    company: "", name: "", area: c.form.areas[1], frequency: c.form.frequencies[1], time: c.form.times[1],
  });
  // اللغة تتغير من الهيدر: الخيارات المختارة تتبعها
  useEffect(() => {
    setForm((f) => ({ ...f, area: c.form.areas[1], frequency: c.form.frequencies[1], time: c.form.times[1] }));
  }, [c]);

  const formRef = useRef<HTMLDivElement>(null);
  const qcRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  // الزر الثابت يظهر بعد الواجهة ويختفي والنموذج ظاهر
  useEffect(() => {
    let heroGone = false;
    let formShown = false;
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === heroRef.current) heroGone = !e.isIntersecting;
        if (e.target === formRef.current) formShown = e.isIntersecting;
      }
      setShowSticky(heroGone && !formShown);
    }, { threshold: 0.1 });
    if (heroRef.current) observer.observe(heroRef.current);
    if (formRef.current) observer.observe(formRef.current);
    return () => observer.disconnect();
  }, []);

  const toForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const toQc = () => qcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const sendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).pixelTracker?.trackWhatsAppClick?.();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(c.form.message(form))}`, "_blank");
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isRTL ? "الرئيسية" : "Home", item: "https://kleenology.me" },
      { "@type": "ListItem", position: 2, name: c.breadcrumb, item: "https://kleenology.me/office-cleaning" },
    ],
  };

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <SEO {...c.seo} url="https://kleenology.me/office-cleaning" jsonLd={breadcrumbJsonLd} />
      <Header />

      <main>
        {/* ——— الواجهة ——— */}
        <section ref={heroRef} className="relative overflow-hidden text-white">
          <img src={heroImage} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-brand-blue-deeper/95 via-brand-blue-deeper/85 to-brand-blue-deep/60 rtl:bg-gradient-to-l ltr:bg-gradient-to-r" />
          <div className="relative max-w-6xl mx-auto px-4 pt-32 pb-20 sm:pt-40 sm:pb-28">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm font-medium mb-6">
                {c.hero.eyebrow}
              </span>
              <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.25] sm:leading-[1.2] mb-5">
                {c.hero.title}
                <br />
                <span className="text-brand-yellow">{c.hero.titleAccent}</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8">{c.hero.subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button size="lg" onClick={toForm}
                        className="h-14 px-8 text-lg font-bold bg-brand-yellow text-brand-blue-deeper hover:bg-brand-yellow/90 shadow-float">
                  {c.hero.primary}
                  <Arrow className="h-5 w-5 ms-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={toQc}
                        className="h-14 px-8 text-lg bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white">
                  {c.hero.secondary}
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-3">
                {c.hero.proof.map((text, i) => {
                  const Icon = [Building2, Clock, ShieldCheck][i];
                  return (
                    <li key={text} className="flex items-center gap-2 text-sm text-white/90">
                      <Icon className="h-5 w-5 text-brand-yellow" />
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ——— المشكلة ← الحل ——— */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">{c.pains.title}</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-14">
            {c.pains.items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-red-100 bg-red-50/60 p-5">
                <Icon className="h-7 w-7 text-red-500 mb-3" />
                <h3 className="font-bold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-lg font-semibold text-brand-blue-deeper mb-8">{c.pains.answer}</p>
          <div className="grid md:grid-cols-3 gap-5">
            {c.pillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border bg-card p-6 shadow-clean">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center mb-4 shadow-float">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ——— فحص الجودة ——— */}
        <section ref={qcRef} className="bg-brand-blue-deeper text-white py-16 sm:py-24 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-brand-yellow font-semibold text-sm">{c.qc.eyebrow}</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-5 leading-tight">{c.qc.title}</h2>
              <p className="text-white/80 leading-relaxed mb-7">{c.qc.desc}</p>
              <ul className="space-y-3">
                {c.qc.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-yellow shrink-0 mt-0.5" />
                    <span className="text-white/90">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* مثال توضيحي لشكل التقرير */}
            <div className="relative">
              <div className="bg-white text-foreground rounded-3xl shadow-2xl p-5 sm:p-6 rotate-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 font-bold">
                    <ClipboardCheck className="h-5 w-5 text-brand-blue" />
                    {c.qc.card.title}
                  </div>
                  <span className="text-xs font-bold rounded-full bg-green-100 text-green-700 px-3 py-1">{c.qc.card.score}</span>
                </div>
                <div className="divide-y rounded-xl border mb-4">
                  {c.qc.card.rows.map(([area]) => (
                    <div key={area} className="flex items-center justify-between px-3 py-2.5 text-sm">
                      <span>{area}</span>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" />{c.qc.card.photos}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["center", "left", "right"].map((pos) => (
                    <img key={pos} src={resultImage} alt="" aria-hidden="true" loading="lazy"
                         className="aspect-square w-full rounded-lg object-cover" style={{ objectPosition: pos }} />
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                  <PenLine className="h-3.5 w-3.5" />{c.qc.card.signed}
                  <CheckCircle2 className="h-4 w-4 text-green-600 ms-auto" />
                </div>
              </div>
              <p className="text-center text-xs text-white/50 mt-4">{c.qc.card.example}</p>
            </div>
          </div>
        </section>

        {/* ——— المناطق ——— */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-10">{c.areas.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {c.areas.items.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-clean transition-all">
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ——— لماذا نحن ونموذج ——— */}
        <section className="bg-muted/40 py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-10 items-start">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">{c.why.title}</h2>
                <ul className="space-y-3">
                  {c.why.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[["+150", isRTL ? "شركة عميلة" : "business clients"], ["98%", isRTL ? "رضا العملاء" : "satisfaction"], ["< 1h", isRTL ? "وقت الرد" : "reply time"]].map(([v, l]) => (
                  <div key={l} className="rounded-2xl bg-card border p-4">
                    <div className="text-2xl font-bold text-brand-blue-deeper">{v}</div>
                    <div className="text-xs text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={formRef} className="rounded-3xl bg-card border shadow-float p-6 sm:p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-1">{c.form.title}</h2>
              <p className="text-sm text-muted-foreground mb-6">{c.form.subtitle}</p>
              <form onSubmit={sendQuote} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="o-company">{c.form.company}</Label>
                    <Input id="o-company" required className="h-12 text-base" value={form.company}
                           onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="o-name">{c.form.name}</Label>
                    <Input id="o-name" required className="h-12 text-base" value={form.name}
                           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                </div>
                <ChipGroup label={c.form.area} options={c.form.areas} value={form.area}
                           onChange={(area) => setForm((f) => ({ ...f, area }))} />
                <ChipGroup label={c.form.frequency} options={c.form.frequencies} value={form.frequency}
                           onChange={(frequency) => setForm((f) => ({ ...f, frequency }))} />
                <ChipGroup label={c.form.time} options={c.form.times} value={form.time}
                           onChange={(time) => setForm((f) => ({ ...f, time }))} />
                <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold bg-[#25D366] hover:bg-[#20BA5A] text-white">
                  <MessageCircle className="h-5 w-5 me-2" />
                  {c.form.submit}
                </Button>
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" />{c.form.note}
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* ——— الأسئلة ——— */}
        <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <h2 className="text-3xl font-bold text-center mb-10">{c.faq.title}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {c.faq.items.map(({ q, a }, i) => (
              <AccordionItem key={q} value={`q${i}`} className="bg-card border rounded-2xl px-5 shadow-clean">
                <AccordionTrigger className="text-start font-semibold hover:no-underline py-5">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ——— الختام ——— */}
        <section className="relative overflow-hidden bg-gradient-to-l from-brand-blue-deep to-brand-blue-deeper text-white py-16 px-4 text-center">
          <Sparkles className="absolute top-8 start-10 h-10 w-10 text-brand-yellow/30" aria-hidden="true" />
          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">{c.cta.title}</h2>
            <p className="text-white/80 text-lg mb-8">{c.cta.subtitle}</p>
            <Button size="lg" onClick={toForm}
                    className="h-14 px-10 text-lg font-bold bg-brand-yellow text-brand-blue-deeper hover:bg-brand-yellow/90 shadow-float">
              {c.cta.button}
              <Arrow className="h-5 w-5 ms-2" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* ——— زر ثابت للجوال ——— */}
      <div className={cn(
        "fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden transition-transform duration-300",
        showSticky ? "translate-y-0" : "translate-y-full",
      )}>
        <Button size="lg" onClick={toForm} className="w-full h-12 text-base font-bold">
          {c.sticky}
        </Button>
      </div>
    </div>
  );
};

export default OfficeCleaning;
