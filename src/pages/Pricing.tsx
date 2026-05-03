import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP = "966537519929";

const wa = (msg: string) =>
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");

// ── data ──────────────────────────────────────────────────────────

const PLACES = {
  ar: [
    { label: "استوديو",       sub: "حتى 50 م²",       general: 500,  deep: 600  },
    { label: "شقة صغيرة",    sub: "50 – 100 م²",      general: 600,  deep: 800  },
    { label: "شقة وسط",       sub: "100 – 200 م²",     general: 800,  deep: 1200 },
    { label: "شقة كبيرة",    sub: "200 – 300 م²",     general: 900,  deep: 1500 },
    { label: "دور عادي",      sub: "150 – 250 م²",     general: 1300, deep: 2000 },
    { label: "دور كبير",      sub: "250 – 400 م²",     general: 1800, deep: 2800 },
    { label: "فيلا صغيرة",   sub: "300 – 400 م²",     general: 2000, deep: 3600 },
    { label: "فيلا وسط",      sub: "400 – 600 م²",     general: 3500, deep: 4800 },
    { label: "فيلا كبيرة",   sub: "أكثر من 600 م²",   general: null, deep: 5600 },
  ],
  en: [
    { label: "Studio",          sub: "Up to 50 m²",    general: 500,  deep: 600  },
    { label: "Small Apartment", sub: "50 – 100 m²",    general: 600,  deep: 800  },
    { label: "Medium Apartment",sub: "100 – 200 m²",   general: 800,  deep: 1200 },
    { label: "Large Apartment", sub: "200 – 300 m²",   general: 900,  deep: 1500 },
    { label: "Regular Floor",   sub: "150 – 250 m²",   general: 1300, deep: 2000 },
    { label: "Large Floor",     sub: "250 – 400 m²",   general: 1800, deep: 2800 },
    { label: "Small Villa",     sub: "300 – 400 m²",   general: 2000, deep: 3600 },
    { label: "Medium Villa",    sub: "400 – 600 m²",   general: 3500, deep: 4800 },
    { label: "Large Villa",     sub: "600 m²+",        general: null, deep: 5600 },
  ],
};

const ADDONS = {
  ar: [
    {
      cat: "الأثاث",
      rows: [
        { name: "سجاد / موكيت",       price: "9 ر.س / م²"     },
        { name: "مسند ظهر",           price: "25 ر.س / م²"    },
        { name: "جلسة عربية",         price: "30 ر.س / م²"    },
        { name: "كنب مقعد واحد",      price: "40 ر.س"         },
        { name: "كنب مقعدين",         price: "80 ر.س"         },
        { name: "كنب 3 مقاعد",        price: "120 ر.س"        },
        { name: "كنب 4 مقاعد",        price: "160 ر.س"        },
        { name: "كرسي طعام",          price: "15 ر.س"         },
        { name: "كنب استرخاء",        price: "80 ر.س"         },
        { name: "ستارة صغيرة",        price: "70 ر.س"         },
        { name: "ستارة كبيرة",        price: "90 ر.س"         },
        { name: "مرتبة مفردة",        price: "120 ر.س"        },
        { name: "مرتبة مزدوجة",       price: "140 ر.س"        },
      ],
    },
    {
      cat: "المطابخ",
      rows: [
        { name: "مطبخ جديد صغير",     price: "500 ر.س"        },
        { name: "مطبخ مستعمل صغير",   price: "600 ر.س"        },
        { name: "مطبخ جديد وسط",      price: "700 ر.س"        },
        { name: "مطبخ مستعمل وسط",    price: "800 ر.س"        },
        { name: "مطبخ جديد كبير",     price: "900 ر.س"        },
        { name: "مطبخ مستعمل كبير",   price: "1,000 ر.س"      },
      ],
    },
    {
      cat: "دورات المياه",
      rows: [
        { name: "دورة مياه صغيرة",    price: "100 ر.س"        },
        { name: "دورة مياه كبيرة",    price: "130 ر.س"        },
      ],
    },
    {
      cat: "نوافذ وإضافات",
      rows: [
        { name: "نافذة صغيرة",        price: "50 ر.س"         },
        { name: "نافذة وسط",          price: "70 ر.س"         },
        { name: "نافذة كبيرة",        price: "100 ر.س"        },
        { name: "تنظيف أرضيات",       price: "7 ر.س / م²"     },
        { name: "تنظيف درج (دور واحد)", price: "150 ر.س"      },
      ],
    },
  ],
  en: [
    {
      cat: "Furniture",
      rows: [
        { name: "Carpet / Rug",        price: "9 SAR / m²"    },
        { name: "Backrest",            price: "25 SAR / m²"   },
        { name: "Arabic Seating",      price: "30 SAR / m²"   },
        { name: "Single Sofa",         price: "40 SAR"        },
        { name: "2-Seat Sofa",         price: "80 SAR"        },
        { name: "3-Seat Sofa",         price: "120 SAR"       },
        { name: "4-Seat Sofa",         price: "160 SAR"       },
        { name: "Dining Chair",        price: "15 SAR"        },
        { name: "Recliner",            price: "80 SAR"        },
        { name: "Small Curtain",       price: "70 SAR"        },
        { name: "Large Curtain",       price: "90 SAR"        },
        { name: "Single Mattress",     price: "120 SAR"       },
        { name: "Double Mattress",     price: "140 SAR"       },
      ],
    },
    {
      cat: "Kitchens",
      rows: [
        { name: "New Small Kitchen",   price: "500 SAR"       },
        { name: "Used Small Kitchen",  price: "600 SAR"       },
        { name: "New Medium Kitchen",  price: "700 SAR"       },
        { name: "Used Medium Kitchen", price: "800 SAR"       },
        { name: "New Large Kitchen",   price: "900 SAR"       },
        { name: "Used Large Kitchen",  price: "1,000 SAR"     },
      ],
    },
    {
      cat: "Bathrooms",
      rows: [
        { name: "Small Bathroom",      price: "100 SAR"       },
        { name: "Large Bathroom",      price: "130 SAR"       },
      ],
    },
    {
      cat: "Windows & Extras",
      rows: [
        { name: "Small Window",        price: "50 SAR"        },
        { name: "Medium Window",       price: "70 SAR"        },
        { name: "Large Window",        price: "100 SAR"       },
        { name: "Floor Cleaning",      price: "7 SAR / m²"    },
        { name: "Staircase (1 floor)", price: "150 SAR"       },
      ],
    },
  ],
};

