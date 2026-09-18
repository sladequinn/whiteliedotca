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
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
    const [isMuted, setIsMuted] = useState(true);
    const [activeOverlay, setActiveOverlay] = useState<'none' | 'store' | 'links' | 'info' | 'admin'>('none');
    const [activeCategory, setActiveCategory] = useState('featured');
    const [showUnmuteToast, setShowUnmuteToast] = useState(true);
    const [isGlitching, setIsGlitching] = useState(false);
    
    const feedRef = useRef<VideoFeedRef>(null);

    // Check for admin route in URL (#admin or ?admin or /admin)
    useEffect(() => {
        const checkAdminHashOrQuery = () => {
            const hash = window.location.hash.toLowerCase();
            const search = window.location.search.toLowerCase();
            const pathname = window.location.pathname.toLowerCase();
            if (hash === '#admin' || hash === '#backstage' || search.includes('admin') || pathname.endsWith('/admin')) {
                setActiveOverlay('admin');
            }
        };

        checkAdminHashOrQuery();
        window.addEventListener('hashchange', checkAdminHashOrQuery);
        window.addEventListener('popstate', checkAdminHashOrQuery);
        return () => {
            window.removeEventListener('hashchange', checkAdminHashOrQuery);
            window.removeEventListener('popstate', checkAdminHashOrQuery);
        };
    }, []);

    const toggleGlitch = (active: boolean) => {
        setIsGlitching(active);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'm' && activeOverlay !== 'admin') {
                handleToggleMute();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMuted, activeOverlay]);

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

    const handleOpenAdmin = () => {
        setActiveOverlay('admin');
        window.location.hash = 'admin';
    };

    const handleCloseAdmin = () => {
        setActiveOverlay('none');
        if (window.location.hash === '#admin' || window.location.hash === '#backstage') {
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
    };

    return (
        <div className="font-brutal antialiased text-white selection:bg-white selection:text-black">
            <div className="noise"></div>

            <div className="app-shell" aria-hidden={activeOverlay !== 'none'}>
                <HUD 
                    activeCategory={activeCategory}
                    onCategorySelect={handleCategorySelect}
                    onToggleMenu={handleToggleMenu}
                    onOpenAdmin={handleOpenAdmin}
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

            <AdminPanel
                isOpen={activeOverlay === 'admin'}
                onClose={handleCloseAdmin}
            />
        </div>
    );
}
