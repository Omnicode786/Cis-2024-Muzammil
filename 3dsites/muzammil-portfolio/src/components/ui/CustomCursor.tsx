import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      if (!hasFinePointer || prefersReducedMotion || !dotRef.current || !ringRef.current) return undefined;
      const safe = contextSafe || (<T extends (...args: never[]) => unknown>(callback: T) => callback);

      document.body.classList.add('has-custom-cursor');
      gsap.set([dotRef.current, ringRef.current], { xPercent: -50, yPercent: -50 });

      const dotX = gsap.quickTo(dotRef.current, 'x', { duration: 0.08, ease: 'power3.out' });
      const dotY = gsap.quickTo(dotRef.current, 'y', { duration: 0.08, ease: 'power3.out' });
      const ringX = gsap.quickTo(ringRef.current, 'x', { duration: 0.42, ease: 'power3.out' });
      const ringY = gsap.quickTo(ringRef.current, 'y', { duration: 0.42, ease: 'power3.out' });

      const move = safe((event: MouseEvent) => {
        dotX(event.clientX);
        dotY(event.clientY);
        ringX(event.clientX);
        ringY(event.clientY);
      });

      const grow = safe(() => {
        gsap.to(ringRef.current, { scale: 1.85, duration: 0.18, ease: 'power2.out' });
      });

      const shrink = safe(() => {
        gsap.to(ringRef.current, { scale: 1, duration: 0.24, ease: 'power2.out' });
      });

      const interactiveElements = Array.from(document.querySelectorAll('a, button, input, textarea, select'));
      window.addEventListener('mousemove', move);
      interactiveElements.forEach((element) => {
        element.addEventListener('mouseenter', grow);
        element.addEventListener('mouseleave', shrink);
      });

      return () => {
        document.body.classList.remove('has-custom-cursor');
        window.removeEventListener('mousemove', move);
        interactiveElements.forEach((element) => {
          element.removeEventListener('mouseenter', grow);
          element.removeEventListener('mouseleave', shrink);
        });
      };
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[9999] hidden md:block" aria-hidden="true">
      <div ref={dotRef} className="fixed left-0 top-0 h-3 w-3 bg-system-cyan mix-blend-screen" />
      <div ref={ringRef} className="fixed left-0 top-0 h-10 w-10 border border-system-lime mix-blend-screen" />
    </div>
  );
}
