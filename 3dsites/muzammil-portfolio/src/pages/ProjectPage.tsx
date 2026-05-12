import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';

const caseStudies = {
  vantage: {
    title: 'Vantage Pro',
    subtitle: 'Enterprise ERP, analytics, reports, AI, and operations in one live demo.',
    live: '/live/vantage',
    tags: ['React', 'ERP', 'AI', 'Charts'],
  },
  spatial: {
    title: 'Spatial OS',
    subtitle: 'Dimensional web interface study for spatial navigation and 3D architecture.',
    live: '/live/spatial-platform',
    tags: ['Three.js', 'R3F', 'Spatial UI'],
  },
  neural: {
    title: 'Neural Void',
    subtitle: 'A reactive WebGL field built around motion, depth, and atmosphere.',
    live: '/live/neural-void',
    tags: ['WebGL', 'Particles', 'Motion'],
  },
} as const;

export default function ProjectPage() {
  const { id } = useParams();
  const project = caseStudies[(id || 'vantage') as keyof typeof caseStudies] || caseStudies.vantage;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="min-h-screen bg-portfolio-paper text-portfolio-ink">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-black/10 bg-portfolio-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="inline-flex items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.18em]">
            <ArrowLeft size={18} />
            Back home
          </Link>
          <Link to={project.live} className="inline-flex items-center gap-3 border border-black bg-portfolio-signal px-4 py-3 font-mono text-xs font-black uppercase tracking-[0.16em]">
            Live demo
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-8">
        <div className="grid min-h-[62vh] items-end gap-10 border-b border-black pb-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-portfolio-blue">Case study shell</p>
            <h1 className="mt-6 font-display text-6xl font-black uppercase leading-none md:text-8xl">{project.title}</h1>
            <p className="mt-8 max-w-2xl text-xl font-semibold leading-relaxed text-portfolio-muted">{project.subtitle}</p>
          </div>

          <div className="border border-black bg-portfolio-ink p-6 text-white">
            <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-white/52">Stack notes</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="border border-white/28 px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.14em]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
