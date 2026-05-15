import { BookOpen, Brain, GraduationCap, Map, Terminal } from 'lucide-react';

const journey = [
  {
    icon: GraduationCap,
    phase: 'origin',
    title: 'Electronics Engineering',
    body: 'The hardware origin point. Circuits, signals, electronics, and the first real taste of how physical systems behave.',
  },
  {
    icon: Terminal,
    phase: 'current path',
    title: 'Computer Systems Engineering at NED',
    body: 'The main path now. Computer architecture, software systems, low-level ideas, and full-stack building started connecting.',
  },
  {
    icon: BookOpen,
    phase: 'foundation',
    title: 'CS50 from Harvard University',
    body: 'Major flex, honestly. It sharpened the way I think about fundamentals, problem-solving, and computer science as a craft.',
  },
  {
    icon: Brain,
    phase: 'future layer',
    title: 'LLMs + Generative AI',
    body: 'Intro to Large Language Models, Intro to Generative AI, and a growing obsession with agents and intelligent systems.',
  },
  {
    icon: Map,
    phase: 'deep work',
    title: 'Advanced C++ and systems learning',
    body: 'DSA, recursion, pointers, memory, file systems, threads, architecture. The deeper it goes, the more fun it gets.',
  },
];

export default function Process() {
  return (
    <section id="education" className="pin-sequence relative min-h-[92vh] scroll-mt-24 overflow-hidden border-y border-[#8fb8aa]/20 bg-[#fff8eb]/78 py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(101,207,215,0.14),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(168,213,140,0.16),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.28),rgba(255,248,235,0.08))]" />
      <div className="pointer-events-none absolute left-1/2 top-16 h-40 w-40 -translate-x-1/2 rounded-full border border-[#8fb8aa]/18 bg-white/24 blur-2xl" />

      <div className="px-4 md:px-8">
        <div className="relative mx-auto mb-9 max-w-7xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6f924c]">Education protocol</p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl font-black uppercase leading-none text-[#20302d] md:text-5xl">
            An evolving roadmap, not a finished resume.
          </h2>
          <div className="mt-5 flex max-w-3xl flex-wrap gap-2">
            {['hardware roots', 'systems core', 'AI curiosity'].map((item) => (
              <span key={item} className="rounded-full border border-[#8fb8aa]/22 bg-white/62 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#60756f] shadow-[0_12px_32px_rgba(75,95,88,0.07)]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pin-track relative flex w-max gap-3 px-4 pb-8 pt-3 will-change-transform md:px-8">
        <div className="pointer-events-none absolute left-12 right-12 top-[5.55rem] h-px bg-gradient-to-r from-transparent via-[#8fb8aa]/48 to-transparent" />
        {journey.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="story-node group relative flex min-h-[332px] w-[76vw] shrink-0 flex-col overflow-hidden rounded-[1.7rem] border border-[#8fb8aa]/20 bg-white/72 p-5 shadow-[0_20px_60px_rgba(75,95,88,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#8fb8aa]/38 hover:bg-white/82 hover:shadow-[0_28px_76px_rgba(75,95,88,0.14)] sm:w-[420px] lg:w-[350px]">
              <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-system-sage/46 blur-md transition-transform duration-500 group-hover:scale-125" />
              <div className="relative flex items-center justify-between gap-5">
                <div className="grid h-11 w-11 place-items-center rounded-full border border-system-lime/42 bg-system-sage/68 text-[#5f8a3f] shadow-[0_12px_30px_rgba(118,150,110,0.12)]">
                  <Icon size={21} />
                </div>
                <span className="rounded-full border border-[#8fb8aa]/18 bg-[#f7fffb]/72 px-3 py-2 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[#6c827c]">node 0{index + 1}</span>
              </div>

              <div className="relative mt-9">
                <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#6f924c]">{item.phase}</p>
                <h3 className="font-display text-2xl font-black uppercase leading-[0.96] text-[#20302d]">{item.title}</h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#536963]">{item.body}</p>
              </div>

              <div className="relative mt-auto pt-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e7f0ea]">
                  <div className="h-full rounded-full bg-gradient-to-r from-system-lime via-system-sage to-system-cyan" style={{ width: `${52 + index * 10}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
