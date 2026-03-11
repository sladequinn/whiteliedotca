import { Volume2, VolumeX } from 'lucide-react';

interface HUDProps {
    activeCategory: string;
    onCategorySelect: (category: string) => void;
    onToggleMenu: (menu: 'store' | 'links') => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

export default function HUD({ activeCategory, onCategorySelect, onToggleMenu, isMuted, onToggleMute }: HUDProps) {
    return (
        <>
            {/* THE TUNER (TOP LEFT) */}
            <nav className="absolute top-10 left-6 z-[100] flex flex-col gap-4 items-start hud-shadow pointer-events-auto">
                <button 
                    onClick={() => onCategorySelect('featured')} 
                    className={`tuner-btn ${activeCategory === 'featured' ? 'active' : ''}`}
                >
                    FEATURED
                </button>
                <button 
                    onClick={() => onCategorySelect('duets')} 
                    className={`tuner-btn ${activeCategory === 'duets' ? 'active' : ''}`}
                >
                    DUETS
                </button>
                <button 
                    onClick={() => onCategorySelect('munchtime')} 
                    className={`tuner-btn ${activeCategory === 'munchtime' ? 'active' : ''}`}
                >
                    MUNCHTIME
                </button>
            </nav>

            {/* MUTE TOGGLE (TOP RIGHT) */}
            <div className="absolute top-10 right-6 z-[100] pointer-events-auto">
                <button 
                    onClick={onToggleMute}
                    className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                </button>
            </div>

            {/* THE ACTIONS (BOTTOM RIGHT) */}
            <div className="absolute bottom-10 right-6 z-[100] flex flex-col gap-3 items-end pointer-events-none">
                <button 
                    onClick={() => onToggleMenu('store')} 
                    className="bg-white text-black px-6 py-3 text-[11px] font-black uppercase tracking-widest pointer-events-auto hover:invert transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                >
                    STORE
                </button>
                <button 
                    onClick={() => onToggleMenu('links')} 
                    className="border-2 border-white/50 bg-black/40 backdrop-blur-md text-white px-6 py-2 text-[11px] font-black uppercase tracking-widest pointer-events-auto hover:bg-white hover:text-black transition-all"
                >
                    LINKS
                </button>
            </div>

            {/* THE BRAND (BOTTOM LEFT) */}
            <div className="absolute bottom-10 left-6 z-[100] hud-shadow pointer-events-none">
                <h1 className="text-4xl sm:text-5xl italic font-black tracking-tighter leading-none">WH!TE L!E</h1>
            </div>
        </>
    );
}
