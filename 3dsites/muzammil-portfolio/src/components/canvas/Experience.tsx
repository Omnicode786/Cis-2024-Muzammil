import { useEffect, useMemo, useRef, useState } from 'react';
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
  drift?: number;
  interactive?: boolean;
};

const placements: ModelPlacement[] = [
  { model: 'treeDetailed', position: [-1.55, -1.75, -1.45], rotation: [0, -0.32, 0], scale: 0.72, drift: 0.22, interactive: true },
  { model: 'treeOak', position: [1.32, -1.8, -1.75], rotation: [0, 0.38, 0], scale: 0.62, drift: -0.18, interactive: true },
  { model: 'treePine', position: [2.35, -1.92, -2.45], rotation: [0, -0.22, 0], scale: 0.48, drift: 0.15, interactive: true },
  { model: 'treePine', position: [-2.55, -1.96, -2.2], rotation: [0, 0.18, 0], scale: 0.44, drift: -0.12, interactive: true },
  { model: 'treeOak', position: [-3.75, -2.02, -4.15], rotation: [0, 0.28, 0], scale: 0.48, drift: -0.3 },
  { model: 'treeDetailed', position: [3.68, -2.02, -4.35], rotation: [0, -0.44, 0], scale: 0.52, drift: 0.28 },
  { model: 'treePine', position: [-4.55, -2.12, -5.25], rotation: [0, 0.18, 0], scale: 0.38, drift: 0.35 },
  { model: 'treePine', position: [4.72, -2.1, -5.1], rotation: [0, -0.18, 0], scale: 0.36, drift: -0.32 },
  { model: 'bush', position: [-0.42, -1.95, -0.86], rotation: [0, 0.68, 0], scale: 0.64, drift: 0.1, interactive: true },
  { model: 'bush', position: [2.85, -2.08, -1.25], rotation: [0, -0.45, 0], scale: 0.42, drift: -0.08, interactive: true },
  { model: 'bush', position: [-3.24, -2.06, -1.48], rotation: [0, 0.26, 0], scale: 0.4, drift: 0.16 },
  { model: 'grass', position: [-2.95, -2.04, -0.72], rotation: [0, 0.2, 0], scale: 0.7, drift: 0.12, interactive: true },
  { model: 'grass', position: [0.3, -2.04, -2.35], rotation: [0, -0.4, 0], scale: 0.58, drift: -0.16 },
  { model: 'grass', position: [3.5, -2.08, -2.05], rotation: [0, 0.34, 0], scale: 0.48, drift: 0.2 },
  { model: 'flower', position: [-0.98, -2.04, -0.72], rotation: [0, 0.22, 0], scale: 0.48, drift: 0.08, interactive: true },
  { model: 'flower', position: [0.95, -2.04, -0.7], rotation: [0, -0.28, 0], scale: 0.45, drift: -0.1, interactive: true },
  { model: 'flower', position: [-3.72, -2.08, -1.92], rotation: [0, 0.5, 0], scale: 0.36, drift: 0.18 },
  { model: 'flower', position: [3.94, -2.08, -2.42], rotation: [0, -0.2, 0], scale: 0.34, drift: -0.14 },
  { model: 'rock', position: [0.0, -2.05, -1.08], rotation: [0, 0.54, 0], scale: 0.38, drift: 0.04, interactive: true },
  { model: 'rock', position: [-1.88, -2.1, -2.82], rotation: [0, -0.22, 0], scale: 0.28, drift: -0.12 },
  { model: 'rock', position: [2.1, -2.12, -3.04], rotation: [0, 0.32, 0], scale: 0.24, drift: 0.16 },
  { model: 'mushroom', position: [1.92, -2.06, -0.78], rotation: [0, -0.25, 0], scale: 0.42, drift: -0.08, interactive: true },
  { model: 'mushroom', position: [-2.92, -2.08, -1.16], rotation: [0, 0.25, 0], scale: 0.31, drift: 0.14 },
  { model: 'lily', position: [-2.05, -2.05, -0.62], rotation: [0, 0.18, 0], scale: 0.44, drift: 0.11, interactive: true },
  { model: 'lily', position: [2.92, -2.08, -0.54], rotation: [0, -0.18, 0], scale: 0.34, drift: -0.1 },
  { model: 'moss', position: [-0.05, 0.86, -1.1], rotation: [0.18, -0.25, 0.02], scale: 0.78, drift: -0.2, interactive: true },
  { model: 'moss', position: [1.8, 0.52, -1.7], rotation: [0.14, 0.38, -0.03], scale: 0.54, drift: 0.18, interactive: true },
  { model: 'moss', position: [-2.28, 0.34, -2.35], rotation: [0.18, -0.1, 0.03], scale: 0.48, drift: -0.24 },
  { model: 'moss', position: [3.05, 0.08, -2.95], rotation: [0.12, 0.3, -0.04], scale: 0.38, drift: 0.22 },
];

