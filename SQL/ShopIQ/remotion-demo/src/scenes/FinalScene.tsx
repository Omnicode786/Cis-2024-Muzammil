import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { ProductFrame } from "../components/ProductFrame";
import { screenshots, product } from "../data/videoCopy";
import { fadeBlurReveal, scaleReveal } from "../motion/motionSystem";

export function FinalScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily: "Inter, ui-sans-serif, system-ui, Segoe UI, Arial", overflow: "hidden" }}>
      <Background tone="dark" intensity={0.72} />
      <div style={{ position: "absolute", right: 140, bottom: 90, opacity: 0.35, transform: "scale(0.76)" }}>
        <ProductFrame src={screenshots.dashboardDark} title="ShopIQ" />
      </div>
      <div style={{ position: "absolute", left: 150, top: 170, width: 920 }}>
        <div style={{ ...scaleReveal(frame, 12, 62, 0.88), marginBottom: 48 }}>
          <div style={{ width: 290, height: 98, borderRadius: 32, display: "grid", placeItems: "center", background: "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.07))", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 32px 90px rgba(0,0,0,0.35)" }}>
            <Img src={staticFile("assets/logo.png")} style={{ width: 240, height: "auto", objectFit: "contain" }} />
          </div>
        </div>
        <h2 style={{ ...fadeBlurReveal(frame, { delay: 72, y: 24 }), margin: 0, color: "#f8fafc", fontSize: 76, lineHeight: 0.98, letterSpacing: -1.4, fontWeight: 880 }}>
          Premium shop operations.
          <br />
          Built for daily work.
        </h2>
        <p style={{ ...fadeBlurReveal(frame, { delay: 150, y: 20 }), margin: "34px 0 0", color: "rgba(226,232,240,0.76)", fontSize: 30, lineHeight: 1.36, maxWidth: 780 }}>
          {product.closing}
        </p>
      </div>
    </AbsoluteFill>
  );
}

