import { motion } from 'framer-motion';

export default function SectionTitle({ eyebrow, title, body, align = 'left' }) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : 'text-left';

  return (
    <div className={`max-w-3xl ${alignClass}`}>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6 }}
        className="mb-4 text-xs uppercase tracking-[0.45em] text-[var(--theme-accent-strong)]"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.8, delay: 0.08 }}
        className="font-display text-4xl leading-none text-[var(--theme-text)] sm:text-5xl lg:text-6xl"
      >
        {title}
      </motion.h2>
      {body ? (
        <motion.p
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, delay: 0.16 }}
          className="mt-6 text-base leading-8 text-[var(--theme-muted)] sm:text-lg"
        >
          {body}
        </motion.p>
      ) : null}
    </div>
  );
}
