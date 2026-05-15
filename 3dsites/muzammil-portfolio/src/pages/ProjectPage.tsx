import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, GitBranch, Terminal } from 'lucide-react';

const caseStudies = {
  vantage: {
    title: 'Vantage Pro',
    subtitle: 'Enterprise ERP, analytics, AI reporting, operations, and admin modules.',
    live: '/live/vantage',
    stack: ['React', 'Charts', 'Node', 'AI'],
  },
  spatial: {
    title: 'Spatial OS',
    subtitle: 'A spatial UI experiment for dimensional web experiences.',
    live: '/live/spatial-platform',
    stack: ['R3F', 'Three.js', '3D UI'],
  },
  neural: {
    title: 'Neural Void',
    subtitle: 'A reactive WebGL signal field with particles and atmosphere.',
    live: '/live/neural-void',
    stack: ['WebGL', 'Particles', 'Motion'],
  },
} as const;

export default function ProjectPage() {
  const { id } = useParams();
  const project = caseStudies[(id || 'vantage') as keyof typeof caseStudies] || caseStudies.vantage;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="min-h-screen bg-system-void text-system-text">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-[#8fb8aa]/20 bg-white/68 shadow-[0_10px_45px_rgba(98,119,113,0.08)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="inline-flex items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#3d767b]">
            <ArrowLeft size={18} />
            Back home
          </Link>
          <Link to={project.live} className="magnetic-button inline-flex items-center gap-3 rounded-full border border-system-lime/45 bg-system-lime/78 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#20302d]">
            Live demo
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-32 md:px-8">
        <div className="grid min-h-[64vh] items-end gap-10 border-b border-[#8fb8aa]/20 pb-16 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#6f924c]">Case study node</p>
            <h1 className="mt-6 font-display text-5xl font-black uppercase leading-none text-[#20302d] md:text-8xl">{project.title}</h1>
            <p className="mt-8 max-w-2xl text-xl font-semibold leading-relaxed text-[#536963]">{project.subtitle}</p>
          </div>

          <div className="soft-card rounded-[2rem] p-6">
            <p className="mb-6 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.2em] text-[#6c827c]">
              <GitBranch size={16} />
              Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tag) => (
                <span key={tag} className="rounded-full border border-system-cyan/25 bg-white/64 px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#20302d]">
                  {tag}
                </span>
              ))}
            </div>
            <div className="terminal-scanline mt-8 rounded-[1.25rem] border border-system-lime/28 bg-[#f7fff0]/74 p-4 font-mono text-xs leading-7 text-[#557944]">
              <p><Terminal className="mr-2 inline" size={14} /> booting project node...</p>
              <p>&gt; route: {project.live}</p>
              <p>&gt; status: ready</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
