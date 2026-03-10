import { useMemo } from 'react';

function Dome({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.75, 48, 48, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <coneGeometry args={[0.08, 0.25, 8]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.65} />
      </mesh>
    </group>
  );
}

function Minaret({ position = [0, 0, 0], height = 2.7 }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.18, 0.26, height, 10]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.08} />
      </mesh>
      <mesh position={[0, height + 0.25, 0]}>
        <sphereGeometry args={[0.25, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.08} />
      </mesh>
      <mesh position={[0, height + 0.58, 0]}>
        <coneGeometry args={[0.05, 0.18, 8]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function MosqueEnvironment({ position = [0, -1.8, -5] }) {
  const windows = useMemo(
    () => Array.from({ length: 7 }, (_, index) => -1.8 + index * 0.6),
    [],
  );

  return (
    <group position={position}>
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <boxGeometry args={[10, 0.35, 6]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>

      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 1.6, 2.2]} />
        <meshStandardMaterial color="#0b1220" roughness={0.95} metalness={0.06} />
      </mesh>

      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[3.25, 0.9, 2.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} />
      </mesh>

      <Dome position={[0, 2.35, 0]} scale={1.2} />
      <Dome position={[-1.75, 1.62, 0]} scale={0.75} />
      <Dome position={[1.75, 1.62, 0]} scale={0.75} />
      <Minaret position={[-3.2, 0.25, 0]} />
      <Minaret position={[3.2, 0.25, 0]} />

      {windows.map((x) => (
        <mesh key={x} position={[x, 0.85, 1.13]}>
          <boxGeometry args={[0.22, 0.4, 0.02]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.28} />
        </mesh>
      ))}

      <mesh position={[0, 0.45, 1.13]}>
        <boxGeometry args={[0.7, 1.1, 0.02]} />
        <meshBasicMaterial color="#facc15" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}
