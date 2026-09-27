import { useState } from 'react';
import { Shield, Search, RefreshCw, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useScanner } from '@/hooks/useScanner';
import { ApiKeyDialog } from '@/components/scanner/ApiKeyDialog';
import { RiskGauge } from '@/components/scanner/RiskGauge';
import { ScanProgress } from '@/components/scanner/ScanProgress';
import { ResultsTabs } from '@/components/scanner/ResultsTabs';

const ALL_MODULES = [
  { id: 'dns',        label: 'DNS & Email Security', requiresKey: false },
  { id: 'certs',      label: 'Certificate Transparency', requiresKey: false },
  { id: 'ip',         label: 'IP Geolocation', requiresKey: false },
  { id: 'headers',    label: 'HTTP Security Headers', requiresKey: false },
  { id: 'virustotal', label: 'VirusTotal Reputation', requiresKey: true,  keyField: 'virustotal' as const },
  { id: 'urlscan',    label: 'URLScan + Headers', requiresKey: true, keyField: 'urlscan' as const },
];

function exportJSON(result: object, domain: string) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recon-${domain}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SecurityScanner() {
  const { state, apiKeys, saveApiKeys, startScan, reset } = useScanner();
  const [target, setTarget] = useState('');
  const [enabled, setEnabled] = useState<Set<string>>(new Set(ALL_MODULES.map(m => m.id)));

  const toggle = (id: string) =>
    setEnabled(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleScan = () => {
    if (!target.trim()) return;
    startScan(target, enabled);
  };

  const scanning = state.phase === 'scanning';
  const done     = state.phase === 'complete';
  const active   = scanning || done;

  return (
    <div className="dark bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Security Reconnaissance Framework</h1>
            <p className="text-slate-500 text-sm mt-1">
              Passive recon & vulnerability surface mapping · DNS · Certificates · Reputation · Headers
            </p>
          </div>
        </div>

        {/* ── Target Input ─────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={target}
                onChange={e => setTarget(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleScan()}
                placeholder="example.com or https://example.com"
                disabled={scanning}
                className="pl-10 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-cyan-500/20 font-mono"
              />
            </div>
            {!active ? (
              <Button onClick={handleScan} disabled={!target.trim()} className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 shrink-0">
                Scan
              </Button>
            ) : (
              <Button onClick={reset} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 shrink-0 gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            )}
            <ApiKeyDialog apiKeys={apiKeys} onSave={saveApiKeys} />
          </div>

          {/* Module toggles */}
          <div className="flex flex-wrap gap-4">
            {ALL_MODULES.map(m => {
              const hasKey = !m.requiresKey || (m.keyField && apiKeys[m.keyField]);
              return (
                <div key={m.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`mod-${m.id}`}
                    checked={enabled.has(m.id)}
                    onCheckedChange={() => toggle(m.id)}
                    disabled={scanning}
                    className="border-slate-600 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600"
                  />
                  <Label htmlFor={`mod-${m.id}`} className="text-slate-400 text-sm cursor-pointer select-none">
                    {m.label}
                    {m.requiresKey && !hasKey && (
                      <span className="ml-1.5 text-xs text-amber-500">(needs key)</span>
                    )}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Scan Progress ─────────────────────────────────────────────── */}
        {active && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {scanning && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
              <h2 className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                {scanning ? `Scanning ${state.result?.domain}...` : `Scan complete · ${state.result?.domain}`}
              </h2>
              {done && state.result && (
                <span className="text-slate-600 text-xs ml-auto">
                  {Math.round((state.result.endTime!.getTime() - state.result.startTime.getTime()) / 1000)}s
                </span>
              )}
            </div>
            <ScanProgress modules={state.modules} />
          </div>
        )}

        {/* ── Risk Score + Results ──────────────────────────────────────── */}
        {state.result && state.result.findings.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <RiskGauge score={state.result.riskScore} />
              {done && (
                <Button
                  onClick={() => exportJSON(state.result!, state.result!.domain)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </Button>
              )}
            </div>
            <ResultsTabs result={state.result} />
          </div>
        )}

        {/* Show tabs (dorks + waiting) even before findings */}
        {state.result && state.result.findings.length === 0 && state.phase !== 'idle' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <ResultsTabs result={state.result} />
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <p className="text-center text-slate-700 text-xs pb-4">
          For authorized penetration testing and security research only · Data sources: Cloudflare DoH · crt.sh · ipapi.co · VirusTotal · URLScan.io
        </p>
      </div>
    </div>
  );
}
