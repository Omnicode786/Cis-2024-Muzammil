import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import useMouseRipple from '../hooks/useMouseRipple';
import WaterReflection from '../three/WaterReflection';
import StarField from '../three/StarField';

function WaterScene({ mouse, ripple }) {
  return (
    <>
      <ambientLight intensity={0.16} />
      <directionalLight position={[2, 4, 2]} intensity={0.65} color="#fff7d6" />
      <pointLight position={[0, 2, -4]} intensity={1.8} color="#facc15" />
      <fog attach="fog" args={['#020617', 6, 18]} />
      <StarField count={1200} depth={16} factor={1.8} />
      <WaterReflection mouse={mouse} ripple={ripple} />
    </>
  );
}

export default function WaterFooter() {
  const { mouse, ripple } = useMouseRipple();

  return (
    <section className="relative z-10 mt-12 h-[82vh] min-h-[560px] w-full water-shell">
      <div className="sticky top-[22vh] h-[46vh] min-h-[360px] overflow-hidden border-y border-white/10">
        <Canvas camera={{ position: [0, 2.2, 6.8], fov: 42 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <WaterScene mouse={mouse} ripple={ripple} />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.05),rgba(2,6,23,0.15)_22%,rgba(2,6,23,0.85)_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8 }}
          className="pointer-events-none absolute inset-x-0 bottom-12 z-10 mx-auto max-w-3xl px-6 text-center"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300/85">Reflective ending</p>
          <h3 className="mt-4 font-display text-4xl text-slate-50 md:text-5xl">
            Move the cursor across the water and let the night respond.
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300/75 md:text-base">
            The closing water scene symbolizes calm reflection — a quiet reminder that Ramadan is not only observed through rituals, but through inner stillness, gratitude, and mercy.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
