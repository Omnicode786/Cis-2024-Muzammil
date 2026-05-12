import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Boxes, BrainCircuit, Cpu, FileCode2, GitBranch, Shield, Terminal, type LucideIcon } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  status: string;
  summary: string;
  problem: string;
  decision: string;
  future: string;
  stack: string[];
  modules: string[];
  link?: string;
};

const projects: Project[] = [
  {
    id: 'trustlayer',
    title: 'TrustLayer',
    status: 'fintech security system',
    summary: 'A security-first fintech concept focused on trust scoring, risk visibility, verification flows, and safer user actions.',
    problem: 'Fintech apps often hide trust logic behind boring screens. I want the trust layer to feel visible, explainable, and alive.',
    decision: 'Model it like an operating layer: identity signals, transaction risk, anomaly checks, and decision history as connected modules.',
    future: 'Turn this into a working prototype with AI-assisted risk summaries and a transaction simulation engine.',
    stack: ['React', 'Node', 'Security UX', 'AI summaries'],
    modules: ['Identity graph', 'Risk engine', 'Audit timeline', 'Action firewall'],
  },
  {
    id: 'flowcharts',
    title: 'Interactive Flowchart Systems',
    status: 'visual systems tool',
    summary: 'A direction for building editable architecture maps, logic diagrams, and system flows that feel less like static slides.',
    problem: 'Most diagrams die after the meeting. I want diagrams that act like living interfaces.',
    decision: 'Use node graphs, command-driven editing, stateful modules, and cinematic reveals for complex logic.',
    future: 'Add simulation mode, exportable diagrams, and AI-generated architecture suggestions.',
    stack: ['React', 'Graph UI', 'Canvas', 'State machines'],
    modules: ['Nodes', 'Edges', 'Inspector', 'Simulation mode'],
  },
  {
    id: 'riscv',
    title: 'RISC-V Experimentation',
    status: 'processor architecture',
    summary: 'Experiments around ISA thinking, processor concepts, datapath ideas, and hardware/software integration.',
    problem: 'High-level apps are fun, but the machine underneath is where the real magic starts.',
    decision: 'Study architecture through small experiments: instructions, memory paths, control signals, and visualization.',
    future: 'Build a visual RISC-V learning lab with instruction stepping and animated datapath states.',
    stack: ['C', 'C++', 'RISC-V', 'Computer architecture'],
    modules: ['ISA notes', 'Datapath', 'Control unit', 'Memory model'],
  },
  {
    id: 'game-engine',
    title: 'Game Engine Experiments',
    status: 'interactive systems',
    summary: 'Small experiments around loops, input, collision, animation, timing, and systems thinking through games.',
    problem: 'Games expose every engineering weakness immediately: performance, state, input, feedback, everything.',
    decision: 'Treat games as systems labs, not just entertainment. Build mechanics, then polish feedback.',
    future: 'Create a small browser engine playground with entity systems, physics toggles, and debug overlays.',
    stack: ['Canvas', 'Three.js', 'State loops', 'Physics'],
    modules: ['Loop', 'Input', 'Collision', 'Debug UI'],
  },
  {
    id: 'vantage',
    title: 'Vantage Pro',
    status: 'existing live demo',
    summary: 'An enterprise ERP-style product shell with analytics, reports, AI context, finance, operations, teams, and admin modules.',
    problem: 'Business tools usually feel dead. This one turns operational data into a more premium command center.',
    decision: 'Keep modules connected through shared workspace state, permissions, reports, and context-aware AI.',
    future: 'Improve data persistence, split modules further, and add real backend integrations.',
    stack: ['React', 'Charts', 'Node', 'AI'],
    modules: ['Analytics', 'CRM', 'Reports', 'Finance'],
    link: '/live/vantage',
  },
  {
    id: 'spatial',
    title: 'Spatial OS',
    status: 'existing live demo',
    summary: 'A spatial interface experiment exploring 3D navigation, architectural presentation, and future UI composition.',
    problem: 'Flat pages are not always enough when the concept is spatial.',
    decision: 'Use 3D as interface structure, not just decoration.',
    future: 'Add better scene transitions and interaction-driven annotations.',
    stack: ['R3F', 'Three.js', 'Spatial UI'],
    modules: ['Scene', 'Navigation', 'Panels', 'Depth'],
    link: '/live/spatial-platform',
  },
  {
    id: 'neural',
    title: 'Neural Void',
    status: 'existing live demo',
    summary: 'A dark WebGL particle field built around atmosphere, motion, and interaction.',
    problem: 'I wanted a visual experiment that felt more like entering a signal field.',
    decision: 'Lean into movement, particles, orbit controls, and a strong black/cyan energy.',
    future: 'Add audio-reactive states and system-map overlays.',
    stack: ['WebGL', 'Particles', 'R3F'],
    modules: ['Particles', 'Orbit', 'Glow', 'Void'],
    link: '/live/neural-void',
  },
];

