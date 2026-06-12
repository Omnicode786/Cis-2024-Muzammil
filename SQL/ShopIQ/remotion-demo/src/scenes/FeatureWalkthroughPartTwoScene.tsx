import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { FloatingCard } from "../components/FloatingCard";
import { ProductFrame } from "../components/ProductFrame";
import { SceneTransition } from "../components/SceneTransition";
import { screenshots } from "../data/videoCopy";
import { featureGroups } from "../data/features";
import { fadeBlurReveal, slideReveal } from "../motion/motionSystem";

type SceneProps = { duration: number };

const segments = [
  {
    start: 0,
    title: "Payments and purchases stay tied to source records.",
    body: "Receipts, supplier payouts, purchase receiving, and customer balances are connected instead of becoming separate bookkeeping islands.",
    leftImage: screenshots.paymentsDark,
    rightImage: screenshots.purchasesDark,
    featureIndex: 3
  },
  {
    start: 540,
    title: "Reports become business documents, not screenshots.",
    body: "ShopIQ creates PDF-ready reporting from real sales, inventory value, fast movers, stock risk, customer dues, and supplier pressure.",
    leftImage: screenshots.reportsDark,
    rightImage: screenshots.reportsLight,
    featureIndex: 5
  },
  {
    start: 1080,
    title: "Copilot answers, prepares, and asks before writing.",
    body: "The Gemini assistant has saved chat threads, role-aware context, database tools, PDF report generation, and confirmation-gated record actions.",
    leftImage: screenshots.assistantDark,
    rightImage: screenshots.settingsLight,
    featureIndex: 6
  }
];

function segmentOpacity(frame: number, start: number) {
  return interpolate(frame, [start - 30, start + 28, start + 450, start + 520], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
}

export function FeatureWalkthroughPartTwoScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={0.95} />
      <div style={{ position: "absolute", left: 104, top: 72, ...fadeBlurReveal(frame, { delay: 0, y: 18 }) }}>
        <p style={{ margin: 0, color: "#7da4ff", fontSize: 18, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase" }}>Walkthrough 02</p>
        <h2 style={{ margin: "14px 0 0", color: "#f8fafc", fontSize: 52, letterSpacing: -1, lineHeight: 1 }}>The back office stays connected.</h2>
      </div>

      {segments.map((segment) => {
        const active = segmentOpacity(frame, segment.start);
        const feature = featureGroups[segment.featureIndex];
        const Icon = feature.icon;
        const cardMotion = slideReveal(frame, { delay: segment.start + 36, duration: 70, x: 48, y: 18 });
        const local = frame - segment.start;
        const leftPanX = interpolate(local, [0, 250, 500], [0, -24, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const leftPanY = interpolate(local, [0, 250, 500], [0, -18, -30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const rightPanX = interpolate(local, [0, 250, 500], [12, -18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const rightPanY = interpolate(local, [0, 250, 500], [0, -14, -24], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        return (
          <div key={segment.title} style={{ position: "absolute", inset: 0, opacity: active }}>
            <div style={{ position: "absolute", left: 96, top: 202, width: 840, height: 550, perspective: 1600 }}>
              {(() => {
                const motion = slideReveal(frame, { delay: segment.start + 24, duration: 76, x: -70, y: 20 });
                return (
                  <div style={{ position: "absolute", left: 0, top: 34, opacity: motion.opacity, transform: `${motion.transform} rotateY(${interpolate(frame, [segment.start + 70, segment.start + 480], [-4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}deg)` }}>
                    <ProductFrame src={segment.leftImage} title="ShopIQ workspace" style={{ width: 790, height: 444 }} imageStyle={{ transform: `scale(1.05) translate3d(${leftPanX}px, ${leftPanY}px, 0)` }} />
                  </div>
                );
              })()}
              {(() => {
                const motion = slideReveal(frame, { delay: segment.start + 90, duration: 82, x: -20, y: 80 });
                return (
                  <div style={{ position: "absolute", left: 230, top: 188, opacity: motion.opacity, transform: `${motion.transform} scale(0.78) rotateY(-7deg)` }}>
                    <ProductFrame src={segment.rightImage} title="ShopIQ mode" light={segment.rightImage.includes("light")} style={{ width: 790, height: 444 }} imageStyle={{ transform: `scale(1.052) translate3d(${rightPanX}px, ${rightPanY}px, 0)` }} />
                  </div>
                );
              })()}
            </div>

            <div style={{ position: "absolute", right: 100, top: 255, width: 560, ...cardMotion }}>
              <FloatingCard accent={feature.accent} style={{ minHeight: 455 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 76, height: 76, borderRadius: 24, display: "grid", placeItems: "center", background: `${feature.accent}20` }}>
                    <Icon size={36} color={feature.accent} />
                  </div>
                  <div>
                    <p style={{ margin: 0, color: feature.accent, fontSize: 18, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase" }}>{feature.title}</p>
                    <h3 style={{ margin: "8px 0 0", fontSize: 38, letterSpacing: -0.8, lineHeight: 1.06 }}>{segment.title}</h3>
                  </div>
                </div>
                <p style={{ margin: "28px 0 0", color: "rgba(226,232,240,0.76)", fontSize: 24, lineHeight: 1.42 }}>{segment.body}</p>
              </FloatingCard>
            </div>
          </div>
        );
      })}
      <SceneTransition duration={duration} />
    </AbsoluteFill>
  );
}
