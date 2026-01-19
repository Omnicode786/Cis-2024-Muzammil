export default function Contact() {
    return (
        <section id="contact" className="min-h-[90vh] w-full flex flex-col items-center justify-center bg-accent-cyan border-t-2 border-black relative overflow-hidden py-20">
            <h2 className="text-[15vw] font-black font-display text-black leading-none mix-blend-overlay opacity-20 absolute select-none top-0">
                TALK
            </h2>

            <div className="z-10 text-center w-full max-w-2xl px-6">
                <h2 className="text-6xl md:text-8xl font-black font-display text-white text-stroke-black mb-12 transform -rotate-2">
                    LET'S JAM
                </h2>

                <form className="bg-white border-4 border-black shadow-pop p-8 md:p-12 transform rotate-1 hover:rotate-0 transition-transform duration-300 w-full flex flex-col gap-6">
                    <input
                        type="text"
                        placeholder="NAME"
                        className="w-full bg-accent-yellow border-2 border-black p-4 font-mono font-bold text-xl placeholder:text-black/50 focus:outline-none focus:shadow-pop-hover transition-all cursor-none"
                    />
                    <input
                        type="email"
                        placeholder="EMAIL"
                        className="w-full bg-accent-pink border-2 border-black p-4 font-mono font-bold text-xl placeholder:text-black/50 focus:outline-none focus:shadow-pop-hover transition-all cursor-none"
                    />
                    <textarea
                        rows={4}
                        placeholder="YOUR CRAZY IDEA..."
                        className="w-full bg-accent-mint border-2 border-black p-4 font-mono font-bold text-xl placeholder:text-black/50 focus:outline-none focus:shadow-pop-hover transition-all cursor-none resize-none"
                    />

                    <button type="button" className="bg-black text-white font-display font-black text-3xl py-4 hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-colors shadow-pop hover:shadow-none cursor-none">
                        SEND IT 🚀
                    </button>
                </form>
            </div>

            <footer className="absolute bottom-8 font-mono font-bold text-black text-sm mix-blend-multiply">
                © 2026 MUZAMMIL ALAM // NO BORING WEBSITES
            </footer>
        </section>
    );
}
