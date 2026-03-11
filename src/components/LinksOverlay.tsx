interface LinksOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LinksOverlay({ isOpen, onClose }: LinksOverlayProps) {
    return (
        <div 
            id="links" 
            className={`fixed inset-0 z-[200] overlay-menu p-10 flex flex-col justify-center bg-zinc-950 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            aria-hidden={!isOpen}
        >
            <button onClick={onClose} className="absolute top-10 right-8 text-4xl font-light" aria-label="Close Links">✕</button>
            <div className="space-y-6 relative z-10">
                <a href="https://open.spotify.com/artist/6IgPg8MO2tPuQFHcM6MF4o" target="_blank" rel="noreferrer" className="block text-5xl md:text-6xl italic font-black tracking-tighter hover:text-zinc-500 transition-colors">SPOTIFY</a>
                <a href="https://music.apple.com/ca/artist/lil-white-lie/1496696984" target="_blank" rel="noreferrer" className="block text-5xl md:text-6xl italic font-black tracking-tighter hover:text-zinc-500 transition-colors">APPLE MUSIC</a>
                <a href="https://www.tiktok.com/@whitelie519" target="_blank" rel="noreferrer" className="block text-5xl md:text-6xl italic font-black tracking-tighter hover:text-zinc-500 transition-colors">TIKTOK</a>
                <a href="https://www.instagram.com/lilwhitelie519" target="_blank" rel="noreferrer" className="block text-5xl md:text-6xl italic font-black tracking-tighter hover:text-zinc-500 transition-colors">INSTAGRAM</a>
                <a href="https://www.youtube.com/@ThaLilWhiteLie" target="_blank" rel="noreferrer" className="block text-5xl md:text-6xl italic font-black tracking-tighter hover:text-zinc-500 transition-colors">YOUTUBE</a>
            </div>
        </div>
    );
}
