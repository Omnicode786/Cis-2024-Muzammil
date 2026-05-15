import { ReactLenis, type LenisRef } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, type ReactNode } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
    children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
    const lenisRef = useRef<LenisRef>(null);

    useEffect(() => {
        function update(time: number) {
            lenisRef.current?.lenis?.raf(time * 1000);
        }

        const lenis = lenisRef.current?.lenis;
        lenis?.on('scroll', ScrollTrigger.update);

        const scrollToHash = (hash: string) => {
            const target = document.querySelector(hash);
            if (!target) return;
            lenisRef.current?.lenis?.scrollTo(target as HTMLElement, { offset: -88, duration: 1.15 });
        };

        const onAnchorClick = (event: MouseEvent) => {
            const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
            if (!anchor || !anchor.hash) return;
            if (!document.querySelector(anchor.hash)) return;
            event.preventDefault();
            window.history.pushState(null, '', anchor.hash);
            scrollToHash(anchor.hash);
        };

        const hashTimers = [160, 480, 900].map((delay) =>
            window.setTimeout(() => {
                if (window.location.hash) scrollToHash(window.location.hash);
            }, delay),
        );

        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);
        document.addEventListener('click', onAnchorClick);

        return () => {
            lenis?.off('scroll', ScrollTrigger.update);
            gsap.ticker.remove(update);
            document.removeEventListener('click', onAnchorClick);
            hashTimers.forEach((timer) => window.clearTimeout(timer));
        };
    }, []);

    return (
        <ReactLenis root ref={lenisRef} autoRaf={false}>
            {children}
        </ReactLenis>
    );
}
