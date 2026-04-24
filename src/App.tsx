/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import VideoFeed, { VideoFeedRef } from './components/VideoFeed';
import HUD from './components/HUD';
import StoreOverlay from './components/StoreOverlay';
import LinksOverlay from './components/LinksOverlay';
import InfoOverlay from './components/InfoOverlay';

export default function App() {
    const [isMuted, setIsMuted] = useState(true);
    const [activeOverlay, setActiveOverlay] = useState<'none' | 'store' | 'links' | 'info'>('none');
    const [activeCategory, setActiveCategory] = useState('featured');
    const [showUnmuteToast, setShowUnmuteToast] = useState(true);
    const [isGlitching, setIsGlitching] = useState(false);
    const [inputBuffer, setInputBuffer] = useState('');
    
    const feedRef = useRef<VideoFeedRef>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const char = e.key.toLowerCase();
            if (/^[a-z]$/.test(char)) {
                const next = (inputBuffer + char).slice(-3);
                setInputBuffer(next);
                if (next === 'lie') {
                    setIsGlitching(true);
                    setTimeout(() => setIsGlitching(false), 5000);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputBuffer]);

    const handleVideoClick = () => {
        if (isMuted) {
            setIsMuted(false);
            setShowUnmuteToast(false);
        } else {
            setIsMuted(true);
        }
    };

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
        setShowUnmuteToast(false);
    };

    const handleCategorySelect = (category: string) => {
        if (feedRef.current) {
            feedRef.current.scrollToCategory(category);
        }
    };

    const handleToggleMenu = (menu: 'store' | 'links' | 'info') => {
        setActiveOverlay(activeOverlay === menu ? 'none' : menu);
    };

    return (
        <div className="font-brutal antialiased text-white selection:bg-white selection:text-black">
            <div className="noise"></div>

            <div className="app-shell" aria-hidden={activeOverlay !== 'none'}>
                <HUD 
                    activeCategory={activeCategory}
                    onCategorySelect={handleCategorySelect}
                    onToggleMenu={handleToggleMenu}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                />

                <VideoFeed 
                    ref={feedRef}
                    isMuted={isMuted}
                    onCategoryChange={setActiveCategory}
                    onVideoClick={handleVideoClick}
                />

                {/* TAP TO UNMUTE TOAST */}
                <div 
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[90] text-[10px] uppercase tracking-[0.5em] pointer-events-none transition-opacity duration-500 bg-white text-black px-6 py-3 font-black rounded-sm shadow-2xl ${showUnmuteToast ? 'opacity-80' : 'opacity-0'}`}
                >
                    TAP TO UNMUTE
                </div>
            </div>

            <LinksOverlay 
                isOpen={activeOverlay === 'links'} 
                onClose={() => setActiveOverlay('none')} 
            />
            
            <InfoOverlay 
                isOpen={activeOverlay === 'info'} 
                onClose={() => setActiveOverlay('none')} 
            />
            
            <StoreOverlay 
                isOpen={activeOverlay === 'store'} 
                onClose={() => setActiveOverlay('none')} 
            />

            {/* EASTER EGG GLITCH OVERLAY */}
            {isGlitching && (
                <div className="fixed inset-0 z-[999] pointer-events-none bg-red-500/20 mix-blend-difference animate-pulse">
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dj3uocb74/image/upload/v1710000000/black_glitch_placeholder.jpg')] opacity-20 mix-blend-overlay animate-glitch-fast"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <h2 className="text-[15vw] font-black italic tracking-tighter leading-none text-white drop-shadow-[0_0_30px_red]">LIE</h2>
                        <p className="text-xl font-mono tracking-[1em] text-red-500 animate-pulse">SYSTEM BREACH</p>
                        <p className="mt-8 text-xs font-mono text-white/50">USE CODE 'TRUTH' FOR 20% OFF</p>
                    </div>
                </div>
            )}
        </div>
    );
}
