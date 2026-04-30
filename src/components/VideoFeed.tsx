import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'motion/react';
import { playlist } from '../data';

interface VideoFeedProps {
    isMuted: boolean;
    onCategoryChange: (category: string) => void;
    onVideoClick: () => void;
    isGlitching?: boolean;
}

export interface VideoFeedRef {
    scrollToCategory: (category: string) => void;
}

const VideoFeed = forwardRef<VideoFeedRef, VideoFeedProps>(({ isMuted, onCategoryChange, onVideoClick, isGlitching = false }, ref) => {
    const feedRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const isJumpingRef = useRef(false);

    useImperativeHandle(ref, () => ({
        scrollToCategory: (category: string) => {
            const targetIndex = playlist.findIndex(p => p.category === category);
            if (targetIndex !== -1 && feedRef.current) {
                isJumpingRef.current = true;
                
                // Pause all currently playing videos to prevent audio blips during jump
                const videos = feedRef.current.querySelectorAll('video');
                videos.forEach(v => {
                    v.pause();
                    v.currentTime = 0;
                });

                const slide = feedRef.current.querySelector(`.slide[data-index="${targetIndex}"]`);
                if (slide) {
                    slide.scrollIntoView({ behavior: 'auto' }); // Use auto to prevent intersection spam
                    setActiveIndex(targetIndex);
                    onCategoryChange(category);
                    
                    // Re-enable observer logic after jump
                    setTimeout(() => {
                        isJumpingRef.current = false;
                        const targetVideo = slide.querySelector('video');
                        if (targetVideo) targetVideo.play().catch(() => {});
                    }, 100);
                }
            }
        }
    }));

    useEffect(() => {
        const options = { root: feedRef.current, threshold: 0.6 };
        observerRef.current = new IntersectionObserver((entries) => {
            if (isJumpingRef.current) return;

            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (entry.isIntersecting) {
                    const index = Number(entry.target.getAttribute('data-index'));
                    setActiveIndex(index);
                    const cat = entry.target.getAttribute('data-category');
                    if (cat) onCategoryChange(cat);
                    
                    if (video) {
                        video.play().catch(() => {});
                    }
                } else {
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }
                }
            });
        }, options);

        const slides = document.querySelectorAll('.slide');
        slides.forEach(s => observerRef.current?.observe(s));

        return () => observerRef.current?.disconnect();
    }, [onCategoryChange]);

    // Sync mute state to all rendered videos
    useEffect(() => {
        if (feedRef.current) {
            const videos = feedRef.current.querySelectorAll('video');
            videos.forEach(v => v.muted = isMuted);
        }
    }, [isMuted, activeIndex]); // Also re-run when activeIndex changes to catch newly rendered videos

    return (
        <main id="feed" className="feed" ref={feedRef} onClick={onVideoClick} aria-label="Video Feed">
            {playlist.map((item, index) => {
                // Virtualization: Only render the video element if it's within +/- 2 of the active index
                const isNearby = Math.abs(index - activeIndex) <= 2;

                return (
                    <section 
                        key={item.id} 
                        className="slide" 
                        data-category={item.category} 
                        data-index={index}
                    >
                        {isNearby ? (
                            <div className={`w-full h-full transition-all duration-75 ${isGlitching ? 'extreme-glitch' : ''}`}>
                                <video 
                                    src={item.url} 
                                    loop 
                                    playsInline 
                                    muted={isMuted} 
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-zinc-900 animate-pulse" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"></div>
                        {isGlitching && (
                            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 mix-blend-overlay animate-pulse opacity-20"></div>
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]"></div>
                                <motion.div 
                                    animate={{ y: [-100, 400] }}
                                    transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                                    className="w-full h-1 bg-white/10 blur-sm mix-blend-overlay"
                                />
                            </div>
                        )}
                    </section>
                );
            })}
        </main>
    );
});

export default VideoFeed;
