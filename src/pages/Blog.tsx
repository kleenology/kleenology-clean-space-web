import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";

const SORO_SCRIPT_SRC = "https://app.trysoro.com/api/embed/5f4bbb8c-95c3-45c7-8fd4-10e0939d5528";

const Blog = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  useEffect(() => {
    const existing = document.querySelector(`script[src="${SORO_SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.setAttribute("src", SORO_SCRIPT_SRC);
      script.setAttribute("defer", "true");
      document.body.appendChild(script);
    }

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <SEO
        title={isRTL ? "المدونة | كلينولوجي" : "Blog | Kleenology"}
        description={
          isRTL
            ? "مقالات ونصائح من كلينولوجي حول التنظيف الاحترافي في الرياض."
            : "Articles and tips from Kleenology on professional cleaning in Riyadh."
        }
        keywords="كلينولوجي مدونة, نصائح تنظيف, kleenology blog, cleaning tips riyadh"
        url="https://kleenology.me/blog"
      />
      <Header />

      <main className="pt-20">
        <section className="py-16 px-4 max-w-4xl mx-auto min-h-[50vh]">
          <div id="soro-blog"></div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
