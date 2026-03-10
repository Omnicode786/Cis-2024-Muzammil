import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import RamadanIntro from '../components/RamadanIntro';
import FastingSection from '../components/FastingSection';
import PrayerSection from '../components/PrayerSection';
import QuranSection from '../components/QuranSection';
import CharitySection from '../components/CharitySection';
import CelebrationSection from '../components/CelebrationSection';
import SectionTitle from '../components/SectionTitle';
import { homeSections } from '../data/content';

const sectionMap = [
  RamadanIntro,
  FastingSection,
  PrayerSection,
  QuranSection,
  CharitySection,
  CelebrationSection,
];

export default function Home() {
  return (
    <div>
      <Hero />

      <section id="story-start" className="px-6 py-20 md:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Scroll-driven storytelling"
            title="A moonlit journey through the meanings, rhythms, and emotions of Ramadan."
            body="This homepage is designed like a guided narrative. As you move through each chapter, the website explains what Ramadan is, why it matters, and how faith, discipline, worship, compassion, and celebration are woven together throughout the month."
          />
        </div>
      </section>

      {homeSections.map((section, index) => {
        const SectionComponent = sectionMap[index] || RamadanIntro;
        return <SectionComponent key={section.id} section={section} index={index} />;
      })}

      <section className="px-6 pb-10 pt-8 md:px-8 lg:px-12 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl rounded-[2rem] border border-amber-200/10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.1),transparent_45%)] p-8 md:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-amber-300/85">For first-time visitors</p>
              <h2 className="mt-4 font-display text-4xl leading-none text-slate-50 md:text-5xl">
                Ramadan is at once deeply personal and beautifully communal.
              </h2>
            </div>
            <p className="text-base leading-8 text-slate-300/78 md:text-lg">
              Its days carry restraint and reflection. Its nights glow with prayer, lanterns, gatherings, and generosity. Across cultures and continents, the expressions may differ, but the heart of the month remains the same: spiritual clarity, mercy, and gratitude.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
