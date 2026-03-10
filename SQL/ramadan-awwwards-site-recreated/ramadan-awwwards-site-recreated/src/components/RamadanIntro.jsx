import StorySection from './StorySection';

export default function RamadanIntro({ section, index }) {
  return <StorySection {...section} index={index} side="right" />;
}
