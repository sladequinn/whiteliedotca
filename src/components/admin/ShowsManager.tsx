import React, { useEffect, useState } from 'react';
import { useAppData, ShowItem } from '../../context/AppDataContext';
import { CalendarDays, Plus, Trash2, ArrowUp, ArrowDown, Check, Save } from 'lucide-react';

export default function ShowsManager() {
  const { shows, updateShows } = useAppData();
  const [editable, setEditable] = useState<ShowItem[]>(shows);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditable(shows);
  }, [shows]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = () => {
    const next: ShowItem = {
      id: 'show-' + Date.now(),
      date: '',
      title: '',
      city: '',
      blurb: '',
      ticketUrl: 'https://',
      sort_order: editable.length,
    };
    setEditable([...editable, next]);
  };

  const handleRemove = (index: number) => {
    setEditable(editable.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof ShowItem, val: string) => {
    const updated = [...editable];
    updated[index] = { ...updated[index], [field]: val };
    setEditable(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= editable.length) return;
    const updated = [...editable];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setEditable(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateShows(editable.map((show, idx) => ({ ...show, sort_order: idx })));
      showToast('Shows saved. Hit PUBLISH to push live.');
    } catch (err: any) {
      alert('Error saving shows: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 pb-3 md:pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
            <CalendarDays className="text-red-500" size={22} /> UPCOMING SHOWS
          </h2>
          <p className="text-[11px] sm:text-xs text-zinc-400 font-mono mt-1">
            Paste a ticket link, add a date and a short blurb. Empty list shows “check back soon.”
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto bg-zinc-900 border border-white/20 text-white hover:bg-white hover:text-black px-4 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> ADD SHOW
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-white text-black hover:bg-red-500 hover:text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={14} /> {isSaving ? 'SAVING...' : 'SAVE SHOWS'}
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check size={16} /> {toast}
        </div>
      )}

      {editable.length === 0 ? (
        <div className="border border-white/10 bg-zinc-950/80 p-6 text-zinc-500 text-xs font-mono">
          No shows yet. Add one, paste the ticket URL, then save and publish.
        </div>
      ) : (
        <div className="space-y-4">
          {editable.map((show, idx) => (
            <div key={show.id || idx} className="border border-white/15 bg-zinc-950/80 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-zinc-500">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 hover:text-white disabled:opacity-20"
                    aria-label="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={idx === editable.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 hover:text-white disabled:opacity-20"
                    aria-label="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <span className="text-[10px] font-mono uppercase tracking-widest pl-2">Show {idx + 1}</span>
                </div>
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-zinc-500 hover:text-red-400"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={show.date}
                  onChange={(e) => handleChange(idx, 'date', e.target.value)}
                  placeholder="DATE — e.g. OCT 18"
                  className="bg-black border border-white/20 px-3 py-2 text-xs font-mono uppercase text-white"
                />
                <input
                  type="text"
                  value={show.city}
                  onChange={(e) => handleChange(idx, 'city', e.target.value)}
                  placeholder="CITY"
                  className="bg-black border border-white/20 px-3 py-2 text-xs font-mono uppercase text-white"
                />
                <input
                  type="text"
                  value={show.title}
                  onChange={(e) => handleChange(idx, 'title', e.target.value)}
                  placeholder="VENUE / EVENT"
                  className="sm:col-span-2 bg-black border border-white/20 px-3 py-2 text-xs font-mono uppercase text-white"
                />
                <input
                  type="url"
                  value={show.ticketUrl}
                  onChange={(e) => handleChange(idx, 'ticketUrl', e.target.value)}
                  placeholder="TICKET LINK — https://..."
                  className="sm:col-span-2 bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white"
                />
                <textarea
                  rows={2}
                  value={show.blurb}
                  onChange={(e) => handleChange(idx, 'blurb', e.target.value)}
                  placeholder="Quick blurb (doors, openers, all ages…)"
                  className="sm:col-span-2 bg-black border border-white/20 px-3 py-2 text-xs font-mono text-white leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
