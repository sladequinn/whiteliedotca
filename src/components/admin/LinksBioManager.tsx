import React, { useState, useEffect } from 'react';
import { useAppData, LinkItem } from '../../context/AppDataContext';
import { Globe, Plus, Trash2, ArrowUp, ArrowDown, Check, AlertCircle, Save } from 'lucide-react';

export default function LinksBioManager() {
  const { links, info, updateLinks, updateInfo } = useAppData();
  const [editableLinks, setEditableLinks] = useState<LinkItem[]>(links);
  const [aboutText, setAboutText] = useState(info.about_text || '');
  const [managementEmail, setManagementEmail] = useState(info.management_email || '');
  const [generalEmail, setGeneralEmail] = useState(info.general_email || '');

  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditableLinks(links);
  }, [links]);

  useEffect(() => {
    setAboutText(info.about_text || '');
    setManagementEmail(info.management_email || '');
    setGeneralEmail(info.general_email || '');
  }, [info]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddLink = () => {
    const newLink: LinkItem = {
      id: 'link-' + Date.now(),
      title: 'NEW LINK',
      url: 'https://',
    };
    setEditableLinks([...editableLinks, newLink]);
  };

  const handleRemoveLink = (index: number) => {
    setEditableLinks(editableLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', val: string) => {
    const updated = [...editableLinks];
    updated[index] = { ...updated[index], [field]: val };
    setEditableLinks(updated);
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= editableLinks.length) return;
    const updated = [...editableLinks];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    setEditableLinks(updated);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await updateLinks(editableLinks);
      await updateInfo({
        about_text: aboutText,
        management_email: managementEmail,
        general_email: generalEmail,
      });
      showToast('Links and Bio saved successfully');
    } catch (err: any) {
      alert('Error saving changes: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white flex items-center gap-2">
            <Globe className="text-red-500" size={24} /> LINKS & BIO / CONTACT
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Update streaming platform links, social media destinations, and the official artist bio.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-white text-black hover:bg-red-500 hover:text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
        >
          <Save size={14} /> {isSaving ? 'SAVING...' : 'SAVE ALL CHANGES'}
        </button>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Check size={16} /> {toast}
        </div>
      )}

      {/* TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SOCIAL & MUSIC LINKS */}
        <div className="border border-white/15 bg-zinc-950/80 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white font-mono">
                OVERLAY LINKS
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Displayed in the full-screen LINKS modal
              </p>
            </div>
            <button
              onClick={handleAddLink}
              className="px-3 py-1 bg-zinc-900 hover:bg-white hover:text-black text-zinc-300 border border-white/20 text-[10px] font-mono uppercase font-bold flex items-center gap-1"
            >
              <Plus size={12} /> ADD
            </button>
          </div>

          <div className="space-y-3">
            {editableLinks.map((link, idx) => (
              <div key={link.id || idx} className="p-3 bg-black/60 border border-white/10 flex items-center gap-2">
                <div className="flex flex-col gap-1 text-zinc-500">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveLink(idx, 'up')}
                    className="hover:text-white disabled:opacity-20"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    disabled={idx === editableLinks.length - 1}
                    onClick={() => handleMoveLink(idx, 'down')}
                    className="hover:text-white disabled:opacity-20"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleLinkChange(idx, 'title', e.target.value)}
                    placeholder="TITLE"
                    className="bg-zinc-900 border border-white/20 px-2 py-1.5 text-xs font-mono font-bold uppercase text-white"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="sm:col-span-2 bg-zinc-900 border border-white/20 px-2 py-1.5 text-xs font-mono text-white"
                  />
                </div>

                <button
                  onClick={() => handleRemoveLink(idx)}
                  className="p-2 text-zinc-500 hover:text-red-400"
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BIO & CONTACT */}
        <div className="border border-white/15 bg-zinc-950/80 p-5 space-y-4">
          <div className="pb-3 border-b border-white/10">
            <h3 className="text-sm font-black uppercase tracking-widest text-white font-mono">
              ABOUT & CONTACT INFO
            </h3>
            <p className="text-[11px] font-mono text-zinc-400">
              Displayed in the full-screen INFO modal
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Artist Bio / Statement
              </label>
              <textarea
                rows={6}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="w-full bg-black border border-white/20 p-3 text-xs font-mono text-white leading-relaxed"
                placeholder="Artist biography, paragraph breaks will format automatically..."
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                Management & Booking Email
              </label>
              <input
                type="email"
                value={managementEmail}
                onChange={(e) => setManagementEmail(e.target.value)}
                className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                placeholder="booking@whitelie.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-zinc-400 mb-1">
                General Inquiry Email
              </label>
              <input
                type="email"
                value={generalEmail}
                onChange={(e) => setGeneralEmail(e.target.value)}
                className="w-full bg-black border border-white/20 p-2.5 text-xs font-mono text-white"
                placeholder="info@whitelie.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
