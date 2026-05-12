import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience';

export default function CanvasBackdrop() {
  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </Canvas>
  );
}
