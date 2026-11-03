import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Package, Camera, ArrowDownUp, ListChecks, ShieldCheck, MessageSquareWarning,
  Home, Building2, HardHat, RotateCcw, CheckCircle2, AlertTriangle, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * دليل العمل الميداني للمشرف — مرجع ثابت يوضّح طريقة العمل الصحيحة حتى لا
 * يشتغل المشرف عشوائياً أو يعطي العميل معلومة غلط.
 *
 * المحتوى هنا قابل للتعديل بسهولة: كل قسم نص عربي واضح. راجِع قوائم
 * «نطاق العمل» خاصة، وعدّلها لتطابق أسعارك وسياستك الفعلية.
 */

const CHECKLIST_KEY = "kleenology_predelivery_checklist";

const PRE_DELIVERY = [
  "صوّرت حالة الموقع قبل البدء (أي كسر أو خدش أو بقعة موجودة مسبقاً)",
  "نظّفت كل غرفة من الأعلى للأسفل: الإنارة والسقف، ثم الجدران والأثاث، ثم الأرضية",
  "الزجاج والمرايا لامعة بلا خطوط أو أصابع",
  "الحمامات معقّمة، والمغاسل والحنفيات نظيفة ولامعة",
  "المطبخ: الأسطح والدواليب من الخارج والحوض نظيفة",
  "الأرضيات نظيفة وجافة بلا بقايا مواد أو شعر",
  "ما خلّفت أدوات أو مخلفات أو عبوات مواد في الموقع",
  "صوّرت النتيجة النهائية ورفعتها في فحص الجودة",
  "راجعت النتيجة مع العميل وأخذت موافقته على الاستلام",
];

function Section({ Icon, title, tone, children, defaultOpen = false }: {
  Icon: typeof Package; title: string; tone: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-card border rounded-2xl shadow-clean overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-right"
      >
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-bold flex-1">{title}</span>
        <ChevronLeft className={cn("h-5 w-5 text-muted-foreground transition-transform", open && "-rotate-90")} />
      </button>
      {open && <div className="px-4 pb-4 pt-0 text-sm leading-relaxed space-y-3">{children}</div>}
    </section>
  );
}

function Bullets({ items, variant = "default" }: { items: string[]; variant?: "default" | "good" | "bad" }) {
  return (
    <ul className="space-y-1.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2">
          {variant === "good" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : variant === "bad" ? (
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0 mt-1.5" />
          )}
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function PreDeliveryChecklist() {
  const [checked, setChecked] = useState<boolean[]>(() => PRE_DELIVERY.map(() => false));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKLIST_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length === PRE_DELIVERY.length) setChecked(saved);
      }
    } catch { /* تخزين محلي تكميلي */ }
  }, []);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = prev.map((v, idx) => (idx === i ? !v : v));
      try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next)); } catch { /* */ }
      return next;
    });
  };

  const reset = () => {
    const cleared = PRE_DELIVERY.map(() => false);
    setChecked(cleared);
    try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(cleared)); } catch { /* */ }
  };

  const done = checked.filter(Boolean).length;
  const all = done === PRE_DELIVERY.length;

  return (
    <section className="bg-card border rounded-2xl shadow-clean overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-700">
          <ListChecks className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold">قائمة التحقق قبل التسليم</h2>
          <p className="text-xs text-muted-foreground">امشِ عليها بند بند قبل ما تسلّم العميل</p>
        </div>
        <span className={cn("text-sm font-bold tabular-nums", all ? "text-emerald-700" : "text-muted-foreground")}>
          {done}/{PRE_DELIVERY.length}
        </span>
      </div>
      <div className="p-4 space-y-2">
        {PRE_DELIVERY.map((item, i) => (
          <label key={i} className={cn(
            "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors",
            checked[i] ? "bg-emerald-50 border-emerald-200" : "hover:bg-muted/50",
          )}>
            <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)}
                   className="mt-0.5 h-5 w-5 rounded accent-emerald-600 shrink-0" />
            <span className={cn("text-sm", checked[i] && "text-emerald-900")}>{item}</span>
          </label>
        ))}
        <div className="flex items-center justify-between pt-1">
          {all ? (
            <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> جاهز للتسليم
            </span>
          ) : <span className="text-xs text-muted-foreground">باقي {PRE_DELIVERY.length - done} بند</span>}
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4 ml-1.5" />تفريغ للطلب الجديد
          </Button>
        </div>
      </div>
    </section>
  );
}

