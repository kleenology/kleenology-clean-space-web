export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ModuleStatus = 'idle' | 'running' | 'complete' | 'error' | 'skipped';

export interface ApiKeys {
  virustotal: string;
  urlscan: string;
}

export interface Finding {
  id: string;
  module: string;
  severity: Severity;
  title: string;
  description: string;
  evidence?: string;
  remediation?: string;
  reference?: string;
}

export interface DnsResult {
  ipv4: string[];
  ipv6: string[];
  nameservers: string[];
  mxRecords: string[];
  txtRecords: string[];
  hasSPF: boolean;
  spfRecord?: string;
  hasDMARC: boolean;
  dmarcRecord?: string;
  hasDKIM: boolean;
  dkimSelectors: string[];
  hasDNSSEC: boolean;
  hasCAA: boolean;
  caaRecords: string[];
}

export interface Certificate {
  id: number;
  issuerName: string;
  commonName: string;
  nameValue: string;
  notBefore: string;
  notAfter: string;
  isExpired: boolean;
  isWildcard: boolean;
}

export interface CertResult {
  certificates: Certificate[];
  subdomains: string[];
  totalCerts: number;
  wildcardCerts: number;
  expiredCerts: number;
  subdomainSources?: Record<string, { count: number; ok: boolean }>;
}

export interface IpResult {
  ip: string;
  city: string;
  region: string;
  countryCode: string;
  countryName: string;
  org: string;
  asn: string;
  timezone: string;
  isHosting: boolean;
}

export interface VirusTotalResult {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  totalVendors: number;
  reputation: number;
  lastAnalysisDate: string;
  categories: string[];
}

export interface SecurityHeader {
  name: string;
  value?: string;
  present: boolean;
  severity: Severity;
  description: string;
  recommendation: string;
}

export interface UrlScanResult {
  uuid: string;
  reportURL: string;
  screenshotURL?: string;
  status: 'submitted' | 'processing' | 'complete' | 'error';
  server?: string;
  ip?: string;
  country?: string;
  tlsProtocol?: string;
  headers: SecurityHeader[];
  technologies: string[];
}

export interface HttpHeadersResult {
  finalStatus: number;
  server?: string;
  poweredBy?: string;
  present: string[];
  missing: string[];
  xssPosture: 'protected' | 'weak' | 'exposed';
  xssSummary: string;
  cookies: Array<{
    name: string;
    secure: boolean;
    httpOnly: boolean;
    sameSite: string | null;
  }>;
}

export interface ModuleStates {
  dns: ModuleStatus;
  certs: ModuleStatus;
  ip: ModuleStatus;
  headers: ModuleStatus;
  virustotal: ModuleStatus;
  urlscan: ModuleStatus;
}

export interface ScanResult {
  target: string;
  domain: string;
  startTime: Date;
  endTime?: Date;
  findings: Finding[];
  riskScore: number;
  dns?: DnsResult;
  certs?: CertResult;
  ip?: IpResult;
  headers?: HttpHeadersResult;
  virustotal?: VirusTotalResult;
  urlscan?: UrlScanResult;
}

export interface ScanState {
  phase: 'idle' | 'scanning' | 'complete' | 'error';
  modules: ModuleStates;
  result?: ScanResult;
  error?: string;
}
