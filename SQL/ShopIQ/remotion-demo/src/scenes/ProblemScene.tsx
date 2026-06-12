import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AlertTriangle, ArrowRight, Boxes, ReceiptText, WalletCards } from "lucide-react";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { FloatingCard } from "../components/FloatingCard";
import { SceneTransition } from "../components/SceneTransition";
import { sceneCopy } from "../data/videoCopy";
import { fadeBlurReveal, slideReveal, stagger } from "../motion/motionSystem";

type SceneProps = { duration: number };

const pains = [
  { title: "Stock moves", icon: Boxes, body: sceneCopy.problems[0], color: "#f44f78" },
  { title: "Payments drift", icon: WalletCards, body: sceneCopy.problems[1], color: "#ffc857" },
  { title: "Reports wait", icon: ReceiptText, body: sceneCopy.problems[2], color: "#5b8cff" }
];

export function ProblemScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [260, 520], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={0.78} />
      <div style={{ position: "absolute", left: 120, top: 102 }}>
        <AnimatedText
          eyebrow="The real problem"
          title={"Too many systems.\nToo much double entry."}
          body="ShopIQ is built around the operational relationships that matter: products, invoices, payments, stock, customers, suppliers, reports, and activity."
          delay={8}
          maxWidth={1120}
        />
      </div>

      <div style={{ position: "absolute", left: 130, right: 130, bottom: 110, display: "grid", gridTemplateColumns: "1fr 220px 1fr", gap: 24, alignItems: "center" }}>
        <div style={{ display: "grid", gap: 20 }}>
          {pains.map((pain, index) => {
            const Icon = pain.icon;
            return (
              <FloatingCard key={pain.title} accent={pain.color} style={{ height: 170, ...slideReveal(frame, { delay: stagger(index, 146, 18), x: -70, y: 20 }) }}>
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ width: 58, height: 58, borderRadius: 18, background: `${pain.color}22`, display: "grid", placeItems: "center" }}>
                    <Icon size={28} color={pain.color} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 26 }}>{pain.title}</h3>
                    <p style={{ margin: "8px 0 0", color: "rgba(226,232,240,0.68)", fontSize: 18, lineHeight: 1.35 }}>{pain.body}</p>
                  </div>
                </div>
              </FloatingCard>
            );
          })}
        </div>

        <div style={{ height: 360, display: "grid", placeItems: "center", ...fadeBlurReveal(frame, { delay: 250 }) }}>
          <div style={{ width: 180, height: 180, borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.055)" }}>
            <ArrowRight size={58} color="#7da4ff" style={{ transform: `translateX(${line * 12}px)` }} />
          </div>
        </div>

        <FloatingCard accent="#18c37e" style={{ height: 560, ...slideReveal(frame, { delay: 330, x: 80, y: 18 }) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
            <div style={{ width: 68, height: 68, borderRadius: 20, background: "rgba(24,195,126,0.18)", display: "grid", placeItems: "center" }}>
              <AlertTriangle size={32} color="#18c37e" />
            </div>
            <div>
              <p style={{ margin: 0, color: "#18c37e", fontSize: 18, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase" }}>Connected records</p>
              <h2 style={{ margin: "8px 0 0", fontSize: 36, letterSpacing: -0.5 }}>One clean operating loop</h2>
            </div>
          </div>
          {["Invoice created", "Payment saved", "Stock movement recorded", "Customer balance updated", "Activity logged"].map((item, index) => (
            <div
              key={item}
              style={{
                marginTop: 14,
                height: 58,
                borderRadius: 18,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                color: "#e2e8f0",
                fontSize: 21,
                fontWeight: 750,
                opacity: interpolate(frame, [330 + index * 20, 366 + index * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
              }}
            >
              {item}
            </div>
          ))}
        </FloatingCard>
      </div>
      <SceneTransition duration={duration} />
    </AbsoluteFill>
  );
}
