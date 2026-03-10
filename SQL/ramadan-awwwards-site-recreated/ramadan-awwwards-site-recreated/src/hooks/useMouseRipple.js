import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function useMouseRipple() {
  const mouse = useRef({ x: 0.5, y: 0.45 });
  const ripple = useRef({ strength: 0, age: 0 });
  const frame = useRef(0);

  const excite = (strength = 1) => {
    ripple.current = { strength, age: 0 };
  };

  const bind = {
    onPointerMove: (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
      mouse.current = { x, y };
      excite(1);
    },
    onPointerEnter: () => excite(0.65),
    onPointerLeave: () => {
      ripple.current = { strength: 0.12, age: ripple.current.age };
    },
  };

  useEffect(() => {
    const animate = () => {
      const previous = ripple.current;
      ripple.current = {
        strength: Math.max(previous.strength - 0.022, 0),
        age: previous.age + 0.016,
      };
      frame.current = requestAnimationFrame(animate);
    };

    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  return { mouse, ripple, bind };
}
