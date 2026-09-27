// Aggregates passive subdomain-enumeration sources server-side. Browsers
// cannot call most of these APIs directly (CORS), so this function fans out,
// merges and de-duplicates the results and returns a single list.
//
// Only public passive sources that need no API key are used. No traffic is
// ever sent to the target domain itself — data comes from third-party indexes.

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

// Accept only a plain registrable domain (letters/digits/hyphen labels). This
// keeps the function from being pointed at IPs, internal names or URLs.
function isValidDomain(d) {
  return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(d);
}

async function withTimeout(promise, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await promise(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

const UA = { "user-agent": "KleenologyScanner/1.0 (+subdomain-index)" };

// Each source returns an array of hostnames (may be empty on failure).
// crt.sh is intentionally NOT queried here: the certificate module already
// calls it directly from the browser, and hitting it twice per scan triggers
// crt.sh rate-limiting, which would empty the results.
const SOURCES = {
  async hackertarget(domain, signal) {
    const res = await fetch(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`, { signal, headers: UA });
    if (!res.ok) return [];
    const text = await res.text();
    if (/error|API count exceeded/i.test(text)) return [];
    return text.split("\n").map((line) => line.split(",")[0]);
  },
  async anubis(domain, signal) {
    const res = await fetch(`https://jldc.me/anubis/subdomains/${encodeURIComponent(domain)}`, { signal, headers: UA });
    if (!res.ok) return [];
    const arr = await res.json();
    return Array.isArray(arr) ? arr : [];
  },
  async otx(domain, signal) {
    const res = await fetch(`https://otx.alienvault.com/api/v1/indicators/domain/${encodeURIComponent(domain)}/passive_dns`, { signal, headers: UA });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.passive_dns ?? []).map((r) => r.hostname);
  },
  async certspotter(domain, signal) {
    const res = await fetch(
      `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`,
      { signal, headers: UA },
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return Array.isArray(rows) ? rows.flatMap((r) => r.dns_names ?? []) : [];
  },
  async rapiddns(domain, signal) {
    const res = await fetch(`https://rapiddns.io/subdomain/${encodeURIComponent(domain)}?full=1`, { signal, headers: UA });
    if (!res.ok) return [];
    const html = await res.text();
    // Extract every hostname of the target domain from the results table.
    const re = new RegExp(`[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\\.[a-z0-9-]+)*\\.${domain.replace(/\./g, "\\.")}`, "gi");
    return html.match(re) ?? [];
  },
  async wayback(domain, signal) {
    const res = await fetch(
      `https://web.archive.org/cdx/search/cdx?url=*.${encodeURIComponent(domain)}&output=json&fl=original&collapse=urlkey&limit=10000`,
      { signal, headers: UA },
    );
    if (!res.ok) return [];
    const rows = await res.json();
    // First row is the header; each remaining row is [originalUrl].
    return (Array.isArray(rows) ? rows.slice(1) : []).map((r) => {
      try {
        return new URL(r[0]).hostname;
      } catch {
        return "";
      }
    });
  },
  async threatminer(domain, signal) {
    const res = await fetch(`https://api.threatminer.org/v2/domain.php?q=${encodeURIComponent(domain)}&rt=5`, { signal, headers: UA });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.results) ? data.results : [];
  },
};

export default async (req) => {
  const domain = (new URL(req.url).searchParams.get("domain") ?? "").trim().toLowerCase().replace(/^\*\./, "");
  if (!domain) return json({ error: "missing domain parameter" }, 400);
  if (!isValidDomain(domain)) return json({ error: "invalid domain" }, 400);

  const names = Object.keys(SOURCES);
  const settled = await Promise.allSettled(
    names.map((name) => withTimeout((signal) => SOURCES[name](domain, signal), 12000)),
  );

  const all = new Set();
  const perSource = {};
  settled.forEach((outcome, i) => {
    const found = new Set();
    if (outcome.status === "fulfilled") {
      for (let host of outcome.value) {
        host = String(host).trim().toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
        // Keep only real subdomains of the target.
        if (host && (host === domain || host.endsWith(`.${domain}`)) && /^[a-z0-9.-]+$/.test(host)) {
          found.add(host);
          all.add(host);
        }
      }
    }
    perSource[names[i]] = { count: found.size, ok: outcome.status === "fulfilled" };
  });

  return json({
    domain,
    total: all.size,
    subdomains: Array.from(all).sort(),
    sources: perSource,
  });
};
