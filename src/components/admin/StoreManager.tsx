import React, { useState } from 'react';
import { useAppData, AlbumItem } from '../../context/AppDataContext';
import { Disc, Plus, Trash2, Edit, ExternalLink, Check, AlertCircle } from 'lucide-react';

export default function StoreManager() {
  const { albums, addAlbum, updateAlbum, deleteAlbum } = useAppData();
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [blurb, setBlurb] = useState('');
  const [price, setPrice] = useState<number>(20);
  const [isPreorder, setIsPreorder] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [stripeUrl, setStripeUrl] = useState('');
  const [spotify, setSpotify] = useState('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const resetForm = () => {
    setTitle('');
    setFront('');
    setBack('');
    setBlurb('');
    setPrice(20);
    setIsPreorder(false);
    setIsSoldOut(false);
    setStripeUrl('');
    setSpotify('');
    setIsAdding(false);
    setEditingAlbum(null);
  };

  const handleStartEdit = (album: AlbumItem) => {
    setEditingAlbum(album);
    setTitle(album.title);
    setFront(album.front);
    setBack(album.back || '');
    setBlurb(album.blurb || '');
    setPrice(album.price);
    setIsPreorder(Boolean(album.isPreorder));
    setIsSoldOut(Boolean(album.isSoldOut));
    setStripeUrl(album.stripeUrl || '');
    setSpotify(album.spotify || '');
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);

    const payload: AlbumItem = {
      title: title.trim(),
      front: front.trim(),
      back: back.trim() || front.trim(),
      blurb: blurb.trim(),
      price: Number(price) || 20,
      isPreorder,
      isSoldOut,
      stripeUrl: stripeUrl.trim() || undefined,
      spotify: spotify.trim() || undefined,
    };

    try {
      if (editingAlbum && editingAlbum.id) {
        await updateAlbum(editingAlbum.id, payload);
        showToast('Album updated');
      } else {
        await addAlbum(payload);
        showToast('Album created');
      }
      resetForm();
    } catch (err: any) {
      setErrorToast(err.message || 'Failed to save album');
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this album?')) return;
    try {
      await deleteAlbum(id);
      showToast('Album deleted');
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
            <Disc className="text-red-500" size={24} /> ALBUMS & PHYSICAL RELEASES
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Manage vinyl/cassettes, covers, back covers, Stripe buy links, Spotify streaming links.
          </p>
        </div>

        <button
          onClick={() => {
            if (isAdding) resetForm();
            else {
              resetForm();
              setIsAdding(true);
            }
          }}
          className="bg-white text-black hover:bg-red-500 hover:text-white px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={14} /> {isAdding ? 'CANCEL' : 'ADD NEW ALBUM'}
        </button>
      </div>

      {successToast && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check size={16} /> {successToast}
        </div>
      )}

      {errorToast && (
        <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={16} /> {errorToast}
        </div>
      )}

      {/* FORM DRAWER */}
      {isAdding && (
        <div className="border border-white/20 bg-zinc-950 p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-white font-mono flex items-center gap-2">
            {editingAlbum ? 'EDIT ALBUM RELEASE' : 'ADD NEW ALBUM'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Undeniable Underdog"
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Price ($ USD) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Front Artwork URL *</label>
                <input
                  type="url"
                  required
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="https://...image.png"
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Back Artwork URL</label>
                <input
                  type="url"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="https://...image.png (or same as front)"
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Description / Blurb</label>
                <textarea
                  rows={2}
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="The story, style or hook of this project..."
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Stripe Checkout URL</label>
                <input
                  type="url"
                  value={stripeUrl}
                  onChange={(e) => setStripeUrl(e.target.value)}
                  placeholder="https://buy.stripe.com/..."
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Spotify Album URL</label>
                <input
                  type="url"
                  value={spotify}
                  onChange={(e) => setSpotify(e.target.value)}
                  placeholder="https://open.spotify.com/album/..."
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2 font-mono text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={isPreorder}
                  onChange={(e) => setIsPreorder(e.target.checked)}
                  className="accent-red-600"
                />
                <span>Pre-order Flag</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={isSoldOut}
                  onChange={(e) => setIsSoldOut(e.target.checked)}
                  className="accent-red-600"
                />
                <span>Sold Out Flag</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="bg-white text-black hover:bg-red-500 hover:text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors"
              >
                {editingAlbum ? 'UPDATE ALBUM' : 'SAVE ALBUM'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALBUMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <div
            key={album.id || album.title}
            className="border border-white/15 bg-zinc-950/80 p-4 flex flex-col justify-between group hover:border-white/40 transition-all"
          >
            <div>
              <div className="aspect-square w-full bg-black border border-white/10 mb-3 overflow-hidden relative">
                <img
                  src={album.front}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as any).src = 'https://res.cloudinary.com/dj3uocb74/image/upload/v1710000000/black_glitch_placeholder.jpg';
                  }}
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {album.isPreorder && (
                    <span className="bg-white text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                      PRE-ORDER
                    </span>
                  )}
                  {album.isSoldOut && (
                    <span className="bg-red-600 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                      SOLD OUT
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-lg font-black italic tracking-tight text-white truncate pr-2">
                  {album.title}
                </h3>
                <span className="text-sm font-mono font-bold text-zinc-300">
                  ${album.price}
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-mono line-clamp-2 mb-3">
                {album.blurb || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {album.spotify && (
                  <a
                    href={album.spotify}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-white"
                    title="Spotify"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                {album.stripeUrl && (
                  <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 border border-white/10">
                    STRIPE
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(album)}
                  className="px-3 py-1 bg-zinc-900 hover:bg-white hover:text-black text-zinc-300 border border-white/20 transition-colors uppercase text-[10px] font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(album.id)}
                  className="p-1 text-zinc-500 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
