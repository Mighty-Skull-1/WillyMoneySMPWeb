import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { adminPasswordConfigured, checkAdminPassword } from '../lib/admin';

interface AdminPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ isOpen, onClose, onUnlocked }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    const ok = await checkAdminPassword(password);
    setChecking(false);
    if (ok) {
      setPassword('');
      onUnlocked();
    } else {
      setError('Wrong password.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-title"
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-title" className="text-lg font-black text-white">Admin only</h3>
              <p className="text-xs text-slate-400">Enter the admin password to continue.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {adminPasswordConfigured() ? (
          <>
            <input
              type="password"
              autoFocus
              autoComplete="current-password"
              aria-label="Admin password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
            />
            {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}
            <button
              type="submit"
              disabled={checking || !password}
              className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Unlock'}
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-300">The admin password hasn&apos;t been set up yet.</p>
        )}
      </form>
    </div>
  );
};
