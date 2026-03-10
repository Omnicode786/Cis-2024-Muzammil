import PageHero from '../components/PageHero';
import SectionTitle from '../components/SectionTitle';
import InfoCardGrid from '../components/InfoCardGrid';
import StorySection from '../components/StorySection';
import { worshipCards } from '../data/content';

export default function Worship() {
  return (
    <div>
      <PageHero
        eyebrow="Worship During Ramadan"
        title="Prayer, Qur’an, remembrance, and charity become the pulse of the month."
        body="Ramadan intensifies spiritual practice. While Muslims pray throughout the year, this month often carries a special tenderness — nights feel fuller, recitation feels closer, and acts of devotion feel more deliberate."
      />

      <section className="px-6 py-20 md:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Forms of devotion"
            title="Worship in Ramadan is expansive."
            body="It includes formal acts such as prayer and fasting, but it also includes inward qualities: patience, honesty, remembrance, forgiveness, and service. The sacred atmosphere of the month encourages people to soften the heart and sharpen intention."
          />
          <div className="mt-14">
            <InfoCardGrid cards={worshipCards} />
          </div>
        </div>
      </section>

      <StorySection
        eyebrow="Prayer rituals"
        title="The five daily prayers remain the foundation, while Ramadan nights often glow with Taraweeh."
        body="Taraweeh are special nightly prayers held after the evening prayer. In many communities, worshippers gather in rows while long portions of the Qur’an are recited. The atmosphere is reverent, unhurried, and filled with stillness."
        stats={['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha + Taraweeh']}
        index={1}
        side="left"
      />

      <StorySection
        eyebrow="Reading the Qur’an"
        title="Ramadan renews the relationship between the believer and revelation."
        body="Many Muslims aim to complete the Qur’an during the month, whether by reading, listening, or studying its meanings. The recitation heard at night prayers often gives the month its emotional soundscape — measured, melodic, and deeply reflective."
        stats={['Listening', 'Recitation', 'Reflection', 'Study circles']}
        index={2}
        side="right"
      />

      <StorySection
        eyebrow="Generosity as worship"
        title="Giving is treated as a sacred act of care."
        body="Charity in Ramadan is both practical and spiritual. Muslims may pay zakat, give voluntary sadaqah, sponsor meals, assist relatives, and support humanitarian causes. The intention is not display, but dignity: helping others with sincerity and mercy."
        stats={['Zakat al-mal', 'Sadaqah', 'Feeding others', 'Community support']}
        index={3}
        side="left"
      />
    </div>
  );
}
