// import { useRef, useEffect } from 'react';
// import gsap from 'gsap';

export default function Skills() {
    return (
        <section className="py-20 bg-primary overflow-hidden border-t-2 border-b-2 border-black">
            <div className="relative flex whitespace-nowrap overflow-hidden">
                <div className="animate-marquee flex gap-12 text-6xl md:text-8xl font-black font-display text-accent-yellow mx-6">
                    <span>REACT</span>
                    <span>THREE.JS</span>
                    <span>TYPESCRIPT</span>
                    <span>NODE.JS</span>
                    <span>WEBGL</span>
                    <span>DESIGN</span>
                    <span>REACT</span>
                    <span>THREE.JS</span>
                    <span>TYPESCRIPT</span>
                    <span>NODE.JS</span>
                    <span>WEBGL</span>
                    <span>DESIGN</span>
                </div>
                <div className="absolute top-0 animate-marquee2 flex gap-12 text-6xl md:text-8xl font-black font-display text-accent-yellow mx-6">
                    <span>REACT</span>
                    <span>THREE.JS</span>
                    <span>TYPESCRIPT</span>
                    <span>NODE.JS</span>
                    <span>WEBGL</span>
                    <span>DESIGN</span>
                    <span>REACT</span>
                    <span>THREE.JS</span>
                    <span>TYPESCRIPT</span>
                    <span>NODE.JS</span>
                    <span>WEBGL</span>
                    <span>DESIGN</span>
                </div>
            </div>

            <div className="mt-8 flex justify-center gap-4 flex-wrap px-6">
                {['Next.js', 'Tailwind', 'Motion', 'Zustand', 'PostgreSQL', 'Blender'].map(skill => (
                    <span key={skill} className="bg-white border-2 border-black shadow-pop px-4 py-2 font-mono font-bold text-sm transform hover:-rotate-2 transition-transform cursor-none">
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    );
}
