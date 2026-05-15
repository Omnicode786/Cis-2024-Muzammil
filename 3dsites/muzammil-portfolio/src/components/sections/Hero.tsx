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
      <div className="ambient-float pointer-events-none absolute left-4 top-28 h-32 w-32 rounded-full bg-system-sage/50 blur-3xl" />
      <div className="ambient-float pointer-events-none absolute right-8 top-40 h-44 w-44 rounded-full bg-system-blue/25 blur-3xl [animation-delay:1.8s]" />
      <div className="pointer-events-none absolute left-1/2 top-24 z-0 w-[115vw] -translate-x-1/2 text-center font-display text-[18vw] font-black uppercase leading-none tracking-[-0.09em] text-[#20302d]/[0.045] sm:top-20 sm:text-[15vw]">
        Muzammil Alam
      </div>
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.03fr_0.97fr] lg:items-end">
        <div className="reveal-up">
          <p className="mb-5 font-display text-5xl font-black uppercase leading-none tracking-[-0.06em] text-[#20302d] sm:text-7xl lg:text-8xl">
            Muzammil Alam
          </p>
          <div className="mb-8 inline-flex max-w-full items-center gap-3 rounded-full border border-system-cyan/35 bg-white/72 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#386d70] shadow-[0_20px_60px_rgba(101,207,215,0.16)] backdrop-blur-2xl">
            <Zap size={15} className="text-[#678b42]" />
            Future systems engineer // Karachi
          </div>

          <h1 className="max-w-5xl font-display text-5xl font-black uppercase leading-[0.9] tracking-normal text-[#20302d] sm:text-7xl lg:text-8xl xl:text-9xl">
            Computer systems engineer.
            <span className="block bg-gradient-to-r from-[#3b8e92] via-[#7da45f] to-[#5b7fd8] bg-clip-text text-transparent">
              Building the future.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg font-semibold leading-8 text-[#526861] md:text-xl">
            I like understanding technology from the transistor all the way to the UI. Most people build apps. I like building ecosystems.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className="magnetic-button inline-flex items-center justify-center gap-3 rounded-full border border-system-cyan/40 bg-system-cyan/75 px-6 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-[#20302d] shadow-[0_22px_50px_rgba(101,207,215,0.26)]">
              Enter projects
              <ArrowDownRight size={18} />
            </a>
            <a href="#signal-breach" className="magnetic-button inline-flex items-center justify-center gap-3 rounded-full border border-system-lime/50 bg-white/70 px-6 py-4 font-mono text-xs font-black uppercase tracking-[0.2em] text-[#54723f] backdrop-blur-xl hover:bg-system-lime/70 hover:text-[#20302d]">
              Play the system
              <Terminal size={18} />
            </a>
          </div>
        </div>

        <div className="story-panel grid gap-4">
          <div className="story-node soft-card rounded-[2rem] p-5">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#657b75]">Live control panel</span>
              <BrainCircuit className="text-[#43888c]" size={24} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {diagnostics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-system-cyan/20 bg-white/58 p-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#6c827c]">{item.label}</p>
                  <p className="mt-3 font-display text-2xl font-black uppercase text-[#24312f]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="story-node terminal-scanline rounded-[2rem] border border-system-lime/30 bg-[#fbfff5]/78 p-5 font-mono text-xs text-[#4e6a43] shadow-[0_28px_70px_rgba(118,150,110,0.14)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2 text-[#5f8a3f]">
              <Cpu size={16} />
              <span className="font-black uppercase tracking-[0.24em]">system boot</span>
            </div>
            <div className="space-y-2">
              {bootLines.map((line) => (
                <p key={line}>
                  <span className="text-[#3f9398]">&gt;</span> {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <svg className="pointer-events-none absolute bottom-10 right-6 hidden h-40 w-40 text-[#65cfd7]/45 md:block" viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <path className="svg-draw" pathLength={1} d="M60 8C84 8 112 28 112 60C112 92 84 112 60 112C36 112 8 92 8 60C8 28 36 8 60 8Z" stroke="currentColor" strokeWidth="1.5" />
        <path className="svg-draw" pathLength={1} d="M28 69C42 37 75 35 92 57C76 84 47 90 28 69Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-[#8fb8aa]/30" />
    </section>
  );
}
