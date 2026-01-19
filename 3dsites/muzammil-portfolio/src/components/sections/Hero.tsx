import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Hero() {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.from('.hero-char', {
            y: 100,
            opacity: 0,
            rotate: 15,
            stagger: 0.05,
            duration: 1,
            ease: 'back.out(2)'
        });
    }, { scope: container });

    return (
        <section ref={container} className="h-screen w-full flex items-center justify-center pointer-events-none select-none">
            <div className="relative text-center z-10">
                <h1 className="text-[12vw] font-black font-display leading-[0.8] tracking-tight mix-blend-multiply text-primary">
                    <div className="overflow-hidden inline-block"><span className="hero-char inline-block text-accent-red">RADICAL</span></div> <br />
                    <div className="overflow-hidden inline-block"><span className="hero-char inline-block text-primary">CREATOR</span></div>
                </h1>

                <div className="mt-8">
                    <span className="bg-white border-2 border-black shadow-pop px-6 py-3 font-bold font-mono text-xl transform -rotate-3 inline-block">
                        MUZAMMIL.ALAM
                    </span>
                </div>
            </div>
        </section>
    );
}
