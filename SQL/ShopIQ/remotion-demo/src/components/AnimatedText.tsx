import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { fadeBlurReveal, stagger, textRevealClip } from "../motion/motionSystem";

type AnimatedTextProps = {
  eyebrow?: string;
  title: string;
  body?: string;
  delay?: number;
  align?: "left" | "center";
  maxWidth?: number;
  children?: ReactNode;
};

export function AnimatedText({ eyebrow, title, body, delay = 0, align = "left", maxWidth = 920, children }: AnimatedTextProps) {
  const frame = useCurrentFrame();
  const lines = title.split("\n");
  const textAlign = align;

  return (
    <div style={{ maxWidth, textAlign }}>
      {eyebrow ? (
        <div
          style={{
            ...fadeBlurReveal(frame, { delay, duration: 34, y: 16, blur: 8 }),
            color: "#7da4ff",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 24
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div style={{ display: "grid", gap: 10 }}>
        {lines.map((line, index) => (
          <h1
            key={line}
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: 78,
              lineHeight: 0.96,
              letterSpacing: -1.6,
              fontWeight: 850,
              clipPath: textRevealClip(frame, delay + stagger(index, 12, 8), 56)
            }}
          >
            {line}
          </h1>
        ))}
      </div>
      {body ? (
        <p
          style={{
            ...fadeBlurReveal(frame, { delay: delay + 48, duration: 50, y: 22, blur: 10 }),
            margin: "28px 0 0",
            color: "rgba(226,232,240,0.78)",
            fontSize: 28,
            lineHeight: 1.42,
            fontWeight: 500
          }}
        >
          {body}
        </p>
      ) : null}
      {children}
    </div>
  );
}

