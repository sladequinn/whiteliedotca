import { useAppData } from '../context/AppDataContext';

interface ShowsOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShowsOverlay({ isOpen, onClose }: ShowsOverlayProps) {
    const { shows } = useAppData();

    return (
        <div
            id="shows"
            className={`fixed inset-0 z-[200] overlay-menu p-8 md:p-16 flex flex-col bg-zinc-950 overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            aria-hidden={!isOpen}
        >
            <button onClick={onClose} className="absolute top-10 right-8 text-4xl font-light z-50" aria-label="Close Shows">✕</button>

            <div className="max-w-3xl mx-auto w-full mt-12 md:mt-24 space-y-10 relative z-10">
                <h2 className="text-4xl md:text-6xl italic font-black tracking-tighter">SHOWS</h2>

                {shows.length === 0 ? (
                    <p className="text-zinc-400 text-lg md:text-xl font-mono leading-relaxed">
                        No upcoming dates. Check back soon.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {shows.map((show) => (
                            <article
                                key={show.id}
                                className="border border-white/15 bg-black/40 p-5 md:p-6 space-y-3"
                            >
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    {show.date && (
                                        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-red-500">
                                            {show.date}
                                        </p>
                                    )}
                                    {show.city && (
                                        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                                            {show.city}
                                        </p>
                                    )}
                                </div>
                                <h3 className="text-2xl md:text-4xl italic font-black tracking-tighter uppercase">
                                    {show.title || 'Upcoming show'}
                                </h3>
                                {show.blurb && (
                                    <p className="text-zinc-400 text-sm md:text-base font-mono leading-relaxed">
                                        {show.blurb}
                                    </p>
                                )}
                                {show.ticketUrl && (
                                    <a
                                        href={show.ticketUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block bg-white text-black hover:bg-red-500 hover:text-white px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors"
                                    >
                                        Tickets
                                    </a>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
