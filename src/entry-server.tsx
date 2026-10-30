// يُبنى بـ vite build --ssr ويستدعيه scripts/prerender.mjs وقت البناء فقط:
// يحوّل كل صفحة لـ HTML جاهز حتى تقرأها روبوتات الذكاء الاصطناعي ومحركات
// البحث اللي ما تشغّل الجافاسكربت.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import "./i18n";
import { takeSsrHead } from "./components/SEO";

export function render(url: string) {
  const html = renderToString(
    <App wrapRouter={(children) => <StaticRouter location={url}>{children}</StaticRouter>} />,
  );
  return { html, head: takeSsrHead() };
}
