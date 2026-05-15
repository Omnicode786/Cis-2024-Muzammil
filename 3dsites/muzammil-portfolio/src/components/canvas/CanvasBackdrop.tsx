import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

export default function CanvasBackdrop() {
  return (
    <Canvas
      camera={{ position: [0, 0, 14], fov: 38 }}
      dpr={[1, 1.55]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
}
