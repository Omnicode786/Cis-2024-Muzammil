import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Experience from './components/canvas/Experience';
import CustomCursor from './components/ui/CustomCursor';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Work from './components/sections/Work';
import Contact from './components/sections/Contact';
import ProjectPage from './pages/ProjectPage';

// Live Projects
import SpatialPlatform from './projects/SpatialPlatform';
import NeuralVoid from './projects/NeuralVoid';
import NeoBoard from './projects/NeoBoard';
import TypeFlow from './projects/TypeFlow';
import FocusFlow from './projects/FocusFlow';
import CashDash from './projects/CashDash';
import Vantage from './projects/Vantage';

import './index.css';

function Home() {
  return (
    <div className="relative w-full">

      {/* 3D Background - Fixed */}
      <div className="fixed inset-0 w-full h-screen bg-[#FFFBF0] -z-10">
        <Canvas shadows camera={{ position: [0, 0, 15], fov: 45 }}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
      </div>

      {/* Navigation Overlay */}
      <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-50 pointer-events-none mix-blend-difference">
        <div className="text-xl font-black font-display tracking-tighter text-black pointer-events-auto hover:text-accent-red transition-colors cursor-none">
          mz/alam
        </div>
        <div className="hidden md:flex gap-4 font-bold font-mono text-sm text-black pointer-events-auto">
          {['ABOUT', 'WORK', 'CONTACT'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="border-2 border-transparent hover:border-black hover:bg-accent-yellow px-4 py-2 transition-all rounded-full cursor-none">
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* Native Scroll Content - Relative on top of Fixed Canvas */}
      <main className="relative z-10 w-full pointer-events-none">
        <div className="pointer-events-auto"><Hero /></div>
        <div className="pointer-events-auto"><About /></div>
        <div className="pointer-events-auto"><Skills /></div>
        <div className="pointer-events-auto"><Work /></div>
        <div className="pointer-events-auto"><Contact /></div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectPage />} />

        {/* Live Project Routes */}
        <Route path="/live/spatial-platform" element={<SpatialPlatform />} />
        <Route path="/live/neural-void" element={<NeuralVoid />} />
        <Route path="/live/neo-board" element={<NeoBoard />} />
        <Route path="/live/type-flow" element={<TypeFlow />} />
        <Route path="/live/focus-flow" element={<FocusFlow />} />
        <Route path="/live/cash-dash" element={<CashDash />} />
        <Route path="/live/vantage" element={<Vantage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
