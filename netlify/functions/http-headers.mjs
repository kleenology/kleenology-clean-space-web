// Fetches a target URL server-side and returns its HTTP response metadata
// (status, server banner, security headers, Set-Cookie flags, redirect chain).
// The browser cannot read cross-origin response headers because of CORS, so
// the scanner's header/cookie checks run here instead.
//
// SSRF hardening: only public http(s) targets are allowed. Localhost, private
// ranges, and the cloud metadata address are rejected before any fetch.

import { unsafeTarget } from "../lib/safe-target.mjs";
import { rateLimited, clientIp } from "../lib/rate-limit.mjs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export default async (req) => {
  if (rateLimited(`headers:${clientIp(req)}`, { max: 30 })) return json({ error: "too many requests" }, 429);
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) return json({ error: "missing url parameter" }, 400);

  let target;
  try {
    target = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return json({ error: "invalid url" }, 400);
  }

  // يحل الاسم فعلياً ويرفض أي عنوان داخلي — فحص النص وحده كان يُتجاوز
  const unsafe = await unsafeTarget(target);
  if (unsafe) return json({ error: unsafe }, 400);

  const controller = new AbortController();
  // Stay under Netlify's ~10s synchronous-function limit.
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(target.toString(), {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "KleenologyScanner/1.0 (+headers-probe)" },
    });

    // Collect headers case-insensitively; keep every Set-Cookie line.
    const headers = {};
    const setCookies = [];
    for (const [key, value] of res.headers) {
      const k = key.toLowerCase();
      if (k === "set-cookie") setCookies.push(value);
      else headers[k] = value;
    }
    // Some runtimes expose combined Set-Cookie only via getSetCookie().
    if (setCookies.length === 0 && typeof res.headers.getSetCookie === "function") {
      for (const c of res.headers.getSetCookie()) setCookies.push(c);
    }

    return json({
      requestedUrl: target.toString(),
      finalStatus: res.status,
      redirectLocation: res.headers.get("location") || null,
      server: res.headers.get("server") || null,
      poweredBy: res.headers.get("x-powered-by") || null,
      headers,
      setCookies,
    });
  } catch (err) {
    return json({ error: err.name === "AbortError" ? "target timed out" : "fetch failed" }, 502);
  } finally {
    clearTimeout(timer);
  }
};
