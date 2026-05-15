import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      if (!hasFinePointer || prefersReducedMotion || !dotRef.current || !ringRef.current) return undefined;

      document.body.classList.add('has-custom-cursor');
      gsap.set([dotRef.current, ringRef.current], { xPercent: -50, yPercent: -50 });

      const dotX = gsap.quickTo(dotRef.current, 'x', { duration: 0.1, ease: 'power3.out' });
      const dotY = gsap.quickTo(dotRef.current, 'y', { duration: 0.1, ease: 'power3.out' });
      const ringX = gsap.quickTo(ringRef.current, 'x', { duration: 0.48, ease: 'power3.out' });
      const ringY = gsap.quickTo(ringRef.current, 'y', { duration: 0.48, ease: 'power3.out' });

      const move = (event: MouseEvent) => {
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
      };

      const magneticSelector = 'a, button, input, textarea, select, .story-node, .skill-card-live, .tree-root-card, .timeline-leaf, .timeline-leaf-card, [data-magnetic]';
      let activeMagnet: HTMLElement | null = null;

      const hoverMove = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const interactive = target?.closest(magneticSelector);
        gsap.to(ringRef.current, {
          scale: interactive ? 1.9 : 1,
          opacity: interactive ? 0.78 : 0.48,
          borderColor: interactive ? '#a8d58c' : '#65cfd7',
          duration: 0.2,
          ease: 'power2.out',
        });
      };

      const magnetMove = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const element = target?.closest<HTMLElement>(magneticSelector) ?? null;

        if (activeMagnet && activeMagnet !== element) {
          gsap.to(activeMagnet, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)' });
        }

        activeMagnet = element;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
        gsap.to(element, { x, y, duration: 0.36, ease: 'power3.out' });
      };

      const magnetLeave = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const element = target?.closest<HTMLElement>(magneticSelector);
        const nextTarget = event.relatedTarget as Node | null;
        if (!element || (nextTarget && element.contains(nextTarget))) return;

        gsap.to(element, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.55)' });
        if (activeMagnet === element) activeMagnet = null;
      };

      window.addEventListener('mousemove', move);
      window.addEventListener('mousemove', hoverMove);
      window.addEventListener('mousemove', magnetMove);
      window.addEventListener('mouseout', magnetLeave);

      return () => {
        document.body.classList.remove('has-custom-cursor');
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mousemove', hoverMove);
        window.removeEventListener('mousemove', magnetMove);
        window.removeEventListener('mouseout', magnetLeave);
        if (activeMagnet) gsap.set(activeMagnet, { x: 0, y: 0 });
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[9999] hidden md:block" aria-hidden="true">
      <div ref={dotRef} className="fixed left-0 top-0 h-2.5 w-2.5 rounded-full bg-[#3e8e93] shadow-[0_0_18px_rgba(101,207,215,0.7)] mix-blend-multiply" />
      <div ref={ringRef} className="fixed left-0 top-0 h-11 w-11 rounded-full border border-system-cyan/80 bg-white/20 opacity-50 shadow-[0_0_34px_rgba(101,207,215,0.28)] mix-blend-multiply backdrop-blur-[2px]" />
    </div>
  );
}
