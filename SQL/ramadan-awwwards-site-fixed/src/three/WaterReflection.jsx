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
    uHover: 0,
  },
  waterVertexShader,
  waterFragmentShader,
);

export default function WaterReflection({ mouse, ripple }) {
  const materialRef = useRef();
  const moonRef = useRef();

  const moonGradient = useMemo(() => new THREE.Color('#fef3c7'), []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uTime += delta;
    materialRef.current.uMouse.lerp(new THREE.Vector2(mouse.current.x, mouse.current.y), 0.08);
    materialRef.current.uRippleStrength = THREE.MathUtils.lerp(
      materialRef.current.uRippleStrength,
      ripple.current.strength,
      0.12,
    );
    materialRef.current.uHover = ripple.current.strength;

    if (moonRef.current) {
      moonRef.current.position.x = THREE.MathUtils.lerp(moonRef.current.position.x, (mouse.current.x - 0.5) * 1.8, 0.04);
      moonRef.current.position.y = 1.9 + Math.sin(state.clock.getElapsedTime() * 0.75) * 0.08;
      moonRef.current.material.emissiveIntensity = 1.25 + ripple.current.strength * 0.55;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      <mesh rotation={[-Math.PI / 2 + 0.16, 0, 0]} position={[0, -0.45, 0]}>
        <planeGeometry args={[22, 12, 320, 320]} />
        <waterMaterial ref={materialRef} transparent />
      </mesh>

      <mesh ref={moonRef} position={[0, 1.9, -4.4]}>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshStandardMaterial
          color={moonGradient}
          emissive="#facc15"
          emissiveIntensity={1.3}
          roughness={0.18}
          metalness={0.08}
        />
      </mesh>

      <mesh position={[0, 0.2, -5.6]}>
        <boxGeometry args={[7.5, 1.5, 0.1]} />
        <meshBasicMaterial color="#0b1220" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

extend({ WaterMaterial });
