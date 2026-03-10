import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function CrescentMoon(props) {
  const group = useRef();
  const glow = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointerX = state.pointer.x;
    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.35) * 0.08;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointerX * 0.3, 0.05);
    }
    if (glow.current) {
      glow.current.material.opacity = 0.14 + Math.sin(t * 1.25) * 0.03 + Math.abs(pointerX) * 0.02;
      glow.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
    }
  });

  return (
    <group ref={group} {...props}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1, 0.35, 48, 128, Math.PI * 1.5]} />
        <meshStandardMaterial
          color="#fff9da"
          emissive="#facc15"
          emissiveIntensity={1.1}
          metalness={0.12}
          roughness={0.16}
        />
      </mesh>
      <mesh position={[0.45, 0.04, 0.26]}>
        <sphereGeometry args={[0.84, 64, 64]} />
        <meshBasicMaterial color="#020617" transparent opacity={1} />
      </mesh>
      <mesh ref={glow}>
        <sphereGeometry args={[1.75, 64, 64]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.16} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
