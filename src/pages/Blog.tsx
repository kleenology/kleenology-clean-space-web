import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Clock, ArrowLeft, BookOpen } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { SoroBlogWidget } from "@/components/SoroBlogWidget";

const categoryColors: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  blue:    "bg-blue-100 text-blue-800",
  purple:  "bg-purple-100 text-purple-800",
  teal:    "bg-teal-100 text-teal-800",
};

const allCategories = ["الكل", ...Array.from(new Set(blogPosts.map(p => p.category)))];

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
  "blogPost": blogPosts.map(p => ({
    "@type": "BlogPosting",
    "headline": p.title,
    "description": p.excerpt,
    "url": `https://kleenology.me/blog/${p.slug}`,
    "datePublished": p.date,
  })),
};

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("الكل");

  const filtered = activeCategory === "الكل"
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

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

      {/* Category Filter */}
      <section className="pb-6 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group bg-white border border-border rounded-2xl overflow-hidden hover:border-primary hover:shadow-lg transition-all"
              >
                {/* Card Header */}
                <div className="h-3 bg-gradient-to-r from-primary to-primary/60" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.categoryColor] ?? "bg-gray-100 text-gray-700"}`}>
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.readTime} د
                    </span>
                  </div>
                  <h2 className="font-bold text-foreground text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                      اقرأ المقال
                      <ArrowLeft className="h-3 w-3 rotate-180" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
