import { useMemo, useRef } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { waterVertexShader, waterFragmentShader } from './shaders/waterShader';

const WaterMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0.5, 0.5),
    uRippleStrength: 0,
    uThemeMix: 0,
  },
  waterVertexShader,
  waterFragmentShader,
);

extend({ WaterMaterial });

export default function WaterReflection({ mouse, ripple, theme }) {
  const materialRef = useRef();
  const moonRef = useRef();
  const glowRef = useRef();

  const moonGradient = useMemo(
    () => new THREE.Color(theme === 'dark' ? '#fef3c7' : '#fff8dc'),
    [theme],
  );

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uTime += delta;
    materialRef.current.uMouse.lerp(new THREE.Vector2(mouse.current.x, mouse.current.y), 0.08);
    materialRef.current.uRippleStrength = THREE.MathUtils.lerp(
      materialRef.current.uRippleStrength,
      ripple.current.strength,
      0.12,
    );
    materialRef.current.uThemeMix = THREE.MathUtils.lerp(
      materialRef.current.uThemeMix,
      theme === 'light' ? 1 : 0,
      0.06,
    );

    if (moonRef.current) {
      moonRef.current.position.x = THREE.MathUtils.lerp(moonRef.current.position.x, (mouse.current.x - 0.5) * 1.2, 0.04);
      moonRef.current.position.y = 1.72 + Math.sin(state.clock.getElapsedTime() * 0.6) * 0.07;
      moonRef.current.material.emissiveIntensity = (theme === 'dark' ? 1.25 : 0.65) + ripple.current.strength * 0.45;
    }

    if (glowRef.current) {
      glowRef.current.material.opacity = THREE.MathUtils.lerp(
        glowRef.current.material.opacity,
        (theme === 'dark' ? 0.12 : 0.08) + ripple.current.strength * 0.08,
        0.08,
      );
    }
  });

  return (
    <group position={[0, -0.52, 0]}>
      <mesh rotation={[-Math.PI / 2 + 0.22, 0, 0]} position={[0, -0.42, 0]}>
        <planeGeometry args={[18, 8, 420, 420]} />
        <waterMaterial ref={materialRef} transparent />
      </mesh>

      <mesh ref={moonRef} position={[0, 1.75, -4.25]}>
        <sphereGeometry args={[0.36, 48, 48]} />
        <meshStandardMaterial
          color={moonGradient}
          emissive={theme === 'dark' ? '#facc15' : '#fff0a5'}
          emissiveIntensity={theme === 'dark' ? 1.35 : 0.72}
          roughness={0.2}
          metalness={0.08}
        />
      </mesh>

      <mesh ref={glowRef} position={[0, 1.76, -4.28]}>
        <sphereGeometry args={[0.88, 40, 40]} />
        <meshBasicMaterial
          color={theme === 'dark' ? '#fde68a' : '#fff4c4'}
          transparent
          opacity={theme === 'dark' ? 0.12 : 0.08}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0.16, -5.4]}>
        <boxGeometry args={[7.8, 1.2, 0.1]} />
        <meshBasicMaterial color={theme === 'dark' ? '#08111f' : '#b5d0e5'} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
