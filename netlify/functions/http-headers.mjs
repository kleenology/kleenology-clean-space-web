// Fetches a target URL server-side and returns its HTTP response metadata
// (status, server banner, security headers, Set-Cookie flags, redirect chain).
// The browser cannot read cross-origin response headers because of CORS, so
// the scanner's header/cookie checks run here instead.
//
// SSRF hardening: only public http(s) targets are allowed. Localhost, private
// ranges, and the cloud metadata address are rejected before any fetch.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

// Reject hostnames that resolve to non-public space by literal form. This is a
// best-effort guard (DNS rebinding is out of scope for a header probe); it
// blocks the obvious internal targets and the metadata endpoint.
function isBlockedHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return true;
  if (h === "metadata.google.internal") return true;

  // IPv4 literal ranges.
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a >= 224) return true; // multicast / reserved
  }

  // IPv6 loopback / link-local / unique-local.
  if (h === "::1" || h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;

  return false;
}

export default async (req) => {
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) return json({ error: "missing url parameter" }, 400);

  let target;
  try {
    target = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return json({ error: "invalid url" }, 400);
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return json({ error: "only http(s) targets are allowed" }, 400);
  }
  if (isBlockedHost(target.hostname)) {
    return json({ error: "target host is not permitted" }, 400);
  }

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
