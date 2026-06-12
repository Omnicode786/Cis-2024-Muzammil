import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { transitionProgress } from "../motion/motionSystem";

type SceneTransitionProps = {
  color?: string;
  tail?: number;
  duration?: number;
};

export function SceneTransition({ color = "#05060a", tail = 56, duration }: SceneTransitionProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = transitionProgress(frame, duration ?? durationInFrames, tail);
  const x = interpolate(progress, [0, 1], [110, 0]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: progress,
        background: `linear-gradient(90deg, transparent 0%, ${color} 42%, ${color} 100%)`,
        transform: `translateX(${x}%)`,
        filter: `blur(${(1 - progress) * 12}px)`
      }}
    />
  );
}
