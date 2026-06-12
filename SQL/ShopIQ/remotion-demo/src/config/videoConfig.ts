export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 60,
  durationSeconds: 150,
  compositionId: "SaaSDemo"
} as const;

export const SCENES = [
  { id: "intro", duration: 8 },
  { id: "context", duration: 12 },
  { id: "problem", duration: 17 },
  { id: "reveal", duration: 18 },
  { id: "featuresOne", duration: 27 },
  { id: "featuresTwo", duration: 27 },
  { id: "workflow", duration: 17 },
  { id: "trust", duration: 12 },
  { id: "final", duration: 12 }
] as const;

export const sceneStarts = SCENES.reduce<Record<string, number>>((acc, scene, index) => {
  const secondsBefore = SCENES.slice(0, index).reduce((total, item) => total + item.duration, 0);
  acc[scene.id] = secondsBefore * VIDEO.fps;
  return acc;
}, {});

export const sceneDuration = (id: (typeof SCENES)[number]["id"]) => {
  const scene = SCENES.find((item) => item.id === id);
  return (scene?.duration ?? 0) * VIDEO.fps;
};

export const COLORS = {
  ink: "#090b12",
  inkSoft: "#111827",
  white: "#f8fafc",
  muted: "#a6adbd",
  orange: "#ff3d1f",
  amber: "#ffc857",
  blue: "#5b8cff",
  violet: "#8d5cff",
  emerald: "#18c37e",
  rose: "#f44f78"
} as const;
