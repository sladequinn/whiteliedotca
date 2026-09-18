import React from 'react';
import { useAppData } from '../context/AppDataContext';

interface InfoOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoOverlay({ isOpen, onClose }: InfoOverlayProps) {
    const { info } = useAppData();

    const paragraphs = (info?.about_text || '').split('\n').filter(p => p.trim());

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
                        {paragraphs.length > 0 ? (
                            paragraphs.map((p, i) => <p key={i}>{p}</p>)
                        ) : (
                            <p>WH!TE L!E Official</p>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="text-4xl md:text-6xl italic font-black tracking-tighter mb-6">CONTACT</h2>
                    <div className="space-y-6 text-zinc-400 text-lg md:text-xl font-mono">
                        <div>
                            <p className="text-white font-bold text-sm tracking-widest uppercase mb-1 font-sans">Management & Booking</p>
                            <a href={`mailto:${info?.management_email || 'lilwhitelie1@gmail.com'}`} className="hover:text-white transition-colors">
                                {info?.management_email || 'lilwhitelie1@gmail.com'}
                            </a>
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm tracking-widest uppercase mb-1 font-sans">General Inquiry</p>
                            <a href={`mailto:${info?.general_email || 'lilwhitelie1@gmail.com'}`} className="hover:text-white transition-colors">
                                {info?.general_email || 'lilwhitelie1@gmail.com'}
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
