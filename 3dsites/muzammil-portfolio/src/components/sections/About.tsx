export default function About() {
    return (
        <section id="about" className="min-h-screen w-full flex items-center justify-center py-20 bg-accent-yellow border-t-2 border-b-2 border-black">
            <div className="max-w-4xl px-6 relative">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-accent-red rounded-full border-2 border-black shadow-pop animate-bounce-slow" />

                <h2 className="text-5xl md:text-7xl font-display font-black text-black mb-12 tracking-tight">
                    WHO IS <br />
                    <span className="text-white text-outline">THIS GUY?</span>
                </h2>

                <div className="bg-white border-2 border-black shadow-pop p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <p className="font-sans text-xl md:text-2xl leading-relaxed text-black font-bold">
                        I'm Muzammil. I smash <span className="text-accent-purple bg-accent-mint px-2">code</span> and <span className="text-accent-red bg-accent-yellow px-2">art</span> together until something cool happens.
                    </p>
                    <p className="mt-6 font-mono text-sm text-secondary">
                  // FULL STACK ENGINEER <br />
                  // 3D ENTHUSIAST <br />
                  // DOPAMINE DEALER
                    </p>
                </div>
            </div>
        </section>
    );
}
