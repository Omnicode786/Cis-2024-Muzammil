import { useMemo, useRef } from 'react';
import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type NodePoint = {
  position: THREE.Vector3;
  color: string;
  scale: number;
};

function signal(index: number) {
  const raw = Math.sin(index * 61.73) * 10000;
  return raw - Math.floor(raw);
}

function NeuralGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo<NodePoint[]>(
    () =>
      Array.from({ length: 34 }, (_, index) => {
        const layer = index % 5;
        const band = Math.floor(index / 5);
        return {
          position: new THREE.Vector3((layer - 2) * 2.7 + signal(index) * 0.7, (band - 3) * 1.2 + signal(index + 1) * 0.8, -5 - signal(index + 2) * 5),
          color: index % 3 === 0 ? '#5dffe8' : index % 3 === 1 ? '#baff5c' : '#7aa7ff',
          scale: 0.045 + signal(index + 4) * 0.055,
        };
      }),
    [],
  );

  const linePositions = useMemo(() => {
    const positions: number[] = [];
    nodes.forEach((node, index) => {
      const next = nodes[(index + 5) % nodes.length];
      const diagonal = nodes[(index + 7) % nodes.length];
      positions.push(node.position.x, node.position.y, node.position.z, next.position.x, next.position.y, next.position.z);
      if (index % 2 === 0) {
        positions.push(node.position.x, node.position.y, node.position.z, diagonal.position.x, diagonal.position.y, diagonal.position.z);
      }
    });
    return new Float32Array(positions);
  }, [nodes]);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y = elapsed * 0.035 + pointer.x * 0.12;
    groupRef.current.rotation.x = Math.sin(elapsed * 0.2) * 0.05 + pointer.y * 0.08;
  });

  return (
    <group ref={groupRef} position={[4.4, 0.2, -2.4]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#5dffe8" transparent opacity={0.2} />
      </lineSegments>

      {nodes.map((node, index) => (
        <mesh key={index} position={node.position} scale={node.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={1.4} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function SystemsCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const packetRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const elapsed = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = elapsed * 0.18 + pointer.x * 0.24;
      coreRef.current.rotation.x = Math.sin(elapsed * 0.28) * 0.12 + pointer.y * 0.1;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = -elapsed * 0.32;
    }

    if (packetRef.current) {
      packetRef.current.position.x = Math.sin(elapsed * 1.3) * 2.5;
      packetRef.current.position.y = Math.cos(elapsed * 1.1) * 1.1;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.32}>
      <group ref={coreRef} position={[1.5, -0.3, -0.2]}>
        <mesh castShadow>
          <icosahedronGeometry args={[1.45, 2]} />
          <meshStandardMaterial color="#0f1720" metalness={0.8} roughness={0.18} emissive="#123a4a" emissiveIntensity={0.18} />
        </mesh>

        <mesh ref={ringRef} rotation={[Math.PI / 2.35, 0, 0]}>
          <torusGeometry args={[2.15, 0.025, 18, 220]} />
          <meshStandardMaterial color="#5dffe8" emissive="#5dffe8" emissiveIntensity={1.5} />
        </mesh>

        <mesh rotation={[0.6, 0.3, 0.4]} scale={[0.92, 0.92, 0.92]}>
          <torusKnotGeometry args={[1.08, 0.08, 180, 12]} />
          <meshStandardMaterial color="#baff5c" emissive="#baff5c" emissiveIntensity={0.62} metalness={0.35} roughness={0.18} />
        </mesh>

        <mesh ref={packetRef} position={[0, 0, 1.7]} castShadow>
          <boxGeometry args={[0.34, 0.34, 0.34]} />
          <meshStandardMaterial color="#ff4d6d" emissive="#ff4d6d" emissiveIntensity={0.8} roughness={0.24} />
        </mesh>
      </group>
    </Float>
  );
}

export default function Experience() {
  return (
    <>
      <color attach="background" args={['#04080c']} />
      <fog attach="fog" args={['#04080c', 13, 34]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[-4, 6, 8]} intensity={1.4} />
      <pointLight position={[4, 2, 5]} intensity={2.2} color="#5dffe8" />
      <pointLight position={[-6, -3, 4]} intensity={1.8} color="#baff5c" />
      <NeuralGraph />
      <SystemsCore />
    </>
  );
}
