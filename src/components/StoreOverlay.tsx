import { useEffect, useRef, useState } from 'react';
import { albums } from '../data';

interface StoreOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function StoreOverlay({ isOpen, onClose }: StoreOverlayProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeBg, setActiveBg] = useState(albums[0].front);
    const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const requestRef = useRef<number>();

    const applyParallax = () => {
        const track = trackRef.current;
        if (!track) return;

        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        
        const wrappers = track.querySelectorAll('.album-wrapper');
        wrappers.forEach((wrapper, idx) => {
            const rect = wrapper.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const offset = itemCenter - trackCenter;
            
            let rotateYAmount = (offset / trackRect.width) * 60;
            rotateYAmount = Math.max(-80, Math.min(80, rotateYAmount));
            
            // Add diagonal tilt: look down slightly (rotateX) and lean into scroll (rotateZ)
            const rotateXAmount = 30;
            const rotateZAmount = (offset / trackRect.width) * -25;

            const box = wrapper.querySelector('.album-box') as HTMLElement;
            if (box) box.style.transform = `rotateY(${rotateYAmount}deg) rotateX(${rotateXAmount}deg) rotateZ(${rotateZAmount}deg)`;

            // Shift the plastic wrap glare based on the tilt
            const glareAmount = 50 + (offset / trackRect.width) * -100;
            const wraps = wrapper.querySelectorAll('.plastic-wrap') as NodeListOf<HTMLElement>;
            wraps.forEach(wrap => {
                wrap.style.backgroundPosition = `${glareAmount}% 0`;
            });

            if (Math.abs(offset) < trackRect.width * 0.3) {
                wrapper.classList.add('active-album');
                const bgImg = wrapper.getAttribute('data-bg');
                if (bgImg) setActiveBg(bgImg);
            } else {
                wrapper.classList.remove('active-album');
                // Unflip if scrolled out of center
                if (flippedIndex === idx) {
                    setFlippedIndex(null);
                }
            }
        });
    };

    const handleScroll = () => {
        if (!requestRef.current) {
            requestRef.current = requestAnimationFrame(() => {
                applyParallax();
                requestRef.current = undefined;
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(applyParallax, 50);
        } else {
            setFlippedIndex(null);
        }
    }, [isOpen]);

    const handleAlbumClick = (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
        const wrapper = e.currentTarget;
        if (wrapper.classList.contains('active-album')) {
            setFlippedIndex(prev => prev === idx ? null : idx);
        } else {
            wrapper.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    };

    const updateQty = (idx: number, delta: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setQuantities(prev => {
            const current = prev[idx] || 1;
            const next = Math.max(1, current + delta);
            return { ...prev, [idx]: next };
        });
    };

    return (
        <div 
            id="store" 
            className={`fixed inset-0 z-[200] overlay-menu flex flex-col overflow-hidden bg-black ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            aria-hidden={!isOpen}
        >
            <div id="store-bg" style={{ backgroundImage: `url('${activeBg}')` }}></div>
            
            <div className="p-8 flex justify-between items-center shrink-0 relative z-10">
                <h2 className="text-6xl font-black italic tracking-tighter drop-shadow-xl">STORE</h2>
                <button onClick={onClose} className="text-4xl font-light drop-shadow-xl" aria-label="Close Store">✕</button>
            </div>
            
            {/* APPAREL BANNER */}
            <div className="px-8 pb-4 shrink-0 relative z-10">
                <div className="bg-black/60 backdrop-blur-xl border border-white/20 p-4 flex justify-between items-center shadow-2xl">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-black mb-1">Apparel</p>
                        <p className="text-[14px] font-black italic tracking-tighter uppercase leading-tight drop-shadow-md">Hand-Pressed<br/>Shirt</p>
                    </div>
                    <a href="#" className="bg-white text-black px-5 py-2 font-black italic text-xs hover:invert transition-all">BUY ($45)</a>
                </div>
                <p className="pt-6 text-[10px] uppercase tracking-[0.3em] opacity-50 font-black">Discography</p>
            </div>

            {/* THE 3D SCROLL TRACK */}
            <div 
                id="coverflow-track" 
                ref={trackRef}
                onScroll={handleScroll}
                className="coverflow-container flex-1 flex overflow-x-auto items-center relative z-10"
            >
                {albums.map((album, idx) => {
                    const isFlipped = flippedIndex === idx;
                    const qty = quantities[idx] || 1;
                    
                    return (
                        <div 
                            key={idx} 
                            className={`album-wrapper ${isFlipped ? 'is-flipped' : ''}`} 
                            data-bg={album.front}
                            onClick={(e) => handleAlbumClick(idx, e)}
                        >
                            <div className="album-box shadow-[0_60px_120px_rgba(0,0,0,0.9)]">
                                <div className="album-spin-container">
                                    {/* FRONT */}
                                    <div className="album-face face-front">
                                        <img src={album.front} alt={`${album.title} Front`} className="w-full h-full object-cover" />
                                        <div className="cd-hinge"></div>
                                        <div className="plastic-wrap"></div>
                                    </div>
                                    {/* SPINES */}
                                    <div className="album-face face-spine-left">
                                        <span className="spine-text">WH!TE L!E - {album.title}</span>
                                    </div>
                                    <div className="album-face face-spine-right"></div>
                                    {/* TOP / BOTTOM */}
                                    <div className="album-face face-top"></div>
                                    <div className="album-face face-bottom"></div>
                                    {/* BACK */}
                                    <div className="album-face face-back">
                                        <img src={album.back} alt={`${album.title} Back`} className="w-full h-full object-cover" />
                                        <div className="plastic-wrap"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="album-info-box relative">
                                <div className="h-12 flex items-center justify-center mb-1">
                                    <h3 className="text-xl md:text-2xl font-black italic uppercase text-center leading-tight drop-shadow-md px-2">{album.title}</h3>
                                </div>
                                
                                <div 
                                    className="overflow-hidden transition-all duration-500 ease-in-out flex flex-col items-center" 
                                    style={{ 
                                        maxHeight: isFlipped ? '300px' : '0px', 
                                        opacity: isFlipped ? 1 : 0,
                                        pointerEvents: isFlipped ? 'auto' : 'none'
                                    }}
                                >
                                    <p className="text-[11px] text-white/70 text-center mb-4 px-2 leading-relaxed italic">
                                        "{album.blurb}"
                                    </p>
                                    
                                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-sm p-1 mb-3 w-full max-w-[200px]">
                                        <div className="flex items-center">
                                            <button onClick={(e) => updateQty(idx, -1, e)} className="px-3 py-1 text-white/50 hover:text-white transition-colors font-mono text-lg">-</button>
                                            <span className="w-6 text-center text-sm font-mono font-bold">{qty}</span>
                                            <button onClick={(e) => updateQty(idx, 1, e)} className="px-3 py-1 text-white/50 hover:text-white transition-colors font-mono text-lg">+</button>
                                        </div>
                                        <div className="text-sm font-mono font-bold pr-3">${album.price * qty}</div>
                                    </div>

                                    <button 
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full max-w-[200px] bg-white text-black py-3 text-[10px] uppercase tracking-[0.2em] font-black italic hover:invert transition-all text-center shadow-[0_0_20px_rgba(255,255,255,0.3)] mb-2"
                                    >
                                        BUY PHYSICAL + DIGITAL
                                    </button>
                                    
                                    <a 
                                        href={album.spotify} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        onClick={(e) => e.stopPropagation()}
                                        className="block w-full max-w-[200px] border border-white/30 text-white/90 py-2 text-[9px] uppercase tracking-[0.2em] font-black italic hover:bg-white hover:text-black transition-all text-center"
                                    >
                                        LISTEN ON SPOTIFY
                                    </a>
                                </div>
                                
                                {/* Unflipped state hint */}
                                <div 
                                    className="absolute left-0 right-0 top-12 text-center transition-all duration-500" 
                                    style={{ 
                                        opacity: isFlipped ? 0 : 0.5, 
                                        transform: isFlipped ? 'translateY(10px)' : 'translateY(0)',
                                        pointerEvents: 'none' 
                                    }}
                                >
                                    <span className="text-[9px] uppercase tracking-[0.3em] font-black animate-pulse">TAP TO EXPLORE</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <p className="shrink-0 mt-auto text-[9px] bg-black/80 backdrop-blur-md uppercase font-black tracking-[0.3em] text-center border-t border-white/10 py-5 relative z-20">
                Hand-pressed & Shipped by WH!TE L!E
            </p>
        </div>
    );
}
