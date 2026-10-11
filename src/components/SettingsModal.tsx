import React, { useState } from 'react';
import { X, Server, Wifi, Check, AlertCircle, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
  isLive: boolean;
  onLoadDemo: () => void;
  onResetDraft?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSaveApiUrl,
  onLoadDemo,
  onResetDraft,
}) => {
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage(null);
    try {
      const raw = inputUrl.trim().toLowerCase();

      // Check if user entered a Minecraft server domain/IP (e.g. willymoneysmp.minefort.com)
      if (raw.includes('minefort.com') || raw.includes('37.59.210.71') || !raw.startsWith('http')) {
        const cleanHost = raw.replace(/^https?:\/\//, '').split('/')[0].split(':')[0] || 'willymoneysmp.minefort.com';
        const mcPing = await fetch(`https://api.mcstatus.io/v2/status/java/${cleanHost}`, { cache: 'no-store' });
        if (mcPing.ok) {
          const mcData = await mcPing.json();
          if (mcData && mcData.online) {
            setStatusMessage(`Success! Minecraft server "${cleanHost}" is Online! (${mcData.players?.online || 0}/${mcData.players?.max || 10} players active). Dual live sync enabled.`);
            onSaveApiUrl('https://ntfy.sh/willymoneysmp_leaderboard_live');
            return;
          }
        }
      }

      let target = inputUrl.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = `https://${target}`;
      }

      if (target.includes('ntfy.sh')) {
        const checkUrl = target.endsWith('/json?poll=1') ? target : `${target.replace(/\/$/, '')}/json?poll=1`;
        const res = await fetch(checkUrl, { cache: 'no-store' });
        if (res.ok) {
          setStatusMessage('Success! Connected to WillyMoneySMP Cloud Relay.');
          onSaveApiUrl(target);
          return;
        }
      } else if (!target.includes('/api/leaderboard')) {
        target = target.endsWith('/') ? `${target}api/leaderboard` : `${target}/api/leaderboard`;
      }

      const res = await fetch(target, { cache: 'no-store' });
      if (res.ok) {
        setStatusMessage('Success! Connected to WillyMoneySMP server API.');
        onSaveApiUrl(inputUrl);
      } else {
        setStatusMessage(`Error: Server replied with HTTP status ${res.status}`);
      }
    } catch (err: any) {
      setStatusMessage(`Connection failed: ${err.message || 'Make sure server IP and port are reachable'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Server Connection Settings</h3>
              <p className="text-xs text-slate-400">Real-time Minecraft Ping & Tournament Standings Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Sync Endpoint or Minecraft Server IP
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. willymoneysmp.minefort.com or https://ntfy.sh/..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
            
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setInputUrl('willymoneysmp.minefort.com')}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono transition-colors"
              >
                🎮 willymoneysmp.minefort.com
              </button>
              <button
                type="button"
                onClick={() => setInputUrl('https://ntfy.sh/willymoneysmp_leaderboard_live')}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono transition-colors"
              >
                ☁️ Cloud Relay (ntfy.sh)
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Dual-sync is active: player count is checked directly from the Minecraft server, and team standings sync automatically via outbound cloud relay.
            </p>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.startsWith('Success')
                  ? 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-800 text-rose-300'
              }`}
            >
              {statusMessage.startsWith('Success') ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Wifi className="w-4 h-4" />
              {testing ? 'Testing Connection...' : 'Connect & Test API'}
            </button>

            {onResetDraft && (
              <button
                onClick={() => {
                  onResetDraft();
                  onClose();
                }}
                title="Reset to empty Draft Phase"
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-amber-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Draft
              </button>
            )}

            <button
              onClick={() => {
                onLoadDemo();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
            >
              Demo Data
            </button>
          </div>
        </div>

        {/* How it works info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">💡 Server IP & Port Details:</p>
          <p>
            • Minecraft Java Address: <code className="text-amber-400 font-mono">willymoneysmp.minefort.com:25565</code>
          </p>
          <p>
            • Direct IP: <code className="text-slate-300 font-mono">37.59.210.71:25565</code>
          </p>
        </div>
      </div>
    </div>
  );
};
