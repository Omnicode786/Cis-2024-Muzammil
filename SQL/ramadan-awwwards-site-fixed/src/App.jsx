import { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import WaterFooter from './components/WaterFooter';

const Home = lazy(() => import('./pages/Home'));
const AboutRamadan = lazy(() => import('./pages/AboutRamadan'));
const Worship = lazy(() => import('./pages/Worship'));
const Celebration = lazy(() => import('./pages/Celebration'));

function PageShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div>
        <p className="font-display text-3xl tracking-[0.35em] text-amber-300/90">
          RAMADAN KAREEM
        </p>
        <p className="mt-4 text-sm uppercase tracking-[0.45em] text-slate-300/70">
          Loading the night sky...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_25%),radial-gradient(circle_at_20%_30%,rgba(248,250,252,0.06),transparent_25%),linear-gradient(180deg,#020617_0%,#020617_55%,#061124_100%)]" />
      <div className="pattern-overlay" />
      <ScrollProgress />
      <Navbar />

      <main className="relative z-10">
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <PageShell>
                    <Home />
                  </PageShell>
                }
              />
              <Route
                path="/about-ramadan"
                element={
                  <PageShell>
                    <AboutRamadan />
                  </PageShell>
                }
              />
              <Route
                path="/worship-during-ramadan"
                element={
                  <PageShell>
                    <Worship />
                  </PageShell>
                }
              />
              <Route
                path="/ramadan-culture-celebration"
                element={
                  <PageShell>
                    <Celebration />
                  </PageShell>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <WaterFooter />
      <Footer />
    </div>
  );
}
