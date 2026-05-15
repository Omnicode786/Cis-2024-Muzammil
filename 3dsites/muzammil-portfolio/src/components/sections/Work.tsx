import { Link } from 'react-router-dom';
import { ArrowUpRight, BrainCircuit, Cpu, FileCode2, Shield } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  status: string;
  summary: string;
  stack: string[];
  modules: string[];
  link?: string;
};

const projects: Project[] = [
  {
    id: 'trustlayer',
    title: 'TrustLayer',
    status: 'fintech security',
    summary: 'Trust scoring, risk visibility, verification flows, and safer user actions.',
    stack: ['React', 'Node', 'Security UX', 'AI'],
    modules: ['Identity graph', 'Risk engine', 'Audit timeline'],
  },
  {
    id: 'flowcharts',
    title: 'Interactive Flowchart Systems',
    status: 'visual systems',
    summary: 'Living architecture maps for logic, systems, and flow-based thinking.',
    stack: ['React', 'Graph UI', 'Canvas', 'State'],
    modules: ['Nodes', 'Edges', 'Inspector'],
  },
  {
    id: 'riscv',
    title: 'RISC-V Experimentation',
    status: 'processor architecture',
    summary: 'ISA ideas, datapath experiments, and hardware/software visualization.',
    stack: ['C', 'C++', 'RISC-V', 'Architecture'],
    modules: ['ISA notes', 'Datapath', 'Memory model'],
  },
  {
    id: 'game-engine',
    title: 'Game Engine Experiments',
    status: 'interactive systems',
    summary: 'Loops, input, collision, timing, and debug overlays through games.',
    stack: ['Canvas', 'Three.js', 'Physics', 'State'],
    modules: ['Loop', 'Input', 'Collision'],
  },
  {
    id: 'vantage',
    title: 'Vantage Pro',
    status: 'existing live demo',
    summary: 'ERP-style command center for analytics, reports, AI, and operations.',
    stack: ['React', 'Charts', 'Node', 'AI'],
    modules: ['Analytics', 'CRM', 'Reports'],
    link: '/live/vantage',
  },
  {
    id: 'spatial',
    title: 'Spatial OS',
    status: 'existing live demo',
    summary: 'A spatial interface experiment for dimensional web experiences.',
    stack: ['R3F', 'Three.js', 'Spatial UI'],
    modules: ['Scene', 'Navigation', 'Depth'],
    link: '/live/spatial-platform',
  },
  {
    id: 'neural',
    title: 'Neural Void',
    status: 'existing live demo',
    summary: 'A reactive WebGL signal field with particles and atmosphere.',
    stack: ['WebGL', 'Particles', 'R3F'],
    modules: ['Particles', 'Orbit', 'Glow'],
    link: '/live/neural-void',
  },
];

export default function Work() {
  return (
    <section id="projects" className="relative scroll-mt-24 border-y border-[#8fb8aa]/20 bg-[#f5fbf7]/70 px-4 py-24 backdrop-blur-sm md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal-up mb-12 max-w-4xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#6f924c]">Project architecture</p>
          <h2 className="mt-5 font-display text-4xl font-black uppercase leading-none text-[#20302d] md:text-6xl">
            Same system energy. Cleaner grid.
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#536963]">
            Each project is a node in the same bigger map: interfaces that explain how systems think.
          </p>
        </div>

        <div className="story-panel grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <article key={project.id} className="story-node group flex min-h-[430px] flex-col rounded-[2rem] border border-[#8fb8aa]/18 bg-white/72 p-5 shadow-[0_22px_70px_rgba(75,95,88,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-system-cyan/40 hover:shadow-[0_28px_90px_rgba(75,95,88,0.15)]">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-system-lime/35 bg-system-sage/70 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#3f6336]">
                  {project.status}
                </span>
                <span className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#8aa09a]">0{index + 1}</span>
              </div>

              <h3 className="mt-8 font-display text-3xl font-black uppercase leading-none text-[#20302d]">{project.title}</h3>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#536963]">{project.summary}</p>

              <div className="mt-6 rounded-[1.35rem] border border-[#8fb8aa]/16 bg-[#f7fffb]/72 p-4">
                <p className="mb-4 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#6c827c]">
                  <FileCode2 size={14} />
                  system modules
                </p>
                <div className="grid gap-2">
                  {project.modules.map((module) => (
                    <span key={module} className="rounded-full border border-system-cyan/20 bg-white/70 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#3d767b]">
                      {module}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span key={tech} className="rounded-full border border-system-lime/26 bg-[#f7fff0]/76 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#315d2c]">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-7">
                {project.link ? (
                  <Link to={project.link} className="magnetic-button inline-flex w-full items-center justify-center gap-2 rounded-full border border-system-cyan/40 bg-system-cyan/62 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#20302d]">
                    Open live
                    <ArrowUpRight size={15} />
                  </Link>
                ) : (
                  <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8fb8aa]/22 bg-white/56 px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#6c827c]">
                    Concept node
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: Cpu, label: 'Processor concepts', value: 'datapath dreams' },
            { icon: BrainCircuit, label: 'AI layers', value: 'agents + LLMs' },
            { icon: Shield, label: 'Fintech security', value: 'trust-first UX' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="reveal-up rounded-[1.5rem] border border-[#8fb8aa]/18 bg-white/64 p-5 shadow-[0_18px_52px_rgba(75,95,88,0.08)]">
                <Icon className="mb-8 text-[#43888c]" size={26} />
                <p className="font-display text-2xl font-black uppercase text-[#20302d]">{item.label}</p>
                <p className="mt-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6c827c]">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
