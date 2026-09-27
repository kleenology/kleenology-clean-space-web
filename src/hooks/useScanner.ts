import { useState, useCallback, useRef } from 'react';
import type { ScanState, ApiKeys, ScanResult, ModuleStates, Finding } from '@/types/scanner';
import { scanDNS } from '@/lib/scanner/dns';
import { scanCertificates } from '@/lib/scanner/certs';
import { scanIP } from '@/lib/scanner/ip';
import { checkVirusTotal, submitUrlScan } from '@/lib/scanner/reputation';
import { scanHeaders } from '@/lib/scanner/headers';
import { calculateRiskScore } from '@/lib/scanner/scoring';

const DEFAULT_KEYS: ApiKeys = { virustotal: '', urlscan: '' };

function loadStoredKeys(): ApiKeys {
  try {
    return { ...DEFAULT_KEYS, ...JSON.parse(localStorage.getItem('recon-api-keys') ?? '{}') };
  } catch {
    return DEFAULT_KEYS;
  }
}

function parseDomain(input: string): string {
  let s = input.trim();
  if (!s.startsWith('http')) s = `https://${s}`;
  try {
    return new URL(s).hostname.replace(/^www\./, '');
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

function normalizeUrl(input: string): string {
  const s = input.trim();
  return s.startsWith('http') ? s : `https://${s}`;
}

const IDLE_MODULES: ModuleStates = {
  dns: 'idle', certs: 'idle', ip: 'idle', headers: 'idle', virustotal: 'idle', urlscan: 'idle',
};

export function useScanner() {
  const [state, setState] = useState<ScanState>({ phase: 'idle', modules: IDLE_MODULES });
  const [apiKeys, setApiKeys] = useState<ApiKeys>(loadStoredKeys);
  const abortRef = useRef<AbortController | null>(null);

  const saveApiKeys = useCallback((keys: ApiKeys) => {
    setApiKeys(keys);
    localStorage.setItem('recon-api-keys', JSON.stringify(keys));
  }, []);

  // Merge partial findings into state and recompute risk score
  const pushFindings = useCallback((incoming: Finding[]) => {
    if (!incoming.length) return;
    setState(prev => {
      if (!prev.result) return prev;
      const all = [...prev.result.findings, ...incoming];
      return {
        ...prev,
        result: { ...prev.result, findings: all, riskScore: calculateRiskScore(all) },
      };
    });
  }, []);

  const setModuleStatus = useCallback(
    (module: keyof ModuleStates, status: ModuleStates[keyof ModuleStates]) => {
      setState(prev => ({ ...prev, modules: { ...prev.modules, [module]: status } }));
    },
    [],
  );

  const mergeResult = useCallback(<K extends keyof ScanResult>(key: K, value: ScanResult[K]) => {
    setState(prev => {
      if (!prev.result) return prev;
      return { ...prev, result: { ...prev.result, [key]: value } };
    });
  }, []);

  const startScan = useCallback(
    async (target: string, enabledModules: Set<string>) => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const domain = parseDomain(target);
      const url = normalizeUrl(target);

      const initialModules: ModuleStates = {
        dns:        enabledModules.has('dns')   ? 'running' : 'skipped',
        certs:      enabledModules.has('certs') ? 'running' : 'skipped',
        headers:    enabledModules.has('headers') ? 'running' : 'skipped',
        ip:         'idle',
        virustotal: enabledModules.has('virustotal') && apiKeys.virustotal ? 'running' : 'skipped',
        urlscan:    enabledModules.has('urlscan') && apiKeys.urlscan       ? 'running' : 'skipped',
      };

      const initialResult: ScanResult = {
        target: url,
        domain,
        startTime: new Date(),
        findings: [],
        riskScore: 0,
      };

      setState({ phase: 'scanning', modules: initialModules, result: initialResult });

      const tasks: Promise<void>[] = [];

      // ── DNS ──────────────────────────────────────────────────────────────
      if (enabledModules.has('dns')) {
        tasks.push(
          scanDNS(domain)
            .then(({ result, findings }) => {
              if (abort.signal.aborted) return;
              mergeResult('dns', result);
              setModuleStatus('dns', 'complete');
              pushFindings(findings);

              // IP scan depends on DNS resolving an IPv4 address
              if (result.ipv4.length > 0 && enabledModules.has('ip')) {
                setModuleStatus('ip', 'running');
                scanIP(result.ipv4[0])
                  .then(({ result: ipResult }) => {
                    if (abort.signal.aborted || !ipResult) return;
                    mergeResult('ip', ipResult);
                    setModuleStatus('ip', 'complete');
                  })
                  .catch(() => setModuleStatus('ip', 'error'));
              }
            })
            .catch(() => setModuleStatus('dns', 'error')),
        );
      }

      // ── Certificates ─────────────────────────────────────────────────────
      if (enabledModules.has('certs')) {
        tasks.push(
          scanCertificates(domain)
            .then(({ result, findings }) => {
              if (abort.signal.aborted) return;
              mergeResult('certs', result);
              setModuleStatus('certs', 'complete');
              pushFindings(findings);
            })
            .catch(() => setModuleStatus('certs', 'error')),
        );
      }

      // ── HTTP Security Headers (via serverless proxy) ─────────────────────
      if (enabledModules.has('headers')) {
        tasks.push(
          scanHeaders(normalizeUrl(target))
            .then(({ result, findings }) => {
              if (abort.signal.aborted) return;
              if (result) mergeResult('headers', result);
              setModuleStatus('headers', result ? 'complete' : 'error');
              pushFindings(findings);
            })
            .catch(() => setModuleStatus('headers', 'error')),
        );
      }

      // ── VirusTotal ────────────────────────────────────────────────────────
      if (enabledModules.has('virustotal') && apiKeys.virustotal) {
        tasks.push(
          checkVirusTotal(domain, apiKeys.virustotal)
            .then(({ result, findings }) => {
              if (abort.signal.aborted) return;
              if (result) mergeResult('virustotal', result);
              setModuleStatus('virustotal', 'complete');
              pushFindings(findings);
            })
            .catch(() => setModuleStatus('virustotal', 'error')),
        );
      }

      // ── URLScan.io ────────────────────────────────────────────────────────
      if (enabledModules.has('urlscan') && apiKeys.urlscan) {
        tasks.push(
          submitUrlScan(url, apiKeys.urlscan)
            .then(({ result, findings }) => {
              if (abort.signal.aborted) return;
              if (result) mergeResult('urlscan', result);
              setModuleStatus('urlscan', 'complete');
              pushFindings(findings);
            })
            .catch(() => setModuleStatus('urlscan', 'error')),
        );
      }

      await Promise.allSettled(tasks);

      if (!abort.signal.aborted) {
        setState(prev => ({
          ...prev,
          phase: 'complete',
          result: prev.result ? { ...prev.result, endTime: new Date() } : prev.result,
        }));
      }
    },
    [apiKeys, pushFindings, setModuleStatus, mergeResult],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ phase: 'idle', modules: IDLE_MODULES });
  }, []);

  return { state, apiKeys, saveApiKeys, startScan, reset };
}
