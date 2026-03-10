import { Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import CrescentMoon from '../three/CrescentMoon';
import LanternSystem from '../three/LanternSystem';
import MosqueEnvironment from '../three/MosqueEnvironment';
import StarField from '../three/StarField';
import { useTheme } from '../context/ThemeContext';

function HeroScene({ theme }) {
  const fogColor = theme === 'dark' ? '#071224' : '#d9eaf8';

  return (
    <>
      <ambientLight intensity={theme === 'dark' ? 0.2 : 0.9} />
      <directionalLight position={[4, 8, 3]} intensity={theme === 'dark' ? 1.1 : 1.4} color={theme === 'dark' ? '#fff7d6' : '#fff8ea'} />
      <pointLight position={[0, 3, 1]} intensity={theme === 'dark' ? 2.2 : 1.4} color={theme === 'dark' ? '#facc15' : '#fff3bf'} />
      <fog attach="fog" args={[fogColor, 10, 28]} />
      <StarField count={theme === 'dark' ? 3800 : 1800} depth={30} factor={3} theme={theme} />
      <Float speed={0.78} rotationIntensity={0.14} floatIntensity={0.35}>
        <CrescentMoon position={[0.2, 1.55, -1.35]} scale={1.35} theme={theme} />
      </Float>
      <LanternSystem count={theme === 'dark' ? 16 : 10} radius={9} baseY={0} theme={theme} />
      <MosqueEnvironment position={[0, -2.3, -4.1]} theme={theme} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={theme === 'dark' ? 0.09 : 0.05} />
    </>
  );
}

export default function Hero() {
  const { theme } = useTheme();
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 800], [0, 120]);
  const subtitleY = useTransform(scrollY, [0, 800], [0, 100]);
  const sceneY = useTransform(scrollY, [0, 800], [0, -60]);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 md:px-10 lg:px-14">
      <motion.div style={{ y: sceneY }} className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 1, 8], fov: 42 }} dpr={[1, 1.75]}>
          <Suspense fallback={null}>
            <HeroScene theme={theme} />
          </Suspense>
        </Canvas>
        <div className="hero-vignette absolute inset-0" />
      </motion.div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mb-6 text-xs uppercase tracking-[0.55em] text-[var(--theme-accent-strong)]"
          >
            A spiritual story rendered through light, motion, and atmosphere
          </motion.p>
          <motion.h1
            style={{ y: titleY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[4.2rem] uppercase leading-[0.82] text-[var(--theme-text)] sm:text-[5.5rem] md:text-[7rem] xl:text-[9rem]"
          >
            <span className="block">Ramadan</span>
            <span className="text-gradient block">Kareem</span>
          </motion.h1>
          <motion.p
            style={{ y: subtitleY }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-8 max-w-2xl text-base leading-8 text-[var(--theme-muted)] sm:text-lg md:text-xl"
          >
            Step into a serene world of moonlight, devotion, generosity, and celebration. This experience is made for people discovering Ramadan for the first time, with a richer visual atmosphere in both night and light modes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#story-start"
              className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-accent-soft)] px-7 py-3 text-sm uppercase tracking-[0.3em] text-[var(--theme-accent-strong)] transition hover:translate-y-[-1px]"
            >
              Begin the story
            </a>
            <Link
              to="/about-ramadan"
              className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-7 py-3 text-sm uppercase tracking-[0.3em] text-[var(--theme-text)] transition hover:translate-y-[-1px]"
            >
              Explore the pages
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.32 }}
          className="glass-panel max-w-xl justify-self-end rounded-[2rem] p-6 md:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ['Meaning', 'A month of spiritual renewal, mercy, discipline, and compassion.'],
              ['Practice', 'Fasting from dawn until sunset while deepening worship and reflection.'],
              ['Atmosphere', 'Lantern glow, prayerful nights, quiet mornings, and shared meals.'],
              ['Ending', 'Eid al-Fitr celebration marked by gratitude, joy, and community.'],
            ].map(([label, value]) => (
              <div key={label} className="theme-chip rounded-[1.5rem] p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--theme-accent-strong)]">{label}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--theme-muted)]">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
