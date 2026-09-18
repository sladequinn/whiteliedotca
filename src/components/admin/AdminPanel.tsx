import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import AdminLogin from './AdminLogin';
import VideoManager from './VideoManager';
import StoreManager from './StoreManager';
import MerchManager from './MerchManager';
import LinksBioManager from './LinksBioManager';
import SecuritySettings from './SecuritySettings';
import { 
  Film, 
  Disc, 
  ShoppingBag, 
  Globe, 
  KeyRound, 
  LogOut, 
  ExternalLink, 
  X,
  Radio,
  Eye
} from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'videos' | 'albums' | 'merch' | 'links' | 'security';

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { token, currentUser, logout, videos, albums, merch } = useAppData();
  const [activeTab, setActiveTab] = useState<TabKey>('videos');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black text-white flex flex-col font-brutal overflow-hidden">
      {/* GLITCH & NOISE ACCENTS */}
      <div className="noise pointer-events-none opacity-10"></div>

      {/* TOP HEADER / BAR */}
      <header className="h-14 sm:h-16 border-b border-white/15 bg-zinc-950 px-3 sm:px-6 flex items-center justify-between shrink-0 relative z-10">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Radio className="text-red-500 animate-pulse" size={16} />
            <h1 className="text-lg sm:text-2xl font-black italic tracking-tighter truncate">
              WH!TE L!E <span className="text-red-500 text-xs sm:text-lg">// BACKSTAGE</span>
            </h1>
          </div>

          {token && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-white/15 text-[11px] font-mono text-zinc-400 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">LOGGED IN AS <strong className="text-white">{currentUser}</strong></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {token && (
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 border border-white/20 bg-zinc-900 text-zinc-300">
              {token.startsWith('static_') ? 'STATIC MODE' : 'SERVER MODE'}
            </span>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white text-black hover:bg-red-600 hover:text-white text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors"
          >
            <Eye size={13} />
            <span className="hidden xs:inline sm:inline">LIVE SITE</span>
            <span className="inline xs:hidden sm:hidden">VIEW</span>
          </button>

          {token && (
            <button
              onClick={logout}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-white/5 border border-transparent hover:border-white/10"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      {!token ? (
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-6 relative z-10">
          <AdminLogin />
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
          {/* NAVIGATION: MOBILE BOTTOM / HORIZONTAL SCROLLBAR, DESKTOP SIDEBAR */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/15 bg-zinc-950/80 p-2 sm:p-4 shrink-0 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto">
            <nav className="flex md:flex-col gap-1 w-full flex-nowrap shrink-0">
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 md:flex-initial flex items-center justify-between px-3 py-2 md:p-3 text-left font-mono text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'videos'
                    ? 'bg-white text-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Film size={15} />
                  <span>VIDEOS</span>
                </div>
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                  activeTab === 'videos' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {videos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('albums')}
                className={`flex-1 md:flex-initial flex items-center justify-between px-3 py-2 md:p-3 text-left font-mono text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'albums'
                    ? 'bg-white text-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Disc size={15} />
                  <span>ALBUMS</span>
                </div>
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                  activeTab === 'albums' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {albums.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('merch')}
                className={`flex-1 md:flex-initial flex items-center justify-between px-3 py-2 md:p-3 text-left font-mono text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'merch'
                    ? 'bg-white text-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={15} />
                  <span>MERCH</span>
                </div>
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${
                  activeTab === 'merch' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {merch.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('links')}
                className={`flex-1 md:flex-initial flex items-center gap-2 px-3 py-2 md:p-3 text-left font-mono text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'links'
                    ? 'bg-white text-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe size={15} />
                <span>LINKS & BIO</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 md:flex-initial flex items-center gap-2 px-3 py-2 md:p-3 text-left font-mono text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'security'
                    ? 'bg-white text-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <KeyRound size={15} />
                <span>SECURITY</span>
              </button>
            </nav>

            <div className="hidden md:block pt-4 border-t border-white/10 text-[10px] font-mono text-zinc-500">
              <div className="mb-1 text-zinc-400 font-bold">WH!TE L!E 519</div>
              <div>Changes apply immediately to live viewers.</div>
            </div>
          </aside>

          {/* TAB VIEWPORT */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
              {activeTab === 'videos' && <VideoManager />}
              {activeTab === 'albums' && <StoreManager />}
              {activeTab === 'merch' && <MerchManager />}
              {activeTab === 'links' && <LinksBioManager />}
              {activeTab === 'security' && <SecuritySettings />}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
