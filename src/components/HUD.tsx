import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    const [wordIndex, setWordIndex] = useState(0);

    const glitchWords = ["UNDENIABLE", "ANTISOCIAL", "DETERMINED", "COMPLICATED", "HUSTLER", "LOST"];

    useEffect(() => {
        if (clickCount >= 5 && !isGlitching) {
            setIsGlitching(true);
            const audio = new Audio('https://res.cloudinary.com/dj3uocb74/video/upload/v1772856943/duet19_r9wyag.mp4');
            audio.volume = 0.5;
            audio.play().catch(() => {});
            
            setTimeout(() => {
                setIsGlitching(false);
                setClickCount(0);
            }, 6000);
        }
        
        const timer = setTimeout(() => setClickCount(0), 2000);
        return () => clearTimeout(timer);
    }, [clickCount, isGlitching]);

    useEffect(() => {
        let interval: number;
        if (isGlitching) {
            interval = window.setInterval(() => {
                setWordIndex(i => (i + 1) % glitchWords.length);
            }, 300); // Slightly faster cycle
        }
        return () => clearInterval(interval);
    }, [isGlitching]);

    return (
        <>
            {/* EASTER EGG OVERLAY */}
            <AnimatePresence>
                {isGlitching && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center pointer-events-none"
                    >
                        {/* NOISE OVERLAY */}
                        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dj3uocb74/image/upload/v1710000000/black_glitch_placeholder.jpg')] bg-cover opacity-20 mix-blend-overlay"></div>
                        
                        {/* GLITCH PULSE */}
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.1, 0.9, 1.05, 1],
                                x: [0, -10, 10, -5, 0],
                                y: [0, 5, -5, 2, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 0.2 }}
                            className="relative"
                        >
                            <h1 
                                className="text-white text-7xl md:text-[12rem] font-black italic tracking-tighter leading-none"
                                style={{ 
                                    textShadow: '8px 8px 0px #ff0000, -8px -8px 0px #00ffff',
                                    filter: 'contrast(150%) brightness(120%)'
                                }}
                            >
                                {glitchWords[wordIndex]}
                            </h1>
                            
                            {/* GHOST LAYERS */}
                            <motion.h1 
                                animate={{ x: [-20, 20, -20], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ repeat: Infinity, duration: 0.1 }}
                                className="absolute inset-0 text-cyan-400 text-7xl md:text-[12rem] font-black italic tracking-tighter leading-none mix-blend-screen opacity-50 blur-sm"
                            >
                                {glitchWords[wordIndex]}
                            </motion.h1>
                            <motion.h1 
                                animate={{ x: [20, -20, 20], opacity: [0.5, 0.2, 0.5] }}
                                transition={{ repeat: Infinity, duration: 0.15 }}
                                className="absolute inset-0 text-red-600 text-7xl md:text-[12rem] font-black italic tracking-tighter leading-none mix-blend-screen opacity-50 blur-sm"
                            >
                                {glitchWords[wordIndex]}
                            </motion.h1>
                        </motion.div>

                        {/* VIGNETTE FLASH */}
                        <motion.div 
                            animate={{ opacity: [0, 0.4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.05 }}
                            className="absolute inset-0 bg-red-600/10 pointer-events-none"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
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
