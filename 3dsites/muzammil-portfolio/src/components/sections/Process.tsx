import { BookOpen, Brain, GraduationCap, Map, Terminal } from 'lucide-react';

const journey = [
  {
    icon: GraduationCap,
    title: 'Electronics Engineering',
    body: 'The hardware origin point. Circuits, signals, electronics, and the first real taste of how physical systems behave.',
  },
  {
    icon: Terminal,
    title: 'Computer Systems Engineering at NED',
    body: 'The main path now. Computer architecture, software systems, low-level ideas, and full-stack building started connecting.',
  },
  {
    icon: BookOpen,
    title: 'CS50 from Harvard University',
    body: 'Major flex, honestly. It sharpened the way I think about fundamentals, problem-solving, and computer science as a craft.',
  },
  {
    icon: Brain,
    title: 'LLMs + Generative AI',
    body: 'Intro to Large Language Models, Intro to Generative AI, and a growing obsession with agents and intelligent systems.',
  },
  {
    icon: Map,
    title: 'Advanced C++ and systems learning',
    body: 'DSA, recursion, pointers, memory, file systems, threads, architecture. The deeper it goes, the more fun it gets.',
  },
];

export default function Process() {
  return (
    <section className="pin-sequence relative overflow-hidden border-y border-cyan-300/15 bg-[#050a10] py-24 md:py-32">
      <div className="px-4 md:px-8">
        <div className="mx-auto mb-12 max-w-7xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-lime-300">Education protocol</p>
          <h2 className="mt-5 max-w-4xl font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">
            An evolving roadmap, not a finished resume.
          </h2>
        </div>
      </div>

      <div className="pin-track flex w-[180vw] gap-4 px-4 md:w-[145vw] md:px-8">
        {journey.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="story-node grid min-h-[420px] w-[78vw] shrink-0 content-between border border-cyan-300/20 bg-cyan-300/[0.045] p-6 backdrop-blur-xl md:w-[34vw]">
              <div className="flex items-start justify-between gap-8">
                <div className="grid h-14 w-14 place-items-center border border-lime-300/35 bg-lime-300/10 text-lime-200">
                  <Icon size={26} />
                </div>
                <span className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-100/35">node 0{index + 1}</span>
              </div>
              <div>
                <h3 className="font-display text-3xl font-black uppercase leading-none text-white">{item.title}</h3>
                <p className="mt-5 text-sm font-semibold leading-7 text-cyan-50/62">{item.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
