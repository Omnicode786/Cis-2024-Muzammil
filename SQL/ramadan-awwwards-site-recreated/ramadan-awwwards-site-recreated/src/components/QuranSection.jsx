import StorySection from './StorySection';

export default function QuranSection({ section, index }) {
  return <StorySection {...section} index={index} side="left" />;
}