export function WorkGuide() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-l from-brand-blue-deep to-brand-blue-deeper text-white rounded-2xl p-5 shadow-clean">
        <h1 className="text-lg font-bold mb-1">دليل العمل الميداني</h1>
        <p className="text-sm text-white/80 leading-relaxed">
          خطوات واضحة لكل موقع — تمشي عليها بالترتيب عشان الشغل يطلع احترافي، وما يصير أخطاء
          ولا ملاحظات من العميل بعد التسليم.
        </p>
      </div>

      <Section Icon={Package} title="١- قبل الذهاب للموقع: التجهيز" tone="bg-blue-100 text-blue-700" defaultOpen>
        <p className="text-muted-foreground">جهّز العدّة كاملة قبل ما تطلع، وتأكد ما ينقص شي:</p>
        <Bullets items={[
          "مواد التنظيف: منظّف متعدد الأغراض، منظّف زجاج، معقّم حمامات، مزيل دهون للمطبخ، ملمّع.",
          "الأدوات: مكنسة كهربائية، ممسحة، دلاء، إسفنج وليف، مساحات زجاج، فوط ميكروفايبر بألوان مختلفة لكل منطقة.",
          "أكياس نفايات، وقفازات وكمامات.",
          "للتنظيف التأهيلي: كشّاطات، مزيل بقايا إسمنت ودهان، سلالم إذا الأسقف عالية.",
          "تأكد من عدد العمال المناسب لحجم الموقع (شقة / فيلا / بعد بناء).",
        ]} />
      </Section>

      <Section Icon={Camera} title="٢- عند الوصول: وثّق أولاً قبل ما تبدأ" tone="bg-rose-100 text-rose-700" defaultOpen>
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-900 text-sm">
          ⚠️ أهم خطوة لحمايتك من مشاكل العميل بعد الشغل.
        </div>
        <Bullets items={[
          "قبل أي شي، صوّر حالة الموقع كامل: الأرضيات، الجدران، الزجاج، الأبواب، المطبخ، الحمامات.",
          "صوّر بالتحديد أي كسر أو خدش أو بقعة أو ضرر موجود مسبقاً.",
          "ارفع الصور في «المعاينة» بالتطبيق قبل بدء العمل.",
        ]} />
        <p className="text-muted-foreground">
          لو قال العميل بعدين «أنتم كسرتوا» أو «خربتوا»، عندك دليل مصوّر إنه كان موجود قبل ما تبدأ.
        </p>
      </Section>

      <Section Icon={ArrowDownUp} title="٣- طريقة التنظيف الصحيحة" tone="bg-indigo-100 text-indigo-700">
        <p className="font-semibold">القاعدة الذهبية: دائماً من الأعلى إلى الأسفل، ومن الداخل للخارج.</p>
        <Bullets variant="good" items={[
          "ابدأ بالأعلى: الإنارة، المراوح، أعلى الدواليب، السقف.",
          "ثم الجدران والمفاتيح والأبواب والنوافذ.",
          "ثم الأثاث والأسطح.",
          "الأرضية آخر شي (كنس ثم مسح)، وابدأ من أبعد نقطة باتجاه الباب.",
          "اشتغل غرفة غرفة، ولا تنتقل لغرفة قبل ما تخلّص اللي قبلها.",
        ]} />
        <p className="text-xs text-muted-foreground">
          كذا ما يتسخ المكان اللي نظّفته من الغبار النازل من فوق.
        </p>
      </Section>

      <Section Icon={Home} title="٤- حسب نوع الموقع" tone="bg-sky-100 text-sky-700">
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 font-semibold mb-1"><Home className="h-4 w-4 text-sky-700" />شقة / منزل مسكون</div>
            <Bullets items={[
              "انتبه لأغراض العميل — لا تحرّك شي ثمين بلا إذن.",
              "ركّز على المطبخ والحمامات (أكثر ما يُلاحظ).",
              "رتّب الأغراض بعد التنظيف في نفس مكانها.",
            ]} />
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold mb-1"><Building2 className="h-4 w-4 text-sky-700" />فيلا</div>
            <Bullets items={[
              "قسّم العمل بين الأدوار: دور دور، وخلّص الدور قبل ما تنتقل.",
              "لا تنسَ الدرج، المداخل، والأسطح الخارجية إذا داخلة في الاتفاق.",
            ]} />
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold mb-1"><HardHat className="h-4 w-4 text-sky-700" />تنظيف تأهيلي (بعد البناء / الترميم)</div>
            <Bullets items={[
              "أزل مخلفات البناء أولاً (شيل الكبير قبل الكنس).",
              "أزل بقايا الإسمنت والدهان والستكر عن الأرضيات والزجاج والأبواب بالكشّاطة.",
              "نظّف الغبار الناعم مرتين — يترسّب مرة ثانية بعد أول مسح.",
              "آخر شي: مسح نهائي وتلميع.",
            ]} />
          </div>
        </div>
      </Section>

      <Section Icon={ShieldCheck} title="٥- نطاق العمل: داخله وخارجه" tone="bg-amber-100 text-amber-700">
        <div>
          <div className="font-semibold text-emerald-700 mb-1">داخل النطاق (مشمول في السعر):</div>
          <Bullets variant="good" items={[
            "تنظيف الأسطح والجدران والأرضيات والزجاج.",
            "تنظيف المطبخ والحمامات وتعقيمها.",
            "إزالة الغبار والأتربة والبقع العادية.",
          ]} />
        </div>
        <div>
          <div className="font-semibold text-amber-700 mb-1 mt-2">خارج النطاق (خدمة إضافية — تحتاج موافقة وتسعير من الإدارة):</div>
          <Bullets variant="bad" items={[
            "جلي وتلميع الرخام أو تلميع الأرضيات بالمكائن.",
            "غسيل السجاد والكنب والمجالس بالبخار.",
            "تنظيف خزانات المياه أو المكيفات من الداخل.",
            "نقل أو فك أثاث ثقيل، أو أعمال خارج اتفاق التنظيف.",
          ]} />
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-900 text-sm mt-2">
            ⚠️ لا توعد العميل بأي شي خارج النطاق من نفسك. إذا طلب إضافة، قل له «أرجع للإدارة وأبلغك بالسعر» وتواصل معنا.
          </div>
        </div>
      </Section>

      <PreDeliveryChecklist />

      <Section Icon={MessageSquareWarning} title="٦- لو جاء العميل بملاحظات" tone="bg-violet-100 text-violet-700">
        <Bullets items={[
          "استقبل أي ملاحظة بصدر رحب ولا تجادل.",
          "لو الملاحظة داخل نطاق العمل: عالجها فوراً قبل ما تطلع.",
          "لو خارج النطاق: اشرح بأدب إنها خدمة إضافية، وتواصل مع الإدارة.",
          "قبل ما تغادر، خذ موافقة العميل على الاستلام — وهذا أسهل لما تكون وثّقت بالصور من البداية.",
        ]} />
      </Section>

      <p className="text-center text-xs text-muted-foreground pb-2">
        هذا الدليل مرجع ثابت — ارجع له في أي وقت. لأي حالة غير واضحة، تواصل مع الإدارة قبل ما تقرر.
      </p>
    </div>
  );
}
