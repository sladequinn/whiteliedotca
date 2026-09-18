import React, { useState } from 'react';
import { useAppData, VideoItem } from '../../context/AppDataContext';
import { Plus, Trash2, ArrowUp, ArrowDown, Play, ExternalLink, Check, AlertCircle, Film, Sparkles } from 'lucide-react';

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

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredVideos = videos
    .filter(v => v.category === selectedCategory)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!newUrl.trim()) return;

    setIsAdding(true);
    try {
      await addVideo({
        url: newUrl.trim(),
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
    <div className="space-y-8">
      {/* HEADER & CATEGORY TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
            <Film className="text-red-500" size={24} /> VIDEO REEL MANAGER
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Add, update, reorder or swap Cloudinary / MP4 video streams across channels.
          </p>
        </div>

        {/* Category switcher */}
        <div className="flex bg-zinc-900 border border-white/10 p-1">
          {(['featured', 'duets', 'munchtime'] as const).map((cat) => {
            const count = videos.filter(v => v.category === cat).length;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
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
      <div className="border border-white/20 bg-black/60 p-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 mb-3 flex items-center gap-2 font-mono">
          <Plus size={14} className="text-red-500" /> Add New Video to {selectedCategory.toUpperCase()}
        </h3>

        {addError && (
          <div className="mb-4 p-2.5 bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} /> {addError}
          </div>
        )}

        <form onSubmit={handleAddVideo} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="Video URL (e.g. Cloudinary, https://.../video.mp4)"
                className="w-full bg-zinc-950 border border-white/20 px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Optional Title / Note"
                className="w-full bg-zinc-950 border border-white/20 px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-zinc-500">
              Cloudinary, S3, or direct MP4/WebM video link supported.
            </span>
            <button
              type="submit"
              disabled={isAdding}
              className="bg-white text-black hover:bg-red-600 hover:text-white px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Plus size={14} /> {isAdding ? 'ADDING...' : 'ADD VIDEO'}
            </button>
          </div>
        </form>
      </div>

      {/* VIDEO LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
          <span>{filteredVideos.length} VIDEOS IN {selectedCategory.toUpperCase()}</span>
          <span>ORDERED BY PLAYBACK SEQUENCE</span>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="border border-white/10 bg-zinc-950 p-12 text-center text-zinc-500 font-mono text-xs">
            No videos in this category yet. Use the box above to add one.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredVideos.map((video, idx) => {
              const isEditing = editingId === video.id;

              return (
                <div
                  key={video.id}
                  className={`border transition-all p-3 ${
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
                            className="px-3 py-1 text-[11px] font-mono text-zinc-400 hover:text-white"
                          >
                            CANCEL
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="px-3 py-1 text-[11px] font-black uppercase tracking-widest bg-white text-black hover:bg-red-500 hover:text-white"
                          >
                            SAVE CHANGES
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
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Order pill */}
                        <div className="shrink-0 w-8 h-8 bg-zinc-900 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-400">
                          #{idx + 1}
                        </div>

                        {/* Video thumbnail / player button */}
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(video.url)}
                          className="shrink-0 w-12 h-12 bg-black border border-white/20 flex items-center justify-center group relative hover:border-red-500 overflow-hidden"
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
                          <div className="text-[11px] font-mono text-zinc-400 truncate flex items-center gap-1.5">
                            <span className="truncate">{video.url}</span>
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-zinc-500 hover:text-white shrink-0"
                            >
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Controls: reorder, edit, delete */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          disabled={idx === filteredVideos.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>

                        <button
                          onClick={() => handleStartEdit(video)}
                          className="px-2.5 py-1 text-[11px] font-mono uppercase bg-zinc-900 hover:bg-white hover:text-black text-zinc-300 border border-white/20 transition-colors ml-1"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 border border-transparent hover:border-red-500/30 transition-colors ml-1"
                          title="Delete video"
                        >
                          <Trash2 size={14} />
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
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-zinc-950 border border-white/20 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-white truncate pr-2">
                VIDEO PREVIEW
              </span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-zinc-400 hover:text-white text-sm font-mono px-2 py-1"
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
