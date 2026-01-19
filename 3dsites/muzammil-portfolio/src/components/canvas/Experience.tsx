import { useMemo } from 'react';
import { Environment } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';

function PopObjects() {
    const count = 30;
    const colors = ['#FF3366', '#00CCFF', '#FFCC00', '#663399', '#00FF99'];
    const geometries = useMemo(() => [
        new THREE.TetrahedronGeometry(1),
        new THREE.OctahedronGeometry(1),
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.8, 32, 32),
    ], []);

    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <RigidBody
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 15,
                        Math.random() * 30 + 10,
                        (Math.random() - 0.5) * 5
                    ]}
                    restitution={0.8}
                    colliders="hull"
                    friction={0.5}
                >
                    <mesh
                        geometry={geometries[Math.floor(Math.random() * geometries.length)]}
                        castShadow
                        receiveShadow
                    >
                        <meshStandardMaterial color={colors[Math.floor(Math.random() * colors.length)]} metalness={0.1} roughness={0.2} />
                    </mesh>
                </RigidBody>
            ))}
        </group>
    )
}

export default function Experience() {
    return (
        <>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
            <Environment preset="studio" />

            <Physics gravity={[0, -2, 0]}>
                {/* Floor */}
                <RigidBody type="fixed" position={[0, -8, 0]} restitution={0.5}>
                    <mesh receiveShadow>
                        <boxGeometry args={[100, 1, 100]} />
                        <meshStandardMaterial color="#FFFBF0" transparent opacity={0} />
                    </mesh>
                </RigidBody>

                <PopObjects />
            </Physics>
        </>
    );
}
