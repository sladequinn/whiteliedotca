import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface HUDProps {
    activeCategory: string;
    onCategorySelect: (category: string) => void;
    onToggleMenu: (menu: 'store' | 'links' | 'info') => void;
    isMuted: boolean;
    onToggleMute: () => void;
}

export default function HUD({ activeCategory, onCategorySelect, onToggleMenu, isMuted, onToggleMute }: HUDProps) {
    const [clickCount, setClickCount] = useState(0);
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        if (clickCount >= 5) {
            setIsGlitching(true);
            const audio = new Audio('https://res.cloudinary.com/dj3uocb74/video/upload/v1772856943/duet19_r9wyag.mp4'); // Just a placeholder audio
            audio.volume = 0.5;
            audio.play().catch(() => {});
            
            setTimeout(() => {
                setIsGlitching(false);
                setClickCount(0);
            }, 4000);
        }
        
        const timer = setTimeout(() => setClickCount(0), 2000);
        return () => clearTimeout(timer);
    }, [clickCount]);

    return (
        <>
            {/* EASTER EGG OVERLAY */}
            {isGlitching && (
                <div className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center pointer-events-none animate-pulse">
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dj3uocb74/image/upload/v1710000000/black_glitch_placeholder.jpg')] bg-cover opacity-30 mix-blend-difference"></div>
                    <h1 className="text-red-600 text-6xl md:text-9xl font-black italic tracking-tighter mix-blend-screen" style={{ textShadow: '4px 4px 0px #0ff, -4px -4px 0px #f0f' }}>
                        UNDENIABLE
                    </h1>
                    <h1 className="text-white text-6xl md:text-9xl font-black italic tracking-tighter mix-blend-screen mt-[-20px]" style={{ textShadow: '4px 4px 0px #0ff, -4px -4px 0px #f0f' }}>
                        UNDERDOG
                    </h1>
                    <p className="text-white font-mono mt-8 tracking-[0.5em] text-sm md:text-xl">THE TRUTH IS COMING</p>
                </div>
            )}
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
                <div className="flex gap-3 pointer-events-auto">
                    <button 
                        onClick={() => onToggleMenu('info')} 
                        className="border-2 border-white/50 bg-black/40 backdrop-blur-md text-white px-4 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        INFO
                    </button>
                    <button 
                        onClick={() => onToggleMenu('links')} 
                        className="border-2 border-white/50 bg-black/40 backdrop-blur-md text-white px-4 py-2 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                    >
                        LINKS
                    </button>
                </div>
            </div>

            {/* THE BRAND (BOTTOM LEFT) */}
            <div className="absolute bottom-10 left-6 z-[100] hud-shadow pointer-events-auto">
                <h1 
                    onClick={() => setClickCount(c => c + 1)}
                    className="text-4xl sm:text-5xl italic font-black tracking-tighter leading-none cursor-pointer select-none hover:text-red-500 transition-colors duration-300"
                >
                    WH!TE L!E
                </h1>
            </div>
        </>
    );
}
