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
    title: "Dashboard: the next move is always visible.",
    body: "Quick actions sit beside real operating numbers, so users can move from overview to work without hunting through menus.",
    image: screenshots.dashboardLight,
    light: true,
    featureIndex: 0
  },
  {
    start: 540,
    title: "Inventory: SKUs, stock risk, and product details stay together.",
    body: "Product records include pricing, stock quantity, reorder logic, categories, suppliers, barcode, and batch fields where needed.",
    image: screenshots.productsLight,
    light: true,
    featureIndex: 1
  },
  {
    start: 1080,
    title: "Billing: invoices create the operational trail.",
    body: "Invoice creation connects customer, items, paid amount, payment status, stock movement, and remaining balance.",
    image: screenshots.billingLight,
    light: true,
    featureIndex: 2
  }
];

function segmentOpacity(frame: number, start: number) {
  return interpolate(frame, [start - 30, start + 28, start + 450, start + 520], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
}

export function FeatureWalkthroughPartOneScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="light" intensity={0.6} />
      <div style={{ position: "absolute", left: 94, top: 72, color: "#0f172a", ...fadeBlurReveal(frame, { delay: 0, y: 18 }) }}>
        <p style={{ margin: 0, color: "#ff3d1f", fontSize: 18, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase" }}>Walkthrough 01</p>
        <h2 style={{ margin: "14px 0 0", fontSize: 52, letterSpacing: -1, lineHeight: 1 }}>From overview to daily work.</h2>
      </div>

      {segments.map((segment) => {
        const active = segmentOpacity(frame, segment.start);
        const feature = featureGroups[segment.featureIndex];
        const Icon = feature.icon;
        const cardMotion = slideReveal(frame, { delay: segment.start + 40, duration: 70, x: -54, y: 20 });
        const frameMotion = slideReveal(frame, { delay: segment.start + 15, duration: 80, x: 90, y: 18 });
        const local = frame - segment.start;
        const productScale = interpolate(local, [0, 250, 500], [0.985, 1.02, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const imageX = interpolate(local, [0, 260, 500], [0, -28, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const imageY = interpolate(local, [0, 260, 500], [0, -20, -34], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        return (
          <div key={segment.title} style={{ position: "absolute", inset: 0, opacity: active }}>
            <div style={{ position: "absolute", left: 94, top: 230, width: 455, ...cardMotion }}>
              <FloatingCard accent={feature.accent} light style={{ minHeight: 470 }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, display: "grid", placeItems: "center", background: `${feature.accent}18`, marginBottom: 28 }}>
                  <Icon size={34} color={feature.accent} />
                </div>
                <p style={{ margin: 0, color: feature.accent, fontSize: 18, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase" }}>{feature.title}</p>
                <h3 style={{ margin: "16px 0 0", color: "#0f172a", fontSize: 40, lineHeight: 1.04, letterSpacing: -0.9 }}>{segment.title}</h3>
                <p style={{ margin: "22px 0 0", color: "#475569", fontSize: 22, lineHeight: 1.42, fontWeight: 560 }}>{segment.body}</p>
              </FloatingCard>
            </div>

            <div style={{ position: "absolute", right: 72, top: 178, opacity: frameMotion.opacity, transform: `${frameMotion.transform} scale(${productScale})` }}>
              <ProductFrame
                src={segment.image}
                title={feature.title}
                light={segment.light}
                style={{ width: 1240, height: 698 }}
                imageStyle={{ transform: `scale(1.045) translate3d(${imageX}px, ${imageY}px, 0)` }}
              />
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 94, right: 94, bottom: 54, height: 6, borderRadius: 999, background: "rgba(15,23,42,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${interpolate(frame, [0, duration], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`, background: "linear-gradient(90deg, #ff3d1f, #5b8cff, #18c37e)" }} />
      </div>
      <SceneTransition duration={duration} color="#f8fafc" />
    </AbsoluteFill>
  );
}
