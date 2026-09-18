import React, { useState } from 'react';
import { useAppData, VideoItem } from '../../context/AppDataContext';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Play, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Film, 
  Info, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CloudUpload,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function VideoManager() {
  const { videos, addVideo, updateVideo, deleteVideo, reorderVideos } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<'featured' | 'duets' | 'munchtime'>('featured');

  // New video form state
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit modal / inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<'featured' | 'duets' | 'munchtime'>('featured');

  // Preview video state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Help accordion state
  const [showHostingGuide, setShowHostingGuide] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredVideos = videos
    .filter(v => v.category === selectedCategory)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const isValidVideoUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const trimmed = newUrl.trim();
    if (!trimmed) return;

    if (!isValidVideoUrl(trimmed)) {
      setAddError('Please enter a valid HTTP/HTTPS video URL (e.g. https://res.cloudinary.com/.../video.mp4)');
      return;
    }

    setIsAdding(true);
    try {
      await addVideo({
        url: trimmed,
        category: selectedCategory,
        title: newTitle.trim() || undefined,
      });
      setNewUrl('');
      setNewTitle('');
      showToast('Video added to ' + selectedCategory.toUpperCase());
    } catch (err: any) {
      setAddError(err.message || 'Failed to add video');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteVideo(id);
      showToast('Video deleted');
    } catch (err: any) {
      alert('Error deleting video: ' + err.message);
    }
  };

  const handleStartEdit = (video: VideoItem) => {
    setEditingId(video.id);
    setEditUrl(video.url);
    setEditTitle(video.title || '');
    setEditCategory(video.category);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    if (!isValidVideoUrl(editUrl.trim())) {
      alert('Please enter a valid HTTP/HTTPS URL');
      return;
    }
    try {
      await updateVideo(editingId, {
        url: editUrl.trim(),
        title: editTitle.trim() || null,
        category: editCategory,
      });
      setEditingId(null);
      showToast('Video updated');
    } catch (err: any) {
      alert('Error updating video: ' + err.message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= filteredVideos.length) return;

    const currentItem = filteredVideos[index];
    const targetItem = filteredVideos[targetIndex];

    const currentOrder = currentItem.sort_order ?? index;
    const targetOrder = targetItem.sort_order ?? targetIndex;

    try {
      await reorderVideos([
        { id: currentItem.id, sort_order: targetOrder },
        { id: targetItem.id, sort_order: currentOrder },
      ]);
      showToast('Reordered');
    } catch (err: any) {
      alert('Error reordering: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER & CATEGORY TABS */}
      <div className="flex flex-col gap-4 pb-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
              <Film className="text-red-500 shrink-0" size={22} /> VIDEO REEL MANAGER
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-mono mt-0.5">
              Instant channel reel editor for TikToks, duets, and music videos.
            </p>
          </div>

          {/* Quick Hosting Guide Toggle Button */}
          <button
            onClick={() => setShowHostingGuide(!showHostingGuide)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-white/20 hover:border-white/50 text-[11px] font-mono text-zinc-300 self-start sm:self-auto transition-colors"
          >
            <HelpCircle size={14} className="text-amber-400" />
            <span>Where do I host videos?</span>
            {showHostingGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* EXPLAINER ACCORDION / HOSTING GUIDE */}
        {showHostingGuide && (
          <div className="p-4 bg-zinc-950 border border-amber-500/30 text-xs font-mono text-zinc-300 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <Info size={15} /> Video Hosting on GitHub / Web Explained
            </div>
            <p className="leading-relaxed text-zinc-300">
              Because code repositories like GitHub have a 100MB file limit and do not stream video smoothly, 
              all your site videos are hosted on free video CDNs like <strong>Cloudinary</strong>, <strong>Supabase</strong>, or <strong>AWS S3</strong> and linked directly by URL:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-black/80 border border-white/10 p-3 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CloudUpload size={13} className="text-red-500" /> Cloudinary (Recommended)
                </div>
                <p className="text-[10px] text-zinc-400">
                  Already powers this entire site. Upload any vertical .mp4 to your free Cloudinary account and paste the video link here.
                </p>
              </div>
              <div className="bg-black/80 border border-white/10 p-3 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <LinkIcon size={13} className="text-cyan-400" /> Direct MP4 / S3 / R2
                </div>
                <p className="text-[10px] text-zinc-400">
                  Any public MP4 or WebM link hosted on Cloudflare R2, AWS S3, or Supabase Storage streams instantly.
                </p>
              </div>
              <div className="bg-black/80 border border-white/10 p-3 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={13} className="text-emerald-400" /> No Code Rebuilding
                </div>
                <p className="text-[10px] text-zinc-400">
                  Whenever you add or reorder a video here, viewers see it updated immediately without having to edit code.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category switcher: Horizontal full-width pill for mobile touch */}
        <div className="flex bg-zinc-900 border border-white/10 p-1 w-full sm:w-auto self-start">
          {(['featured', 'duets', 'munchtime'] as const).map((cat) => {
            const count = videos.filter(v => v.category === cat).length;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                  active
                    ? 'bg-white text-black shadow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  active ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check size={16} /> {successToast}
        </div>
      )}

      {/* QUICK ADD BOX */}
      <div className="border border-white/20 bg-black/60 p-4 sm:p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 mb-3 flex items-center gap-2 font-mono">
          <Plus size={14} className="text-red-500" /> Add Video to {selectedCategory.toUpperCase()}
        </h3>

        {addError && (
          <div className="mb-4 p-2.5 bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} /> {addError}
          </div>
        )}

        <form onSubmit={handleAddVideo} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                Video Stream URL (MP4 / Cloudinary) *
              </label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/.../my-video.mp4"
                className="w-full bg-zinc-950 border border-white/20 px-3 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-zinc-400 mb-1">
                Optional Title / Label
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Studio Session #4"
                className="w-full bg-zinc-950 border border-white/20 px-3 py-2.5 text-xs font-mono text-white placeholder-zinc-600 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-[10px] sm:text-[11px] font-mono text-zinc-500">
              Tip: Paste any direct MP4 link. It will stream immediately on mobile & desktop.
            </span>
            <button
              type="submit"
              disabled={isAdding}
              className="w-full sm:w-auto bg-white text-black hover:bg-red-600 hover:text-white px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus size={14} /> {isAdding ? 'ADDING...' : 'ADD VIDEO'}
            </button>
          </div>
        </form>
      </div>

      {/* VIDEO LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-zinc-400 px-1">
          <span>{filteredVideos.length} VIDEOS IN {selectedCategory.toUpperCase()}</span>
          <span className="hidden sm:inline">ORDERED BY PLAYBACK SEQUENCE</span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="border border-white/10 bg-zinc-950 p-8 sm:p-12 text-center text-zinc-500 font-mono text-xs">
            No videos in this category yet. Use the box above to add one.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVideos.map((video, idx) => {
              const isEditing = editingId === video.id;

              return (
                <div
                  key={video.id}
                  className={`border transition-all p-3 sm:p-3.5 ${
                    isEditing
                      ? 'border-red-500 bg-zinc-950'
                      : 'border-white/10 bg-zinc-950/60 hover:border-white/30'
                  }`}
                >
                  {isEditing ? (
                    // EDIT MODE
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <span className="text-xs font-mono font-bold text-red-500">EDITING VIDEO</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white"
                          >
                            CANCEL
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="px-3 py-1 text-[11px] font-black uppercase tracking-widest bg-white text-black hover:bg-red-500 hover:text-white"
                          >
                            SAVE
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-[10px] uppercase font-mono text-zinc-400">Video URL</label>
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full bg-black border border-white/20 p-2 text-xs font-mono text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-zinc-400">Category</label>
                          <select
                            value={editCategory}
                            onChange={(e: any) => setEditCategory(e.target.value)}
                            className="w-full bg-black border border-white/20 p-2 text-xs font-mono text-white"
                          >
                            <option value="featured">featured</option>
                            <option value="duets">duets</option>
                            <option value="munchtime">munchtime</option>
                          </select>
                        </div>
                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[10px] uppercase font-mono text-zinc-400">Title / Label</label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full bg-black border border-white/20 p-2 text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // VIEW ROW
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* Order pill */}
                        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-zinc-900 border border-white/10 flex items-center justify-center font-mono text-[11px] sm:text-xs font-bold text-zinc-400">
                          #{idx + 1}
                        </div>

                        {/* Video thumbnail / player button */}
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(video.url)}
                          className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-black border border-white/20 flex items-center justify-center group relative hover:border-red-500 overflow-hidden"
                          title="Click to preview video"
                        >
                          <Play size={16} className="text-white group-hover:scale-125 transition-transform" />
                        </button>

                        {/* Title and URL */}
                        <div className="min-w-0 flex-1">
                          {video.title && (
                            <div className="text-xs font-bold text-white tracking-wide truncate">
                              {video.title}
                            </div>
                          )}
                          <div className="text-[10px] sm:text-[11px] font-mono text-zinc-400 truncate flex items-center gap-1.5">
                            <span className="truncate">{video.url}</span>
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-500 hover:text-white shrink-0 p-0.5"
                              title="Open link in new tab"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Controls: reorder, edit, delete (optimized for touch targets) */}
                      <div className="flex items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="flex items-center border border-white/15 bg-black/40">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-2 sm:p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors"
                            title="Move up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <span className="w-px h-3 bg-white/20"></span>
                          <button
                            disabled={idx === filteredVideos.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-2 sm:p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors"
                            title="Move down"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleStartEdit(video)}
                          className="px-3 py-1.5 sm:py-1 text-[11px] font-mono uppercase bg-zinc-900 hover:bg-white hover:text-black text-zinc-300 border border-white/20 transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 sm:p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-500/30 transition-colors"
                          title="Delete video"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VIDEO PREVIEW MODAL */}
      {previewUrl && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-md w-full bg-zinc-950 border border-white/20 p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-white truncate pr-2">
                VIDEO PREVIEW
              </span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-zinc-400 hover:text-white text-xs font-mono px-2 py-1 bg-white/5"
              >
                ✕ CLOSE
              </button>
            </div>
            <div className="aspect-[9/16] max-h-[70vh] mx-auto bg-black flex items-center justify-center overflow-hidden">
              <video
                src={previewUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
