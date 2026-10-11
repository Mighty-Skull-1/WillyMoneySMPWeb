import React, { useState } from 'react';
import { X, Server, Wifi, Key, Check, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
  isLive: boolean;
  onLoadDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSaveApiUrl,
  isLive,
  onLoadDemo,
}) => {
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage(null);
    try {
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
        setStatusMessage('Success! Connected to WillyMoneySMP server.');
        onSaveApiUrl(inputUrl);
      } else {
        setStatusMessage(`Error: Server replied with status ${res.status}`);
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
              <p className="text-xs text-slate-400">Configure Option 1 direct REST API sync</p>
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
              Minecraft Server Web API Address
            </label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. http://your-server-ip:8080"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              The built-in HTTP server endpoint hosted directly by the WillyMoneySMP paper plugin.
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

            <button
              onClick={() => {
                onLoadDemo();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
            >
              Use Sample Data
            </button>
          </div>
        </div>

        {/* How it works info */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">💡 How Option 1 works:</p>
          <p>
            The plugin runs a background HTTP listener inside PaperMC. When requested, it serves the current leaderboard, team rosters, and game phase as JSON without lag.
          </p>
        </div>
      </div>
    </div>
  );
};
