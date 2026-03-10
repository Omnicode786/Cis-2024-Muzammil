import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function StarField({ count = 1800, depth = 24, factor = 2.2, theme = 'dark' }) {
  const points = useRef();

  const { positions, colors, sizes } = useMemo(() => {
    const positionsArray = new Float32Array(count * 3);
    const colorsArray = new Float32Array(count * 3);
    const sizesArray = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      positionsArray[i3 + 0] = (Math.random() - 0.5) * depth * factor;
      positionsArray[i3 + 1] = (Math.random() - (theme === 'dark' ? 0.18 : 0.1)) * depth;
      positionsArray[i3 + 2] = -Math.random() * depth * 1.2;

      if (theme === 'dark') {
        const intensity = 0.55 + Math.random() * 0.45;
        color.setRGB(0.9 * intensity, 0.95 * intensity, 1 * intensity);
        sizesArray[i] = 0.03 + Math.random() * 0.06;
      } else {
        const warm = 0.72 + Math.random() * 0.18;
        color.setRGB(1.0 * warm, 0.96 * warm, 0.84 * warm);
        sizesArray[i] = 0.02 + Math.random() * 0.045;
      }

      colorsArray[i3 + 0] = color.r;
      colorsArray[i3 + 1] = color.g;
      colorsArray[i3 + 2] = color.b;
    }

    return { positions: positionsArray, colors: colorsArray, sizes: sizesArray };
  }, [count, depth, factor, theme]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.getElapsedTime();
    points.current.rotation.y = t * (theme === 'dark' ? 0.01 : 0.006);
    points.current.rotation.x = THREE.MathUtils.lerp(points.current.rotation.x, state.pointer.y * 0.06, 0.03);
    points.current.rotation.z = THREE.MathUtils.lerp(points.current.rotation.z, -state.pointer.x * 0.06, 0.03);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={theme === 'dark' ? 0.045 : 0.032}
        sizeAttenuation
        depthWrite={false}
        transparent
        opacity={theme === 'dark' ? 0.95 : 0.62}
        vertexColors
      />
    </points>
  );
}
