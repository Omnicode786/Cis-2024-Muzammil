import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function StorySection({ eyebrow, title, body, stats = [], index = 0, side = 'right' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const x = useTransform(scrollYProgress, [0, 1], side === 'right' ? [-40, 24] : [40, -24]);

  return (
    <section ref={ref} className="relative px-6 py-20 md:px-8 lg:px-12 lg:py-28">
      <div className="mx-auto max-w-7xl section-grid">
        <motion.div
          style={{ y, x }}
          className={`glass-panel rounded-[2rem] p-8 md:p-10 ${side === 'right' ? 'lg:order-1' : 'lg:order-2'}`}
        >
          <p className="text-xs uppercase tracking-[0.45em] text-amber-300/90">{eyebrow}</p>
          <h3 className="mt-5 font-display text-4xl leading-none text-slate-50 md:text-5xl">
            {title}
          </h3>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300/80 md:text-lg">{body}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className={`relative overflow-hidden rounded-[2rem] border border-amber-200/10 bg-white/5 p-8 md:p-10 ${
            side === 'right' ? 'lg:order-2' : 'lg:order-1'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.12),transparent_50%)]" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.45em] text-slate-300/60">Chapter {index + 1}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {stats.map((stat, statIndex) => (
                <motion.div
                  key={stat}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.5, delay: statIndex * 0.08 }}
                  className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5"
                >
                  <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-amber-200 to-amber-400" />
                  <p className="font-display text-2xl tracking-wide text-slate-50">{stat}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
