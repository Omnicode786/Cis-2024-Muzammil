import { ArrowDownRight, BrainCircuit, Cpu, Terminal, Zap } from 'lucide-react';

const diagnostics = [
  { label: 'NED CSE', value: 'active' },
  { label: 'Jaunt Solutions', value: 'hybrid' },
  { label: 'systems obsession', value: 'high' },
];

const bootLines = [
  'boot: muzammil.systems.init()',
  'loading: low_level_curiosity',
  'mount: hardware + software + ai',
  'status: haan thora obsessed hoon futuristic interfaces se',
];

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pt-36" aria-label="Systems engineer hero">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-end">
        <div className="reveal-up">
          <div className="mb-8 inline-flex max-w-full items-center gap-3 border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-cyan-50 shadow-[0_0_45px_rgba(93,255,232,0.14)]">
            <Zap size={15} className="text-lime-300" />
            Future systems engineer // Karachi
          </div>

          <h1 className="max-w-5xl font-display text-5xl font-black uppercase leading-[0.9] tracking-normal text-white sm:text-7xl lg:text-8xl xl:text-9xl">
            Computer systems engineer.
            <span className="block bg-gradient-to-r from-cyan-200 via-lime-200 to-blue-300 bg-clip-text text-transparent">
              Building the future.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg font-semibold leading-8 text-cyan-50/70 md:text-xl">
            I like understanding technology from the transistor all the way to the UI. Most people build apps. I like building ecosystems.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className="magnetic-button inline-flex items-center justify-center gap-3 border border-cyan-200/40 bg-cyan-200 px-6 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-black shadow-[0_0_35px_rgba(93,255,232,0.22)]">
              Enter projects
              <ArrowDownRight size={18} />
            </a>
            <a href="#signal-breach" className="magnetic-button inline-flex items-center justify-center gap-3 border border-lime-200/40 bg-lime-300/10 px-6 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-lime-100 hover:bg-lime-300 hover:text-black">
              Play the system
              <Terminal size={18} />
            </a>
          </div>
        </div>

        <div className="story-panel grid gap-4">
          <div className="story-node border border-cyan-300/20 bg-black/35 p-5 backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/60">Live control panel</span>
              <BrainCircuit className="text-cyan-200" size={24} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {diagnostics.map((item) => (
                <div key={item.label} className="border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/45">{item.label}</p>
                  <p className="mt-3 font-display text-2xl font-black uppercase text-cyan-50">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="story-node border border-lime-300/20 bg-[#06120d]/70 p-5 font-mono text-xs text-lime-100/72 shadow-[0_0_50px_rgba(186,255,92,0.1)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-lime-200">
              <Cpu size={16} />
              <span className="font-black uppercase tracking-[0.24em]">system boot</span>
            </div>
            <div className="space-y-2">
              {bootLines.map((line) => (
                <p key={line}>
                  <span className="text-cyan-300">&gt;</span> {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-cyan-300/20" />
    </section>
  );
}
