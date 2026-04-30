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
    
    const feedRef = useRef<VideoFeedRef>(null);

    const toggleGlitch = (active: boolean) => {
        setIsGlitching(active);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'm') {
                handleToggleMute();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMuted]);

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
                    onGlitchToggle={toggleGlitch}
                    isGlitchingExternal={isGlitching}
                />

                <VideoFeed 
                    ref={feedRef}
                    isMuted={isMuted}
                    onCategoryChange={setActiveCategory}
                    onVideoClick={handleVideoClick}
                    isGlitching={isGlitching}
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
        </div>
    );
}
