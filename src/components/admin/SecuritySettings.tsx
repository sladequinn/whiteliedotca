import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { KeyRound, RotateCcw, Check, AlertCircle, ShieldAlert, GitBranch, Download, FileCode } from 'lucide-react';

export default function SecuritySettings() {
  const { token, resetToDefaults, exportToDataFile } = useAppData();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passToast, setPassToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [isResetting, setIsResetting] = useState(false);
  const [resetToast, setResetToast] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassToast(null);

    if (newPassword !== confirmPassword) {
      setPassToast({ type: 'error', msg: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPassToast({ type: 'error', msg: 'New password must be at least 6 characters' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPassToast({ type: 'success', msg: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassToast({ type: 'error', msg: err.message || 'Error changing password' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await exportToDataFile();
      setExportToast('Synced! Current database has been written to src/data.ts.');
      setTimeout(() => setExportToast(null), 5000);
    } catch (err: any) {
      alert('Error exporting to file: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('WARNING: This will reset all videos, albums, merch, and links back to the original hardcoded defaults from data.ts. Are you sure?')) {
      return;
    }

    setIsResetting(true);
    try {
      await resetToDefaults();
      setResetToast('Database has been reset to default state.');
      setTimeout(() => setResetToast(null), 4000);
    } catch (err: any) {
      alert('Error resetting database: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-2xl">
      {/* HEADER */}
      <div className="pb-3 md:pb-4 border-b border-white/10">
        <h2 className="text-xl md:text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
          <KeyRound className="text-red-500" size={22} /> SECURITY & SYSTEM
        </h2>
        <p className="text-[11px] md:text-xs text-zinc-400 font-mono mt-1">
          Manage admin login credentials, GitHub code sync, and database controls.
        </p>
      </div>

      {/* GITHUB SYNC / STATIC HOSTING EXPORT */}
      <div className="border border-white/15 bg-zinc-950/80 p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] md:text-xs uppercase tracking-widest font-black">
          <GitBranch size={16} /> GITHUB / STATIC HOSTING SYNC
        </div>

        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-white font-mono">
          SYNC CHANGES TO SRC/DATA.TS (FOR GITHUB DEPLOYS)
        </h3>

        <p className="text-[11px] md:text-xs text-zinc-400 font-mono leading-relaxed">
          Hosting on GitHub Pages, Netlify, or Vercel? Click this button to save all your latest videos, 
          albums, and merch changes directly into <code className="text-white font-mono bg-zinc-900 px-1 py-0.5">src/data.ts</code>. 
          That way, your edits are preserved in git and built into static production bundles.
        </p>

        {exportToast && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check size={16} /> {exportToast}
          </div>
        )}

        <button
          onClick={handleExportData}
          disabled={isExporting}
          className="w-full sm:w-auto bg-white text-black hover:bg-cyan-400 hover:text-black px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <FileCode size={14} /> {isExporting ? 'SYNCING...' : 'SYNC ALL CHANGES TO SRC/DATA.TS'}
        </button>
      </div>

      {/* CHANGE PASSWORD */}
      <div className="border border-white/15 bg-zinc-950/80 p-4 md:p-6 space-y-4">
        <div className="pb-2 border-b border-white/10">
          <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-white font-mono">
            CHANGE ADMIN PASSWORD
          </h3>
          <p className="text-[11px] font-mono text-zinc-400">
            Current account: <span className="text-white font-bold">whitelie</span>
          </p>
        </div>

        {passToast && (
          <div
            className={`p-3 text-xs font-mono flex items-center gap-2 ${
              passToast.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                : 'bg-red-950/60 border border-red-500/50 text-red-300'
            }`}
          >
            {passToast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{passToast.msg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
              placeholder="••••••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="w-full sm:w-auto mt-2 bg-white text-black hover:bg-red-500 hover:text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {isChangingPass ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>

      {/* DANGER ZONE: RESET TO FACTORY DEFAULTS */}
      <div className="border border-red-900/40 bg-red-950/20 p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] md:text-xs uppercase tracking-widest font-black">
          <ShieldAlert size={16} /> DANGER ZONE
        </div>

        <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-white font-mono">
          RESET DATABASE TO ORIGINAL FACTORY DEFAULTS
        </h3>

        <p className="text-[11px] md:text-xs text-zinc-400 font-mono leading-relaxed">
          Restore all videos, albums, merch products, and links back to the original WH!TE L!E defaults. 
          Use this if you want to undo any experimental changes or start clean.
        </p>

        {resetToast && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check size={16} /> {resetToast}
          </div>
        )}

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="w-full sm:w-auto bg-transparent border border-red-500 text-red-400 hover:bg-red-600 hover:text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RotateCcw size={14} /> {isResetting ? 'RESETTING...' : 'RESET ALL DATA TO DEFAULTS'}
        </button>
      </div>
    </div>
  );
}
