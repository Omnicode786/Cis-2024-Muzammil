import PageHero from '../components/PageHero';
import SectionTitle from '../components/SectionTitle';
import InfoCardGrid from '../components/InfoCardGrid';
import StorySection from '../components/StorySection';
import { celebrationCards } from '../data/content';

export default function Celebration() {
  return (
    <div>
      <PageHero
        eyebrow="Ramadan Culture & Celebration"
        title="Lanterns, shared meals, night streets, and the joy of Eid al-Fitr."
        body="Ramadan is globally shared but locally expressed. Across regions, the month comes alive with distinctive foods, family traditions, neighborhood hospitality, decorated streets, and rituals of welcome that make the spiritual season feel warm and unforgettable."
      />

      <section className="px-6 py-20 md:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Culture in motion"
            title="The nights of Ramadan often feel festive, luminous, and full of togetherness."
            body="After sunset, homes and streets can transform. Families gather for iftar, cafes and markets become lively, and many communities fill the night with conversation, prayer, desserts, and hospitality. The quiet devotion of the day meets the warmth of collective joy."
          />
          <div className="mt-14">
            <InfoCardGrid cards={celebrationCards} />
          </div>
        </div>
      </section>

      <StorySection
        eyebrow="Traditions"
        title="From dates and water to regional dishes and sweets, iftar is deeply symbolic."
        body="Breaking the fast often begins simply — many Muslims start with dates and water, following prophetic tradition. After that, meals vary by culture: soups, breads, rice dishes, grilled foods, pastries, and sweets each reflect local history and family custom."
        stats={['Dates', 'Water', 'Regional dishes', 'Desserts']}
        index={1}
        side="right"
      />

      <StorySection
        eyebrow="Eid al-Fitr"
        title="The closing celebration carries both tenderness and delight."
        body="On Eid morning, Muslims attend a special communal prayer, wear beautiful clothes, exchange greetings, and visit loved ones. Children may receive gifts or money, families prepare favorite meals, and communities celebrate the successful completion of Ramadan with gratitude."
        stats={['Morning prayer', 'Family visits', 'Gifts for children', 'Festive meals']}
        index={2}
        side="left"
      />

      <section className="px-6 pb-16 pt-8 md:px-8 lg:px-12 lg:pb-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center md:p-12">
          <p className="text-xs uppercase tracking-[0.45em] text-amber-300/85">Closing note</p>
          <p className="mt-6 font-display text-3xl leading-tight text-slate-50 md:text-4xl">
            Ramadan ends with celebration, but its lessons are meant to linger.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300/80 md:text-lg">
            After the lanterns dim and the month passes, many hope to carry forward what Ramadan strengthened: patience, prayer, gratitude, generosity, and a gentler way of moving through the world.
          </p>
        </div>
      </section>
    </div>
  );
}
