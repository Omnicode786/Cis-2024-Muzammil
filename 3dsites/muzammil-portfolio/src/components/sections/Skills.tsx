import { BrainCircuit, Code2, Cpu, Database, Leaf, Network, ShieldCheck } from 'lucide-react';

const branches = [
  {
    icon: Code2,
    title: 'Frontend interfaces',
    root: 'React, Next.js, Tailwind',
    nodes: ['Framer Motion', 'Three.js', 'Responsive UX', 'Interactive experiences'],
  },
  {
    icon: Database,
    title: 'Backend systems',
    root: 'Node, Express, MongoDB',
    nodes: ['REST APIs', 'Auth systems', 'MERN stack', 'Backend architecture'],
  },
  {
    icon: Cpu,
    title: 'Low-level computing',
    root: 'C, C++, architecture',
    nodes: ['Pointers', 'Memory', 'Bit manipulation', 'File systems', 'Threads/processes'],
  },
  {
    icon: Network,
    title: 'Hardware + systems',
    root: 'RISC-V and electronics',
    nodes: ['Processor design', 'ISA extensions', 'VGA controllers', 'ESP32', 'PCB design'],
  },
  {
    icon: BrainCircuit,
    title: 'AI + future tech',
    root: 'LLMs and agents',
    nodes: ['Generative AI', 'Automation', 'Intelligent systems', 'Futuristic interfaces'],
  },
  {
    icon: ShieldCheck,
    title: 'Security thinking',
    root: 'Fintech and trust',
    nodes: ['Cybersecurity basics', 'Risk flows', 'Verification layers', 'System resilience'],
  },
];

export default function Skills() {
  return (
    <section id="tech-tree" className="relative overflow-hidden border-y border-[#3b2b15]/20 bg-[#f5e4bf] px-4 py-24 text-[#1c1409] md:px-8 md:py-32">
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(90deg,rgba(79,48,18,0.16)_1px,transparent_1px),linear-gradient(0deg,rgba(79,48,18,0.12)_1px,transparent_1px),radial-gradient(circle_at_20%_10%,rgba(55,115,49,0.18),transparent_22%),radial-gradient(circle_at_80%_80%,rgba(125,71,28,0.18),transparent_24%)] [background-size:46px_46px,46px_46px,100%_100%,100%_100%]" />
      <div className="absolute left-6 top-10 hidden rotate-[-18deg] text-[#315d2c]/35 md:block">
        <Leaf size={160} />
      </div>
      <div className="absolute bottom-12 right-8 hidden rotate-[18deg] text-[#315d2c]/30 md:block">
        <Leaf size={140} />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="reveal-up max-w-4xl">
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#315d2c]">Learning tech tree</p>
          <h2 className="mt-5 font-display text-4xl font-black uppercase leading-none md:text-6xl">
            The old manuscript version of my engineering brain.
          </h2>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#4f3b21]">
            Thora ninja village energy, thora computer architecture. I like seeing skills as connected roots, not random badges.
          </p>
        </div>

        <div className="story-panel relative mt-14 grid gap-4 lg:grid-cols-3">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#3b2b15]/30 lg:block" />
          {branches.map((branch, index) => {
            const Icon = branch.icon;
            return (
              <article key={branch.title} className="story-node relative border border-[#3b2b15]/35 bg-[#fff4d2]/70 p-5 shadow-[8px_8px_0_rgba(59,43,21,0.18)] backdrop-blur-sm">
                <div className="mb-8 flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-full border border-[#3b2b15]/45 bg-[#315d2c]/10">
                    <Icon size={24} />
                  </div>
                  <span className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#7b5524]">rank {index + 1}</span>
                </div>
                <h3 className="font-display text-2xl font-black uppercase">{branch.title}</h3>
                <p className="mt-2 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#315d2c]">{branch.root}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {branch.nodes.map((node) => (
                    <span key={node} className="rounded-full border border-[#3b2b15]/30 bg-[#f5e4bf] px-3 py-2 text-xs font-bold text-[#4f3b21]">
                      {node}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
