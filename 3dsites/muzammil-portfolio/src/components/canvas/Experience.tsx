import { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const modelPaths = {
  treeDetailed: '/assets/models/kenney-tree-detailed.glb',
  treeOak: '/assets/models/kenney-tree-oak.glb',
  treePine: '/assets/models/kenney-tree-pine-round.glb',
  bush: '/assets/models/kenney-bush-detailed.glb',
  grass: '/assets/models/kenney-grass-large.glb',
  flower: '/assets/models/kenney-flower-yellow.glb',
  rock: '/assets/models/kenney-rock-large.glb',
  mushroom: '/assets/models/kenney-mushroom-red-group.glb',
  lily: '/assets/models/kenney-lily-large.glb',
  moss: '/assets/models/kenney-hanging-moss.glb',
} as const;

type ModelKey = keyof typeof modelPaths;

type ModelPlacement = {
  model: ModelKey;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

const placements: ModelPlacement[] = [
  { model: 'treeDetailed', position: [-1.55, -1.75, -1.45], rotation: [0, -0.32, 0], scale: 0.72 },
  { model: 'treeOak', position: [1.32, -1.8, -1.75], rotation: [0, 0.38, 0], scale: 0.62 },
  { model: 'treePine', position: [2.35, -1.92, -2.45], rotation: [0, -0.22, 0], scale: 0.48 },
  { model: 'treePine', position: [-2.55, -1.96, -2.2], rotation: [0, 0.18, 0], scale: 0.44 },
  { model: 'bush', position: [-0.42, -1.95, -0.86], rotation: [0, 0.68, 0], scale: 0.64 },
  { model: 'bush', position: [2.85, -2.08, -1.25], rotation: [0, -0.45, 0], scale: 0.42 },
  { model: 'grass', position: [-2.95, -2.04, -0.72], rotation: [0, 0.2, 0], scale: 0.7 },
  { model: 'grass', position: [0.3, -2.04, -2.35], rotation: [0, -0.4, 0], scale: 0.58 },
  { model: 'flower', position: [-0.98, -2.04, -0.72], rotation: [0, 0.22, 0], scale: 0.48 },
  { model: 'flower', position: [0.95, -2.04, -0.7], rotation: [0, -0.28, 0], scale: 0.45 },
  { model: 'rock', position: [0.0, -2.05, -1.08], rotation: [0, 0.54, 0], scale: 0.38 },
  { model: 'mushroom', position: [1.92, -2.06, -0.78], rotation: [0, -0.25, 0], scale: 0.42 },
  { model: 'lily', position: [-2.05, -2.05, -0.62], rotation: [0, 0.18, 0], scale: 0.44 },
  { model: 'moss', position: [-0.05, 0.86, -1.1], rotation: [0.18, -0.25, 0.02], scale: 0.78 },
  { model: 'moss', position: [1.8, 0.52, -1.7], rotation: [0.14, 0.38, -0.03], scale: 0.54 },
];

function polishModel(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const materialIsArray = Array.isArray(mesh.material);
    const materials = materialIsArray ? mesh.material : [mesh.material];
    const clonedMaterials = materials.map((material) => {
      const cloned = material.clone();
      const standard = cloned as THREE.MeshStandardMaterial;
      if ('roughness' in standard) standard.roughness = Math.max(standard.roughness ?? 0.7, 0.78);
      if ('metalness' in standard) standard.metalness = 0.02;
      if ('emissiveIntensity' in standard) standard.emissiveIntensity = 0.035;
      return cloned;
    });

    mesh.material = materialIsArray ? clonedMaterials : clonedMaterials[0];
  });
  return object;
}

function ModelGrove() {
  const groveRef = useRef<THREE.Group>(null);
  const treeDetailed = useGLTF(modelPaths.treeDetailed).scene;
  const treeOak = useGLTF(modelPaths.treeOak).scene;
  const treePine = useGLTF(modelPaths.treePine).scene;
  const bush = useGLTF(modelPaths.bush).scene;
  const grass = useGLTF(modelPaths.grass).scene;
  const flower = useGLTF(modelPaths.flower).scene;
  const rock = useGLTF(modelPaths.rock).scene;
  const mushroom = useGLTF(modelPaths.mushroom).scene;
  const lily = useGLTF(modelPaths.lily).scene;
  const moss = useGLTF(modelPaths.moss).scene;

  const scenes = useMemo(
    () => ({
      treeDetailed,
      treeOak,
      treePine,
      bush,
      grass,
      flower,
      rock,
      mushroom,
      lily,
      moss,
    }),
    [treeDetailed, treeOak, treePine, bush, grass, flower, rock, mushroom, lily, moss],
  );

  const models = useMemo(
    () =>
      placements.map((placement) => ({
        ...placement,
        object: polishModel(scenes[placement.model].clone(true)),
      })),
    [scenes],
  );

  useFrame(({ clock, pointer }) => {
    if (!groveRef.current) return;
    const elapsed = clock.getElapsedTime();
    groveRef.current.rotation.y = Math.sin(elapsed * 0.18) * 0.045 + pointer.x * 0.055;
    groveRef.current.rotation.x = Math.sin(elapsed * 0.16) * 0.018 + pointer.y * 0.025;
    groveRef.current.position.y = Math.sin(elapsed * 0.36) * 0.055;
  });

  return (
    <group ref={groveRef} position={[0.48, 0.1, -0.28]}>
      {models.map((item, index) => (
        <primitive key={`${item.model}-${index}`} object={item.object} position={item.position} rotation={item.rotation} scale={item.scale} />
      ))}
    </group>
  );
}

export default function Experience() {
  return (
    <>
      <color attach="background" args={['#fff8eb']} />
      <fog attach="fog" args={['#fff8eb', 9, 31]} />
      <hemisphereLight color="#fff6d7" groundColor="#c7dec5" intensity={1.45} />
      <ambientLight intensity={1.05} />
      <directionalLight position={[-5, 7, 8]} intensity={1.55} color="#fff2c9" />
      <pointLight position={[4, 3, 5]} intensity={0.75} color="#a8d58c" />
      <pointLight position={[-5, -2, 4]} intensity={0.55} color="#8cc6bd" />
      <ModelGrove />
    </>
  );
}

Object.values(modelPaths).forEach((path) => useGLTF.preload(path));
