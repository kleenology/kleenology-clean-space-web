import type { CertResult, Certificate, Finding } from '@/types/scanner';

interface CrtShEntry {
  id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  not_before: string;
  not_after: string;
}

// Pull extra subdomains from the multi-source aggregator (crt.sh, certspotter,
// hackertarget, anubis, OTX) via a same-origin serverless function.
async function fetchAggregatedSubdomains(
  domain: string,
): Promise<{ subdomains: string[]; sources?: CertResult['subdomainSources'] }> {
  try {
    const res = await fetch(`/api/scan/subdomains?domain=${encodeURIComponent(domain)}`);
    if (!res.ok) return { subdomains: [] };
    const data = await res.json();
    if (data.error || !Array.isArray(data.subdomains)) return { subdomains: [] };
    return { subdomains: data.subdomains, sources: data.sources };
  } catch {
    return { subdomains: [] };
  }
}

export async function scanCertificates(domain: string): Promise<{ result: CertResult; findings: Finding[] }> {
  const empty: CertResult = { certificates: [], subdomains: [], totalCerts: 0, wildcardCerts: 0, expiredCerts: 0 };

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(
      `https://crt.sh/?q=%.${encodeURIComponent(domain)}&output=json`,
      { signal: controller.signal },
    );
    clearTimeout(tid);

    if (!res.ok) return { result: empty, findings: [] };

    const raw: CrtShEntry[] = await res.json();

    const seenIds = new Set<number>();
    const unique = raw.filter(c => {
      if (seenIds.has(c.id)) return false;
      seenIds.add(c.id);
      return true;
    });

    const now = new Date();
    const subdomainSet = new Set<string>();
    let wildcardCerts = 0;
    let expiredCerts = 0;

    const certificates: Certificate[] = unique.map(c => {
      const expired = new Date(c.not_after) < now;
      const wildcard = c.common_name.startsWith('*');
      if (wildcard) wildcardCerts++;
      if (expired) expiredCerts++;

      c.name_value.split('\n').forEach(name => {
        const cleaned = name.trim().replace(/^\*\./, '').toLowerCase();
        if (cleaned && (cleaned === domain || cleaned.endsWith(`.${domain}`))) {
          subdomainSet.add(cleaned);
        }
      });

      return {
        id: c.id,
        issuerName: c.issuer_name,
        commonName: c.common_name,
        nameValue: c.name_value,
        notBefore: c.not_before,
        notAfter: c.not_after,
        isExpired: expired,
        isWildcard: wildcard,
      };
    });

    // Enrich the CT-derived subdomains with the aggregator's other sources.
    const agg = await fetchAggregatedSubdomains(domain);
    agg.subdomains.forEach(s => subdomainSet.add(s));

    const result: CertResult = {
      certificates: certificates.slice(0, 50),
      subdomains: Array.from(subdomainSet).sort(),
      totalCerts: unique.length,
      wildcardCerts,
      expiredCerts,
      subdomainSources: agg.sources,
    };

    const findings: Finding[] = [];

    if (expiredCerts > 0) {
      findings.push({
        id: 'cert-expired',
        module: 'Certificate Transparency',
        severity: 'medium',
        title: `${expiredCerts} Expired Certificate(s) in CT Logs`,
        description: 'Expired certificates in CT logs indicate gaps in certificate lifecycle management.',
        remediation: "Audit all certificates. Implement automated renewal (e.g., Let's Encrypt with certbot).",
      });
    }

    if (wildcardCerts > 0) {
      findings.push({
        id: 'cert-wildcard',
        module: 'Certificate Transparency',
        severity: 'info',
        title: `${wildcardCerts} Wildcard Certificate(s) Detected`,
        description: 'Wildcard certs cover *.domain.com. A private key compromise exposes all subdomains simultaneously.',
        remediation: 'Consider dedicated certificates for high-value subdomains (e.g., payment, admin).',
      });
    }

    if (subdomainSet.size > 30) {
      findings.push({
        id: 'cert-large-surface',
        module: 'Certificate Transparency',
        severity: 'info',
        title: `${subdomainSet.size} Subdomains Discovered Across Public Sources`,
        description: 'A large subdomain footprint increases attack surface. These names are publicly indexed (CT logs, passive DNS, crt.sh, certspotter, and others).',
        evidence: `${subdomainSet.size} unique subdomains found`,
        remediation: 'Decommission unused subdomains. Ensure each subdomain has appropriate security controls.',
      });
    }

    return { result, findings };
  } catch {
    return { result: empty, findings: [] };
  }
}
