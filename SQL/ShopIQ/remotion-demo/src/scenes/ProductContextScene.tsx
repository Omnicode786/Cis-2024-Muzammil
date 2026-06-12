import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Building2, Store, UserRoundCog } from "lucide-react";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { FloatingCard } from "../components/FloatingCard";
import { SceneTransition } from "../components/SceneTransition";
import { sceneCopy } from "../data/videoCopy";
import { cardStack, fadeBlurReveal } from "../motion/motionSystem";

type SceneProps = { duration: number };

const cards = [
  { label: "Owners", icon: Store, accent: "#ff3d1f", detail: sceneCopy.context[0] },
  { label: "Cash counters", icon: UserRoundCog, accent: "#5b8cff", detail: sceneCopy.context[1] },
  { label: "Managers", icon: Building2, accent: "#18c37e", detail: sceneCopy.context[2] }
];

export function ProductContextScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={0.85} />
      <div style={{ position: "absolute", left: 120, top: 112 }}>
        <AnimatedText
          eyebrow="Built for the counter"
          title={"Everyday retail work,\nwithout the clutter."}
          body="ShopIQ brings the daily shop loop into one modern workspace: stock, invoices, payments, customers, purchases, reports, and Copilot."
          delay={10}
          maxWidth={1100}
        />
      </div>

      <div style={{ position: "absolute", left: 150, right: 150, bottom: 130, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, perspective: 1400 }}>
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <FloatingCard key={card.label} accent={card.accent} style={{ minHeight: 280, ...cardStack(frame, index, 155) }}>
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 22,
                  background: `${card.accent}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 26
                }}
              >
                <Icon size={36} color={card.accent} />
              </div>
              <h2 style={{ margin: 0, fontSize: 34, lineHeight: 1, letterSpacing: -0.4 }}>{card.label}</h2>
              <p style={{ margin: "18px 0 0", color: "rgba(226,232,240,0.76)", fontSize: 23, lineHeight: 1.36 }}>{card.detail}</p>
            </FloatingCard>
          );
        })}
      </div>

      <div style={{ position: "absolute", right: 110, top: 112, ...fadeBlurReveal(frame, { delay: 250 }) }}>
        <div style={{ color: "rgba(226,232,240,0.42)", fontSize: 18, fontWeight: 800, letterSpacing: 5, textTransform: "uppercase" }}>Role aware</div>
      </div>
      <SceneTransition duration={duration} />
    </AbsoluteFill>
  );
}

