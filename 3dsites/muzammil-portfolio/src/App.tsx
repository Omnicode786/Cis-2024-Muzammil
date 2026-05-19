import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Command, Github, Linkedin, Mail, Radar } from 'lucide-react';
import CanvasBackdrop from './components/canvas/CanvasBackdrop';
import CinematicScroll from './components/layout/CinematicScroll';
import SmoothScroll from './components/layout/SmoothScroll';
import AmbientAudio from './components/ui/AmbientAudio';
import CustomCursor from './components/ui/CustomCursor';
import CommandPalette from './components/ui/CommandPalette';
import SiteLoader from './components/ui/SiteLoader';
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
  const [loaderComplete, setLoaderComplete] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-system-void text-system-text">
      {!loaderComplete && <SiteLoader onComplete={() => setLoaderComplete(true)} />}

      <div className="systems-backdrop fixed inset-0 z-0 bg-system-void">
        <CanvasBackdrop />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] bg-[linear-gradient(90deg,rgba(125,143,83,0.035)_1px,transparent_1px),linear-gradient(0deg,rgba(141,107,69,0.032)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_72%_14%,rgba(168,213,140,0.23),transparent_31%),radial-gradient(circle_at_22%_76%,rgba(243,217,155,0.24),transparent_28%),radial-gradient(circle_at_50%_42%,rgba(140,198,189,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,248,235,0.9)_94%)]" />
      <div className="pointer-events-none fixed inset-0 z-[3] opacity-[0.16] mix-blend-multiply [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_160_160%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.72%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22160%22_height=%22160%22_filter=%22url(%23n)%22_opacity=%220.33%22/%3E%3C/svg%3E')]" />

      <nav data-loader-nav data-no-canvas-interaction className="fixed left-0 top-0 z-50 w-full border-b border-[#86a9a0]/20 bg-white/90 shadow-[0_10px_38px_rgba(98,119,113,0.07)] backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
          <a href="#top" className="group flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-system-cyan/40 bg-white/70 text-[#2a6f73] shadow-[0_18px_40px_rgba(101,207,215,0.22)]">
              <Radar size={18} />
            </span>
            <span>
              <span className="block font-mono text-xs font-black uppercase tracking-[0.26em] text-system-text">Muzammil Alam</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[#6a7b75] sm:block">Systems interface lab</span>
            </span>
          </a>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="rounded-full px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#60756f] transition-colors hover:bg-white/70 hover:text-[#1d4f52]">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a href="https://github.com/Omnicode786" className="hidden h-10 w-10 place-items-center rounded-full border border-[#86a9a0]/25 bg-white/55 text-[#49665f] transition-colors hover:bg-system-cyan/70 hover:text-[#20302d] sm:grid" aria-label="GitHub">
              <Github size={17} />
            </a>
            <a href="https://pk.linkedin.com/in/muzammil-mansoor-alam-644a763b5" className="hidden h-10 w-10 place-items-center rounded-full border border-[#86a9a0]/25 bg-white/55 text-[#49665f] transition-colors hover:bg-system-cyan/70 hover:text-[#20302d] sm:grid" aria-label="LinkedIn">
              <Linkedin size={17} />
            </a>
            <a href="mailto:progamers5656@gmail.com" className="hidden h-10 w-10 place-items-center rounded-full border border-[#86a9a0]/25 bg-white/55 text-[#49665f] transition-colors hover:bg-system-cyan/70 hover:text-[#20302d] sm:grid" aria-label="Email">
              <Mail size={17} />
            </a>
            <button
              data-magnetic="true"
              onClick={() => setPaletteOpen(true)}
              className="magnetic-button inline-flex h-10 items-center gap-2 rounded-full border border-system-lime/60 bg-system-sage/65 px-3 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#355a3c] shadow-[0_16px_34px_rgba(118,150,110,0.13)] transition-colors hover:bg-system-lime/80 hover:text-[#20302d]"
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
    <div className="grid min-h-screen place-items-center bg-system-void px-6 text-center text-system-text">
      <div>
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border border-system-cyan/30 border-t-system-lime" />
        <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#5f756f]">Loading interface</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <AmbientAudio />
      <SmoothScroll>
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
      </SmoothScroll>
    </BrowserRouter>
  );
}

export default App;
