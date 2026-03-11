import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { playlist } from '../data';

interface VideoFeedProps {
    isMuted: boolean;
    onCategoryChange: (category: string) => void;
    onVideoClick: () => void;
}

export interface VideoFeedRef {
    scrollToCategory: (category: string) => void;
}

const VideoFeed = forwardRef<VideoFeedRef, VideoFeedProps>(({ isMuted, onCategoryChange, onVideoClick }, ref) => {
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
                            <video 
                                src={item.url} 
                                loop 
                                playsInline 
                                muted={isMuted} 
                                preload="metadata"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-900 animate-pulse" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"></div>
                    </section>
                );
            })}
        </main>
    );
});

export default VideoFeed;
