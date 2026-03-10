import StorySection from './StorySection';

export default function CelebrationSection({ section, index }) {
  return <StorySection {...section} index={index} side="left" />;
}
