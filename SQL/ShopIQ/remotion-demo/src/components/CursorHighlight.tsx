import { MousePointer2 } from "lucide-react";
import { useCurrentFrame } from "remotion";
import { cursorPoint, highlightPulse } from "../motion/motionSystem";

type CursorHighlightProps = {
  points: Array<{ frame: number; x: number; y: number }>;
  delay?: number;
  color?: string;
};

export function CursorHighlight({ points, delay = 0, color = "#5b8cff" }: CursorHighlightProps) {
  const frame = useCurrentFrame();
  const point = cursorPoint(frame, points);
  const pulse = highlightPulse(frame, delay);
  const visible = frame >= delay ? 1 : 0;

  return (
    <div style={{ position: "absolute", left: point.x, top: point.y, opacity: visible, transform: "translate(-8px, -6px)" }}>
      <div
        style={{
          position: "absolute",
          left: 18,
          top: 18,
          width: 88,
          height: 88,
          borderRadius: 999,
          border: `2px solid ${color}88`,
          ...pulse
        }}
      />
      <MousePointer2 size={40} color="#f8fafc" fill="#0b1220" strokeWidth={2.2} />
    </div>
  );
}

