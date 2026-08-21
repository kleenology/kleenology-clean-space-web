import { useState, useEffect, useRef } from "react";
import { SEO } from "@/components/SEO";
import { MessageCircle, Phone, Star, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function useCountUp(target: number, active: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const dur = 1600;
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target]);
  return val;
}

function SparklePhoto({ emoji }: { emoji: string }) {
  return (
    <div style={{ position: "relative", width: 100, height: 100 }}>
      <div style={{ position: "absolute", top: 0, right: 4, fontSize: 16, color: "#f97316", zIndex: 2 }}>✦</div>
      <svg viewBox="0 0 100 100" width="100" height="100">
        <path d="M50,2 C50,2 58,38 98,50 C58,62 50,98 50,98 C50,98 42,62 2,50 C42,38 50,2 50,2 Z" fill="#dde8dd" />
        <text x="50" y="63" textAnchor="middle" fontSize="36">{emoji}</text>
      </svg>
    </div>
  );
}

const SERVICES = [
  { emoji: "🏠", title: "تنظيف المنازل والفلل", desc: "فريق مدرّب يوفر لك تنظيفاً شاملاً بسرعة وجودة تناسب احتياجات منزلك.", bg: "#f0f9f4" },
  { emoji: "✨", title: "التنظيف العميق الشامل", desc: "تنظيف كامل من الأسقف حتى الأرضيات يشمل الخزائن والنوافذ وكل الزوايا.", bg: "#fff7ed" },
  { emoji: "🏢", title: "تنظيف المكاتب والشركات", desc: "بيئة عمل نظيفة تعكس احترافية مؤسستك — قبل الدوام أو بعده.", bg: "#eff6ff" },
  { emoji: "🧶", title: "تنظيف السجاد بالبخار", desc: "إزالة البقع العميقة وتجديد ألوان السجاد بأحدث معدات البخار.", bg: "#fdf4ff" },
  { emoji: "🔨", title: "تنظيف ما بعد البناء", desc: "تسليم نظيف جاهز للسكن أو الافتتاح بطريقة منظمة ومتخصصة.", bg: "#f0fdf4" },
];

