import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Clock, MessageCircle, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPost, getRelatedPosts, ContentBlock } from "@/data/blogPosts";

const WHATSAPP = "966537519929";

const categoryColors: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  blue:    "bg-blue-100 text-blue-800",
  purple:  "bg-purple-100 text-purple-800",
  teal:    "bg-teal-100 text-teal-800",
};

function renderBlock(block: ContentBlock, idx: number) {
  switch (block.type) {
    case "p":
      return <p key={idx} className="text-foreground/80 leading-loose text-base mb-5">{block.text}</p>;
    case "h2":
      return <h2 key={idx} className="text-2xl font-bold text-foreground mt-10 mb-4">{block.text}</h2>;
    case "h3":
      return <h3 key={idx} className="text-xl font-semibold text-foreground mt-7 mb-3">{block.text}</h3>;
    case "ul":
      return (
        <ul key={idx} className="mb-5 space-y-2 pr-5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 items-start text-foreground/80">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div key={idx} className="my-6 bg-primary/8 border-r-4 border-primary rounded-lg px-5 py-4">
          <p className="text-sm text-foreground font-medium">{block.text}</p>
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : null;

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.slug, 3);
  const pageUrl = `https://kleenology.me/blog/${post.slug}`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP}`, "_blank");
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "الرئيسية", "item": "https://kleenology.me" },
        { "@type": "ListItem", "position": 2, "name": "المدونة",  "item": "https://kleenology.me/blog" },
        { "@type": "ListItem", "position": 3, "name": post.title, "item": pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.metaDescription,
      "url": pageUrl,
      "datePublished": post.date,
      "author": {
        "@type": "Organization",
        "name": "Kleenology",
        "url": "https://kleenology.me",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Kleenology",
        "url": "https://kleenology.me",
      },
      "inLanguage": "ar",
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        keywords={post.keywords}
        url={pageUrl}
        type="article"
        jsonLd={jsonLd}
      />
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-10 bg-gradient-to-bl from-primary/10 via-background to-background px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <a href="/" className="hover:text-primary transition-colors">الرئيسية</a>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary transition-colors">المدونة</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.categoryColor] ?? "bg-gray-100 text-gray-700"}`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.readTime} دقائق قراءة
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(post.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="text-xs text-muted-foreground">· بقلم {post.author}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Article Body */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl border border-border p-6 md:p-10 shadow-sm">
            {post.content.map((block, idx) => renderBlock(block, idx))}
          </div>

          {/* CTA inside article */}
          <div className="mt-10 bg-foreground rounded-2xl p-7 text-center">
            <p className="text-white/90 font-semibold text-lg mb-2">احجز خدمة تنظيف احترافية الآن</p>
            <p className="text-white/60 text-sm mb-5">فريق كلينولوجي جاهز لخدمتك في جميع أحياء الرياض</p>
            <Button
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20BA5A] text-white gap-2"
              size="lg"
            >
              <MessageCircle className="h-5 w-5" />
              تواصل عبر واتساب
            </Button>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="py-12 px-4 bg-primary/5">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center gap-2 mb-7">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">مقالات قد تهمك</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map(rp => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="group bg-white border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all"
                >
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[rp.categoryColor] ?? "bg-gray-100 text-gray-700"}`}>
                    {rp.category}
                  </span>
                  <h3 className="font-bold text-foreground text-sm mt-3 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {rp.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    اقرأ المقال
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/blog" className="text-primary text-sm font-medium hover:underline">
                ← عرض جميع المقالات
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />

    </div>
  );
}
