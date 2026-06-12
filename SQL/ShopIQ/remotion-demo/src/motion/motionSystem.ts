import { Easing, interpolate, spring } from "remotion";

export const easings = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  premium: Easing.bezier(0.22, 1, 0.36, 1),
  soft: Easing.bezier(0.33, 1, 0.68, 1)
};

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const springIn = (frame: number, fps: number, delay = 0, config = {}) => {
  if (frame < delay) return 0;
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 24, stiffness: 120, mass: 0.9, ...config }
  });
};

export const fadeBlurReveal = (
  frame: number,
  options: { delay?: number; duration?: number; y?: number; blur?: number } = {}
) => {
  const { delay = 0, duration = 46, y = 28, blur = 14 } = options;
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.premium
  });

  return {
    opacity: progress,
    transform: `translate3d(0, ${(1 - progress) * y}px, 0)`,
    filter: `blur(${(1 - progress) * blur}px)`
  };
};

export const slideReveal = (
  frame: number,
  options: { delay?: number; duration?: number; x?: number; y?: number } = {}
) => {
  const { delay = 0, duration = 58, x = 0, y = 40 } = options;
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.premium
  });

  return {
    opacity: progress,
    transform: `translate3d(${(1 - progress) * x}px, ${(1 - progress) * y}px, 0)`
  };
};

export const scaleReveal = (frame: number, delay = 0, duration = 58, from = 0.92) => {
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.premium
  });
  const scale = interpolate(progress, [0, 0.76, 1], [from, 1.018, 1]);

  return {
    opacity: progress,
    transform: `scale(${scale})`,
    filter: `blur(${(1 - progress) * 10}px)`
  };
};

export const stagger = (index: number, base = 0, gap = 9) => base + index * gap;

export const cameraZoom = (frame: number, start: number, end: number, from = 1.06, to = 1) => {
  const scale = interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut
  });
  return `scale(${scale})`;
};

export const parallax = (frame: number, start: number, end: number, amount: number) =>
  interpolate(frame, [start, end], [-amount, amount], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut
  });

export const textRevealClip = (frame: number, delay = 0, duration = 54) => {
  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.premium
  });
  return `inset(0 ${100 - progress * 100}% 0 0)`;
};

export const cardStack = (frame: number, index: number, start = 0) => {
  const progress = springIn(frame, 60, start + index * 8, { damping: 25, stiffness: 100 });
  return {
    opacity: progress,
    transform: `translate3d(${(1 - progress) * 56}px, ${(1 - progress) * 34}px, ${-index * 18}px) rotateY(${(1 - progress) * -7}deg) scale(${0.96 + progress * 0.04})`
  };
};

export const transitionProgress = (frame: number, duration: number, tail = 70) =>
  interpolate(frame, [duration - tail, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut
  });

export const highlightPulse = (frame: number, delay = 0) => {
  const pulse = Math.sin(Math.max(0, frame - delay) / 12);
  const intensity = frame < delay ? 0 : 0.5 + pulse * 0.5;
  return {
    boxShadow: `0 0 ${18 + intensity * 24}px rgba(91, 140, 255, ${0.25 + intensity * 0.28})`,
    transform: `scale(${1 + intensity * 0.012})`
  };
};

export const cursorPoint = (
  frame: number,
  points: Array<{ frame: number; x: number; y: number }>
) => {
  if (points.length === 0) return { x: 0, y: 0 };
  let current = points[0];
  for (const point of points) {
    if (frame >= point.frame) {
      current = point;
    }
  }
  const next = points.find((point) => point.frame > frame) ?? current;
  if (current === next) return { x: current.x, y: current.y };

  const x = interpolate(frame, [current.frame, next.frame], [current.x, next.x], {
    easing: easings.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const y = interpolate(frame, [current.frame, next.frame], [current.y, next.y], {
    easing: easings.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  return { x, y };
};
