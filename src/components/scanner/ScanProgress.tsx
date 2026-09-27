import { CheckCircle, XCircle, Loader2, MinusCircle, Circle } from 'lucide-react';
import type { ModuleStates, ModuleStatus } from '@/types/scanner';

const MODULE_LABELS: Record<keyof ModuleStates, string> = {
  dns:        'DNS & Email',
  certs:      'Certificates',
  ip:         'IP Geolocation',
  headers:    'Security Headers',
  virustotal: 'VirusTotal',
  urlscan:    'URLScan + Headers',
};

function StatusIcon({ status }: { status: ModuleStatus }) {
  if (status === 'running')  return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
  if (status === 'complete') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === 'error')    return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === 'skipped')  return <MinusCircle className="w-4 h-4 text-slate-600" />;
  return <Circle className="w-4 h-4 text-slate-700" />;
}

function statusLabel(status: ModuleStatus) {
  if (status === 'running')  return <span className="text-cyan-400 text-xs">Scanning...</span>;
  if (status === 'complete') return <span className="text-emerald-400 text-xs">Done</span>;
  if (status === 'error')    return <span className="text-red-400 text-xs">Error</span>;
  if (status === 'skipped')  return <span className="text-slate-600 text-xs">Skipped</span>;
  return <span className="text-slate-700 text-xs">Idle</span>;
}

interface Props {
  modules: ModuleStates;
}

export function ScanProgress({ modules }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {(Object.entries(modules) as [keyof ModuleStates, ModuleStatus][]).map(([key, status]) => (
        <div
          key={key}
          className={`flex flex-col gap-1.5 p-3 rounded-lg border transition-all duration-300 ${
            status === 'running'  ? 'border-cyan-500/50 bg-cyan-950/30' :
            status === 'complete' ? 'border-emerald-500/30 bg-emerald-950/20' :
            status === 'error'    ? 'border-red-500/30 bg-red-950/20' :
            'border-slate-800 bg-slate-900/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <StatusIcon status={status} />
            {statusLabel(status)}
          </div>
          <span className="text-slate-300 text-xs font-medium">{MODULE_LABELS[key]}</span>
        </div>
      ))}
    </div>
  );
}
