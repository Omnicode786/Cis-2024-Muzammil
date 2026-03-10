import { motion } from 'framer-motion';

export default function InfoCardGrid({ cards = [] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, index) => (
        <motion.article
          key={card.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, delay: index * 0.08 }}
          className="glass-panel rounded-[2rem] p-7 md:p-8"
        >
          <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-amber-200 to-amber-400" />
          <h3 className="font-display text-3xl text-slate-50">{card.title}</h3>
          <p className="mt-5 text-base leading-8 text-slate-300/80">{card.text}</p>
        </motion.article>
      ))}
    </div>
  );
}
