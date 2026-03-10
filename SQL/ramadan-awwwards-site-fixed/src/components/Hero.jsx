import { Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import CrescentMoon from '../three/CrescentMoon';
import LanternSystem from '../three/LanternSystem';
import MosqueEnvironment from '../three/MosqueEnvironment';
import StarField from '../three/StarField';

function HeroScene() {
  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={[4, 8, 3]} intensity={0.9} color="#fff7d6" />
      <pointLight position={[0, 3, 1]} intensity={2} color="#facc15" />
      <fog attach="fog" args={['#020617', 10, 28]} />
      <StarField count={2200} depth={28} factor={2.8} />
      <Float speed={0.85} rotationIntensity={0.16} floatIntensity={0.42}>
        <CrescentMoon position={[0.25, 1.6, -1.5]} scale={1.25} />
      </Float>
      <LanternSystem />
      <MosqueEnvironment position={[0, -2.3, -4]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.12} />
    </>
  );
}

export default function Hero() {
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 800], [0, 120]);
  const subtitleY = useTransform(scrollY, [0, 800], [0, 100]);
  const sceneY = useTransform(scrollY, [0, 800], [0, -60]);

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-28 md:px-10 lg:px-14">
      <motion.div style={{ y: sceneY }} className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 1, 8], fov: 42 }} dpr={[1, 1.75]}>
          <Suspense fallback={null}>
            <HeroScene />
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
            className="mb-6 text-xs uppercase tracking-[0.55em] text-amber-300/90"
          >
            An immersive introduction to the holy month
          </motion.p>
          <motion.h1
            style={{ y: titleY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[4.2rem] uppercase leading-[0.82] text-slate-50 sm:text-[5.5rem] md:text-[7rem] xl:text-[9rem]"
          >
            <span className="block">Ramadan</span>
            <span className="text-gradient block">Kareem</span>
          </motion.h1>
          <motion.p
            style={{ y: subtitleY }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-8 max-w-2xl text-base leading-8 text-slate-300/80 sm:text-lg md:text-xl"
          >
            Step into a serene night of moonlight, worship, generosity, and celebration. This experience is designed for anyone curious about Ramadan — what it means, why Muslims fast, how they pray, and how the month ends in joy.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <a
              href="#story-start"
              className="rounded-full border border-amber-300/30 bg-amber-300/10 px-7 py-3 text-sm uppercase tracking-[0.3em] text-amber-200 transition hover:bg-amber-300/20"
            >
              Begin the story
            </a>
            <Link
              to="/about-ramadan"
              className="rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm uppercase tracking-[0.3em] text-slate-100 transition hover:bg-white/10"
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
              ['Meaning', 'A month of spiritual renewal and mercy'],
              ['Practice', 'Fasting from dawn until sunset'],
              ['Atmosphere', 'Prayer, community, reflection, generosity'],
              ['Ending', 'Eid al-Fitr celebration and gratitude'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-300/80">{label}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300/80">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