const interactiveSelector =
  'a, button, input, textarea, select, nav, [role="dialog"], [data-no-canvas-interaction], .story-node, .soft-card, .skill-card-live, .tree-root-card, .timeline-leaf-card, .magnetic-button';

function getScrollProgress() {
  if (typeof window === 'undefined') return 0;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (documentHeight <= 0) return 0;
  return THREE.MathUtils.clamp(window.scrollY / documentHeight, 0, 1);
}

function isUiTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(interactiveSelector));
}

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

type ForestModelProps = ModelPlacement & {
  index: number;
  source: THREE.Object3D;
  scrollProgress: { current: number };
};

function ForestModel({ index, source, position, rotation, scale, drift = 0, interactive = false, scrollProgress }: ForestModelProps) {
  const objectRef = useRef<THREE.Object3D>(null);
  const [hovered, setHovered] = useState(false);
  const [activated, setActivated] = useState(false);

  const object = useMemo(() => polishModel(source.clone(true)), [source]);

  useEffect(() => {
    if (!interactive || !hovered) return undefined;
    document.body.classList.add('model-hovering');
    return () => document.body.classList.remove('model-hovering');
  }, [hovered, interactive]);

  useFrame(({ clock, pointer }) => {
    if (!objectRef.current) return;
    const elapsed = clock.getElapsedTime();
    const progress = scrollProgress.current;
    const depthFactor = THREE.MathUtils.clamp(Math.abs(position[2]) / 5.5, 0.18, 1);
    const hoverBoost = hovered ? 1 : 0;
    const activeBoost = activated ? 1 : 0;
    const float = Math.sin(elapsed * (0.42 + index * 0.006) + index * 0.8) * (0.018 + depthFactor * 0.036);
    const scrollSweep = (progress - 0.5) * drift;
    const pointerDrift = interactive ? pointer.x * (0.025 + depthFactor * 0.035) : pointer.x * 0.012;
    const targetScale = scale * (1 + hoverBoost * 0.12 + activeBoost * 0.08);

    objectRef.current.position.x = position[0] + scrollSweep + pointerDrift + Math.sin(elapsed * 0.18 + index) * 0.018;
    objectRef.current.position.y = position[1] + float + progress * (0.12 - depthFactor * 0.28);
    objectRef.current.position.z = position[2] + progress * (0.18 + depthFactor * 0.62);
    objectRef.current.rotation.x = rotation[0] + Math.sin(elapsed * 0.28 + index) * (0.012 + hoverBoost * 0.025);
    objectRef.current.rotation.y = THREE.MathUtils.lerp(
      objectRef.current.rotation.y,
      rotation[1] + pointer.x * 0.055 + progress * (0.22 + drift * 0.16) + activeBoost * Math.sin(elapsed * 1.8) * 0.18,
      0.065,
    );
    objectRef.current.rotation.z = rotation[2] + Math.sin(elapsed * 0.22 + index * 0.4) * (0.006 + hoverBoost * 0.018);

    const smoothScale = THREE.MathUtils.lerp(objectRef.current.scale.x, targetScale, 0.08);
    objectRef.current.scale.setScalar(smoothScale);
  });

  return (
    <primitive
      ref={objectRef}
      object={object}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={(event) => {
        if (!interactive || isUiTarget(event.nativeEvent.target)) return;
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={(event) => {
        if (!interactive || isUiTarget(event.nativeEvent.target)) return;
        event.stopPropagation();
        setActivated((value) => !value);
      }}
    />
  );
}

function ModelGrove() {
  const groveRef = useRef<THREE.Group>(null);
  const scrollProgress = useRef(0);
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

  useFrame(({ clock, pointer, camera }) => {
    if (!groveRef.current) return;
    const elapsed = clock.getElapsedTime();
    const targetScroll = getScrollProgress();
    scrollProgress.current = THREE.MathUtils.lerp(scrollProgress.current, targetScroll, 0.055);
    const progress = scrollProgress.current;

    groveRef.current.rotation.y = Math.sin(elapsed * 0.18) * 0.045 + pointer.x * 0.055 + progress * 0.34;
    groveRef.current.rotation.x = Math.sin(elapsed * 0.16) * 0.018 + pointer.y * 0.025 - progress * 0.06;
    groveRef.current.position.x = 0.48 + Math.sin(progress * Math.PI * 2) * 0.22;
    groveRef.current.position.y = 0.1 + Math.sin(elapsed * 0.36) * 0.055 - progress * 0.28;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.48, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.18 + progress * 0.12, 0.035);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 11.85 - progress * 1.25, 0.035);
    camera.lookAt(0, -0.18 + progress * 0.22, -0.72);
  });

  return (
    <group ref={groveRef} position={[0.48, 0.1, -0.28]} scale={1.34}>
      {placements.map((item, index) => (
        <ForestModel
          key={`${item.model}-${index}`}
          {...item}
          index={index}
          source={scenes[item.model]}
          scrollProgress={scrollProgress}
        />
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
