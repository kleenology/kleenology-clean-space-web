import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { BookOpen } from "lucide-react";
import { SoroBlogWidget } from "@/components/SoroBlogWidget";

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "مدونة كلينولوجي",
  "description": "نصائح وأدلة تنظيف من خبراء كلينولوجي في الرياض",
  "url": "https://kleenology.me/blog",
  "publisher": {
    "@type": "Organization",
    "name": "Kleenology",
    "url": "https://kleenology.me",
  },
};

export default function Blog() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title="مدونة كلينولوجي | نصائح وأدلة التنظيف"
        description="اكتشف أحدث نصائح وأدلة التنظيف من خبراء كلينولوجي في الرياض. مواضيع تنظيف المنزل، السجاد، المكاتب، وأكثر."
        keywords="مدونة تنظيف، نصائح تنظيف المنزل، دليل التنظيف، كلينولوجي، تنظيف الرياض"
        url="https://kleenology.me/blog"
        jsonLd={blogJsonLd}
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-bl from-primary/10 via-background to-background text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <BookOpen className="h-4 w-4" />
            المدونة
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            نصائح وأدلة <span className="text-primary">التنظيف</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            خبراء كلينولوجي يشاركونك أفضل الطرق والأسرار للحفاظ على منزل نظيف وصحي
          </p>
        </div>
      </section>

      {/* Soro Blog Widget */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <SoroBlogWidget />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-primary/5 text-center">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-2xl font-bold text-foreground mb-3">هل تحتاج خدمة تنظيف احترافية؟</h2>
          <p className="text-muted-foreground mb-6">فريق كلينولوجي جاهز لخدمتك في جميع أحياء الرياض</p>
          <a
            href="https://wa.me/966537519929"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-7 py-3 rounded-xl transition-colors"
          >
            احجز عبر واتساب
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