export default function Work() {
  const [activeId, setActiveId] = useState(projects[0].id);
  const activeProject = projects.find((project) => project.id === activeId) || projects[0];

  return (
    <section id="projects" className="relative border-y border-cyan-300/15 bg-black/65 px-4 py-24 backdrop-blur-sm md:px-8 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="reveal-up mb-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-lime-300">Project architecture</p>
            <h2 className="mt-5 font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">
              Not cards. Systems.
            </h2>
          </div>
          <p className="max-w-3xl text-lg font-semibold leading-8 text-cyan-50/65 lg:self-end">
            Some projects are live demos. Some are active concepts. All of them are connected by the same thing: I like building interfaces that reveal how a system thinks.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="grid gap-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveId(project.id)}
                className={`group grid gap-3 border p-4 text-left transition-colors ${
                  activeId === project.id
                    ? 'border-lime-300/55 bg-lime-300/10 text-lime-50 shadow-[0_0_42px_rgba(186,255,92,0.1)]'
                    : 'border-cyan-300/15 bg-cyan-300/[0.035] text-cyan-50/72 hover:border-cyan-300/35 hover:bg-cyan-300/10'
                }`}
              >
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/45">{project.status}</span>
                <span className="font-display text-2xl font-black uppercase leading-none text-white">{project.title}</span>
              </button>
            ))}
          </div>

          <div className="story-panel border border-cyan-300/20 bg-[#061014]/88 p-5 shadow-[0_0_80px_rgba(93,255,232,0.08)] backdrop-blur-xl md:p-7">
            <div className="story-node grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 border border-lime-300/35 bg-lime-300/10 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-lime-100">
                    <Shield size={14} />
                    {activeProject.status}
                  </span>
                  {activeProject.link ? (
                    <Link to={activeProject.link} className="inline-flex items-center gap-2 border border-cyan-300/30 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-300 hover:text-black">
                      Open live
                      <ArrowUpRight size={14} />
                    </Link>
                  ) : null}
                </div>

                <h3 className="font-display text-4xl font-black uppercase leading-none text-white md:text-6xl">{activeProject.title}</h3>
                <p className="mt-6 text-lg font-semibold leading-8 text-cyan-50/68">{activeProject.summary}</p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <InfoBlock icon={Terminal} title="Problem" body={activeProject.problem} />
                  <InfoBlock icon={GitBranch} title="Decision" body={activeProject.decision} />
                  <InfoBlock icon={Boxes} title="Next" body={activeProject.future} />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="border border-cyan-300/15 bg-black/35 p-5">
                  <p className="mb-5 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/45">Architecture map</p>
                  <div className="grid gap-3">
                    {activeProject.modules.map((module, index) => (
                      <div key={module} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 font-mono text-[10px] font-black text-cyan-100">{index + 1}</span>
                        <span className="h-px bg-cyan-300/20" />
                        <span className="min-w-36 border border-cyan-300/20 bg-cyan-300/[0.05] px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-cyan-50">{module}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-lime-300/20 bg-[#071208] p-5">
                  <p className="mb-4 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-lime-100/70">
                    <FileCode2 size={15} />
                    stack trace
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.stack.map((tech) => (
                      <span key={tech} className="border border-lime-300/25 bg-lime-300/10 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-lime-50">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-cyan-300/15 bg-black/35 p-5 font-mono text-xs leading-7 text-cyan-100/62">
                  <p><span className="text-lime-300">&gt;</span> analyze --project {activeProject.id}</p>
                  <p><span className="text-lime-300">&gt;</span> output: system thinking detected</p>
                  <p><span className="text-lime-300">&gt;</span> note: future plans still compiling...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: Cpu, label: 'Processor concepts', value: 'datapath dreams' },
            { icon: BrainCircuit, label: 'AI layers', value: 'agents + LLMs' },
            { icon: Shield, label: 'Fintech security', value: 'trust-first UX' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="reveal-up border border-cyan-300/15 bg-cyan-300/[0.035] p-5">
                <Icon className="mb-10 text-cyan-200" size={26} />
                <p className="font-display text-2xl font-black uppercase text-white">{item.label}</p>
                <p className="mt-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-cyan-100/45">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="border border-cyan-300/15 bg-cyan-300/[0.035] p-4">
      <Icon className="mb-5 text-cyan-200" size={20} />
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100/45">{title}</p>
      <p className="mt-3 text-sm font-semibold leading-6 text-cyan-50/62">{body}</p>
    </div>
  );
}
