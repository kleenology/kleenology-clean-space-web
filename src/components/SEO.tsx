import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object;
  hreflang?: boolean;
  noindex?: boolean;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Kleenology - Professional Cleaning Services | Excellence in Every Inch",
  description = "Kleenology delivers spotless cleaning results using eco-friendly products. Professional home and office cleaning services with satisfaction guarantee.",
  keywords = "cleaning services, professional cleaning, house cleaning, office cleaning, eco-friendly cleaning, deep cleaning, sanitization",
  image = "https://kleenology.me/logobg.png",
  url = "https://kleenology.me",
  type = "website",
  jsonLd,
  hreflang = true,
  noindex = false,
}) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string, attrName = 'content') => {
      let tag = document.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, selector.match(/["']([^"']+)["']/)?.[1] ?? '');
        document.head.appendChild(tag);
      }
      tag.setAttribute(attrName, value);
    };

    setMeta('meta[name="description"]', 'name', description);
    setMeta('meta[name="robots"]', 'name', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('meta[name="keywords"]', 'name', keywords);

    const ogTags: [string, string][] = [
      ['og:title', title],
      ['og:description', description],
      ['og:image', image],
      ['og:url', url],
      ['og:type', type],
    ];
    ogTags.forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    const twitterTags: [string, string][] = [
      ['twitter:title', title],
      ['twitter:description', description],
      ['twitter:image', image],
    ];
    twitterTags.forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

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
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      const script = document.getElementById('seo-page-jsonld');
      if (script) script.remove();
    };
  }, [title, description, keywords, image, url, type, jsonLd, hreflang, noindex]);

  return null;
};
