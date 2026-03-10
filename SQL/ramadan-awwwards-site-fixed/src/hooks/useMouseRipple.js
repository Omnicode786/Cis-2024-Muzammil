import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function useMouseRipple() {
  const mouse = useRef({ x: 0.5, y: 0.6 });
  const ripple = useRef({ strength: 0, age: 0 });
  const frame = useRef(0);
  const lastMoveTime = useRef(0);

  useEffect(() => {
    const onMove = (event) => {
      const x = clamp(event.clientX / window.innerWidth, 0, 1);
      const y = clamp(1 - event.clientY / window.innerHeight, 0, 1);
      mouse.current = { x, y };
      lastMoveTime.current = performance.now();
      ripple.current = { strength: 1, age: 0 };
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const animate = () => {
      const previous = ripple.current;
      const idleBoost = performance.now() - lastMoveTime.current < 180 ? 0.045 : 0.018;
      ripple.current = {
        strength: Math.max(previous.strength - idleBoost, 0),
        age: previous.age + 0.016,
      };
      frame.current = requestAnimationFrame(animate);
    };

    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  return { mouse, ripple };
}
