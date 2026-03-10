import StorySection from './StorySection';

export default function FastingSection({ section, index }) {
  return <StorySection {...section} index={index} side="left" />;
}
