import type { Finding, HttpHeadersResult } from '@/types/scanner';

// The header/cookie probe runs through a same-origin serverless function
// (netlify/functions/http-headers) because browsers cannot read cross-origin
// response headers directly (CORS).
const ENDPOINT = '/api/scan/headers';

interface SecurityHeaderSpec {
  header: string;
  label: string;
  severity: Finding['severity'];
  description: string;
  remediation: string;
  reference?: string;
}

const SECURITY_HEADERS: SecurityHeaderSpec[] = [
  {
    header: 'content-security-policy',
    label: 'Content-Security-Policy',
    severity: 'medium',
    description: 'No CSP header. A strong CSP is the most effective mitigation against cross-site scripting (XSS) and content injection.',
    remediation: "Add a Content-Security-Policy header, starting from default-src 'self' and tightening from there.",
    reference: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy',
  },
  {
    header: 'strict-transport-security',
    label: 'Strict-Transport-Security',
    severity: 'medium',
    description: 'No HSTS header. Without it, browsers can be downgraded to plaintext HTTP (SSL-stripping) on the first or a tampered request.',
    remediation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains.',
    reference: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security',
  },
  {
    header: 'x-frame-options',
    label: 'X-Frame-Options',
    severity: 'low',
    description: 'No X-Frame-Options (and no CSP frame-ancestors). The page can be framed by other origins, enabling clickjacking.',
    remediation: 'Add X-Frame-Options: DENY, or a Content-Security-Policy with frame-ancestors \'self\'.',
  },
  {
    header: 'x-content-type-options',
    label: 'X-Content-Type-Options',
    severity: 'low',
    description: 'No X-Content-Type-Options header. Browsers may MIME-sniff responses, which can turn benign uploads into executable content.',
    remediation: 'Add X-Content-Type-Options: nosniff.',
  },
  {
    header: 'referrer-policy',
    label: 'Referrer-Policy',
    severity: 'low',
    description: 'No Referrer-Policy header. Full URLs (which may contain sensitive path/query data) can leak to third-party sites.',
    remediation: 'Add Referrer-Policy: strict-origin-when-cross-origin.',
  },
  {
    header: 'permissions-policy',
    label: 'Permissions-Policy',
    severity: 'info',
    description: 'No Permissions-Policy header. Powerful browser features (camera, microphone, geolocation) are not explicitly restricted.',
    remediation: 'Add a Permissions-Policy header disabling features you do not use, e.g. geolocation=(), microphone=(), camera=().',
  },
];

interface HeadersApiResponse {
  finalStatus: number;
  server: string | null;
  poweredBy: string | null;
  headers: Record<string, string>;
  setCookies: string[];
  error?: string;
}

function parseCookie(raw: string): HttpHeadersResult['cookies'][number] {
  const name = raw.split('=')[0]?.trim() ?? '(unknown)';
  const lower = raw.toLowerCase();
  const sameSiteMatch = lower.match(/samesite=([a-z]+)/);
  return {
    name,
    secure: /(^|;)\s*secure(\s*;|\s*$)/.test(lower),
    httpOnly: /(^|;)\s*httponly(\s*;|\s*$)/.test(lower),
    sameSite: sameSiteMatch ? sameSiteMatch[1] : null,
  };
}

