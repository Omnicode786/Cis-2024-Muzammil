import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CheckCircle2 } from "lucide-react";
import { Background } from "../components/Background";
import { FloatingCard } from "../components/FloatingCard";
import { SceneTransition } from "../components/SceneTransition";
import { workflowSteps } from "../data/features";
import { fadeBlurReveal, stagger } from "../motion/motionSystem";

type SceneProps = { duration: number };

export function WorkflowScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [140, 500], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pathLength = 1260;

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={0.82} />
      <div style={{ position: "absolute", left: 120, top: 100 }}>
        <div style={{ ...fadeBlurReveal(frame, { delay: 0 }) }}>
          <p style={{ margin: 0, color: "#7da4ff", fontSize: 20, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase" }}>End-to-end</p>
          <h2 style={{ margin: "16px 0 0", color: "#f8fafc", fontSize: 68, lineHeight: 0.96, letterSpacing: -1.3 }}>A sale becomes a complete record.</h2>
          <p style={{ margin: "24px 0 0", color: "rgba(226,232,240,0.72)", width: 860, fontSize: 26, lineHeight: 1.38 }}>The core workflow is deliberately connected: product data feeds invoice creation, invoices drive payments, stock moves automatically, and reports stay trustworthy.</p>
        </div>
      </div>

      <svg style={{ position: "absolute", left: 260, top: 532, width: 1400, height: 260, overflow: "visible" }} viewBox="0 0 1400 260">
        <path d="M 40 130 C 240 20, 390 20, 570 130 S 910 238, 1080 130 S 1230 18, 1360 96" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
        <path d="M 40 130 C 240 20, 390 20, 570 130 S 910 238, 1080 130 S 1230 18, 1360 96" fill="none" stroke="url(#workflowGradient)" strokeWidth="9" strokeLinecap="round" strokeDasharray={pathLength} strokeDashoffset={pathLength - draw * pathLength} />
        <defs>
          <linearGradient id="workflowGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#ff3d1f" />
            <stop offset="45%" stopColor="#5b8cff" />
            <stop offset="100%" stopColor="#18c37e" />
          </linearGradient>
        </defs>
      </svg>

      <div style={{ position: "absolute", left: 210, right: 210, bottom: 160, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }}>
        {workflowSteps.map((step, index) => {
          const progress = interpolate(frame, [170 + index * 52, 225 + index * 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <FloatingCard key={step} accent={["#ff3d1f", "#ffc857", "#5b8cff", "#18c37e", "#8d5cff"][index]} style={{ height: 170, opacity: progress, transform: `translateY(${(1 - progress) * 38}px) scale(${0.96 + progress * 0.04})` }}>
              <CheckCircle2 size={32} color={["#ff3d1f", "#ffc857", "#5b8cff", "#18c37e", "#8d5cff"][index]} />
              <p style={{ margin: "18px 0 0", color: "rgba(226,232,240,0.48)", fontSize: 16, fontWeight: 900, letterSpacing: 3 }}>STEP {index + 1}</p>
              <h3 style={{ margin: "8px 0 0", fontSize: 25, letterSpacing: -0.3 }}>{step}</h3>
            </FloatingCard>
          );
        })}
      </div>

      <div style={{ position: "absolute", right: 140, top: 128, display: "grid", gap: 12 }}>
        {["No partial invoice if stock fails", "Walk-in customers pay on spot", "AI writes need approval"].map((item, index) => (
          <div key={item} style={{ ...fadeBlurReveal(frame, { delay: stagger(index, 420, 18), y: 18 }), padding: "15px 18px", borderRadius: 999, background: "rgba(255,255,255,0.075)", border: "1px solid rgba(255,255,255,0.1)", color: "#dbeafe", fontSize: 18, fontWeight: 800 }}>
            {item}
          </div>
        ))}
      </div>
      <SceneTransition duration={duration} />
    </AbsoluteFill>
  );
}