const STEPS = [
  {
    num: "1",
    title: "تواصل معنا",
    desc: "واتساب أو اتصال، وشاركنا تفاصيل بسيطة عن المكان والخدمة اللي تحتاجها.",
    visual: (
      <div style={{ background: "white", borderRadius: 14, padding: "18px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ background: "#25D366", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, fontWeight: 700, flex: 1, lineHeight: 1.5 }}>
          " عندي شقة ٤ غرف أحتاج تنظيف عميق "
        </div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageCircle size={22} color="white" />
        </div>
      </div>
    ),
  },
  {
    num: "2",
    title: "نرسلك السعر ونحدد الموعد",
    desc: "نرسل لك سعراً واضحاً وموعداً يناسب جدولك بسهولة وراحة.",
    visual: (
      <div style={{ background: "white", borderRadius: 14, padding: "24px 14px", display: "flex", gap: 14, justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "#f5f5f3", borderRadius: 12, padding: "14px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28 }}>⏰</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginTop: 6 }}>الموعد</div>
        </div>
        <div style={{ background: "#f5f5f3", borderRadius: 12, padding: "14px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28 }}>💵</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#555", marginTop: 6 }}>السعر</div>
        </div>
      </div>
    ),
  },
  {
    num: "3",
    title: "فريقنا يجيك وينظف بكل عناية",
    desc: "نوصل لموقعك ونبدأ الشغل اللي يبيض الوجه — بضمان رضا كامل.",
    visual: (
      <div style={{ background: "white", borderRadius: 14, padding: "28px 14px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🧹</div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#16a34a", marginTop: 10 }}>تنظيف بكل عناية ✦</div>
      </div>
    ),
  },
];

const WHY_US = [
  { emoji: "✅", title: "الجودة اللي تميزنا", desc: "نستخدم أحدث التقنيات ونضمن لك مستوى نظافة يرفع الراس.", bg: "#d1fae5", iconBg: "#4ade80" },
  { emoji: "⚡", title: "سرعة مع دقة", desc: "ننجز الخدمة بسرعة وبنفس الوقت نحافظ على أعلى جودة.", bg: "#ffedd5", iconBg: "#fb923c" },
  { emoji: "🛡️", title: "فريق معتمد وموثوق", desc: "كل فرد في فريقنا مدرب ومعتمد — عائلتك بأمان.", bg: "#dbeafe", iconBg: "#60a5fa" },
  { emoji: "🌿", title: "مواد آمنة للأطفال", desc: "نستخدم مواد تنظيف صديقة للبيئة آمنة تماماً للأطفال والحيوانات.", bg: "#fef9c3", iconBg: "#facc15" },
];

const REVIEWS = [
  { name: "ياسر بن مضواح", text: "الله يوفقكم، فريق عمل متميز وشغل مرتب ونظيف. ما قصروا أبداً.", stars: 5 },
  { name: "حسن العتيبي", text: "دقة متناهية، اهتمام بأدق التفاصيل. خدمة تستحق التجربة وبقوة!", stars: 5 },
  { name: "الزين", text: "رائع شغلهم وإحترافي ماشاء الله، إن شاء الله مو آخر تعامل معاكم.", stars: 5 },
];

const FAQS = [
  { q: "كم تستغرق الخدمة؟", a: "الخدمة العادية يوم عمل واحد. التنظيف العميق قد يمتد ليومين حسب المساحة." },
  { q: "هل أحتاج لتوفير مواد التنظيف؟", a: "لا. الفريق يصل بكامل معداته ومواده. تحتاج فقط لتوفير الماء والكهرباء." },
  { q: "ما هي مناطق الخدمة؟", a: "نخدم جميع أحياء مدينة الرياض." },
  { q: "ماذا لو لم أكن راضياً؟", a: "نضمن رضاك ١٠٠٪. نعود ونعيد العمل مجاناً خلال ٢٤ ساعة بدون نقاش." },
];

const BTN_DARK: React.CSSProperties = { background: "#2d2016", color: "white", border: "none", borderRadius: 14, padding: "14px 22px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };
const BTN_OUTLINE: React.CSSProperties = { background: "white", color: "#2d2016", border: "2px solid #2d2016", borderRadius: 14, padding: "14px 22px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 };

export default function PremiumLanding() {
  const wa = () => window.open(`https://wa.me/966537519929?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن خدمات التنظيف")}`, "_blank");
  const call = () => { window.location.href = "tel:+966537519929"; };

  const statsRef = useFadeIn();
  const c690 = useCountUp(690, statsRef.visible);
  const c3 = useCountUp(3, statsRef.visible);
  const c100 = useCountUp(100, statsRef.visible);

  const [reviewIdx, setReviewIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div dir="rtl" style={{ fontFamily: "Arial, sans-serif", background: "#fff", overflowX: "hidden" }}>
      <SEO
        title="كلينولوجي — خدمات تنظيف احترافية في الرياض"
        description="+٦٩٠ عميل في الرياض. مواد آمنة. ضمان الرضا ١٠٠٪. احجز الآن."
        keywords="شركة تنظيف الرياض, تنظيف منازل, كلينولوجي"
        url="https://kleenology.me/premium"
      />

      {/* NAV */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "white", borderBottom: "1px solid #f0f0f0", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, cursor: "pointer" }}>
          {[26, 20, 26].map((w, i) => <div key={i} style={{ width: w, height: 2, background: "#333", borderRadius: 2 }} />)}
        </div>
        <a href="/"><img src="/lovable-uploads/afda02d7-63e7-4998-92eb-dbe3d776cea3.png" alt="Kleenology" style={{ height: 54, width: "auto", mixBlendMode: "multiply" }} /></a>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(180deg,#dbeafe 0%,#eff6ff 55%,#fff 100%)", padding: "32px 20px 0" }}>
        <div style={{ display: "inline-flex", alignItems: "center", background: "white", borderRadius: 999, padding: "8px 18px", fontSize: 13, fontWeight: 700, color: "#2d2016", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          +٦٩٠ عميل بنسبة رضا ١٠٠٪ ✓
        </div>
        <h1 style={{ fontSize: "clamp(34px,8vw,52px)", fontWeight: 900, color: "#1a1a1a", lineHeight: 1.2, marginBottom: 14, letterSpacing: "-0.02em" }}>
          نرفع معايير النظافة<br />لمستوى عالي.
        </h1>
        <p style={{ color: "#555", fontSize: 16, lineHeight: 1.7, marginBottom: 26, maxWidth: 360 }}>
          فريق مدرّب ومعتمد يعمل في الرياض منذ ٣ سنوات بمواد آمنة وضمان رضا كامل.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
          <button style={BTN_DARK} onClick={wa}><MessageCircle size={18} /> احجز الآن واتساب</button>
          <button style={BTN_OUTLINE} onClick={call}><Phone size={17} /> اتصل مباشرة</button>
        </div>
        {/* Trust visual — brand stats card */}
        <div style={{ borderRadius: "20px 20px 0 0", overflow: "hidden", background: "linear-gradient(135deg,#1e293b 0%,#2d2016 100%)", padding: "28px 20px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { value: "+٦٩٠", label: "عميل راضٍ", icon: "👥" },
              { value: "٣ سنوات", label: "خبرة في الرياض", icon: "🏆" },
              { value: "٤.٩ ★", label: "تقييم قوقل", icon: "⭐" },
              { value: "١٠٠٪", label: "ضمان الرضا", icon: "✅" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 12px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "white", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 4, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: 28, overflowX: "auto", alignItems: "center" }}>
        {["أرامكو السعودية", "الارجان", "بنك الرياض", "المملكة القابضة", "الخليج للتطوير"].map((p, i) => (
          <span key={i} style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#bbb", whiteSpace: "nowrap" }}>{p}</span>
        ))}
      </div>

      {/* SERVICES */}
      <section style={{ padding: "36px 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 40 }}>خدماتنا</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {SERVICES.map((sv, i) => (
            <div key={i} style={{ background: sv.bg, borderRadius: 20, padding: "80px 22px 22px", position: "relative" }}>
              <div style={{ position: "absolute", top: -18, right: 20 }}>
                <SparklePhoto emoji={sv.emoji} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 10 }}>{sv.title}</h3>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{sv.desc}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <button style={BTN_DARK} onClick={wa}><MessageCircle size={16} /> طلب الخدمة</button>
                <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#2d2016", display: "flex", alignItems: "center", gap: 4 }} onClick={wa}>
                  تفاصيل الخدمة <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef.ref} style={{ padding: "0 20px 36px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 20 }}>أرقامنا</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { val: `${c690}+`, label: "عميل في الرياض", bg: "#f0eeeb" },
            { val: `${c3}+`, label: "سنوات خبرة", bg: "#fef9e7" },
            { val: `${c100}٪`, label: "ضمان الرضا", bg: "#e0f2fe" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 20, padding: "32px 24px", opacity: statsRef.visible ? 1 : 0, transform: statsRef.visible ? "none" : "translateY(20px)", transition: `all 0.6s ease ${i * 0.15}s` }}>
              <div style={{ fontSize: "clamp(52px,14vw,80px)", fontWeight: 900, color: "#1a1a1a", letterSpacing: "-0.04em", lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 16, color: "#555", marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "0 20px 36px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 28 }}>كيف نعمل؟</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ marginBottom: 48 }}>
              {/* gray card */}
              <div style={{ background: "#eeece8", borderRadius: 20, padding: "20px 18px 24px", position: "relative" }}>
                {step.visual}
                {/* number circle — centered at bottom edge */}
                <div style={{ position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%)", width: 46, height: 46, borderRadius: "50%", background: "#2d2016", color: "white", fontWeight: 900, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.25)", zIndex: 2 }}>
                  {step.num}
                </div>
              </div>
              {/* title + desc below */}
              <div style={{ textAlign: "center", paddingTop: 36 }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section style={{ padding: "0 20px 36px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 44 }}>ليش الناس يختاروننا؟</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {WHY_US.map((w, i) => (
            <div key={i} style={{ position: "relative", paddingTop: 28 }}>
              {/* floating icon */}
              <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", width: 54, height: 54, background: "white", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", zIndex: 1 }}>
                {w.emoji}
              </div>
              <div style={{ background: w.bg, borderRadius: 20, padding: "40px 22px 28px", textAlign: "center" }}>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", marginBottom: 10 }}>{w.title}</h3>
                <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7 }}>{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ padding: "0 20px 36px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 20 }}>آراء عملائنا</h2>
        <div style={{ background: "#fef9e7", borderRadius: 20, padding: "22px 20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            🗺️ تقييم من قوقل ماب
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
            {Array.from({ length: REVIEWS[reviewIdx].stars }).map((_, j) => <Star key={j} size={20} fill="#f59e0b" color="#f59e0b" />)}
          </div>
          <p style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 1.7, marginBottom: 14 }}>"{REVIEWS[reviewIdx].text}"</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#666" }}>{REVIEWS[reviewIdx].name}</p>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
          {[() => setReviewIdx(i => i === 0 ? REVIEWS.length - 1 : i - 1), () => setReviewIdx(i => i === REVIEWS.length - 1 ? 0 : i + 1)].map((fn, i) => (
            <button key={i} onClick={fn} style={{ width: 44, height: 44, borderRadius: "50%", background: "#2d2016", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              {i === 0 ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "0 20px 36px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#1a1a1a", marginBottom: 20, textAlign: "center" }}>الأسئلة الشائعة</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: "#f8f8f6", borderRadius: 16, overflow: "hidden" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", background: "none", border: "none", padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", textAlign: "right", fontWeight: 700, fontSize: 15, color: "#1a1a1a", gap: 10 }}>
                {faq.q}
                <ChevronDown size={18} color="#888" style={{ transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
              </button>
              {openFaq === i && <div style={{ padding: "0 18px 16px", fontSize: 14, color: "#555", lineHeight: 1.7 }}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "20px 20px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(20px,5vw,26px)", fontWeight: 900, color: "#1a1a1a", marginBottom: 24, lineHeight: 1.4 }}>
          ابدأ أول خطوة واطلب خدمتك<br />بالطريقة اللي تحبها
        </h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={BTN_DARK} onClick={wa}><MessageCircle size={18} /> احجز الآن واتساب</button>
          <button style={BTN_OUTLINE} onClick={call}><Phone size={17} /> اتصل مباشرة</button>
        </div>
      </section>

      <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px", textAlign: "center", fontSize: 12, color: "#aaa" }}>
        © 2024 كلينولوجي — الرياض
      </div>

      {/* floating WhatsApp */}
    </div>
  );
}
