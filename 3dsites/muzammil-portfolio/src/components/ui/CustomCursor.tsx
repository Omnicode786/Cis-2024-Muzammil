import { useEffect } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
    // const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            // setPosition({ x: e.clientX, y: e.clientY });

            // Trail effect
            gsap.to('.cursor-dot', {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1,
                ease: 'power2.out'
            });

            gsap.to('.cursor-ring', {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5,
                ease: 'power2.out'
            });
        };

        window.addEventListener('mousemove', onMouseMove);
        return () => window.removeEventListener('mousemove', onMouseMove);
    }, []);

    return (
        <>
            <div className="cursor-dot fixed top-0 left-0 w-3 h-3 bg-accent-cyan rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{ transform: `translate(-50%, -50%)` }} />
            <div className="cursor-ring fixed top-0 left-0 w-8 h-8 border border-accent-orange rounded-full pointer-events-none z-[9999] mix-blend-difference"
                style={{ transform: `translate(-50%, -50%)` }} />

            <style>{`
        body { cursor: none; }
        a:hover ~ .cursor-ring, button:hover ~ .cursor-ring {
            background-color: rgba(255, 0, 85, 0.2);
            transform: scale(1.5);
        }
      `}</style>
        </>
    );
}
