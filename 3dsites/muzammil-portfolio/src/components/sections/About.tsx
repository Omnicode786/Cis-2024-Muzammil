import { CircuitBoard, Code2, Cpu, Rocket } from 'lucide-react';

const identity = [
  { icon: Cpu, title: 'Computer Systems Engineering', body: 'NED University of Engineering and Technology. I moved here because systems started feeling more exciting than just circuits alone.' },
  { icon: CircuitBoard, title: 'Hardware + software brain', body: 'Electronics gave me the hardware instinct. C, C++, architecture, embedded work, and UI gave me the rest of the map.' },
  { icon: Code2, title: 'Hybrid developer at Jaunt', body: 'I work hybrid at Jaunt Solutions, where shipping real interfaces keeps the engineering obsession grounded.' },
  { icon: Rocket, title: 'Builder first', body: 'I do not want to be only a frontend person or only a backend person. I want to understand the full machine.' },
];

export default function About() {
  return (
    <section id="origin" className="relative border-y border-[#8fb8aa]/20 bg-white/44 px-4 py-24 backdrop-blur-sm md:px-8 md:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/55 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="reveal-up">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6f924c]">Origin story</p>
          <h2 className="mt-6 max-w-2xl font-display text-4xl font-black uppercase leading-none text-[#20302d] md:text-6xl">
            I don&apos;t just like systems. I genuinely think they&apos;re beautiful.
          </h2>
          <p className="mt-8 max-w-xl text-lg font-semibold leading-8 text-[#536963]">
            I started in Electronics Engineering, then shifted into Computer Systems Engineering because software, hardware, AI, and low-level computing became too interesting to ignore. Low-level computing is lowkey addictive.
          </p>
        </div>

        <div className="story-panel grid gap-3 sm:grid-cols-2">
          {identity.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="story-node group min-h-72 rounded-[1.75rem] border border-[#8fb8aa]/22 bg-white/66 p-5 shadow-[0_20px_60px_rgba(75,95,88,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/82 hover:shadow-[0_30px_80px_rgba(75,95,88,0.15)]">
                <div className="mb-12 flex items-center justify-between">
                  <Icon size={28} className="text-[#43888c]" />
                  <span className="h-2 w-2 rounded-full bg-system-lime shadow-[0_0_20px_rgba(168,213,140,0.8)]" />
                </div>
                <h3 className="font-display text-2xl font-black uppercase text-[#20302d]">{item.title}</h3>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#5d706a]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