export async function scanHeaders(
  target: string,
): Promise<{ result: HttpHeadersResult | null; findings: Finding[] }> {
  let data: HeadersApiResponse;
  try {
    const res = await fetch(`${ENDPOINT}?url=${encodeURIComponent(target)}`);
    if (!res.ok) return { result: null, findings: [] };
    data = await res.json();
    if (data.error) return { result: null, findings: [] };
  } catch {
    return { result: null, findings: [] };
  }

  const findings: Finding[] = [];
  const present: string[] = [];
  const missing: string[] = [];

  for (const spec of SECURITY_HEADERS) {
    if (data.headers[spec.header]) {
      present.push(spec.label);
    } else {
      missing.push(spec.label);
      findings.push({
        id: `headers-missing-${spec.header}`,
        module: 'HTTP Security Headers',
        severity: spec.severity,
        title: `Missing ${spec.label} Header`,
        description: spec.description,
        remediation: spec.remediation,
        reference: spec.reference,
      });
    }
  }

  // XSS-readiness: CSP is the primary defence-in-depth control against XSS.
  // Analyse its strength when present (no payloads are ever sent to the target).
  const csp = data.headers['content-security-policy'];
  if (csp) {
    const lower = csp.toLowerCase();
    const scriptDirective =
      lower.match(/script-src[^;]*/)?.[0] ?? lower.match(/default-src[^;]*/)?.[0] ?? '';

    if (scriptDirective.includes("'unsafe-inline'")) {
      findings.push({
        id: 'headers-csp-unsafe-inline',
        module: 'HTTP Security Headers',
        severity: 'medium',
        title: "CSP Allows 'unsafe-inline' Scripts",
        description: "'unsafe-inline' lets inline <script> and event-handler attributes run, which largely defeats CSP as an XSS defence.",
        evidence: scriptDirective.trim(),
        remediation: "Remove 'unsafe-inline'; use nonces or hashes for the scripts you trust.",
        reference: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src',
      });
    }
    if (scriptDirective.includes("'unsafe-eval'")) {
      findings.push({
        id: 'headers-csp-unsafe-eval',
        module: 'HTTP Security Headers',
        severity: 'low',
        title: "CSP Allows 'unsafe-eval'",
        description: "'unsafe-eval' permits eval() and similar string-to-code APIs, expanding the XSS attack surface.",
        evidence: scriptDirective.trim(),
        remediation: "Remove 'unsafe-eval' and refactor code that relies on eval().",
      });
    }
    if (/script-src[^;]*(\s|:)\*/.test(lower) || (!lower.includes('script-src') && /default-src[^;]*(\s|:)\*/.test(lower))) {
      findings.push({
        id: 'headers-csp-wildcard-script',
        module: 'HTTP Security Headers',
        severity: 'medium',
        title: 'CSP Script Source Uses a Wildcard (*)',
        description: 'A wildcard script source lets scripts load from any origin, so an attacker-controlled host can serve malicious JavaScript.',
        evidence: scriptDirective.trim(),
        remediation: 'Replace * with an explicit allowlist of trusted script origins.',
      });
    }
    if (!lower.includes('object-src')) {
      findings.push({
        id: 'headers-csp-no-object-src',
        module: 'HTTP Security Headers',
        severity: 'info',
        title: "CSP Missing object-src 'none'",
        description: 'Without object-src, plugins/embeds (<object>, <embed>) can be injected as an XSS vector.',
        remediation: "Add object-src 'none' to the policy.",
      });
    }
  }

  const cookies = data.setCookies.map(parseCookie);
  for (const cookie of cookies) {
    if (!cookie.httpOnly) {
      findings.push({
        id: `headers-cookie-httponly-${cookie.name}`,
        module: 'HTTP Security Headers',
        severity: 'high',
        title: `Session Cookie "${cookie.name}" Lacks HttpOnly`,
        description: 'A cookie without HttpOnly can be read by JavaScript, so any XSS on the site can steal the session token.',
        evidence: `Set-Cookie: ${cookie.name}=…`,
        remediation: 'Set the HttpOnly attribute on session cookies.',
        reference: 'https://cwe.mitre.org/data/definitions/1004.html',
      });
    }
    if (!cookie.secure) {
      findings.push({
        id: `headers-cookie-secure-${cookie.name}`,
        module: 'HTTP Security Headers',
        severity: 'medium',
        title: `Cookie "${cookie.name}" Lacks Secure`,
        description: 'Without the Secure attribute, the cookie can be transmitted over plaintext HTTP and intercepted.',
        evidence: `Set-Cookie: ${cookie.name}=…`,
        remediation: 'Set the Secure attribute so the cookie is only sent over HTTPS.',
        reference: 'https://cwe.mitre.org/data/definitions/614.html',
      });
    }
    if (!cookie.sameSite) {
      findings.push({
        id: `headers-cookie-samesite-${cookie.name}`,
        module: 'HTTP Security Headers',
        severity: 'low',
        title: `Cookie "${cookie.name}" Has No SameSite Attribute`,
        description: 'Without SameSite, the cookie is sent on cross-site requests, exposing the site to CSRF.',
        evidence: `Set-Cookie: ${cookie.name}=…`,
        remediation: 'Set SameSite=Strict (or Lax) on cookies.',
      });
    }
  }

  if (data.poweredBy) {
    findings.push({
      id: 'headers-x-powered-by',
      module: 'HTTP Security Headers',
      severity: 'info',
      title: 'Technology Disclosed via X-Powered-By',
      description: 'The X-Powered-By header reveals the backend technology and version, helping attackers target known vulnerabilities.',
      evidence: `X-Powered-By: ${data.poweredBy}`,
      remediation: 'Remove or suppress the X-Powered-By header.',
    });
  }

  if (data.server && /\d/.test(data.server)) {
    findings.push({
      id: 'headers-server-version',
      module: 'HTTP Security Headers',
      severity: 'info',
      title: 'Server Version Disclosed',
      description: 'The Server header exposes the web server software and version, aiding version-specific exploitation.',
      evidence: `Server: ${data.server}`,
      remediation: 'Suppress the version in the Server header (e.g. ServerTokens Prod on Apache, server_tokens off on nginx).',
    });
  }

  // At-a-glance XSS readiness from the response's defensive posture (no active
  // probing): strong CSP => protected, weak CSP => weak, no CSP => exposed.
  let xssPosture: HttpHeadersResult['xssPosture'];
  let xssSummary: string;
  const cspLower = csp?.toLowerCase() ?? '';
  const cspIsWeak =
    cspLower.includes("'unsafe-inline'") ||
    cspLower.includes("'unsafe-eval'") ||
    /script-src[^;]*(\s|:)\*/.test(cspLower);
  if (!csp) {
    xssPosture = 'exposed';
    xssSummary = 'No Content-Security-Policy: if any input is reflected unsafely, injected scripts run with nothing to stop them.';
  } else if (cspIsWeak) {
    xssPosture = 'weak';
    xssSummary = 'A CSP exists but is weakened (unsafe-inline / unsafe-eval / wildcard), so it offers limited protection against XSS.';
  } else {
    xssPosture = 'protected';
    xssSummary = 'A Content-Security-Policy is present without obvious weaknesses, providing defence-in-depth against XSS.';
  }

  const result: HttpHeadersResult = {
    finalStatus: data.finalStatus,
    server: data.server ?? undefined,
    poweredBy: data.poweredBy ?? undefined,
    present,
    missing,
    xssPosture,
    xssSummary,
    cookies,
  };

  return { result, findings };
}
