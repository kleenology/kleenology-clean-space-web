import type { DnsResult, Finding } from '@/types/scanner';

const DOH = 'https://cloudflare-dns.com/dns-query';

async function doh(name: string, type: string): Promise<Array<{ data: string; TTL: number }>> {
  try {
    const res = await fetch(`${DOH}?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`, {
      headers: { Accept: 'application/dns-json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.Answer ?? []).map((r: { data: string; TTL: number }) => ({ data: r.data, TTL: r.TTL }));
  } catch {
    return [];
  }
}

const DKIM_SELECTORS = [
  'default', 'google', 'mail', 'dkim', 'k1', 'k2',
  'selector1', 'selector2', 'smtp', 'email', 's1', 's2',
];

export async function scanDNS(domain: string): Promise<{ result: DnsResult; findings: Finding[] }> {
  const [aRecs, aaaaRecs, mxRecs, nsRecs, txtRecs, dmarcRecs, dsRecs, caaRecs] = await Promise.all([
    doh(domain, 'A'),
    doh(domain, 'AAAA'),
    doh(domain, 'MX'),
    doh(domain, 'NS'),
    doh(domain, 'TXT'),
    doh(`_dmarc.${domain}`, 'TXT'),
    doh(domain, 'DS'),
    doh(domain, 'CAA'),
  ]);

  const dkimResults = await Promise.all(
    DKIM_SELECTORS.map(s => doh(`${s}._domainkey.${domain}`, 'TXT')),
  );
  const foundSelectors = DKIM_SELECTORS.filter((_, i) => dkimResults[i].length > 0);

  const unquote = (s: string) => s.replace(/^"|"$/g, '').replace(/"\s*"/g, '');
  const txtValues = txtRecs.map(r => unquote(r.data));
  const spfRecords = txtValues.filter(t => t.startsWith('v=spf1'));
  const spfRecord = spfRecords[0];
  const dmarcRaw = dmarcRecs.find(r => r.data.includes('v=DMARC1'));
  const dmarcRecord = dmarcRaw ? unquote(dmarcRaw.data) : undefined;
  const caaValues = caaRecs.map(r => unquote(r.data));

  const result: DnsResult = {
    ipv4: aRecs.map(r => r.data),
    ipv6: aaaaRecs.map(r => r.data),
    nameservers: nsRecs.map(r => r.data.replace(/\.$/, '')),
    mxRecords: mxRecs.map(r => r.data),
    txtRecords: txtValues,
    hasSPF: !!spfRecord,
    spfRecord,
    hasDMARC: !!dmarcRecord,
    dmarcRecord,
    hasDKIM: foundSelectors.length > 0,
    dkimSelectors: foundSelectors,
    hasDNSSEC: dsRecs.length > 0,
    hasCAA: caaValues.length > 0,
    caaRecords: caaValues,
  };

  const findings: Finding[] = [];

  // Count SPF DNS-lookup mechanisms (RFC 7208 caps these at 10).
  const spfLookups = spfRecord
    ? (spfRecord.match(/\b(include|a|mx|ptr|exists|redirect)[:=]?/gi) ?? []).length
    : 0;

  if (!result.hasSPF) {
    findings.push({
      id: 'dns-missing-spf',
      module: 'DNS / Email Security',
      severity: 'high',
      title: 'Missing SPF Record',
      description: 'No SPF record found. Attackers can forge emails claiming to be from this domain (email spoofing).',
      remediation: 'Add TXT record: v=spf1 include:_spf.<mailprovider>.com ~all',
      reference: 'https://www.rfc-editor.org/rfc/rfc7208',
    });
  } else if (spfRecord?.includes('+all')) {
    findings.push({
      id: 'dns-spf-plus-all',
      module: 'DNS / Email Security',
      severity: 'critical',
      title: 'SPF Record Uses +all — Permits Any Sender',
      description: '+all allows any server on the internet to send mail as this domain, completely defeating SPF.',
      evidence: spfRecord,
      remediation: 'Replace +all with ~all (soft fail) or -all (hard fail)',
    });
  } else if (spfRecord && !/[-~?+]all\b/.test(spfRecord)) {
    findings.push({
      id: 'dns-spf-no-all',
      module: 'DNS / Email Security',
      severity: 'medium',
      title: 'SPF Record Missing an "all" Mechanism',
      description: 'Without a trailing all mechanism, receivers apply a neutral result and spoofed mail is not reliably rejected.',
      evidence: spfRecord,
      remediation: 'End the SPF record with -all (hard fail) or at least ~all (soft fail).',
    });
  } else if (spfRecord?.includes('~all')) {
    findings.push({
      id: 'dns-spf-soft-fail',
      module: 'DNS / Email Security',
      severity: 'low',
      title: 'SPF Uses ~all (Soft Fail)',
      description: 'Soft fail asks receivers to accept-but-mark unauthorized mail rather than reject it, leaving room for spoofing.',
      evidence: spfRecord,
      remediation: 'Once confident in your sender list, tighten ~all to -all (hard fail).',
    });
  }

  if (spfRecords.length > 1) {
    findings.push({
      id: 'dns-spf-multiple',
      module: 'DNS / Email Security',
      severity: 'high',
      title: 'Multiple SPF Records Published',
      description: 'RFC 7208 permits only one SPF record. Multiple records cause a permerror and SPF is ignored entirely by receivers.',
      evidence: spfRecords.join('  |  '),
      remediation: 'Merge all senders into a single v=spf1 TXT record.',
    });
  }

  if (spfLookups > 10) {
    findings.push({
      id: 'dns-spf-lookup-limit',
      module: 'DNS / Email Security',
      severity: 'medium',
      title: `SPF Exceeds the 10 DNS-Lookup Limit (~${spfLookups})`,
      description: 'SPF allows at most 10 DNS-lookup mechanisms. Exceeding it produces a permerror, so SPF fails open.',
      evidence: spfRecord,
      remediation: 'Reduce include/a/mx/ptr/exists mechanisms, or flatten includes into IP ranges.',
    });
  }

  if (!result.hasDMARC) {
    findings.push({
      id: 'dns-missing-dmarc',
      module: 'DNS / Email Security',
      severity: 'high',
      title: 'Missing DMARC Record',
      description: 'No DMARC policy found. Mail receivers cannot enforce SPF/DKIM alignment or quarantine spoofed mail.',
      remediation: 'Add TXT at _dmarc.domain.com: v=DMARC1; p=quarantine; rua=mailto:dmarc@domain.com',
      reference: 'https://www.rfc-editor.org/rfc/rfc7489',
    });
  } else if (dmarcRecord?.includes('p=none')) {
    findings.push({
      id: 'dns-dmarc-none',
      module: 'DNS / Email Security',
      severity: 'medium',
      title: 'DMARC Policy is p=none (Monitor Only)',
      description: 'DMARC is in report-only mode. Spoofed emails are not quarantined or rejected.',
      evidence: dmarcRecord,
      remediation: 'Graduate to p=quarantine then p=reject after reviewing DMARC aggregate reports.',
    });
  }

  if (dmarcRecord) {
    const pctMatch = dmarcRecord.match(/pct=(\d+)/);
    if (pctMatch && Number(pctMatch[1]) < 100 && !dmarcRecord.includes('p=none')) {
      findings.push({
        id: 'dns-dmarc-partial-pct',
        module: 'DNS / Email Security',
        severity: 'medium',
        title: `DMARC Enforced on Only ${pctMatch[1]}% of Mail (pct<100)`,
        description: 'The DMARC policy is applied to a fraction of messages, leaving the remainder unprotected against spoofing.',
        evidence: dmarcRecord,
        remediation: 'Raise pct to 100 once monitoring confirms legitimate mail passes.',
      });
    }
    if (!/\brua=/.test(dmarcRecord)) {
      findings.push({
        id: 'dns-dmarc-no-rua',
        module: 'DNS / Email Security',
        severity: 'low',
        title: 'DMARC Has No Aggregate Reporting Address (rua)',
        description: 'Without rua you receive no aggregate reports, so you cannot see who is sending or spoofing mail as your domain.',
        evidence: dmarcRecord,
        remediation: 'Add rua=mailto:dmarc-reports@yourdomain.com to collect aggregate reports.',
      });
    }
    if (/\bsp=none\b/.test(dmarcRecord)) {
      findings.push({
        id: 'dns-dmarc-sp-none',
        module: 'DNS / Email Security',
        severity: 'medium',
        title: 'DMARC Subdomain Policy is sp=none',
        description: 'Subdomains are exempt from enforcement, so attackers can spoof mail from any subdomain of this domain.',
        evidence: dmarcRecord,
        remediation: 'Set sp=quarantine or sp=reject to cover subdomains.',
      });
    }
  }

  if (!result.hasCAA) {
    findings.push({
      id: 'dns-no-caa',
      module: 'DNS / Email Security',
      severity: 'low',
      title: 'No CAA Record — Any CA May Issue Certificates',
      description: 'Without a CAA record, any certificate authority can issue certificates for this domain, widening the mis-issuance attack surface.',
      remediation: 'Publish a CAA record, e.g. 0 issue "letsencrypt.org", to restrict which CAs may issue.',
      reference: 'https://www.rfc-editor.org/rfc/rfc8659',
    });
  }

  if (result.mxRecords.length > 0 && (!result.hasSPF || !result.hasDMARC)) {
    findings.push({
      id: 'dns-mx-without-auth',
      module: 'DNS / Email Security',
      severity: 'high',
      title: 'Mail Servers Present Without Full Email Authentication',
      description: 'The domain publishes MX records (it sends/receives mail) but is missing SPF and/or DMARC, making it an easy spoofing target.',
      evidence: `MX: ${result.mxRecords.join(', ')}`,
      remediation: 'Ensure SPF, DKIM, and an enforcing DMARC policy are all configured for any mail-enabled domain.',
    });
  }

  if (!result.hasDKIM) {
    findings.push({
      id: 'dns-missing-dkim',
      module: 'DNS / Email Security',
      severity: 'medium',
      title: 'DKIM Not Detected',
      description: 'No DKIM public key found for common selectors. Email integrity and authenticity cannot be cryptographically verified.',
      remediation: 'Configure DKIM signing in your mail provider and publish the TXT record at <selector>._domainkey.domain.com.',
    });
  }

  if (!result.hasDNSSEC) {
    findings.push({
      id: 'dns-no-dnssec',
      module: 'DNS / Email Security',
      severity: 'low',
      title: 'DNSSEC Not Configured',
      description: 'DNS responses are not cryptographically signed, making DNS cache poisoning attacks possible.',
      remediation: 'Enable DNSSEC through your domain registrar and validate with your DNS provider.',
      reference: 'https://www.icann.org/resources/pages/dnssec-what-is-it-why-important-2019-03-20-en',
    });
  }

  if (result.nameservers.length === 1) {
    findings.push({
      id: 'dns-single-ns',
      module: 'DNS / Email Security',
      severity: 'medium',
      title: 'Single Nameserver (Single Point of Failure)',
      description: 'Only one authoritative nameserver detected. A single failure makes the domain unresolvable.',
      remediation: 'Add at least two geographically distributed nameservers.',
    });
  }

  return { result, findings };
}
