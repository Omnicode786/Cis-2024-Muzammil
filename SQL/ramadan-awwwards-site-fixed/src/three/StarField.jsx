import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StarField({ count = 1800, depth = 24, factor = 2.2 }) {
  const points = useRef();

  const { positions, colors } = useMemo(() => {
    const positionsArray = new Float32Array(count * 3);
    const colorsArray = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positionsArray[i3 + 0] = (Math.random() - 0.5) * depth * factor;
      positionsArray[i3 + 1] = (Math.random() - 0.2) * depth;
      positionsArray[i3 + 2] = -Math.random() * depth * 1.2;

      const intensity = 0.6 + Math.random() * 0.4;
      color.setRGB(0.9 * intensity, 0.95 * intensity, 1 * intensity);
      colorsArray[i3 + 0] = color.r;
      colorsArray[i3 + 1] = color.g;
      colorsArray[i3 + 2] = color.b;
    }

    return { positions: positionsArray, colors: colorsArray };
  }, [count, depth, factor]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.getElapsedTime();
    points.current.rotation.y = t * 0.01;
    points.current.rotation.x = THREE.MathUtils.lerp(points.current.rotation.x, state.pointer.y * 0.08, 0.04);
    points.current.rotation.z = THREE.MathUtils.lerp(points.current.rotation.z, -state.pointer.x * 0.08, 0.04);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        transparent
        opacity={0.95}
        vertexColors
      />
    </points>
  );
}
