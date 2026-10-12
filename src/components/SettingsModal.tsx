import React, { useState } from 'react';
import { X, Server, Wifi, Check, AlertCircle, RotateCcw, Plus, Users, Trash2, Send } from 'lucide-react';
import { TeamData } from '../types/tournament';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
  isLive: boolean;
  onLoadDemo: () => void;
  onResetDraft?: () => void;
  currentTeams?: TeamData[];
  onBroadcastTeams?: (teams: TeamData[], phase?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSaveApiUrl,
  onLoadDemo,
  onResetDraft,
  currentTeams = [],
  onBroadcastTeams,
}) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'squads'>('connection');
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New squad form state
  const [newTeamName, setNewTeamName] = useState('');
  const [newCaptain, setNewCaptain] = useState('Mighty110');
  const [newCredits, setNewCredits] = useState(100);
  const [newColor, setNewColor] = useState('#ef4444');
  const [squadNotice, setSquadNotice] = useState<string | null>(null);

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

  const handleAddSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newCaptain.trim()) return;

    const trimmedName = newTeamName.trim();
    const trimmedCap = newCaptain.trim();
    const id = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const newSquad: TeamData = {
      id,
      name: trimmedName,
      colorCode: '§e',
      hexColor: newColor,
      captain: `cap_${id}`,
      captainName: trimmedCap,
      totalCredits: Number(newCredits) || 100,
      aliveCount: 1,
      eliminatedCount: 0,
      members: [
        {
          uuid: `cap_${id}`,
          name: trimmedCap,
          tier: 'CAPTAIN',
          gameCredits: Number(newCredits) || 100,
          draftCredits: 400,
          isCaptain: true,
          isEliminated: false,
        },
      ],
    };

    const existingIndex = currentTeams.findIndex((t) => t.id === id || t.name.toLowerCase() === trimmedName.toLowerCase());
    let updated: TeamData[];
    if (existingIndex >= 0) {
      updated = [...currentTeams];
      updated[existingIndex] = newSquad;
    } else {
      updated = [...currentTeams, newSquad];
    }

    if (onBroadcastTeams) {
      onBroadcastTeams(updated);
      setSquadNotice(`Squad "${trimmedName}" broadcast live! It is now live on the leaderboard.`);
      setNewTeamName('');
      setTimeout(() => setSquadNotice(null), 4000);
    }
  };

  const handleRemoveSquad = (teamId: string) => {
    const updated = currentTeams.filter((t) => t.id !== teamId);
    if (onBroadcastTeams) {
      onBroadcastTeams(updated);
      setSquadNotice('Squad removed and live leaderboard updated.');
      setTimeout(() => setSquadNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Tournament Control & Sync</h3>
              <p className="text-xs text-slate-400">Server Ping, Cloud Relay & Squad Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 shrink-0">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'connection'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" /> Connection & IP
          </button>
          <button
            onClick={() => setActiveTab('squads')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'squads'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Manage Squads ({currentTeams.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'connection' ? (
            <>
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
                  Dual-sync is active: player count is checked directly from the Minecraft server, and team standings sync automatically via outbound cloud relay and real-time SSE.
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

              {/* In-Game Command Guide */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300">🎮 In-Game Sync Commands:</p>
                <p>
                  • Force Sync to Web: <code className="text-amber-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">/smp sync</code>
                </p>
                <p>
                  • Create Team: <code className="text-sky-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">/team create &lt;name&gt; &lt;captain&gt;</code>
                </p>
                <p>
                  • Server IP: <code className="text-slate-300 font-mono">willymoneysmp.minefort.com:25565</code>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Quick Squad Creator Form */}
              <form onSubmit={handleAddSquad} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add or Update Squad Live
                  </h4>
                  <span className="text-[10px] text-slate-500">Broadcasts immediately</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Squad Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mighty Squad"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Captain Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Mighty110"
                      value={newCaptain}
                      onChange={(e) => setNewCaptain(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Starting Credits</label>
                    <input
                      type="number"
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Badge Color</label>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewColor(col)}
                          style={{ backgroundColor: col }}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            newColor === col ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" /> Save & Broadcast Squad to Live Standings
                </button>
              </form>

              {squadNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{squadNotice}</span>
                </div>
              )}

              {/* Current Squads List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Squads on Live Leaderboard ({currentTeams.length})
                </h4>
                {currentTeams.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No squads registered yet. Use the form above to add your team!</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {currentTeams.map((team) => (
                      <div
                        key={team.id}
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: team.hexColor || '#eab308' }}
                          />
                          <div>
                            <span className="text-xs font-bold text-white">{team.name}</span>
                            <span className="text-[11px] text-slate-400 ml-2">Captain: {team.captainName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {team.totalCredits} Cr
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSquad(team.id)}
                            title="Remove Squad"
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
