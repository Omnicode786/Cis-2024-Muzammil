import type { CSSProperties, ReactNode } from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";

type ProductFrameProps = {
  src?: string;
  children?: ReactNode;
  title?: string;
  scale?: number;
  style?: CSSProperties;
  imageStyle?: CSSProperties;
  light?: boolean;
  shine?: boolean;
};

export function ProductFrame({ src, children, title = "ShopIQ", scale = 1, style, imageStyle, light = false, shine = true }: ProductFrameProps) {
  const frame = useCurrentFrame();
  const shineX = interpolate((frame % 210), [0, 210], [-55, 155], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });

  return (
    <div
      style={{
        width: 1320,
        height: 742,
        borderRadius: 34,
        padding: 12,
        background: light
          ? "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(242,246,252,0.88))"
          : "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.055))",
        border: light ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.17)",
        boxShadow: light
          ? "0 34px 110px rgba(15,23,42,0.18), inset 0 1px 0 rgba(255,255,255,0.96)"
          : "0 38px 130px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.14)",
        transform: `scale(${scale})`,
        transformOrigin: "center",
        overflow: "hidden",
        ...style
      }}
    >
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 18px",
          color: light ? "#475569" : "rgba(226,232,240,0.72)",
          fontSize: 15,
          fontWeight: 700
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: 99, background: "#ff5f57" }} />
        <span style={{ width: 12, height: 12, borderRadius: 99, background: "#ffbd2e" }} />
        <span style={{ width: 12, height: 12, borderRadius: 99, background: "#28c840" }} />
        <span style={{ marginLeft: 18 }}>{title}</span>
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "calc(100% - 48px)",
          borderRadius: 24,
          overflow: "hidden",
          background: light ? "#f8fafc" : "#06070b"
        }}
      >
        {src ? (
          <Img
            src={staticFile(src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transformOrigin: "center",
              ...imageStyle
            }}
          />
        ) : (
          children
        )}
        {shine ? (
          <div
            style={{
              position: "absolute",
              inset: "-25%",
              pointerEvents: "none",
              background: light
                ? "linear-gradient(110deg, transparent 42%, rgba(255,255,255,0.38) 48%, transparent 55%)"
                : "linear-gradient(110deg, transparent 42%, rgba(255,255,255,0.12) 48%, transparent 55%)",
              transform: `translateX(${shineX}%) rotate(0.001deg)`,
              opacity: 0.5,
              mixBlendMode: light ? "screen" : "plus-lighter"
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
