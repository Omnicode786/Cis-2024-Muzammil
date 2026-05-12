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
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-cyan-300/15 bg-system-void/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="inline-flex items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
            <ArrowLeft size={18} />
            Back home
          </Link>
          <Link to={project.live} className="inline-flex items-center gap-3 border border-lime-300/35 bg-lime-300 px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-black">
            Live demo
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-32 md:px-8">
        <div className="grid min-h-[64vh] items-end gap-10 border-b border-cyan-300/15 pb-16 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-lime-300">Case study node</p>
            <h1 className="mt-6 font-display text-5xl font-black uppercase leading-none text-white md:text-8xl">{project.title}</h1>
            <p className="mt-8 max-w-2xl text-xl font-semibold leading-relaxed text-cyan-50/65">{project.subtitle}</p>
          </div>

          <div className="border border-cyan-300/20 bg-cyan-300/[0.045] p-6">
            <p className="mb-6 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.2em] text-cyan-100/60">
              <GitBranch size={16} />
              Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tag) => (
                <span key={tag} className="border border-cyan-300/25 px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.14em] text-cyan-50">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-8 border border-lime-300/20 bg-black/40 p-4 font-mono text-xs leading-7 text-lime-100/70">
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
