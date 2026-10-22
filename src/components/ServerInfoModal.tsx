import React, { useState } from 'react';
import { X, Server, Copy, Check, Radio, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import type { McStatus } from '../lib/sync';

interface ServerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcStatus: McStatus | null;
  mcChecked: boolean;
  serverAddress: string;
  lastUpdateAt: number | null;
  isStale: boolean;
  rejectedCount: number;
  syncError: string | null;
  isDemo: boolean;
  onToggleDemo: () => void;
}

export function timeAgo(ms: number | null): string {
  if (!ms) return 'never';
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)} days ago`;
}

export const ServerInfoModal: React.FC<ServerInfoModalProps> = ({
  isOpen,
  onClose,
  mcStatus,
  mcChecked,
  serverAddress,
  lastUpdateAt,
  isStale,
  rejectedCount,
  syncError,
  isDemo,
  onToggleDemo,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(serverAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address is selectable text anyway.
    }
  };

  const keyMismatch = rejectedCount > 0 && !lastUpdateAt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="server-info-title"
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 id="server-info-title" className="text-lg font-black text-white">Join Willy Money SMP</h3>
              <p className="text-xs text-slate-400">Java Edition 1.21+</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Address */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Server address</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-sm select-all">
                {serverAddress}
              </code>
              <button
                onClick={copyAddress}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Minecraft → Multiplayer → Add Server → paste the address.
            </p>
          </div>

          {/* Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Server</div>
              {mcStatus === null ? (
                <div className="mt-1 text-sm text-slate-400">{mcChecked ? 'Unavailable' : 'Checking…'}</div>
              ) : mcStatus.online ? (
                <div className="mt-1 text-sm font-bold text-emerald-400">
                  Online · {mcStatus.players}/{mcStatus.max}
                </div>
              ) : (
                <div className="mt-1 text-sm font-bold text-rose-400">Offline</div>
              )}
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Standings</div>
              <div className={`mt-1 text-sm font-bold flex items-center gap-1.5 ${isStale ? 'text-amber-300' : 'text-emerald-400'}`}>
                <Radio className="w-3.5 h-3.5" />
                {lastUpdateAt ? `Updated ${timeAgo(lastUpdateAt)}` : 'No update yet'}
              </div>
            </div>
          </div>

          {keyMismatch && (
            <div className="p-3 rounded-xl text-xs flex gap-2 bg-rose-950/40 border border-rose-800 text-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>
                Ignored {rejectedCount} update{rejectedCount === 1 ? '' : 's'} with an invalid signature. If you run the server, the
                key in <code className="font-mono">plugins/WillyMoneySMP/web-signing-key.properties</code> doesn&apos;t match this
                website. Run <code className="font-mono">/smp webkey</code> in game to check.
              </span>
            </div>
          )}

          {syncError && !lastUpdateAt && (
            <div className="p-3 rounded-xl text-xs flex gap-2 bg-amber-950/40 border border-amber-800 text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Couldn&apos;t reach the live relay: {syncError}</span>
            </div>
          )}

          <button
            onClick={() => {
              onToggleDemo();
              onClose();
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {isDemo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isDemo ? 'Back to live standings' : 'Preview with demo data'}
          </button>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <p className="font-semibold text-slate-300">Admin commands (in game)</p>
            <p>
              <code className="text-amber-400 font-mono">/smp sync</code> push the latest standings now
            </p>
            <p>
              <code className="text-amber-400 font-mono">/smp webkey</code> show the key this website must use
            </p>
            <p>
              <code className="text-amber-400 font-mono">/smp setip &lt;address&gt;</code> change the server address shown here
            </p>
            <p>
              <code className="text-sky-400 font-mono">/team create &lt;name&gt; &lt;captain&gt;</code> ·{' '}
              <code className="text-sky-400 font-mono">/bid nominate &lt;player&gt;</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
