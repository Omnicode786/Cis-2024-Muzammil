import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import CrescentMoon from '../three/CrescentMoon';
import LanternSystem from '../three/LanternSystem';
import StarField from '../three/StarField';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 5, 4]} intensity={0.7} color="#fff7d6" />
      <pointLight position={[0, 1.5, 1]} intensity={1.5} color="#facc15" />
      <fog attach="fog" args={['#020617', 8, 24]} />
      <StarField count={1400} depth={18} factor={2.2} />
      <Float speed={0.8} rotationIntensity={0.18} floatIntensity={0.4}>
        <CrescentMoon position={[0.5, 0.75, 0]} scale={0.9} />
      </Float>
      <LanternSystem count={10} radius={6} baseY={-0.4} />
    </>
  );
}

export default function PageHero({ eyebrow, title, body }) {
  return (
    <section className="relative isolate overflow-hidden px-6 pt-32 md:px-8 lg:px-12">
      <div className="absolute inset-0 z-0 opacity-90">
        <Canvas camera={{ position: [0, 0.5, 7], fov: 46 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        <div className="hero-vignette absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl py-24 md:py-32">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.45em] text-amber-300/85"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.06 }}
          className="mt-5 max-w-4xl font-display text-5xl leading-none text-slate-50 md:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.14 }}
          className="mt-8 max-w-3xl text-base leading-8 text-slate-300/80 md:text-lg"
        >
          {body}
        </motion.p>
      </div>
    </section>
  );
}
