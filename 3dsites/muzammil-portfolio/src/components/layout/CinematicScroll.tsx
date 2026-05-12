import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function CinematicScroll({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reducedMotion) {
        gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((item) => {
          gsap.fromTo(
            item,
            { y: 42, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('.story-panel').forEach((panel) => {
          const nodes = panel.querySelectorAll('.story-node');
          gsap.fromTo(
            nodes,
            { y: 30, autoAlpha: 0, scale: 0.96 },
            {
              y: 0,
              autoAlpha: 1,
              scale: 1,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: panel,
                start: 'top 72%',
                end: 'bottom 30%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        });

        gsap.to('.systems-backdrop', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        });

        gsap.utils.toArray<HTMLElement>('.pin-sequence').forEach((section) => {
          const track = section.querySelector('.pin-track');
          if (!track) return;

          gsap.to(track, {
            xPercent: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: '+=1100',
              pin: true,
              scrub: 1,
            },
          });
        });
      }

      ScrollTrigger.refresh();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
