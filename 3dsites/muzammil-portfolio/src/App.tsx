import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Command, Github, Linkedin, Mail, Radar } from 'lucide-react';
import CanvasBackdrop from './components/canvas/CanvasBackdrop';
import CinematicScroll from './components/layout/CinematicScroll';
import CustomCursor from './components/ui/CustomCursor';
import CommandPalette from './components/ui/CommandPalette';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Work from './components/sections/Work';
import Process from './components/sections/Process';
import Proof from './components/sections/Proof';
import SignalBreach from './components/sections/SignalBreach';
import Contact from './components/sections/Contact';
import ProjectPage from './pages/ProjectPage';

import './index.css';

const SpatialPlatform = lazy(() => import('./projects/SpatialPlatform'));
const NeuralVoid = lazy(() => import('./projects/NeuralVoid'));
const NeoBoard = lazy(() => import('./projects/NeoBoard'));
const TypeFlow = lazy(() => import('./projects/TypeFlow'));
const FocusFlow = lazy(() => import('./projects/FocusFlow'));
const CashDash = lazy(() => import('./projects/CashDash'));
const Vantage = lazy(() => import('./projects/Vantage'));

const navItems = [
  { label: 'Origin', href: '#origin' },
  { label: 'Tech Tree', href: '#tech-tree' },
  { label: 'Projects', href: '#projects' },
  { label: 'Game', href: '#signal-breach' },
];

function Home() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-system-void text-system-text">
      <div className="systems-backdrop fixed inset-0 z-0 bg-system-void">
        <CanvasBackdrop />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(90deg,rgba(93,255,232,0.055)_1px,transparent_1px),linear-gradient(0deg,rgba(93,255,232,0.045)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_70%_18%,rgba(59,130,246,0.28),transparent_28%),radial-gradient(circle_at_20%_75%,rgba(63,255,157,0.14),transparent_24%),linear-gradient(180deg,rgba(4,8,12,0.12),#04080c_94%)]" />
      <div className="pointer-events-none fixed inset-0 z-[3] opacity-[0.08] mix-blend-screen [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_160_160%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.8%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22160%22_height=%22160%22_filter=%22url(%23n)%22_opacity=%220.65%22/%3E%3C/svg%3E')]" />

      <nav className="fixed left-0 top-0 z-50 w-full border-b border-cyan-300/15 bg-system-void/72 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <a href="#top" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(93,255,232,0.2)]">
              <Radar size={18} />
            </span>
            <span>
              <span className="block font-mono text-xs font-black uppercase tracking-[0.26em] text-cyan-50">Muzammil Alam</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/45 sm:block">Systems interface lab</span>
            </span>
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/52 transition-colors hover:text-cyan-100">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a href="https://github.com/Omnicode786" className="hidden h-10 w-10 place-items-center border border-cyan-300/20 text-cyan-100/70 transition-colors hover:bg-cyan-300 hover:text-black sm:grid" aria-label="GitHub">
              <Github size={17} />
            </a>
            <a href="https://pk.linkedin.com/in/muzammil-mansoor-alam-644a763b5" className="hidden h-10 w-10 place-items-center border border-cyan-300/20 text-cyan-100/70 transition-colors hover:bg-cyan-300 hover:text-black sm:grid" aria-label="LinkedIn">
              <Linkedin size={17} />
            </a>
            <a href="mailto:progamers5656@gmail.com" className="hidden h-10 w-10 place-items-center border border-cyan-300/20 text-cyan-100/70 transition-colors hover:bg-cyan-300 hover:text-black sm:grid" aria-label="Email">
              <Mail size={17} />
            </a>
            <button
              onClick={() => setPaletteOpen(true)}
              className="inline-flex h-10 items-center gap-2 border border-lime-300/45 bg-lime-300/10 px-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-lime-100 shadow-[0_0_30px_rgba(190,255,92,0.12)] transition-colors hover:bg-lime-300 hover:text-black"
            >
              <Command size={15} />
              <span className="hidden md:inline">Ctrl K</span>
            </button>
          </div>
        </div>
      </nav>

      <CinematicScroll>
        <main id="top" className="relative z-10">
          <Hero />
          <About />
          <Skills />
          <Work />
          <Process />
          <Proof />
          <SignalBreach />
          <Contact />
        </main>
      </CinematicScroll>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-system-void px-6 text-center text-cyan-50">
      <div>
        <div className="mx-auto mb-5 h-10 w-10 animate-spin border border-cyan-300/30 border-t-lime-300" />
        <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-cyan-100/70">Loading interface</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/live/spatial-platform" element={<SpatialPlatform />} />
          <Route path="/live/neural-void" element={<NeuralVoid />} />
          <Route path="/live/neo-board" element={<NeoBoard />} />
          <Route path="/live/type-flow" element={<TypeFlow />} />
          <Route path="/live/focus-flow" element={<FocusFlow />} />
          <Route path="/live/cash-dash" element={<CashDash />} />
          <Route path="/live/vantage" element={<Vantage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
