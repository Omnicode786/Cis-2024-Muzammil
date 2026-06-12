import type { CSSProperties, ReactNode } from "react";

type FloatingCardProps = {
  children: ReactNode;
  accent?: string;
  light?: boolean;
  style?: CSSProperties;
};

export function FloatingCard({ children, accent = "#5b8cff", light = false, style }: FloatingCardProps) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        padding: 28,
        background: light
          ? "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.86))"
          : "linear-gradient(180deg, rgba(18,23,35,0.88), rgba(8,10,16,0.78))",
        border: light ? "1px solid rgba(15,23,42,0.1)" : "1px solid rgba(255,255,255,0.12)",
        boxShadow: light
          ? "0 24px 70px rgba(15,23,42,0.14), inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 26px 90px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)",
        color: light ? "#0f172a" : "#f8fafc",
        overflow: "hidden",
        ...style
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 4,
          background: `linear-gradient(90deg, ${accent}, transparent)`
        }}
      />
      {children}
    </div>
  );
}

