import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config/videoConfig";
import { parallax } from "../motion/motionSystem";

type BackgroundProps = {
  tone?: "dark" | "light";
  intensity?: number;
};

export function Background({ tone = "dark", intensity = 1 }: BackgroundProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const shift = parallax(frame, 0, durationInFrames, 36 * intensity);
  const glow = interpolate(Math.sin(frame / 100), [-1, 1], [0.75, 1.12]);
  const isLight = tone === "light";

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: isLight
          ? "linear-gradient(140deg, #f7f9fc 0%, #eef3f8 47%, #fff7ed 100%)"
          : "linear-gradient(135deg, #05060a 0%, #0b0e18 45%, #120d1c 100%)"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -120,
          backgroundImage: isLight
            ? "linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px)"
            : "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          transform: `translate3d(${shift}px, ${shift * 0.5}px, 0) scale(1.08)`,
          opacity: isLight ? 0.46 : 0.35
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 980,
          height: 540,
          left: 90 + shift,
          top: -180 + shift * 0.2,
          background: `radial-gradient(circle, ${COLORS.blue}55 0%, transparent 64%)`,
          filter: "blur(70px)",
          opacity: isLight ? 0.24 * glow : 0.22 * glow
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 760,
          height: 520,
          right: -120 - shift * 0.3,
          bottom: -130,
          background: `radial-gradient(circle, ${COLORS.orange}55 0%, transparent 65%)`,
          filter: "blur(80px)",
          opacity: isLight ? 0.18 : 0.2
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isLight
            ? "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.88), transparent 42%)"
            : "radial-gradient(circle at 50% 12%, rgba(255,255,255,0.075), transparent 38%)",
          opacity: 0.88
        }}
      />
    </AbsoluteFill>
  );
}

