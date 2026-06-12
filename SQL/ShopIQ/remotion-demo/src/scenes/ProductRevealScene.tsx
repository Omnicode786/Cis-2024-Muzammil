import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { ProductFrame } from "../components/ProductFrame";
import { CursorHighlight } from "../components/CursorHighlight";
import { SceneTransition } from "../components/SceneTransition";
import { screenshots } from "../data/videoCopy";
import { fadeBlurReveal, scaleReveal } from "../motion/motionSystem";

type SceneProps = { duration: number };

function AnimatedChartOverlay() {
  const frame = useCurrentFrame();
  const lineProgress = interpolate(frame, [180, 390], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pieProgress = interpolate(frame, [250, 460], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dash = 740 - lineProgress * 740;

  return (
    <>
      <svg style={{ position: "absolute", left: 328, top: 510, width: 555, height: 170, overflow: "visible" }} viewBox="0 0 555 170">
        <path d="M8 138 C92 122 105 80 176 92 C256 107 262 42 338 56 C421 71 429 28 544 34" fill="none" stroke="#7da4ff" strokeWidth="8" strokeLinecap="round" strokeDasharray="740" strokeDashoffset={dash} />
        {[8, 176, 338, 544].map((x, index) => (
          <circle key={x} cx={x} cy={[138, 92, 56, 34][index]} r={lineProgress > index * 0.18 ? 8 : 0} fill="#f8fafc" stroke="#7da4ff" strokeWidth="4" />
        ))}
      </svg>
      <svg style={{ position: "absolute", left: 1008, top: 500, width: 240, height: 200, overflow: "visible", transform: `rotate(${-78 + pieProgress * 78}deg)` }} viewBox="0 0 240 200">
        <circle cx="110" cy="100" r="68" fill="none" stroke="#1f2937" strokeWidth="28" opacity="0.76" />
        <circle cx="110" cy="100" r="68" fill="none" stroke="#ff3d1f" strokeWidth="28" strokeLinecap="round" strokeDasharray={`${pieProgress * 150} 427`} transform="rotate(-90 110 100)" />
        <circle cx="110" cy="100" r="68" fill="none" stroke="#ffc857" strokeWidth="28" strokeLinecap="round" strokeDasharray={`${pieProgress * 92} 427`} strokeDashoffset={-170} transform="rotate(-90 110 100)" />
        <circle cx="110" cy="100" r="68" fill="none" stroke="#18c37e" strokeWidth="28" strokeLinecap="round" strokeDasharray={`${pieProgress * 122} 427`} strokeDashoffset={-280} transform="rotate(-90 110 100)" />
      </svg>
    </>
  );
}

export function ProductRevealScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();
  const reveal = scaleReveal(frame, 36, 58, 0.86);
  const cameraScale = interpolate(frame, [40, 260, 660, duration - 40], [0.9, 1.025, 0.985, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const cameraX = interpolate(frame, [40, 290, 650, duration - 40], [90, -58, -22, 38], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const cameraY = interpolate(frame, [40, 290, 650, duration - 40], [34, -24, -56, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const innerX = interpolate(frame, [110, 420, 780], [0, -18, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const innerY = interpolate(frame, [110, 420, 780], [0, -12, -24], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={1} />
      <div style={{ position: "absolute", left: 150, top: 62, ...fadeBlurReveal(frame, { delay: 0 }) }}>
        <p style={{ margin: 0, color: "#7da4ff", fontSize: 20, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase" }}>Product reveal</p>
        <h2 style={{ margin: "18px 0 0", color: "#f8fafc", fontSize: 54, lineHeight: 1, letterSpacing: -0.9 }}>A command center that starts with action.</h2>
      </div>
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 220,
          opacity: reveal.opacity,
          filter: reveal.filter,
          transform: `${reveal.transform} translate3d(${cameraX}px, ${cameraY}px, 0) scale(${cameraScale})`
        }}
      >
        <ProductFrame src={screenshots.dashboardDark} title="ShopIQ dashboard" imageStyle={{ transform: `scale(1.055) translate3d(${innerX}px, ${innerY}px, 0)` }} />
        <AnimatedChartOverlay />
        <div
          style={{
            position: "absolute",
            left: 32,
            top: 224,
            width: 932,
            height: 70,
            borderRadius: 18,
            border: "2px solid rgba(125,164,255,0.5)",
            background: "rgba(91,140,255,0.08)",
            opacity: interpolate(frame, [230, 280, 560, 620], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }}
        />
        <CursorHighlight
          delay={210}
          points={[
            { frame: 210, x: 1090, y: 262 },
            { frame: 310, x: 570, y: 346 },
            { frame: 440, x: 1112, y: 525 }
          ]}
        />
      </div>
      <SceneTransition duration={duration} />
    </AbsoluteFill>
  );
}
