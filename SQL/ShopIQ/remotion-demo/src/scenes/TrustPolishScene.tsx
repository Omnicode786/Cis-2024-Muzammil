import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Palette, ShieldCheck, Sparkles } from "lucide-react";
import { Background } from "../components/Background";
import { FloatingCard } from "../components/FloatingCard";
import { ProductFrame } from "../components/ProductFrame";
import { SceneTransition } from "../components/SceneTransition";
import { screenshots, sceneCopy } from "../data/videoCopy";
import { fadeBlurReveal, slideReveal } from "../motion/motionSystem";

type SceneProps = { duration: number };

export function TrustPolishScene({ duration }: SceneProps) {
  const frame = useCurrentFrame();
  const pullback = interpolate(frame, [0, duration], [1.02, 0.96], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={1.05} />
      <div style={{ position: "absolute", left: 120, top: 82, ...fadeBlurReveal(frame, { delay: 0 }) }}>
        <p style={{ margin: 0, color: "#7da4ff", fontSize: 19, fontWeight: 900, letterSpacing: 5, textTransform: "uppercase" }}>Polished for real use</p>
        <h2 style={{ margin: "16px 0 0", color: "#f8fafc", fontSize: 58, lineHeight: 0.98, letterSpacing: -1.1 }}>One system. Different modes. Protected work.</h2>
      </div>

      {(() => {
        const motion = slideReveal(frame, { delay: 50, x: -54, y: 20 });
        return (
          <div style={{ position: "absolute", left: 110, bottom: 118, opacity: motion.opacity, transform: `${motion.transform} scale(${pullback})`, transformOrigin: "left bottom" }}>
            <ProductFrame src={screenshots.dashboardDark} title="Dark liquid glass mode" style={{ width: 910, height: 512 }} />
          </div>
        );
      })()}
      {(() => {
        const motion = slideReveal(frame, { delay: 90, x: 64, y: 42 });
        return (
          <div style={{ position: "absolute", right: 110, bottom: 150, opacity: motion.opacity, transform: `${motion.transform} scale(${pullback * 0.92})`, transformOrigin: "right bottom" }}>
            <ProductFrame src={screenshots.dashboardLight} title="Light classic mode" light style={{ width: 910, height: 512 }} />
          </div>
        );
      })()}

      <div style={{ position: "absolute", left: 1230, top: 190, width: 500, display: "grid", gap: 16 }}>
        {sceneCopy.strengths.map((item, index) => {
          const icons = [ShieldCheck, Sparkles, Palette, null] as const;
          const Icon = icons[index];
          return (
            <FloatingCard key={item} accent={["#18c37e", "#8d5cff", "#5b8cff", "#ff3d1f"][index]} style={{ padding: 22, ...fadeBlurReveal(frame, { delay: 130 + index * 20, y: 18 }) }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.075)" }}>
                  {Icon ? <Icon size={25} color={["#18c37e", "#8d5cff", "#5b8cff", "#ff3d1f"][index]} /> : <Img src={staticFile("assets/favicon.png")} style={{ width: 28, height: 28 }} />}
                </div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 850, color: "#f8fafc" }}>{item}</p>
              </div>
            </FloatingCard>
          );
        })}
      </div>
      <SceneTransition duration={duration} tail={34} />
    </AbsoluteFill>
  );
}
