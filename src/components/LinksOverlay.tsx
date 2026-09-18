import { useAppData } from '../context/AppDataContext';

interface LinksOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LinksOverlay({ isOpen, onClose }: LinksOverlayProps) {
    const { links } = useAppData();

    return (
        <div 
            id="links" 
            className={`fixed inset-0 z-[200] overlay-menu p-10 flex flex-col justify-center bg-zinc-950 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            aria-hidden={!isOpen}
        >
            <button onClick={onClose} className="absolute top-10 right-8 text-4xl font-light" aria-label="Close Links">✕</button>
            <div className="space-y-6 relative z-10">
                {links.map((link) => (
                    <a 
                        key={link.id}
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="block text-5xl md:text-6xl italic font-black tracking-tighter hover:text-zinc-500 transition-colors uppercase"
                    >
                        {link.title}
                    </a>
                ))}
            </div>
        </div>
    );
}
