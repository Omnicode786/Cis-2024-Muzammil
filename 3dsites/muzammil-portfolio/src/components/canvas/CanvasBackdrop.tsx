import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

export default function CanvasBackdrop() {
  const eventSource = typeof document !== 'undefined' ? document.body : undefined;

  return (
    <Canvas
      camera={{ position: [0, 0, 12.4], fov: 34 }}
      dpr={[1, 1.28]}
      eventPrefix="client"
      eventSource={eventSource}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
    >
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
}
