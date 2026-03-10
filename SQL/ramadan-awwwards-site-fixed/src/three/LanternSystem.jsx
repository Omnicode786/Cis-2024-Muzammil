import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Lantern({ position, speed, phase, scale = 1 }) {
  const group = useRef();
  const lamp = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.32;
      group.current.rotation.z = Math.sin(t * 0.45 + phase) * 0.12 + state.pointer.x * 0.08;
      group.current.rotation.x = Math.cos(t * 0.4 + phase) * 0.08 + state.pointer.y * 0.05;
    }
    if (lamp.current) {
      lamp.current.material.emissiveIntensity = 1.6 + Math.sin(t * 2 + phase) * 0.18;
    }
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.55, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh ref={lamp} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.27, 0.5, 6, 1, false]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#facc15"
          emissiveIntensity={1.65}
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

export default function LanternSystem({ count = 14, radius = 9, baseY = 0 }) {
  const lanterns = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2;
        const distance = radius * (0.45 + Math.random() * 0.75);
        return {
          key: index,
          position: [Math.cos(angle) * distance, baseY + Math.random() * 3.5, -3.5 + Math.sin(angle) * 4.5],
          speed: 0.45 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
          scale: 0.8 + Math.random() * 0.55,
        };
      }),
    [count, radius, baseY],
  );

  return (
    <group>
      {lanterns.map((lantern) => (
        <Lantern key={lantern.key} {...lantern} />
      ))}
    </group>
  );
}
