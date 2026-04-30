import React, { useEffect, useRef, useState } from 'react';
import { albums, merch } from '../data';

interface StoreOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function StoreOverlay({ isOpen, onClose }: StoreOverlayProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeBg, setActiveBg] = useState(albums[0].front);
    const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const requestRef = useRef<number>();
    const [shirtRot, setShirtRot] = useState({ x: 10, y: -15 });
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [activeVariants, setActiveVariants] = useState<Record<string, number>>({});

    const groupedMerch = merch.reduce((acc, item) => {
        const baseTitle = item.title.replace(/ (SHIRT|HOODIE|Signature Tee|Tee)$/i, '').trim();
        if (!acc[baseTitle]) acc[baseTitle] = [];
        acc[baseTitle].push(item);
        return acc;
    }, {} as Record<string, typeof merch>);

    const baseTitles = Object.keys(groupedMerch);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

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
                <div className="px-8 pb-12 shrink-0">
                    <div className="max-w-6xl mx-auto w-full mb-8 flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black">Apparel</p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    const track = document.querySelector('.apparel-track');
                                    if (track) {
                                        const scrollAmount = window.innerWidth < 768 ? 240 : 320;
                                        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                                    }
                                }}
                                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/50 hover:bg-white hover:text-black transition-colors backdrop-blur-md"
                                aria-label="Previous Apparel"
                            >
                                ←
                            </button>
                            <button 
                                onClick={() => {
                                    const track = document.querySelector('.apparel-track');
                                    if (track) {
                                        const scrollAmount = window.innerWidth < 768 ? 240 : 320;
                                        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                                    }
                                }}
                                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/50 hover:bg-white hover:text-black transition-colors backdrop-blur-md"
                                aria-label="Next Apparel"
                            >
                                →
                            </button>
                        </div>
                    </div>
                    
                    <div className="apparel-track">
                        {baseTitles.map((baseTitle) => {
                            const variants = groupedMerch[baseTitle];
                            const activeIdx = activeVariants[baseTitle] || 0;
                            const item = variants[activeIdx];
                            
                            return (
                                <div key={baseTitle} className="apparel-item-wrapper">
                                    <div 
                                        className={`shirt-wrapper mb-8 type-${item.type}`} 
                                        onMouseMove={handleShirtMove} 
                                        onMouseLeave={handleShirtLeave}
                                    >
                                        <div className="apparel-box" style={{ transform: `rotateX(${shirtRot.x}deg) rotateY(${shirtRot.y}deg)` }}>
                                            {/* HOODIE EXTRAS */}
                                            {item.type === 'hoodie' && <div className="hoodie-hood"></div>}
                                            
                                            <div className="apparel-body">
                                                <div className="apparel-texture"></div>
                                                <div className="apparel-collar"></div>
                                                {item.type === 'hoodie' && <div className="hoodie-strings"></div>}
                                                <img src={item.front} alt={item.title} className="apparel-logo" />
                                                <div className="apparel-folds"></div>
                                            </div>
    
                                            {/* KANGAROO POCKET */}
                                            {item.type === 'hoodie' && <div className="hoodie-pocket"></div>}
                                        </div>
                                    </div>
    
                                    <div className="flex flex-col items-center bg-black/40 backdrop-blur-md p-6 border border-white/10 rounded-lg w-full">
                                        <p className="text-[14px] font-black italic tracking-tighter uppercase leading-tight drop-shadow-md text-center min-h-[2.5rem] flex items-center">{baseTitle}</p>
                                        
                                        {/* VARIANT SELECTOR */}
                                        {variants.length > 1 && (
                                            <div className="flex gap-2 mb-4 w-full">
                                                {variants.map((v, vIdx) => (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => setActiveVariants(prev => ({ ...prev, [baseTitle]: vIdx }))}
                                                        className={`flex-1 py-1 text-[8px] uppercase tracking-widest border transition-all ${activeIdx === vIdx ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                                                    >
                                                        {v.type}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-[9px] text-white/50 uppercase tracking-widest mt-1 mb-4 text-center">{item.blurb}</p>
                                        
                                        <button 
                                            onClick={() => window.open(item.stripeUrl, '_blank')}
                                            className="w-full bg-white text-black py-3 font-black italic text-[10px] tracking-widest hover:invert transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                        >
                                            BUY {item.type.toUpperCase()} (${item.price})
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ALBUM SECTION HEADER */}
                <div className="px-8 pt-8 shrink-0 flex justify-between items-center w-full max-w-4xl mx-auto">
                    <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 font-black">Discography</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => {
                                if (trackRef.current) {
                                    const scrollAmount = window.innerWidth < 768 ? 240 : 300;
                                    trackRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                                }
                            }}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/50 hover:bg-white hover:text-black transition-colors backdrop-blur-md"
                            aria-label="Previous Album"
                        >
                            ←
                        </button>
                        <button 
                            onClick={() => {
                                if (trackRef.current) {
                                    const scrollAmount = window.innerWidth < 768 ? 240 : 300;
                                    trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                                }
                            }}
                            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/50 hover:bg-white hover:text-black transition-colors backdrop-blur-md"
                            aria-label="Next Album"
                        >
                            →
                        </button>
                    </div>
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
                    
                    return (
                        <div 
                            key={idx} 
                            className={`album-wrapper ${isFlipped ? 'is-flipped' : ''} ${activeIndex === idx ? 'active-album' : ''} ${album.isSoldOut ? 'is-sold-out' : ''}`} 
                            data-bg={album.front}
                            onClick={(e) => handleAlbumClick(idx, e)}
                        >
                            <div className="album-box shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                                <div className="album-spin-container">
                                    {/* FRONT */}
                                    <div className="album-face face-front">
                                        <img src={album.front} alt={`${album.title} Front`} className="w-full h-full object-cover" />
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
                                        {album.title === "Undeniable Underdog" ? (
                                            <div className="mysterious-back">
                                                <div 
                                                    className="mysterious-logo-blur"
                                                    style={{ 
                                                        maskImage: `url('${album.front}')`,
                                                        WebkitMaskImage: `url('${album.front}')`
                                                    }}
                                                ></div>
                                            </div>
                                        ) : (
                                            <img src={album.back} alt={`${album.title} Back`} className="w-full h-full object-cover" />
                                        )}
                                        <div className="plastic-wrap"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div 
                                className="album-info-box relative"
                                onClick={(e) => {
                                    if (isFlipped) e.stopPropagation();
                                }}
                            >
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
                                    
                                    <button 
                                        disabled={album.isSoldOut}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (album.isSoldOut) return;
                                            if (album.stripeUrl) {
                                                window.open(album.stripeUrl, '_blank');
                                            } else {
                                                showToast(`ADDED TO CART: ${album.title}`);
                                            }
                                        }}
                                        className={`w-full max-w-[200px] py-3 text-[10px] uppercase tracking-[0.2em] font-black italic transition-all text-center mb-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] ${album.isSoldOut ? 'bg-white/10 text-white/30 cursor-not-allowed shadow-none' : 'bg-white text-black hover:invert'}`}
                                    >
                                        {album.isSoldOut ? 'SOLD OUT' : album.isPreorder ? 'PRE-ORDER NOW' : 'BUY PHYSICAL'}
                                    </button>
                                    
                                    {album.spotify && (
                                        <a 
                                            href={album.spotify} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            onClick={(e) => e.stopPropagation()}
                                            className="block w-full max-w-[200px] border border-white/30 text-white/90 py-2 text-[9px] uppercase tracking-[0.2em] font-black italic hover:bg-white hover:text-black transition-all text-center"
                                        >
                                            LISTEN ON SPOTIFY
                                        </a>
                                    )}
                                </div>
                                
                                {/* Unflipped state hint */}
                                <div 
                                    className="absolute left-0 right-0 top-12 text-center transition-all duration-500" 
                                    style={{ 
                                        opacity: isFlipped || album.isSoldOut ? 0 : 0.5, 
                                        transform: isFlipped || album.isSoldOut ? 'translateY(10px)' : 'translateY(0)',
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

            {/* TOAST NOTIFICATION */}
            <div 
                className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                {toastMessage}
            </div>
            </div>
        </div>
    );
}
