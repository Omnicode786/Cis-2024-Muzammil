import StorySection from './StorySection';

export default function CharitySection({ section, index }) {
  return <StorySection {...section} index={index} side="right" />;
}
