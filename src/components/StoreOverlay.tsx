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
    const [activeIndex, setActiveIndex] = useState(0);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const requestRef = useRef<number>();
    const [shirtRot, setShirtRot] = useState({ x: 10, y: -15 });
    const [selectedSize, setSelectedSize] = useState('L');
    const [showXlMenu, setShowXlMenu] = useState(false);

    const handleShirtMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Increased rotation multipliers for a more pronounced 3D effect
        const rotateY = ((x - centerX) / centerX) * 22;
        const rotateX = ((centerY - y) / centerY) * 22;
        
        setShirtRot({ x: rotateX, y: rotateY });
    };

    const handleShirtLeave = () => {
        setShirtRot({ x: 10, y: -15 });
    };

    const applyParallax = () => {
        const track = trackRef.current;
        if (!track) return;

        const trackRect = track.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        
        const wrappers = track.querySelectorAll('.album-wrapper');
        let closestIdx = -1;
        let minDistance = Infinity;

        wrappers.forEach((wrapper, idx) => {
            const rect = wrapper.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const offset = itemCenter - trackCenter;
            const distance = Math.abs(offset);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestIdx = idx;
            }
            
            let rotateYAmount = (offset / trackRect.width) * 60;
            rotateYAmount = Math.max(-80, Math.min(80, rotateYAmount));
            
            // Add diagonal tilt: look down slightly (rotateX) and lean into scroll (rotateZ)
            const rotateXAmount = 15;
            const rotateZAmount = (offset / trackRect.width) * -15;

            // Scale down non-active albums smoothly based on distance from center
            const isMobile = window.innerWidth < 768;
            const distanceRatio = Math.min(1, distance / (trackRect.width * 0.6));
            
            const maxScale = isMobile ? 1.15 : 1.05;
            const minScale = isMobile ? 0.75 : 0.85;
            const scaleAmount = maxScale - (distanceRatio * (maxScale - minScale));

            const box = wrapper.querySelector('.album-box') as HTMLElement;
            if (box) box.style.transform = `rotateY(${rotateYAmount}deg) rotateX(${rotateXAmount}deg) rotateZ(${rotateZAmount}deg) scale(${scaleAmount})`;

            // Shift the plastic wrap glare based on the tilt
            const glareAmount = 50 + (offset / trackRect.width) * -100;
            const wraps = wrapper.querySelectorAll('.plastic-wrap') as NodeListOf<HTMLElement>;
            wraps.forEach(wrap => {
                wrap.style.backgroundPosition = `${glareAmount}% 0`;
            });
        });

        wrappers.forEach((wrapper, idx) => {
            if (idx === closestIdx) {
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

        if (closestIdx !== activeIndex) {
            setActiveIndex(closestIdx);
        }
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
            className={`fixed inset-0 z-[200] overlay-menu overflow-y-auto overflow-x-hidden bg-black ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            aria-hidden={!isOpen}
        >
            <div id="store-bg" style={{ backgroundImage: `url('${activeBg}')` }}></div>
            
            <div className="min-h-screen flex flex-col relative z-10">
                <div className="p-8 flex justify-between items-center shrink-0">
                    <h2 className="text-6xl font-black italic tracking-tighter drop-shadow-xl">STORE</h2>
                    <button onClick={onClose} className="text-4xl font-light drop-shadow-xl" aria-label="Close Store">✕</button>
                </div>
                
                {/* APPAREL SECTION */}
                <div className="px-8 pb-8 shrink-0 flex flex-col items-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black mb-8 self-start">Apparel</p>
                    
                    <div 
                        className="shirt-wrapper" 
                        onMouseMove={handleShirtMove} 
                        onMouseLeave={handleShirtLeave}
                    >
                        <div className="shirt-flat" style={{ transform: `rotateX(${shirtRot.x}deg) rotateY(${shirtRot.y}deg)` }}>
                            <div className="shirt-texture"></div>
                            <div className="shirt-collar-line"></div>
                            <img src="https://res.cloudinary.com/dj3uocb74/image/upload/v1773257932/WLLOGOTRANSPARENTWEB_1_uxzw2g.png" alt="WH!TE L!E Logo" className="shirt-logo" />
                            <div className="shirt-folds"></div>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center bg-black/40 backdrop-blur-md p-4 border border-white/10 rounded-lg w-full max-w-xs">
                        <p className="text-[16px] font-black italic tracking-tighter uppercase leading-tight drop-shadow-md text-center">WH!TE L!E Logo Tee</p>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest mt-1 mb-3">Premium Heavyweight Cotton</p>
                        
                        <div className="flex gap-2 mb-4 relative">
                            {['XS', 'S', 'M', 'L'].map(size => (
                                <button 
                                    key={size}
                                    onClick={() => { setSelectedSize(size); setShowXlMenu(false); }}
                                    className={`border w-8 h-8 flex items-center justify-center text-xs transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                >
                                    {size}
                                </button>
                            ))}
                            
                            {/* XL+ Dropdown Button */}
                            <div className="relative">
                                <button 
                                    onClick={() => setShowXlMenu(!showXlMenu)}
                                    className={`border h-8 px-2 flex items-center justify-center text-xs transition-all gap-1 ${['XL', '2XL', '3XL', '4XL', '5XL'].includes(selectedSize) ? 'bg-white text-black border-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                >
                                    {['XL', '2XL', '3XL', '4XL', '5XL'].includes(selectedSize) ? selectedSize : 'XL'}
                                    <span className="text-[8px] opacity-70">▼</span>
                                </button>
                                
                                {showXlMenu && (
                                    <div className="absolute bottom-full left-0 mb-1 w-full min-w-[3rem] bg-black/90 backdrop-blur-md border border-white/20 flex flex-col z-50">
                                        {['XL', '2XL', '3XL', '4XL', '5XL'].map(size => (
                                            <button 
                                                key={size}
                                                onClick={() => { setSelectedSize(size); setShowXlMenu(false); }}
                                                className={`text-xs py-2 transition-all text-center ${selectedSize === size ? 'bg-white text-black font-bold' : 'text-white hover:bg-white/20'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button className="w-full bg-white text-black py-2 font-black italic text-xs tracking-widest hover:invert transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                            BUY ($45)
                        </button>
                    </div>
                </div>

                {/* ALBUM SECTION HEADER */}
                <div className="px-8 pt-8 shrink-0">
                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black self-start">Discography</p>
                </div>

                {/* THE 3D SCROLL TRACK */}
                <div 
                    id="coverflow-track" 
                    ref={trackRef}
                    onScroll={handleScroll}
                    className="coverflow-container w-full flex overflow-x-auto items-center py-12"
                    style={{ minHeight: '450px' }}
                >
                {albums.map((album, idx) => {
                    const isFlipped = flippedIndex === idx;
                    const qty = quantities[idx] || 1;
                    
                    return (
                        <div 
                            key={idx} 
                            className={`album-wrapper ${isFlipped ? 'is-flipped' : ''} ${activeIndex === idx ? 'active-album' : ''}`} 
                            data-bg={album.front}
                            onClick={(e) => handleAlbumClick(idx, e)}
                        >
                            <div className="album-box shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
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
        </div>
    );
}
