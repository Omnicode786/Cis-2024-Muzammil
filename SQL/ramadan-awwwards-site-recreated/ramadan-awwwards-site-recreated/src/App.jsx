import { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import WaterFooter from './components/WaterFooter';
import { useTheme } from './context/ThemeContext';

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
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center text-[var(--theme-text)]">
      <div>
        <p className="font-display text-3xl tracking-[0.35em] text-[var(--theme-accent-strong)]">
          RAMADAN KAREEM
        </p>
        <p className="mt-4 text-sm uppercase tracking-[0.45em] text-[var(--theme-muted)]">
          Loading the atmosphere...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { theme } = useTheme();

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden bg-[var(--theme-bg)] text-[var(--theme-text)]">
      <div className={`background-layer ${theme === 'dark' ? 'background-layer--night' : 'background-layer--day'}`} />
      <div className={`background-orbs ${theme === 'dark' ? 'background-orbs--night' : 'background-orbs--day'}`} />
      <div className={`pattern-overlay ${theme === 'dark' ? 'pattern-overlay--night' : 'pattern-overlay--day'}`} />
      <ScrollProgress />
      <Navbar />

      <main className="relative z-10 pb-[17rem] md:pb-[18rem]">
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

      <Footer />
      <WaterFooter theme={theme} />
    </div>
  );
}