// ── component ─────────────────────────────────────────────────────

export default function Pricing() {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const lang = isRTL ? "ar" : "en";

  const [mode, setMode] = useState<"general" | "deep">("general");

  const places = PLACES[lang];
  const addons = ADDONS[lang];

  const bookMsg = (label: string, sub: string, price: number | null) =>
    isRTL
      ? `مرحباً، أريد حجز خدمة ${mode === "general" ? "تنظيف عام" : "تنظيف تأهيلي"} لـ ${label} (${sub})${price ? ` — السعر ${price} ر.س` : ""}`
      : `Hello! I'd like to book ${mode === "general" ? "General Cleaning" : "Deep Cleaning"} for ${label} (${sub})${price ? ` — ${price} SAR` : ""}`;

  const pricingJsonLd = [
    {
      "@type": "ItemList",
      "name": isRTL ? "أسعار خدمات التنظيف — كلينولوجي" : "Cleaning Service Prices — Kleenology",
      "description": isRTL
        ? "أسعار خدمات التنظيف العام والتأهيلي في الرياض"
        : "General and deep cleaning service prices in Riyadh",
      "itemListElement": places.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "Offer",
          "name": p.label,
          "description": p.sub,
          "priceSpecification": [
            ...(p.general ? [{
              "@type": "UnitPriceSpecification",
              "price": p.general,
              "priceCurrency": "SAR",
              "name": isRTL ? "تنظيف عام" : "General Cleaning",
            }] : []),
            {
              "@type": "UnitPriceSpecification",
              "price": p.deep,
              "priceCurrency": "SAR",
              "name": isRTL ? "تنظيف تأهيلي" : "Deep Cleaning",
            },
          ],
          "seller": {
            "@type": "LocalBusiness",
            "name": "Kleenology",
            "url": "https://kleenology.me",
          },
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": isRTL ? "الرئيسية" : "Home", "item": "https://kleenology.me" },
        { "@type": "ListItem", "position": 2, "name": isRTL ? "الأسعار" : "Pricing", "item": "https://kleenology.me/pricing" },
      ],
    },
  ];

  return (
    <div className={`min-h-screen bg-white ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={isRTL ? "الأسعار | كلينولوجي" : "Pricing | Kleenology"}
        description={isRTL
          ? "أسعار خدمات التنظيف في الرياض — تنظيف عام وتنظيف تأهيلي للشقق والأدوار والفلل."
          : "Cleaning service prices in Riyadh — general and deep cleaning for apartments, floors, and villas."}
        keywords="أسعار تنظيف, cleaning prices, kleenology"
        url="https://kleenology.me/pricing"
        locale={isRTL ? "ar_SA" : "en_US"}
        jsonLd={pricingJsonLd}
      />
      <Header />

      <main className="pt-24 pb-24">

        {/* ── Title ── */}
        <div className="border-b border-border">
          <div className="max-w-5xl mx-auto px-5 py-10">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              {isRTL ? "الأسعار" : "Pricing"}
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              {isRTL
                ? "اختر نوع الخدمة، ثم اضغط على خدمتك لتحجز مباشرة عبر واتساب"
                : "Choose a service type, then tap any row to book via WhatsApp"}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5">

          {/* ── Special offer strip ── */}
          <div className="flex items-center justify-between py-4 border-b border-border gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-0.5">
                {isRTL ? "عرض خاص" : "Special Offer"}
              </span>
              <span className="font-semibold text-foreground">
                {isRTL
                  ? "عرض المجلس — كنب 9 مقاعد + سجادة 20 م² + ستارة"
                  : "Majlis Package — 9-seat sofa + 20 m² carpet + curtain"}
              </span>
            </div>
            <button
              onClick={() => wa(isRTL
                ? "مرحباً، أريد الاستفسار عن عرض المجلس (299 ر.س)"
                : "Hello! I'd like to inquire about the Majlis Package (299 SAR)")}
              className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors whitespace-nowrap"
            >
              <span className="text-xl font-black">299</span>
              <span className="font-normal text-xs">{isRTL ? "ر.س" : "SAR"}</span>
              <span className="underline underline-offset-2">
                {isRTL ? "احجز" : "Book"}
              </span>
            </button>
          </div>

          {/* ── Mode toggle ── */}
          <div className="flex items-center gap-1 mt-6 mb-2 bg-muted p-1 rounded-lg w-fit">
            {(["general", "deep"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-5 py-2 rounded-md text-sm font-semibold transition-all duration-150",
                  mode === m
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "general"
                  ? isRTL ? "تنظيف عام" : "General"
                  : isRTL ? "تنظيف تأهيلي" : "Deep"}
              </button>
            ))}
          </div>

          {/* ── Price list ── */}
          <div className="mt-2">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
              <span>{isRTL ? "نوع المكان" : "Property"}</span>
              <span className="text-end w-20">{isRTL ? "المساحة" : "Area"}</span>
              <span className="text-end w-24">{isRTL ? "السعر" : "Price"}</span>
            </div>

            {places.map(({ label, sub, general, deep }, i) => {
              const price = mode === "general" ? general : deep;
              return (
                <button
                  key={label}
                  onClick={() => wa(bookMsg(label, sub, price))}
                  className={cn(
                    "w-full grid grid-cols-[1fr_auto_auto] gap-4 px-3 py-4 text-start transition-colors duration-100 border-b border-border last:border-0 group",
                    "hover:bg-primary/5 active:bg-primary/10",
                    i % 2 === 0 ? "" : "bg-muted/30",
                  )}
                >
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {label}
                    <span className="flex items-center gap-1.5 mt-0.5">
                      <MessageCircle className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-xs text-muted-foreground font-normal opacity-0 group-hover:opacity-100 transition-opacity">
                        {isRTL ? "اضغط للحجز" : "tap to book"}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground w-20 text-end self-start pt-0.5">
                    {sub}
                  </span>
                  <span className={cn(
                    "font-black text-lg w-24 text-end self-start",
                    price ? "text-foreground" : "text-muted-foreground text-sm font-normal",
                  )}>
                    {price
                      ? `${price.toLocaleString("ar-SA")}`
                      : isRTL ? "تواصل معنا" : "On request"}
                    {price && (
                      <span className="text-xs font-normal text-muted-foreground me-0.5">
                        {" "}{isRTL ? "ر.س" : "SAR"}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Add-ons ── */}
          <div className="mt-14">
            <h2 className="text-2xl font-black text-foreground mb-1">
              {isRTL ? "الإضافات" : "Add-ons"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {isRTL ? "تُضاف على أي خدمة حسب الطلب" : "Added to any service on request"}
            </p>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
              {addons.map((section) => (
                <div key={section.cat}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground pb-2 border-b border-border mb-1">
                    {section.cat}
                  </h3>
                  {section.rows.map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm text-foreground">{row.name}</span>
                      <span className="text-sm font-bold text-foreground tabular-nums">{row.price}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom CTA ── */}
          <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="font-bold text-foreground text-lg">
                {isRTL ? "محتاج مساعدة في الاختيار؟" : "Need help choosing?"}
              </p>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isRTL
                  ? "تواصل معنا وسنساعدك تختار المناسب لمكانك"
                  : "We'll help you pick the right option"}
              </p>
            </div>
            <button
              onClick={() => wa(isRTL
                ? "مرحباً، أريد الاستفسار عن أسعار خدمات التنظيف"
                : "Hello! I'd like to inquire about cleaning prices")}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" />
              {isRTL ? "واتساب" : "WhatsApp"}
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
