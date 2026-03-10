import StorySection from './StorySection';

export default function PrayerSection({ section, index }) {
  return <StorySection {...section} index={index} side="right" />;
}
