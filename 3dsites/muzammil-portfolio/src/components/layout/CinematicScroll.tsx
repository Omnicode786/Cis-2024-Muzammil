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
            { y: 46, autoAlpha: 0, filter: 'blur(12px)' },
            {
              y: 0,
              autoAlpha: 1,
              filter: 'blur(0px)',
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
              duration: 0.78,
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

        ScrollTrigger.batch('.soft-card', {
          interval: 0.08,
          batchMax: 5,
          start: 'top 84%',
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 36, autoAlpha: 0, scale: 0.985, filter: 'blur(10px)' },
              { y: 0, autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.72, stagger: 0.08, ease: 'power3.out', overwrite: true },
            );
          },
        });

        gsap.utils.toArray<SVGPathElement>('.svg-draw').forEach((path) => {
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: path,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          });
        });

        const backdrop = document.querySelector<HTMLElement>('.systems-backdrop');
        if (backdrop) {
          gsap.to(backdrop, {
            yPercent: 9,
            scale: 1.04,
            ease: 'none',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.2,
            },
          });
        }

        gsap.utils.toArray<HTMLElement>('.pin-sequence').forEach((section) => {
          const track = section.querySelector<HTMLElement>('.pin-track');
          if (!track) return;
          const getTravel = () => {
            const sidePadding = window.innerWidth < 768 ? 32 : 64;
            return Math.max(0, track.scrollWidth - window.innerWidth + sidePadding);
          };

          gsap.to(track, {
            x: () => -getTravel(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => {
                const travel = getTravel();
                return `+=${Math.max(window.innerHeight * 0.92, travel + window.innerHeight * 0.72)}`;
              },
              pin: true,
              pinSpacing: true,
              scrub: 0.85,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: -2,
              onRefreshInit: () => gsap.set(track, { x: 0 }),
            },
          });
        });

        gsap.utils.toArray<HTMLElement>('section').forEach((section, index) => {
          gsap.fromTo(
            section,
            { backgroundPositionY: index % 2 === 0 ? '0px' : '32px' },
            {
              backgroundPositionY: index % 2 === 0 ? '42px' : '-18px',
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.4,
              },
            },
          );
        });
      }

      const refresh = () => ScrollTrigger.refresh();
      const refreshTimers = [180, 620, 1200].map((delay) => window.setTimeout(refresh, delay));
      window.addEventListener('load', refresh);
      window.addEventListener('resize', refresh);

      ScrollTrigger.refresh();
      return () => {
        refreshTimers.forEach((timer) => window.clearTimeout(timer));
        window.removeEventListener('load', refresh);
        window.removeEventListener('resize', refresh);
      };
    },
    { scope: rootRef },
  );

  return <div ref={rootRef}>{children}</div>;
}
