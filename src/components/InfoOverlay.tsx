import React from 'react';

interface InfoOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoOverlay({ isOpen, onClose }: InfoOverlayProps) {
    return (
        <div 
            id="info" 
            className={`fixed inset-0 z-[200] overlay-menu p-8 md:p-16 flex flex-col bg-zinc-950 overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            aria-hidden={!isOpen}
        >
            <button onClick={onClose} className="absolute top-10 right-8 text-4xl font-light z-50" aria-label="Close Info">✕</button>
            
            <div className="max-w-3xl mx-auto w-full mt-12 md:mt-24 space-y-16 relative z-10">
                <section>
                    <h2 className="text-4xl md:text-6xl italic font-black tracking-tighter mb-6">ABOUT</h2>
                    <div className="space-y-4 text-zinc-400 text-lg md:text-xl leading-relaxed font-mono">
                        <p>
                            WH!TE L!E is a boundary-pushing artist blending raw energy with meticulously crafted soundscapes. 
                            Known for high-octane performances and a unique visual aesthetic, the music speaks to the chaotic beauty of modern life.
                        </p>
                        <p>
                            Hailing from the underground and rising to mainstream consciousness, WH!TE L!E continues to redefine what it means to be an independent creator in the digital age.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-4xl md:text-6xl italic font-black tracking-tighter mb-6">CONTACT</h2>
                    <div className="space-y-6 text-zinc-400 text-lg md:text-xl font-mono">
                        <div>
                            <p className="text-white font-bold text-sm tracking-widest uppercase mb-1 font-sans">Management & Booking</p>
                            <a href="mailto:mgmt@whitelie.com" className="hover:text-white transition-colors">mgmt@whitelie.com</a>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-widest uppercase mb-1 font-sans">Press Inquiries</p>
                            <a href="mailto:press@whitelie.com" className="hover:text-white transition-colors">press@whitelie.com</a>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-widest uppercase mb-1 font-sans">Store Support</p>
                            <a href="mailto:store@whitelie.com" className="hover:text-white transition-colors">store@whitelie.com</a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
