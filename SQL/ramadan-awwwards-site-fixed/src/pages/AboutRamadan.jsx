import PageHero from '../components/PageHero';
import SectionTitle from '../components/SectionTitle';
import InfoCardGrid from '../components/InfoCardGrid';
import StorySection from '../components/StorySection';
import { aboutCards } from '../data/content';

export default function AboutRamadan() {
  return (
    <div>
      <PageHero
        eyebrow="About Ramadan"
        title="What Ramadan is, where it sits in the Islamic calendar, and why it matters so deeply."
        body="For people unfamiliar with Islam, Ramadan can be understood as a sacred month of worship, fasting, introspection, and shared compassion. It is not only a time of abstaining from food and drink — it is a season of spiritual refinement."
      />

      <section className="px-6 py-20 md:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Foundations"
            title="The month is shaped by the moon, but felt in the heart."
            body="Because Ramadan follows the Islamic lunar calendar, its arrival is anticipated through moon sighting and community. Around the world, it brings a distinct shift in rhythm: quieter mornings, attentive afternoons, luminous evenings, and nights filled with devotion."
          />
          <div className="mt-14">
            <InfoCardGrid cards={aboutCards} />
          </div>
        </div>
      </section>

      <StorySection
        eyebrow="More than a schedule"
        title="Ramadan is a lived experience of restraint, gratitude, and heightened awareness."
        body="The fast is one part of a larger spiritual atmosphere. People become more intentional about speech, habits, and time. Homes prepare early meals before dawn, mosques fill at night, and daily routines are quietly reoriented around worship and mercy."
        stats={['Moon-sighted month', 'Sacred revelation', 'Shared discipline', 'Global observance']}
        index={0}
        side="right"
      />

      <section className="px-6 pb-16 pt-8 md:px-8 lg:px-12 lg:pb-20">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center md:p-12">
          <p className="text-xs uppercase tracking-[0.45em] text-amber-300/85">A helpful lens</p>
          <p className="mt-6 font-display text-3xl leading-tight text-slate-50 md:text-4xl">
            If Ramadan seems quiet from the outside, that quiet often holds the deepest beauty.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300/80 md:text-lg">
            Its beauty is found in intention: a prayer whispered before sunrise, a date shared at sunset, a donation given in secret, a family gathering after a long day of fasting, and the sense that time itself is being used more thoughtfully.
          </p>
        </div>
      </section>
    </div>
  );
}
