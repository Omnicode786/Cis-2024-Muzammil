import { useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, BrainCircuit, Code2, Cpu, Database, Leaf, Network, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Milestone = {
  title: string;
  detail: string;
  focus: string;
};

type Branch = {
  icon: LucideIcon;
  title: string;
  root: string;
  nodes: string[];
  roadmap: Milestone[];
};

const branches: Branch[] = [
  {
    icon: Code2,
    title: 'Frontend interfaces',
    root: 'React, Next.js, Tailwind',
    nodes: ['Framer Motion', 'Three.js', 'Responsive UX', 'Interactive experiences'],
    roadmap: [
      { title: 'Foundation', detail: 'Semantic layouts, reusable components, responsive UI.', focus: 'React + Tailwind' },
      { title: 'Motion', detail: 'GSAP, Framer Motion, hover systems, reveal timing.', focus: 'Animation' },
      { title: 'Immersion', detail: 'Three.js, glass layers, spatial interfaces, polish.', focus: 'Cinematic UX' },
    ],
  },
  {
    icon: Database,
    title: 'Backend systems',
    root: 'Node, Express, MongoDB',
    nodes: ['REST APIs', 'Auth systems', 'MERN stack', 'Backend architecture'],
    roadmap: [
      { title: 'API roots', detail: 'Routes, validation, controllers, reliable data flow.', focus: 'Node + Express' },
      { title: 'Persistence', detail: 'MongoDB models, query habits, product-shaped data.', focus: 'MongoDB' },
      { title: 'Trust layer', detail: 'Auth, roles, protected paths, safer actions.', focus: 'Security' },
    ],
  },
  {
    icon: Cpu,
    title: 'Low-level computing',
    root: 'C, C++, architecture',
    nodes: ['Pointers', 'Memory', 'Bit manipulation', 'File systems', 'Threads/processes'],
    roadmap: [
      { title: 'C memory', detail: 'Pointers, arrays, files, and what the machine actually does.', focus: 'C' },
      { title: 'C++ depth', detail: 'DSA, recursion, object lifetimes, sharper problem solving.', focus: 'C++' },
      { title: 'Systems brain', detail: 'Processes, threads, architecture, file systems.', focus: 'CS core' },
    ],
  },
  {
    icon: Network,
    title: 'Hardware + systems',
    root: 'RISC-V and electronics',
    nodes: ['Processor design', 'ISA extensions', 'VGA controllers', 'ESP32', 'PCB design'],
    roadmap: [
      { title: 'Electronics origin', detail: 'Circuits, signals, sensors, embedded instincts.', focus: 'Hardware' },
      { title: 'Embedded builds', detail: 'ESP32, boards, and hardware/software integration.', focus: 'Embedded' },
      { title: 'Architecture labs', detail: 'RISC-V, datapaths, VGA, processor concepts.', focus: 'RISC-V' },
    ],
  },
  {
    icon: BrainCircuit,
    title: 'AI + future tech',
    root: 'LLMs and agents',
    nodes: ['Generative AI', 'Automation', 'Intelligent systems', 'Futuristic interfaces'],
    roadmap: [
      { title: 'AI foundations', detail: 'LLMs, Generative AI, and intelligent system thinking.', focus: 'LLMs' },
      { title: 'Agent loops', detail: 'Automation, tools, task systems, useful AI layers.', focus: 'Agents' },
      { title: 'Future UI', detail: 'Explainable AI interfaces that feel alive and trustworthy.', focus: 'AI UX' },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Security thinking',
    root: 'Fintech and trust',
    nodes: ['Cybersecurity basics', 'Risk flows', 'Verification layers', 'System resilience'],
    roadmap: [
      { title: 'Risk awareness', detail: 'Spot what can break, leak, or be abused.', focus: 'Mindset' },
      { title: 'Verification', detail: 'Identity checks, trust signals, audit trails.', focus: 'Trust UX' },
      { title: 'Resilience', detail: 'Graceful failure, safer flows, explainable decisions.', focus: 'Systems' },
    ],
  },
];

function getLeafAnchor(index: number, total: number) {
  const y = 38 + index * (50 / Math.max(total - 1, 1));
  const isLeft = index % 2 === 0;
  return {
    x: isLeft ? 26 : 74,
    y,
    handleX: isLeft ? 38 : 62,
  };
}

function getBranchPath(index: number, total: number) {
  const anchor = getLeafAnchor(index, total);
  return `M50 ${anchor.y - 1.4} C${anchor.handleX} ${anchor.y - 8} ${anchor.handleX} ${anchor.y - 1.2} ${anchor.x} ${anchor.y - 1.2} L${anchor.x} ${anchor.y}`;
}

function getLeafPosition(index: number, total: number): CSSProperties {
  const anchor = getLeafAnchor(index, total);
  return {
    '--leaf-x': `${anchor.x}%`,
    '--leaf-y': `${anchor.y}%`,
  } as CSSProperties;
}

export default function Skills() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const activeBranch = activeIndex === null ? null : branches[activeIndex];
  const ActiveIcon = activeBranch?.icon;

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set('.skill-card-live, .tree-root-card, .timeline-trunk, .timeline-branch-path, .timeline-knot, .timeline-leaf, .timeline-micro', {
          autoAlpha: 1,
          clearProps: 'transform,filter,strokeDashoffset',
        });
        return;
      }

      if (!activeBranch) {
        gsap.fromTo(
          '.skill-card-live',
          { y: 34, autoAlpha: 0, scale: 0.94, rotate: -1, filter: 'blur(10px)' },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            filter: 'blur(0px)',
            duration: 0.74,
            stagger: 0.075,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.skill-experience-stage',
              start: 'top 68%',
              toggleActions: 'play none none reverse',
            },
          },
        );
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      timeline
        .fromTo('.tree-root-card', { y: -18, autoAlpha: 0, scale: 0.82, filter: 'blur(10px)' }, { y: 0, autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.54 })
        .fromTo(
          '.timeline-trunk',
          { strokeDasharray: 1, strokeDashoffset: 1, autoAlpha: 0.35 },
          { strokeDashoffset: 0, autoAlpha: 1, duration: 0.95, ease: 'power2.inOut' },
          '-=0.08',
        )
        .fromTo(
          '.timeline-branch-path',
          { strokeDasharray: 1, strokeDashoffset: 1, autoAlpha: 0.25 },
          { strokeDashoffset: 0, autoAlpha: 1, duration: 0.72, stagger: 0.11, ease: 'power2.out' },
          '-=0.34',
        )
        .fromTo('.timeline-knot', { autoAlpha: 0, scale: 0.2, transformOrigin: 'center' }, { autoAlpha: 1, scale: 1, duration: 0.34, stagger: 0.09, ease: 'back.out(1.7)' }, '-=0.42')
        .fromTo(
          '.timeline-leaf',
          { y: 34, autoAlpha: 0, scale: 0.38, rotate: -7, transformOrigin: 'center top', filter: 'blur(12px)' },
          { y: 0, autoAlpha: 1, scale: 1, rotate: 0, transformOrigin: 'center top', filter: 'blur(0px)', duration: 0.62, stagger: 0.12, ease: 'back.out(1.55)' },
          '-=0.25',
        )
        .fromTo('.timeline-micro', { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.28, stagger: 0.04 }, '-=0.18');
    },
    { scope: rootRef, dependencies: [activeIndex], revertOnUpdate: true },
  );

  return (
    <section ref={rootRef} id="tech-tree" className="paper-grain relative overflow-hidden border-y border-[#b38f59]/20 bg-[#f8ebcd] px-4 py-24 text-[#1c1409] md:px-8 md:py-32">
      <div className="absolute left-6 top-10 hidden rotate-[-18deg] text-[#315d2c]/18 md:block">
        <Leaf size={170} />
      </div>
      <div className="absolute bottom-12 right-8 hidden rotate-[18deg] text-[#315d2c]/16 md:block">
        <Leaf size={150} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <div className="reveal-up max-w-4xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#315d2c]">Learning tech tree</p>
          <h2 className="mt-5 font-display text-4xl font-black uppercase leading-none md:text-6xl">
            The old manuscript version of my engineering brain.
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#4f3b21]">
            Pick a branch. The grid stays clean first, then the selected skill grows into a focused tree map with the leaves pinned to the branch tips.
          </p>
        </div>

        <div className="skill-experience-stage relative mt-14 overflow-hidden rounded-[3rem] border border-[#8d6b45]/25 bg-[#fff7df]/72 p-4 shadow-[0_34px_100px_rgba(94,76,45,0.14)] backdrop-blur-xl md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(216,234,214,0.72),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.72),transparent_24%),linear-gradient(135deg,rgba(141,107,69,0.08),transparent_45%)]" />

          <AnimatePresence initial={false}>
            {!activeBranch ? (
              <motion.div
                key="skill-cards"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18, filter: 'blur(8px)' }}
                transition={{ duration: 0.34, ease: 'easeOut' }}
                className="relative grid gap-5 lg:grid-cols-2 xl:grid-cols-3"
              >
                <div className="col-span-full rounded-[2rem] border border-[#8d6b45]/18 bg-[#fffaf0]/72 p-5 shadow-[0_18px_58px_rgba(94,76,45,0.09)] backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#6d4724]">select a skill branch</p>
                    <p className="max-w-xl text-sm font-bold leading-6 text-[#5b4728]">Simple cards first. The detailed bubbles only appear after a branch opens into timeline mode.</p>
                  </div>
                </div>
                {branches.map((branch, index) => (
                    <article
                      key={branch.title}
                      data-magnetic
                      className="skill-card-live story-node group relative flex min-h-[178px] flex-col justify-between overflow-hidden rounded-[2rem] border border-[#8d6b45]/18 bg-white/76 p-6 opacity-0 shadow-[0_22px_70px_rgba(94,76,45,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#315d2c]/35 hover:bg-[#fffaf0] hover:shadow-[0_28px_88px_rgba(49,93,44,0.16)]"
                    >
                      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#d8ead6]/52 blur-sm transition-transform duration-500 group-hover:scale-125" />
                      <h3 className="relative max-w-[12rem] font-display text-3xl font-black uppercase leading-none text-[#1c1409]">{branch.title}</h3>

                      <button
                        onClick={() => setActiveIndex(index)}
                        className="magnetic-button relative mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#315d2c]/25 bg-white/70 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#315d2c] transition-colors hover:bg-[#315d2c] hover:text-[#fff7df]"
                      >
                        <Sparkles size={14} />
                        View Timeline
                      </button>
                    </article>
                  ))}
              </motion.div>
            ) : (
              <motion.div
                key={`timeline-${activeBranch.title}`}
                initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
                transition={{ duration: 0.38, ease: 'easeOut' }}
                className="tree-timeline-mode relative min-h-[860px] overflow-hidden rounded-[2.5rem] border border-[#4f7f38]/20 bg-[linear-gradient(180deg,rgba(255,250,240,0.9),rgba(239,249,228,0.78))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] md:min-h-[900px] md:p-8"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(141,107,69,0.14),transparent_22%),radial-gradient(circle_at_18%_54%,rgba(86,132,54,0.16),transparent_24%),radial-gradient(circle_at_82%_62%,rgba(168,213,140,0.2),transparent_24%)]" />
                <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="timeline-trunk-gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#b98548" />
                      <stop offset="52%" stopColor="#7b5524" />
                      <stop offset="100%" stopColor="#4f7f38" />
                    </linearGradient>
                    <linearGradient id="timeline-branch-gradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#8d6b45" />
                      <stop offset="100%" stopColor="#4f7f38" />
                    </linearGradient>
                  </defs>
                  <path className="timeline-trunk" pathLength={1} d="M50 26 C47 38 52 48 50 61 C48 73 52 82 50 92" fill="none" stroke="url(#timeline-trunk-gradient)" strokeWidth="1.05" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  {activeBranch.nodes.map((node, index) => {
                    const anchor = getLeafAnchor(index, activeBranch.nodes.length);
                    return (
                      <g key={node}>
                        <path className="timeline-branch-path" pathLength={1} d={getBranchPath(index, activeBranch.nodes.length)} fill="none" stroke="url(#timeline-branch-gradient)" strokeWidth="0.64" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        <circle className="timeline-knot" cx={anchor.x} cy={anchor.y} r="0.92" fill="#7da35a" stroke="#fff7df" strokeWidth="0.36" vectorEffect="non-scaling-stroke" />
                      </g>
                    );
                  })}
                </svg>
                <div className="pointer-events-none absolute left-1/2 top-24 z-0 h-[calc(100%-8rem)] w-12 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#8d6b45]/24 via-[#4f7f38]/14 to-[#8d6b45]/12 blur-md" />

                <div className="relative z-30 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={() => setActiveIndex(null)}
                    className="magnetic-button inline-flex items-center gap-2 rounded-full border border-[#315d2c]/22 bg-white/72 px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#315d2c] transition-colors hover:bg-[#315d2c] hover:text-[#fff7df]"
                  >
                    <ArrowLeft size={14} />
                    Back to skill cards
                  </button>
                  <span className="timeline-micro rounded-full bg-[#f8ebcd] px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#7b5524]">
                    focused timeline mode
                  </span>
                </div>

                <div className="tree-root-card relative z-30 mx-auto mt-12 max-w-xl rounded-[2rem] border border-[#8d6b45]/28 bg-[#fff7df]/90 p-6 text-center opacity-0 shadow-[0_24px_80px_rgba(141,107,69,0.14)] backdrop-blur-xl">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#8d6b45]/28 bg-[#ead8b8]/86 text-[#6d4724]">
                    {ActiveIcon ? <ActiveIcon size={28} /> : null}
                  </div>
                  <h3 className="mt-5 font-display text-3xl font-black uppercase leading-none md:text-5xl">{activeBranch.title}</h3>
                  <p className="mt-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6d4724]">root: {activeBranch.root}</p>
                </div>

                <div className="absolute inset-0 z-20">
                  {activeBranch.nodes.map((node, index) => {
                    const milestone = activeBranch.roadmap[index % activeBranch.roadmap.length];
                    const position = getLeafPosition(index, activeBranch.nodes.length);

                    return (
                      <div key={node} className="timeline-leaf pointer-events-auto absolute left-[var(--leaf-x)] top-[var(--leaf-y)] w-0 opacity-0" style={position}>
                        <article
                          data-magnetic
                          tabIndex={0}
                          className="timeline-leaf-card group relative h-24 w-24 -translate-x-1/2 origin-top overflow-hidden rounded-full border border-[#4f7f38]/22 bg-[#f2f8dc]/90 p-3.5 shadow-[0_18px_52px_rgba(86,118,54,0.13)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] hover:h-auto hover:min-h-24 hover:rounded-[1.55rem] hover:border-[#4f7f38]/42 hover:bg-[#e5f2c4]/96 hover:shadow-[0_26px_80px_rgba(86,118,54,0.2)] focus:h-auto focus:min-h-24 focus:rounded-[1.55rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4f7f38]/55 sm:hover:w-[300px] sm:focus:w-[300px]"
                        >
                          <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_34%_24%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_72%_78%,rgba(79,127,56,0.18),transparent_32%)]" />
                          <div className="relative flex h-full flex-col items-center justify-center text-center transition-all duration-500 group-hover:items-start group-hover:justify-start group-hover:text-left group-focus:items-start group-focus:justify-start group-focus:text-left">
                            <span className="timeline-micro rounded-full bg-[#fff8df]/86 px-2.5 py-1.5 font-mono text-[8px] font-black uppercase tracking-[0.14em] text-[#7b5524] opacity-0">
                              stage {String(index + 1).padStart(2, '0')}
                            </span>
                            <h4 className="mt-2 font-display text-[0.66rem] font-black uppercase leading-[0.92] text-[#244318] sm:text-[0.72rem]">{node}</h4>
                            <div className="mt-2 h-1 w-8 rounded-full bg-[#8d6b45]/34 transition-all duration-500 group-hover:w-20 group-focus:w-20" />
                            <div className="timeline-micro mt-4 max-h-0 opacity-0 transition-all duration-500 group-hover:max-h-48 group-hover:opacity-100 group-focus:max-h-48 group-focus:opacity-100">
                              <span className="rounded-full border border-[#4f7f38]/16 bg-[#d8ead6]/72 px-3 py-2 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-[#315d2c]">
                                {milestone.focus}
                              </span>
                              <p className="mt-4 text-sm font-semibold leading-6 text-[#4f3b21]">{milestone.detail}</p>
                              <p className="mt-3 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#6d4724]">{milestone.title}</p>
                            </div>
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
