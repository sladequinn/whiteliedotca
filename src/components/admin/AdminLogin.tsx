import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { Lock, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const { login } = useAppData();
  const [username, setUsername] = useState('whitelie');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.username);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-3 sm:p-6">
      <div className="border border-white/20 bg-zinc-950/95 backdrop-blur-xl p-5 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-white to-red-600 animate-pulse" />
        
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-red-500 mb-2">
            <Lock size={14} /> Backstage Access
          </div>
          <h2 className="text-2xl sm:text-4xl italic font-black tracking-tighter leading-none text-white">
            WH!TE L!E ADMIN
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 mt-2 font-mono">
            Control center for videos, store merchandise, links & bio.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 font-mono">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-black/80 border border-white/20 px-3.5 py-3 text-white text-base sm:text-sm font-mono focus:border-white focus:outline-none transition-colors"
              placeholder="Username"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">
                Password
              </label>
              <span className="text-[10px] font-mono text-zinc-500">
                Default: whitelie519
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full bg-black/80 border border-white/20 px-3.5 py-3 text-white text-base sm:text-sm font-mono focus:border-white focus:outline-none transition-colors"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-white text-black py-3.5 px-6 font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {isLoading ? (
              <span>AUTHENTICATING...</span>
            ) : (
              <>
                <span>ENTER BACKSTAGE</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-zinc-400" /> SECURE SESSION
          </span>
          <span>WH!TE L!E 519</span>
        </div>
      </div>
    </div>
  );
}
