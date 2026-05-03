import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  jsonLd?: object | object[];
  hreflang?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title = "كلينولوجي - خدمات تنظيف احترافية في الرياض | Kleenology",
  description = "كلينولوجي — شركة تنظيف احترافية في الرياض. تنظيف منازل، مكاتب، سجاد، وتنظيف عميق بمواد آمنة وضمان الرضا ١٠٠٪.",
  keywords = "تنظيف منازل الرياض, شركة تنظيف الرياض, تنظيف عميق, تنظيف سجاد, تنظيف مكاتب, كلينولوجي, cleaning company Riyadh",
  image = "https://kleenology.me/logobg.png",
  url = "https://kleenology.me",
  type = "website",
  locale = "ar_SA",
  jsonLd,
  hreflang = true,
}) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, selector.match(/["']([^"']+)["']/)?.[1] ?? '');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    const setProp = (property: string, value: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    };

    setMeta('meta[name="description"]', 'name', description);
    setMeta('meta[name="keywords"]', 'name', keywords);

    // Open Graph
    setProp('og:title', title);
    setProp('og:description', description);
    setProp('og:image', image);
    setProp('og:url', url);
    setProp('og:type', type);
    setProp('og:site_name', 'Kleenology');
    setProp('og:locale', locale);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'name', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', title);
    setMeta('meta[name="twitter:description"]', 'name', description);
    setMeta('meta[name="twitter:image"]', 'name', image);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    if (hreflang) {
      const hreflangConfigs = [
        { hreflang: 'ar', href: url },
        { hreflang: 'en', href: url },
        { hreflang: 'x-default', href: url },
      ];
      hreflangConfigs.forEach(({ hreflang: lang, href }) => {
        let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', 'alternate');
          link.setAttribute('hreflang', lang);
          document.head.appendChild(link);
        }
        link.setAttribute('href', href);
      });
    }

    if (jsonLd) {
      const scriptId = 'seo-page-jsonld';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.id = scriptId;
        document.head.appendChild(script);
      }
      const payload = Array.isArray(jsonLd)
        ? { '@context': 'https://schema.org', '@graph': jsonLd }
        : jsonLd;
      script.textContent = JSON.stringify(payload);
    }

    return () => {
      const script = document.getElementById('seo-page-jsonld');
      if (script) script.remove();
    };
  }, [title, description, keywords, image, url, type, locale, jsonLd, hreflang]);

  return null;
};
