import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { AnimatedText } from "../components/AnimatedText";
import { IllustrationLayer } from "../components/IllustrationLayer";
import { SceneTransition } from "../components/SceneTransition";
import { product } from "../data/videoCopy";
import { fadeBlurReveal, scaleReveal, springIn } from "../motion/motionSystem";

type SceneProps = { duration: number };

export function IntroScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoSpring = springIn(frame, fps, 12);
  const slowPush = interpolate(frame, [0, duration], [1, 1.045], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={1.1} />
      <IllustrationLayer />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${slowPush})`, transformOrigin: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 90,
              ...scaleReveal(frame, 10, 48, 0.88)
          }}
        >
          <div
            style={{
              width: 250,
              height: 86,
              borderRadius: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 32px 90px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
              transform: `scale(${0.9 + logoSpring * 0.1})`
            }}
          >
            <Img src={staticFile("assets/logo.png")} style={{ width: 205, height: "auto", objectFit: "contain" }} />
          </div>
        </div>

        <div style={{ position: "absolute", left: 160, top: 315 }}>
          <AnimatedText
            eyebrow="ShopIQ"
            title={"A cleaner way\nto run the shop."}
            body={product.positioning}
            delay={38}
            maxWidth={940}
          />
          <div
            style={{
              ...fadeBlurReveal(frame, { delay: 178, duration: 42, y: 18 }),
              marginTop: 44,
              display: "flex",
              gap: 14
            }}
          >
            {["Inventory", "Billing", "Payments", "Reports", "AI Copilot"].map((item, index) => (
              <span
                key={item}
                style={{
                  padding: "14px 20px",
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 800,
                  color: index === 4 ? "#06111f" : "#dbeafe",
                  background: index === 4 ? "linear-gradient(135deg, #7da4ff, #8d5cff)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)"
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <SceneTransition duration={duration} />
    </AbsoluteFill>
  );
}
