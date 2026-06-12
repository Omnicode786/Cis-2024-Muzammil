import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { parallax } from "../motion/motionSystem";

export function IllustrationLayer() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = parallax(frame, 0, durationInFrames, 30);
  const rotation = interpolate(frame, [0, durationInFrames], [-2, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", perspective: 1200 }}>
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: 260 + index * 34,
            height: 120 + index * 22,
            right: 140 + index * 170,
            top: 120 + index * 124,
            borderRadius: 30,
            border: "1px solid rgba(255,255,255,0.09)",
            background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))",
            transform: `translate3d(${drift * (index + 1) * 0.4}px, ${drift * 0.22}px, ${-index * 30}px) rotate(${rotation + index * 1.4}deg)`,
            boxShadow: "0 26px 80px rgba(0,0,0,0.22)",
            opacity: 0.46 - index * 0.06
          }}
        />
      ))}
    </div>
  );
}

