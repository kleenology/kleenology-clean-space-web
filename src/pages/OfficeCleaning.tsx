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
import { MessageCircle, CheckCircle2, Camera, PenLine, ClipboardCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
// صور فريق كلينولوجي الحقيقية بالزي — لا صور مولّدة في هذه الصفحة
import teamGlass from "@/assets/deep-cleaning.jpg";
import teamShelves from "@/assets/home-cleaning.jpg";
import teamWindow from "@/assets/windows-cleaning.jpg";
import teamStairs from "@/assets/rehab-cleaning.jpg";
import teamMove from "@/assets/move-cleaning.jpg";

// صفحة تنظيف المكاتب لها تصميمها الخاص بدل قالب الخدمات العام: صاحب القرار
// هنا مدير مكتب أو مسؤول مرافق، وسؤاله «ليش أوقّع معكم؟».
// كل الادعاءات هنا موجودة أصلاً في الموقع (الأرقام، التأمين، الجدولة) أو في
// أداة فحص الجودة الفعلية (قائمة بنود، صور، توقيع العميل، سجل محفوظ).
// لا تضف هنا «نرسل التقرير على الواتس» — رابط التقرير للإدارة فقط.

const WHATSAPP_NUMBER = "966537519929";

const content = {
  ar: {
    seo: {
      title: "تنظيف مكاتب وشركات في الرياض | كلينولوجي",
      description: "تنظيف مكاتب وشركات في الرياض بفريق ثابت ومشرف، قبل الدوام أو بعده، مع فحص جودة بالصور بعد كل زيارة. اطلب عرض سعر على الواتس.",
      keywords: "تنظيف مكاتب الرياض, شركة تنظيف مكاتب, تنظيف شركات, عقد تنظيف مكاتب, تنظيف تجاري, كلينولوجي",
    },
    breadcrumb: "تنظيف المكاتب",
    hero: {
      kicker: "كلينولوجي للتنظيف · الرياض",
      title: "تنظيف مكاتب وشركات",
      subtitle: "نفس الفريق يجي مكتبك كل مرة، ومعه مشرف. نشتغل قبل الدوام أو بعده، وبعد كل زيارة نمر على المكان بقائمة فحص ونصوّر النتيجة.",
      primary: "اطلب عرض سعر",
      secondary: "أو كلّمنا واتساب مباشرة",
      proof: ["+150 شركة تعاملت معنا", "رد خلال أقل من ساعة", "الفريق مؤمَّن عليه"],
      photoAlt: "عامل من فريق كلينولوجي ينظف واجهة زجاجية",
    },
    gallery: {
      caption: "فريقنا في الشغل",
      alts: ["فريق كلينولوجي ينظف الرفوف والشاشة", "تنظيف زجاج بالبخاخ", "تنظيف درج بعد التشطيب", "فريق كلينولوجي في وحدة فاضية"],
    },
    pains: {
      title: "اللي نسمعه من الشركات قبل ما يجون لنا",
      items: [
        "العامل يتغير كل أسبوع، وكل مرة تشرح له من جديد.",
        "أول أسبوعين ممتاز، وبعدها المستوى ينزل شوي شوي.",
        "تعطيهم ملاحظة، ونفس المشكلة ترجع الأسبوع اللي بعده.",
      ],
    },
    pillars: {
      title: "وكيف نشتغل احنا",
      items: [
        { title: "فريق ثابت ومشرف", desc: "نخصص لمكتبك نفس الفريق كل مرة. يعرفون المكان وتفاصيله، والمشرف هو اللي تكلمه لو عندك ملاحظة." },
        { title: "فحص بعد كل زيارة", desc: "قبل ما نطلع، المشرف يمر على قائمة بنود لكل منطقة ويصوّر النتيجة. أي شيء ناقص يتعدل في نفس الزيارة." },
        { title: "على وقت دوامكم", desc: "قبل الدوام، بعده، أو في الويكند. نتفق على الوقت اللي ما يعطّل موظفينك." },
      ],
    },
    qc: {
      title: "شكل فحص الجودة",
      desc: "هذا الفحص نفسه اللي يعبّيه المشرف في نظامنا بعد كل زيارة: بنود لكل منطقة، صور للنتيجة، وتوقيعك على الاستلام. ويبقى محفوظ عندنا لو احتجنا نرجع له.",
      card: {
        title: "فحص جودة — زيارة مكتب",
        rows: ["الاستقبال", "قاعة الاجتماعات", "المطبخ", "الحمامات", "المكاتب"],
        score: "مطابق",
        photos: "صور النتيجة",
        signed: "توقيع العميل على الاستلام",
        example: "مثال توضيحي",
      },
    },
    areas: {
      title: "وش يشمل التنظيف",
      items: [
        ["الاستقبال والمداخل", "الأرضيات، الزجاج، والكاونتر."],
        ["المكاتب", "الأسطح والشاشات المشتركة وأماكن اللمس."],
        ["قاعات الاجتماعات", "الطاولات والكراسي والزجاج."],
        ["المطبخ والاستراحة", "الأجهزة والمغاسل والطاولات."],
        ["الحمامات", "تنظيف وتعقيم وتعبئة المستلزمات."],
        ["الممرات والسلالم والمصاعد", "وتفريغ السلال وترتيب الأماكن المشتركة."],
      ] as [string, string][],
    },
    why: {
      title: "باختصار",
      items: ["فريق ثابت ومشرف", "فحص جودة بالصور بعد كل زيارة", "قبل الدوام أو بعده أو في الويكند", "عرض سعر خلال أقل من ساعة"],
    },
    stats: [["+150", "شركة عميلة"], ["98%", "رضا العملاء"], ["< ساعة", "وقت الرد"]],
    form: {
      title: "عرض سعر لمكتبك",
      subtitle: "اختر التفاصيل، ويفتح لك الواتس والرسالة جاهزة.",
      company: "اسم الشركة",
      name: "اسمك",
      area: "مساحة المكتب تقريباً",
      areas: ["أقل من 150 م²", "150 – 400 م²", "400 – 1000 م²", "أكثر من 1000 م²"],
      frequency: "كم مرة تحتاج التنظيف؟",
      frequencies: ["يومي", "2–3 مرات بالأسبوع", "أسبوعي", "مرة وحدة"],
      time: "الوقت المناسب",
      times: ["قبل الدوام", "بعد الدوام", "الويكند", "مرن"],
      submit: "أرسل على الواتس",
      note: "ما نرسل شيء بدون ما تضغط إرسال في الواتس.",
      message: (f: QuoteForm) =>
        `مرحباً، أبي عرض سعر لتنظيف مكتب:\n• الشركة: ${f.company}\n• الاسم: ${f.name}\n• المساحة: ${f.area}\n• التكرار: ${f.frequency}\n• الوقت: ${f.time}`,
    },
    faq: {
      title: "أسئلة تتكرر",
      items: [
        { q: "كيف تحددون السعر؟", a: "حسب المساحة وعدد مرات التنظيف ونوع الأماكن. نعطيك سعر مبدئي على الواتس، ولو احتاج نزور المكتب قبل ما نثبت السعر." },
        { q: "تشتغلون خارج الدوام؟", a: "إيه، قبل الدوام أو بعده أو في الويكند. نتفق على الوقت اللي يناسبكم." },
        { q: "نفس الفريق يجي كل مرة؟", a: "إيه، نخصص فريق ثابت لمكتبك مع مشرف، عشان ما تحتاج تشرح كل مرة." },
        { q: "لو عندي ملاحظة؟", a: "ترسلها للمشرف مباشرة. وفحص الجودة بعد كل زيارة يكشف أغلب النواقص قبل ما تشوفها أنت." },
        { q: "وش عن المستندات والأجهزة؟", a: "الفريق ما يلمس المستندات ولا الأجهزة الخاصة إلا بطلبك." },
      ],
    },
    cta: {
      title: "تبي عرض سعر لمكتبك؟",
      subtitle: "أرسل لنا التفاصيل على الواتس ونرد عليك خلال أقل من ساعة.",
      button: "اطلب عرض سعر",
    },
    sticky: "اطلب عرض سعر",
  },
  en: {
    seo: {
      title: "Office & Commercial Cleaning in Riyadh | Kleenology",
      description: "Office cleaning in Riyadh with a dedicated team and supervisor, before or after hours, with a photo quality check after every visit. Get a quote on WhatsApp.",
      keywords: "office cleaning riyadh, commercial cleaning, corporate cleaning, office cleaning contract, kleenology",
    },
    breadcrumb: "Office Cleaning",
    hero: {
      kicker: "Kleenology Cleaning · Riyadh",
      title: "Office & commercial cleaning",
      subtitle: "The same team comes to your office every time, with a supervisor. We work before or after hours, and after every visit we walk the space with a checklist and photograph the result.",
      primary: "Get a quote",
      secondary: "or message us on WhatsApp",
      proof: ["150+ businesses served", "Reply in under an hour", "Insured team"],
      photoAlt: "A Kleenology team member cleaning a glass wall",
    },
    gallery: {
      caption: "Our team at work",
      alts: ["Kleenology team cleaning shelves and a screen", "Spraying and cleaning glass", "Cleaning stairs after finishing work", "Kleenology team in an empty unit"],
    },
    pains: {
      title: "What businesses tell us before they switch",
      items: [
        "A different cleaner every week, and you explain everything again.",
        "Great for two weeks, then standards slowly slip.",
        "You give feedback, and the same issue is back next week.",
      ],
    },
    pillars: {
      title: "How we work",
      items: [
        { title: "Dedicated team + supervisor", desc: "The same team every visit. They know your space, and the supervisor is your single point of contact." },
        { title: "A check after every visit", desc: "Before leaving, the supervisor goes through a checklist per area and photographs the result. Anything missed is fixed on the spot." },
        { title: "Around your hours", desc: "Before hours, after hours or weekends — whatever doesn't disrupt your team." },
      ],
    },
    qc: {
      title: "What the quality check looks like",
      desc: "This is the same check the supervisor fills in our system after every visit: items per area, photos of the result, and your sign-off on handover. It stays on record if we ever need to look back.",
      card: {
        title: "Quality check — office visit",
        rows: ["Reception", "Meeting room", "Kitchen", "Restrooms", "Offices"],
        score: "Passed",
        photos: "Result photos",
        signed: "Client sign-off on handover",
        example: "Illustrative example",
      },
    },
    areas: {
      title: "What's included",
      items: [
        ["Reception & entrances", "Floors, glass and the counter."],
        ["Offices", "Surfaces, shared screens and touch points."],
        ["Meeting rooms", "Tables, chairs and glass."],
        ["Kitchen & break room", "Appliances, sinks and tables."],
        ["Restrooms", "Cleaning, disinfecting and restocking."],
        ["Hallways, stairs & lifts", "Plus emptying bins and tidying shared areas."],
      ] as [string, string][],
    },
    why: {
      title: "In short",
      items: ["Dedicated team and supervisor", "Photo quality check after every visit", "Before hours, after hours or weekends", "A quote in under an hour"],
    },
    stats: [["150+", "business clients"], ["98%", "satisfaction"], ["< 1h", "reply time"]],
    form: {
      title: "A quote for your office",
      subtitle: "Pick the details and WhatsApp opens with the message ready.",
      company: "Company name",
      name: "Your name",
      area: "Approximate office size",
      areas: ["Under 150 m²", "150 – 400 m²", "400 – 1,000 m²", "Over 1,000 m²"],
      frequency: "How often?",
      frequencies: ["Daily", "2–3 times a week", "Weekly", "One-off"],
      time: "Preferred time",
      times: ["Before hours", "After hours", "Weekends", "Flexible"],
      submit: "Send on WhatsApp",
      note: "Nothing is sent until you press send in WhatsApp.",
      message: (f: QuoteForm) =>
        `Hello, I'd like a quote for office cleaning:\n• Company: ${f.company}\n• Name: ${f.name}\n• Size: ${f.area}\n• Frequency: ${f.frequency}\n• Time: ${f.time}`,
    },
    faq: {
      title: "Common questions",
      items: [
        { q: "How do you price?", a: "By size, frequency and the types of areas. We send an initial price on WhatsApp and visit the office if needed before confirming." },
        { q: "Do you work outside office hours?", a: "Yes — before hours, after hours or weekends. We agree on what suits you." },
        { q: "Is it the same team every time?", a: "Yes, a dedicated team and supervisor for your office, so you don't have to re-explain." },
        { q: "What if I have feedback?", a: "Send it to the supervisor directly. The check after every visit catches most gaps before you see them." },
        { q: "What about documents and devices?", a: "The team doesn't touch documents or personal devices unless you ask." },
      ],
    },
    cta: {
      title: "Want a quote for your office?",
      subtitle: "Send us the details on WhatsApp and we'll reply in under an hour.",
      button: "Get a quote",
    },
    sticky: "Get a quote",
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
              "rounded-lg border px-3 py-2.5 text-sm transition-colors",
              value === option
                ? "border-brand-blue-deeper bg-brand-blue-deeper text-white"
                : "bg-background hover:border-foreground/30",
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

  const [form, setForm] = useState<QuoteForm>({
    company: "", name: "", area: c.form.areas[1], frequency: c.form.frequencies[1], time: c.form.times[1],
  });
  // اللغة تتغير من الهيدر: الخيارات المختارة تتبعها
  useEffect(() => {
    setForm((f) => ({ ...f, area: c.form.areas[1], frequency: c.form.frequencies[1], time: c.form.times[1] }));
  }, [c]);

  const formRef = useRef<HTMLDivElement>(null);
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

  const openWhatsApp = (text: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).pixelTracker?.trackWhatsAppClick?.();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const sendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    openWhatsApp(c.form.message(form));
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isRTL ? "الرئيسية" : "Home", item: "https://kleenology.me" },
      { "@type": "ListItem", position: 2, name: c.breadcrumb, item: "https://kleenology.me/office-cleaning" },
    ],
  };

  const gallery = [teamShelves, teamWindow, teamStairs, teamMove];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <SEO {...c.seo} url="https://kleenology.me/office-cleaning" jsonLd={breadcrumbJsonLd} />
      <Header />

      <main>
        {/* ——— الواجهة ——— */}
        <section ref={heroRef} className="max-w-6xl mx-auto px-4 pt-28 pb-12 sm:pt-36 sm:pb-16 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-3">{c.hero.kicker}</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.3] mb-5 text-brand-blue-deeper">{c.hero.title}</h1>
            <p className="text-lg text-foreground/80 leading-relaxed mb-7 max-w-xl">{c.hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-7">
              <Button size="lg" onClick={toForm} className="h-12 px-7 text-base font-bold">
                {c.hero.primary}
              </Button>
              <button type="button" onClick={() => openWhatsApp(isRTL ? "مرحباً، أبي أستفسر عن تنظيف المكاتب" : "Hello, I'd like to ask about office cleaning")}
                      className="text-sm font-medium text-foreground/70 hover:text-foreground underline underline-offset-4 decoration-foreground/30 py-2">
                {c.hero.secondary}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{c.hero.proof.join(" · ")}</p>
          </div>
          <img src={teamGlass} alt={c.hero.photoAlt}
               className="w-full aspect-[4/3] object-cover rounded-lg" />
        </section>

        {/* ——— صور الفريق ——— */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {gallery.map((src, i) => (
              <img key={src} src={src} alt={c.gallery.alts[i]} loading="lazy"
                   className="w-full aspect-square object-cover rounded-md" />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{c.gallery.caption}</p>
        </section>

        {/* ——— المشكلة والطريقة ——— */}
        <section className="border-y bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">{c.pains.title}</h2>
              <ul className="space-y-4">
                {c.pains.items.map((item) => (
                  <li key={item} className="text-foreground/80 leading-relaxed border-s-2 border-red-300 ps-4">
                    «{item}»
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">{c.pillars.title}</h2>
              <ol className="divide-y border-y">
                {c.pillars.items.map(({ title, desc }, i) => (
                  <li key={title} className="py-5 flex gap-5">
                    <span className="text-sm font-bold text-brand-blue tabular-nums pt-0.5">0{i + 1}</span>
                    <div>
                      <h3 className="font-bold mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ——— فحص الجودة ——— */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{c.qc.title}</h2>
            <p className="text-foreground/80 leading-relaxed">{c.qc.desc}</p>
          </div>
          <div>
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <ClipboardCheck className="h-4 w-4 text-brand-blue" />
                  {c.qc.card.title}
                </div>
                <span className="text-xs font-semibold rounded bg-green-100 text-green-700 px-2 py-0.5">{c.qc.card.score}</span>
              </div>
              <div className="divide-y border rounded-md mb-4">
                {c.qc.card.rows.map((area) => (
                  <div key={area} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>{area}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />{c.qc.card.photos}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[teamWindow, teamShelves, teamStairs].map((src) => (
                  <img key={src} src={src} alt="" aria-hidden="true" loading="lazy"
                       className="aspect-square w-full rounded object-cover" />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3">
                <PenLine className="h-3.5 w-3.5" />{c.qc.card.signed}
                <CheckCircle2 className="h-4 w-4 text-green-600 ms-auto" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{c.qc.card.example}</p>
          </div>
        </section>

        {/* ——— وش يشمل ——— */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold mb-6">{c.areas.title}</h2>
          <dl className="grid sm:grid-cols-2 gap-x-12 border-t">
            {c.areas.items.map(([title, desc]) => (
              <div key={title} className="py-4 border-b flex flex-col sm:flex-row sm:gap-4">
                <dt className="font-semibold sm:w-48 shrink-0">{title}</dt>
                <dd className="text-sm text-muted-foreground">{desc}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ——— باختصار ونموذج ——— */}
        <section className="bg-muted/40 border-y py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-start">
            <div className="lg:sticky lg:top-28 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">{c.why.title}</h2>
                <ul className="space-y-2.5">
                  {c.why.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-8">
                {c.stats.map(([v, l]) => (
                  <div key={l}>
                    <div className="text-2xl font-bold text-brand-blue-deeper">{v}</div>
                    <div className="text-xs text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
              <img src={teamMove} alt="" aria-hidden="true" loading="lazy"
                   className="hidden lg:block w-full aspect-[16/10] object-cover rounded-lg" />
            </div>

            <div ref={formRef} className="rounded-lg bg-card border p-6 sm:p-8 scroll-mt-24">
              <h2 className="text-2xl font-bold mb-1">{c.form.title}</h2>
              <p className="text-sm text-muted-foreground mb-6">{c.form.subtitle}</p>
              <form onSubmit={sendQuote} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="o-company">{c.form.company}</Label>
                    <Input id="o-company" required className="h-11 text-base" value={form.company}
                           onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="o-name">{c.form.name}</Label>
                    <Input id="o-name" required className="h-11 text-base" value={form.name}
                           onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                </div>
                <ChipGroup label={c.form.area} options={c.form.areas} value={form.area}
                           onChange={(area) => setForm((f) => ({ ...f, area }))} />
                <ChipGroup label={c.form.frequency} options={c.form.frequencies} value={form.frequency}
                           onChange={(frequency) => setForm((f) => ({ ...f, frequency }))} />
                <ChipGroup label={c.form.time} options={c.form.times} value={form.time}
                           onChange={(time) => setForm((f) => ({ ...f, time }))} />
                <Button type="submit" size="lg" className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#20BA5A] text-white">
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
          <h2 className="text-2xl font-bold mb-6">{c.faq.title}</h2>
          <Accordion type="single" collapsible className="border-t">
            {c.faq.items.map(({ q, a }, i) => (
              <AccordionItem key={q} value={`q${i}`}>
                <AccordionTrigger className="text-start font-semibold hover:no-underline py-5">{q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ——— الختام ——— */}
        <section className="bg-brand-blue-deeper text-white py-14 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{c.cta.title}</h2>
              <p className="text-white/75">{c.cta.subtitle}</p>
            </div>
            <Button size="lg" onClick={toForm}
                    className="h-12 px-8 text-base font-bold bg-white text-brand-blue-deeper hover:bg-white/90 shrink-0">
              {c.cta.button}
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* ——— زر ثابت للجوال ——— */}
      <div className={cn(
        "fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur border-t md:hidden transition-transform duration-300",
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
