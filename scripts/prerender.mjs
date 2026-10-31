/**
 * تصيير مسبق وقت البناء: يحوّل كل صفحة عامة لـ HTML فيه نصها الكامل وعنوانها
 * ووصفها، حتى تقرأها روبوتات الذكاء الاصطناعي (ChatGPT, Claude, Perplexity)
 * ومحركات البحث اللي ما تشغّل الجافاسكربت.
 *
 * يشتغل بعد:  vite build  و  vite build --ssr src/entry-server.tsx --outDir dist-ssr
 *
 * - dist/app.html  نسخة نظيفة من القالب لكل المسارات غير المصيَّرة (الإدارة،
 *   روابط الشركاء، ...) حتى ما يظهر فيها محتوى الرئيسية للحظة.
 * - dist/<route>.html  لكل صفحة، و dist/index.html للرئيسية.
 * - dist/_redirects  تُضاف قواعد صريحة لكل صفحة قبل قاعدة /* .
 *
 * أي فشل هنا لا يوقف النشر: الموقع يرجع يشتغل كتطبيق عادي مثل قبل.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://kleenology.me";

// صفحات عامة ليست في sitemap.xml
const EXTRA_ROUTES = ["/privacy-policy"];

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function routesFromSitemap() {
  const xml = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].trim().replace(SITE, "") || "/")
    .map((p) => (p.length > 1 ? p.replace(/\/$/, "") : p));
}

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function applyHead(html, head) {
  if (!head) return html;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(head.title)}</title>`);
  html = setMeta(html, "name", "description", head.description);
  if (head.keywords) html = setMeta(html, "name", "keywords", head.keywords);
  html = setMeta(html, "property", "og:title", head.title);
  html = setMeta(html, "property", "og:description", head.description);
  html = setMeta(html, "property", "og:url", head.url);
  html = setMeta(html, "property", "og:image", head.image);
  html = setMeta(html, "name", "twitter:title", head.title);
  html = setMeta(html, "name", "twitter:description", head.description);
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(head.url)}" />`);
  if (head.jsonLd) {
    // نفس المعرّف اللي يستخدمه مكوّن SEO في المتصفح، فيستبدله بدل ما يكرره
    const json = JSON.stringify(head.jsonLd).replace(/</g, "\\u003c");
    html = html.replace("</head>", `    <script type="application/ld+json" id="seo-page-jsonld">${json}</script>\n  </head>`);
  }
  return html;
}

async function main() {
  // بعد أول تشغيل يصير index.html الرئيسية المصيَّرة، فالقالب النظيف هو app.html
  const appShell = join(dist, "app.html");
  const template = readFileSync(existsSync(appShell) ? appShell : join(dist, "index.html"), "utf8");
  // القالب النظيف أولاً — قاعدة /* تعتمد عليه حتى لو فشل كل شي بعده
  writeFileSync(join(dist, "app.html"), template);

  const { render } = await import(pathToFileURL(join(root, "dist-ssr", "entry-server.js")).href);
  const routes = [...new Set([...routesFromSitemap(), ...EXTRA_ROUTES])];

  // سجلات الصفحات (console.log) تملأ سجل البناء — تُكتم وقت التصيير
  const log = console.log;
  const done = [];
  for (const route of routes) {
    try {
      console.log = () => {};
      const { html, head } = render(route);
      console.log = log;
      if (head?.noindex) continue;

      let page = applyHead(template, head).replace('<div id="root"></div>', `<div id="root">${html}</div>`);
      // أسئلة الرئيسية في القالب تخص الرئيسية فقط — قوقل يرفض FAQ ما تظهر في الصفحة
      if (route !== "/") {
        page = page.replace(/<script type="application\/ld\+json">(?:(?!<\/script>)[\s\S])*?"FAQPage"[\s\S]*?<\/script>\s*/, "");
      }
      const file = route === "/" ? join(dist, "index.html") : join(dist, `${route.slice(1)}.html`);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, page);
      done.push(route);
    } catch (error) {
      console.log = log;
      console.warn(`⚠️  prerender skipped ${route}: ${error.message.split("\n")[0]}`);
    }
  }

  // قواعد صريحة قبل /* — ونجعل /* يخدم القالب النظيف بدل الرئيسية المصيَّرة
  const redirectsPath = join(dist, "_redirects");
  if (existsSync(redirectsPath)) {
    const rules = done.filter((r) => r !== "/").map((r) => `${r}    ${r}.html   200`).join("\n");
    const lines = readFileSync(redirectsPath, "utf8")
      .replace(/^(\/\S*\s+)\/index\.html(\s+200)/gm, "$1/app.html$2");
    const updated = lines.replace(/^\/\*\s+\/app\.html\s+200/m, (catchAll) => `# صفحات مصيَّرة مسبقاً (scripts/prerender.mjs)\n${rules}\n${catchAll}`);
    writeFileSync(redirectsPath, updated);
  }

  log(`✅ prerendered ${done.length}/${routes.length} pages`);
}

main().catch((error) => {
  // dist/app.html موجود، فالموقع يشتغل كتطبيق عادي حتى لو فشل التصيير
  console.warn("⚠️  prerender failed, site will be served as a plain SPA:", error.message);
  try {
    if (!existsSync(join(dist, "app.html"))) copyFileSync(join(dist, "index.html"), join(dist, "app.html"));
  } catch {
    /* لا شيء أكثر نقدر نسويه */
  }
});
