import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const minimumLogoTime = 2.85;

type SiteLoaderProps = {
  onComplete: () => void;
};

export default function SiteLoader({ onComplete }: SiteLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    document.documentElement.classList.add('site-loader-active');
    document.body.classList.add('site-loader-active');

    let timeline: gsap.core.Timeline | null = null;
    let reducedMotionTimer: number | null = null;
    let scopedContext: gsap.Context | undefined;
    let animationFrame: number | null = null;

    const startLoader = () => {
      const root = rootRef.current;
      if (!root) {
        animationFrame = window.requestAnimationFrame(startLoader);
        return;
      }

      scopedContext = gsap.context(() => {
        const select = <T extends Element>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
        const heroTargets = gsap.utils.toArray<HTMLElement>('[data-hero-reveal]');
        const nav = document.querySelector<HTMLElement>('[data-loader-nav]');
        const logoPaths = select<SVGElement>('.loader-logo-path');
        const leaves = select<SVGGElement>('.loader-leaf');
        const dots = select<SVGCircleElement>('.loader-dot');
        const core = select<SVGGElement>('.loader-core');
        const portal = select<HTMLDivElement>('.loader-portal');
        const aura = select<HTMLDivElement>('.loader-aura');
        const ripple = select<HTMLDivElement>('.loader-ripple');
        const slowOrbit = select<SVGGElement>('.loader-orbit-slow');
        const fastOrbit = select<SVGGElement>('.loader-orbit-fast');
        const logoWrap = select<HTMLDivElement>('.loader-logo-wrap');
        const wordmark = select<HTMLDivElement>('.loader-wordmark');
        const wordmarkFill = select<HTMLDivElement>('.loader-wordmark-fill');
        const wordmarkWave = select<HTMLDivElement>('.loader-wordmark-wave');
        const percentage = select<HTMLDivElement>('.loader-percentage');
        const motes = select<HTMLSpanElement>('.loader-mote');
        const driftRings = select<HTMLDivElement>('.loader-drift-ring');
        const progressState = { value: 0 };
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        gsap.set(heroTargets, { y: 48, autoAlpha: 0, filter: 'blur(14px)' });
        if (nav) gsap.set(nav, { y: -20, autoAlpha: 0, filter: 'blur(8px)' });
        gsap.set(logoPaths, { strokeDasharray: 1, strokeDashoffset: 1, transformOrigin: '50% 50%' });
        gsap.set(leaves, { scale: 0.78, autoAlpha: 0, transformOrigin: '50% 50%' });
        gsap.set(dots, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' });
        gsap.set(core, { scale: 0.68, rotate: -16, autoAlpha: 0, transformOrigin: '50% 50%' });
        gsap.set(portal, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' });
        gsap.set(wordmark, { y: 22, autoAlpha: 0, filter: 'blur(14px)' });
        gsap.set(wordmarkFill, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set(wordmarkWave, { xPercent: -46, yPercent: 18, autoAlpha: 0.88 });
        gsap.set(percentage, { y: 10, autoAlpha: 0, filter: 'blur(8px)' });
        gsap.set(motes, { scale: 0, autoAlpha: 0, transformOrigin: '50% 50%' });
        gsap.set(driftRings, { scale: 0.82, autoAlpha: 0, transformOrigin: '50% 50%' });
        if (percentage[0]) percentage[0].textContent = '0%';

        if (prefersReducedMotion) {
          gsap.set(wordmark, { y: 0, autoAlpha: 1, filter: 'blur(0px)' });
          gsap.set(wordmarkFill, { clipPath: 'inset(0% 0% 0% 0%)' });
          gsap.set(wordmarkWave, { xPercent: 0, yPercent: 0 });
          if (percentage[0]) percentage[0].textContent = '100%';
          reducedMotionTimer = window.setTimeout(() => {
            gsap.set(heroTargets, { y: 0, autoAlpha: 1, filter: 'blur(0px)' });
            if (nav) gsap.set(nav, { y: 0, autoAlpha: 1, filter: 'blur(0px)' });
            onComplete();
          }, minimumLogoTime * 1000);
          return;
        }

        timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete,
        });

        timeline
          .set(root, { autoAlpha: 1 })
          .from(aura, { scale: 0.72, autoAlpha: 0, filter: 'blur(24px)', duration: 0.7 })
          .to(logoPaths, { strokeDashoffset: 0, duration: 1.05, stagger: 0.045, ease: 'power2.out' }, '<0.08')
          .to(leaves, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.72, stagger: 0.06, ease: 'back.out(1.35)' }, '<0.22')
          .to(core, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.68, ease: 'back.out(1.2)' }, '<0.18')
          .to(dots, { scale: 1, autoAlpha: 1, duration: 0.42, stagger: 0.035, ease: 'back.out(1.8)' }, '<0.2')
          .to(wordmark, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.72, ease: 'power3.out' }, '<0.05')
          .to(percentage, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.58, ease: 'power3.out' }, '<0.1')
          .to(driftRings, { scale: 1, autoAlpha: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out' }, 0.12)
          .to(motes, { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.035, ease: 'back.out(1.7)' }, 0.36)
          .to(wordmarkFill, { clipPath: 'inset(0% 0% 0% 0%)', duration: minimumLogoTime, ease: 'power2.inOut' }, 0)
          .to(wordmarkWave, { xPercent: 38, yPercent: -4, duration: minimumLogoTime, ease: 'sine.inOut' }, 0)
          .to(wordmarkWave, { backgroundPositionX: '180px', duration: 0.78, repeat: 3, ease: 'none' }, 0)
          .to(wordmarkFill, { y: -3, duration: 0.68, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.18)
          .to(
            progressState,
            {
              value: 100,
              duration: minimumLogoTime,
              ease: 'power2.inOut',
              onUpdate: () => {
                if (percentage[0]) percentage[0].textContent = `${Math.round(progressState.value)}%`;
              },
            },
            0,
          )
          .to(slowOrbit, { rotate: 54, duration: minimumLogoTime, ease: 'sine.inOut' }, 0)
          .to(fastOrbit, { rotate: -92, duration: minimumLogoTime, ease: 'sine.inOut' }, 0)
          .to(driftRings, { rotate: (index) => (index % 2 === 0 ? 38 : -46), scale: (index) => 1.08 + index * 0.04, duration: minimumLogoTime, ease: 'sine.inOut' }, 0)
          .to(motes, { y: (index) => (index % 2 === 0 ? -18 : 16), x: (index) => (index % 3 - 1) * 20, rotate: (index) => index * 24, duration: minimumLogoTime, ease: 'sine.inOut' }, 0)
          .to(logoWrap, { y: -8, scale: 1.035, duration: 1.05, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.75)
          .to(core, { scale: 1.08, duration: 0.74, yoyo: true, repeat: 2, ease: 'sine.inOut' }, 0.62)
          .to(leaves, { rotate: (index) => (index - 1.5) * 4, duration: 0.9, yoyo: true, repeat: 2, stagger: 0.04, ease: 'sine.inOut' }, 0.7)
          .to(ripple, { scale: 1.14, autoAlpha: 0.42, duration: 1.2, stagger: 0.16, ease: 'sine.inOut' }, 0.58)
          .addLabel('exit', minimumLogoTime)
          .to(motes, { scale: 1.45, autoAlpha: 0, duration: 0.34, stagger: 0.025, ease: 'power2.in' }, 'exit-=0.06')
          .to(driftRings, { scale: 1.26, autoAlpha: 0, duration: 0.42, stagger: 0.05, ease: 'power2.in' }, 'exit-=0.05')
          .to([logoWrap, wordmark, percentage], { scale: 0.86, rotate: -4, duration: 0.22, ease: 'power2.in' }, 'exit')
          .to(portal, { scale: 1, autoAlpha: 1, duration: 0.22, ease: 'power2.out' }, 'exit+=0.06')
          .to(portal, { scale: 28, duration: 0.92, ease: 'expo.inOut' }, 'exit+=0.22')
          .to([logoWrap, wordmark, percentage], { scale: 1.5, autoAlpha: 0, filter: 'blur(18px)', duration: 0.48, ease: 'power2.in' }, 'exit+=0.2')
          .to(root, { autoAlpha: 0, duration: 0.34, ease: 'power1.out' }, 'exit+=0.78')
          .to(heroTargets, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.12, stagger: 0.075, ease: 'power4.out' }, 'exit+=0.62');

        if (nav) {
          timeline.to(nav, { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.82, ease: 'power4.out' }, 'exit+=0.72');
        }
      }, root);
    };

    animationFrame = window.requestAnimationFrame(startLoader);

    return () => {
      document.documentElement.classList.remove('site-loader-active');
      document.body.classList.remove('site-loader-active');
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      if (reducedMotionTimer) window.clearTimeout(reducedMotionTimer);
      timeline?.kill();
      scopedContext?.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      role="status"
      aria-live="polite"
      aria-label="Loading Muzammil Alam portfolio"
      className="fixed inset-0 z-[999] grid place-items-center overflow-hidden bg-[#fff8eb] text-[#20302d]"
    >
      <span className="sr-only">Loading portfolio</span>
      <div className="loader-percentage pointer-events-none absolute right-5 top-5 z-20 font-['Burbank_Big_Condensed_Black','Luckiest_Guy',Impact,sans-serif] text-[clamp(1.15rem,2.25vw,2rem)] font-black tabular-nums uppercase tracking-[0.025em] text-[#3d4542] drop-shadow-[0_16px_34px_rgba(76,97,90,0.12)] sm:right-8 sm:top-8">
        0%
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(255,255,255,0.88),rgba(255,248,235,0.78)_24%,rgba(238,248,245,0.92)_64%,#fff8eb_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(101,207,215,0.24),transparent_28%),radial-gradient(circle_at_74%_20%,rgba(168,213,140,0.28),transparent_30%),radial-gradient(circle_at_50%_78%,rgba(243,217,155,0.28),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_160_160%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.62%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22160%22_height=%22160%22_filter=%22url(%23n)%22_opacity=%220.34%22/%3E%3C/svg%3E')]" />

      <div className="loader-stage pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-[min(68vw,54vh,500px)] w-[min(68vw,54vh,500px)] place-items-center">
        <div className="loader-aura loader-center-layer pointer-events-none absolute h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.92)_0%,rgba(216,234,214,0.44)_34%,rgba(101,207,215,0.13)_58%,transparent_72%)] blur-sm" />
        <div className="loader-ripple loader-center-layer pointer-events-none absolute h-[89%] w-[89%] rounded-full border border-[#8fb8aa]/18 opacity-0" />
        <div className="loader-ripple loader-center-layer pointer-events-none absolute h-[70%] w-[70%] rounded-full border border-[#a8d58c]/20 opacity-0" />
        <div className="loader-portal loader-center-layer pointer-events-none absolute h-28 w-28 rounded-full bg-[#fffaf0]" />
        <div className="loader-drift-ring pointer-events-none absolute h-[64%] w-[64%] rounded-[42%_58%_54%_46%] border border-[#65cfd7]/18" />
        <div className="loader-drift-ring pointer-events-none absolute h-[80%] w-[80%] rounded-[58%_42%_48%_52%] border border-[#a8d58c]/16" />

        {[
          ['left-[18%]', 'top-[24%]', 'bg-[#65cfd7]'],
          ['left-[78%]', 'top-[22%]', 'bg-[#a8d58c]'],
          ['left-[14%]', 'top-[68%]', 'bg-[#f3d99b]'],
          ['left-[84%]', 'top-[70%]', 'bg-[#8fb8ff]'],
          ['left-[30%]', 'top-[14%]', 'bg-[#8d6b45]'],
          ['left-[68%]', 'top-[84%]', 'bg-[#65cfd7]'],
          ['left-[42%]', 'top-[20%]', 'bg-[#a8d58c]'],
          ['left-[58%]', 'top-[74%]', 'bg-[#f3d99b]'],
        ].map(([x, y, color], index) => (
          <span key={`${x}-${y}`} className={`loader-mote pointer-events-none absolute z-10 h-2.5 w-2.5 rounded-full ${x} ${y} ${color} shadow-[0_0_24px_rgba(101,207,215,0.32)]`} style={{ opacity: 0.75 - index * 0.04 }} />
        ))}

        <div className="loader-logo-wrap relative h-[min(48vw,31vh,276px)] w-[min(48vw,31vh,276px)]">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 320 320" fill="none" aria-hidden="true">
          <g className="loader-orbit-slow" style={{ transformOrigin: '160px 160px' }}>
            <circle className="loader-logo-path" pathLength={1} cx="160" cy="160" r="122" stroke="#43888C" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 18" opacity=".55" />
            <path className="loader-logo-path" pathLength={1} d="M54 180C86 76 199 48 268 118C242 236 126 266 54 180Z" stroke="#A8D58C" strokeWidth="2" strokeLinecap="round" opacity=".62" />
          </g>

          <g className="loader-orbit-fast" style={{ transformOrigin: '160px 160px' }}>
            <circle className="loader-logo-path" pathLength={1} cx="160" cy="160" r="82" stroke="#8D6B45" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 12" opacity=".5" />
            <path className="loader-logo-path" pathLength={1} d="M160 58V262M58 160H262M90 90L230 230M230 90L90 230" stroke="#65CFD7" strokeWidth="1.5" strokeLinecap="round" opacity=".36" />
          </g>

          <g className="loader-leaf" style={{ transformOrigin: '160px 160px' }}>
            <path d="M160 43C187 78 188 111 160 137C132 111 133 78 160 43Z" fill="#D8EAD6" stroke="#7DA45F" strokeWidth="3" />
            <path d="M160 60C158 86 159 111 160 137" stroke="#6F924C" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <g className="loader-leaf" style={{ transformOrigin: '160px 160px' }}>
            <path d="M277 160C242 187 209 188 183 160C209 132 242 133 277 160Z" fill="#EEF8F5" stroke="#43888C" strokeWidth="3" />
            <path d="M260 160C234 158 209 159 183 160" stroke="#43888C" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <g className="loader-leaf" style={{ transformOrigin: '160px 160px' }}>
            <path d="M160 277C133 242 132 209 160 183C188 209 187 242 160 277Z" fill="#FFF2D9" stroke="#B98A4F" strokeWidth="3" />
            <path d="M160 260C162 234 161 209 160 183" stroke="#8D6B45" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <g className="loader-leaf" style={{ transformOrigin: '160px 160px' }}>
            <path d="M43 160C78 133 111 132 137 160C111 188 78 187 43 160Z" fill="#F6EEE0" stroke="#8D6B45" strokeWidth="3" />
            <path d="M60 160C86 162 111 161 137 160" stroke="#8D6B45" strokeWidth="2.4" strokeLinecap="round" />
          </g>

          <g className="loader-core" style={{ transformOrigin: '160px 160px' }}>
            <path d="M160 110L204 134V186L160 210L116 186V134L160 110Z" fill="rgba(255,255,255,0.86)" stroke="#20302D" strokeWidth="4" strokeLinejoin="round" />
            <path d="M160 128L187 143V177L160 192L133 177V143L160 128Z" fill="#FFF8EB" stroke="#65CFD7" strokeWidth="3" />
            <path d="M143 160H177M160 143V177" stroke="#7DA45F" strokeWidth="4" strokeLinecap="round" />
            <path d="M118 134L95 124M202 134L225 124M118 186L95 196M202 186L225 196" stroke="#20302D" strokeWidth="3" strokeLinecap="round" opacity=".48" />
          </g>

          {[88, 160, 232].map((x) => (
            <circle key={`top-${x}`} className="loader-dot" cx={x} cy="66" r="5" fill="#65CFD7" />
          ))}
          {[88, 160, 232].map((x) => (
            <circle key={`bottom-${x}`} className="loader-dot" cx={x} cy="254" r="5" fill="#A8D58C" />
          ))}
          {[66, 254].map((y) => (
            <circle key={`left-${y}`} className="loader-dot" cx="66" cy={y} r="5" fill="#8D6B45" />
          ))}
          {[66, 254].map((y) => (
            <circle key={`right-${y}`} className="loader-dot" cx="254" cy={y} r="5" fill="#43888C" />
          ))}
          </svg>
        </div>
      </div>

      <div className="loader-wordmark absolute z-20 w-max max-w-[94vw] whitespace-nowrap text-center font-['Burbank_Big_Condensed_Black','Luckiest_Guy',Impact,sans-serif] text-[clamp(2.05rem,8.4vw,7.8rem)] font-black uppercase leading-[0.78] tracking-[0.035em] [word-spacing:0.14em]" aria-hidden="true">
        <span className="block text-white drop-shadow-[0_24px_54px_rgba(69,88,82,0.18)] [-webkit-text-stroke:1px_rgba(17,31,28,0.07)]">Muzammil Alam</span>
        <span className="loader-wordmark-fill absolute inset-0 block overflow-hidden text-[#3d4542] [clip-path:inset(100%_0%_0%_0%)]">
          <span className="loader-wordmark-wave pointer-events-none absolute -left-1/4 right-[-25%] top-[-18%] h-[44%] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.18)_34%,transparent_68%),repeating-linear-gradient(90deg,transparent_0_28px,rgba(255,255,255,0.22)_30px_42px,transparent_44px_72px)] opacity-80 blur-[1px]" />
          Muzammil Alam
        </span>
      </div>
    </div>
  );
}
