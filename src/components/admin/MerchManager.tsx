import React, { useState } from 'react';
import { useAppData, MerchItem } from '../../context/AppDataContext';
import { ShoppingBag, Plus, Trash2, Edit, ExternalLink, Check, AlertCircle } from 'lucide-react';

export default function MerchManager() {
  const { merch, addMerch, updateMerch, deleteMerch } = useAppData();
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [type, setType] = useState('shirt');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [blurb, setBlurb] = useState('');
  const [price, setPrice] = useState<number>(30);
  const [stripeUrl, setStripeUrl] = useState('');

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const resetForm = () => {
    setTitle('');
    setType('shirt');
    setFront('');
    setBack('');
    setBlurb('');
    setPrice(30);
    setStripeUrl('');
    setIsAdding(false);
    setEditingMerch(null);
  };

  const handleStartEdit = (item: MerchItem) => {
    setEditingMerch(item);
    setTitle(item.title);
    setType(item.type);
    setFront(item.front);
    setBack(item.back || '');
    setBlurb(item.blurb || '');
    setPrice(item.price);
    setStripeUrl(item.stripeUrl || '');
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);

    const payload: MerchItem = {
      id: editingMerch?.id || 'merch-' + Date.now(),
      title: title.trim(),
      type: type.trim(),
      front: front.trim(),
      back: back.trim() || front.trim(),
      blurb: blurb.trim(),
      price: Number(price) || 30,
      stripeUrl: stripeUrl.trim() || undefined,
    };

    try {
      if (editingMerch) {
        await updateMerch(editingMerch.id, payload);
        showToast('Merch item updated');
      } else {
        await addMerch(payload);
        showToast('Merch item created');
      }
      resetForm();
    } catch (err: any) {
      setErrorToast(err.message || 'Failed to save merch');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this merch item?')) return;
    try {
      await deleteMerch(id);
      showToast('Merch item deleted');
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
            <ShoppingBag className="text-red-500" size={24} /> APPAREL & MERCHANDISE
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Manage shirts, hoodies, accessories, 3D clothing textures, and checkout links.
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
          <Plus size={14} /> {isAdding ? 'CANCEL' : 'ADD MERCH ITEM'}
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
            {editingMerch ? 'EDIT MERCH ITEM' : 'ADD NEW MERCH ITEM'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mental Meltdown HOODIE"
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                >
                  <option value="shirt">shirt</option>
                  <option value="hoodie">hoodie</option>
                  <option value="accessory">accessory</option>
                  <option value="other">other</option>
                </select>
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
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Front Image URL *</label>
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
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Back Image URL</label>
                <input
                  type="url"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="https://...image.png"
                  className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">Description / Blurb</label>
                <input
                  type="text"
                  value={blurb}
                  onChange={(e) => setBlurb(e.target.value)}
                  placeholder="Official WH!TE L!E signature piece..."
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
                {editingMerch ? 'UPDATE MERCH' : 'SAVE MERCH'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MERCH GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {merch.map((item) => (
          <div
            key={item.id}
            className="border border-white/15 bg-zinc-950/80 p-4 flex flex-col justify-between group hover:border-white/40 transition-all"
          >
            <div>
              <div className="aspect-square w-full bg-zinc-900 border border-white/10 mb-3 overflow-hidden relative flex items-center justify-center p-4">
                <img
                  src={item.front}
                  alt={item.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-black/80 backdrop-blur-md border border-white/20 text-white px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider">
                    {item.type}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-1">
                <h3 className="text-base font-black italic tracking-tight text-white truncate pr-2">
                  {item.title}
                </h3>
                <span className="text-sm font-mono font-bold text-zinc-300">
                  ${item.price}
                </span>
              </div>

              <p className="text-xs text-zinc-400 font-mono line-clamp-2 mb-3">
                {item.blurb || 'Signature merchandise.'}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                {item.stripeUrl && (
                  <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 border border-white/10">
                    STRIPE LINKED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(item)}
                  className="px-3 py-1 bg-zinc-900 hover:bg-white hover:text-black text-zinc-300 border border-white/20 transition-colors uppercase text-[10px] font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
