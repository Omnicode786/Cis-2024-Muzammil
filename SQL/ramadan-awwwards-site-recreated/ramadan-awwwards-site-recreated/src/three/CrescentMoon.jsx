import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function createMoonMaps(theme = 'dark') {
  const size = 768;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;

  const base = theme === 'dark' ? '#eee6c8' : '#e9edf1';
  const shadow = theme === 'dark' ? '#b8ae8a' : '#b8c2cc';
  const highlight = theme === 'dark' ? '#fff8e3' : '#ffffff';

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const radial = ctx.createRadialGradient(size * 0.35, size * 0.32, size * 0.08, size * 0.5, size * 0.5, size * 0.65);
  radial.addColorStop(0, highlight);
  radial.addColorStop(0.55, base);
  radial.addColorStop(1, shadow);
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 220; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 6 + Math.random() * 42;
    const crater = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.25, radius * 0.08, x, y, radius);
    crater.addColorStop(0, theme === 'dark' ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.45)');
    crater.addColorStop(0.4, theme === 'dark' ? 'rgba(207,198,165,0.28)' : 'rgba(203,213,225,0.32)');
    crater.addColorStop(1, theme === 'dark' ? 'rgba(71,63,47,0.12)' : 'rgba(71,85,105,0.12)');
    ctx.fillStyle = crater;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 2800; i += 1) {
    const alpha = Math.random() * 0.04;
    ctx.fillStyle = theme === 'dark' ? `rgba(255,255,255,${alpha})` : `rgba(15,23,42,${alpha})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;

  const roughnessCanvas = document.createElement('canvas');
  const roughnessCtx = roughnessCanvas.getContext('2d');
  roughnessCanvas.width = size;
  roughnessCanvas.height = size;
  roughnessCtx.fillStyle = theme === 'dark' ? '#909090' : '#c0c6d0';
  roughnessCtx.fillRect(0, 0, size, size);
  for (let i = 0; i < 240; i += 1) {
    const shade = Math.floor(80 + Math.random() * 100);
    roughnessCtx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    roughnessCtx.beginPath();
    roughnessCtx.arc(Math.random() * size, Math.random() * size, 8 + Math.random() * 36, 0, Math.PI * 2);
    roughnessCtx.fill();
  }
  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
  roughnessMap.anisotropy = 8;

  return { texture, roughnessMap };
}

export default function CrescentMoon({ theme = 'dark', ...props }) {
  const group = useRef();
  const glow = useRef();
  const moon = useRef();
  const shadowMoon = useRef();

  const maps = useMemo(() => createMoonMaps(theme), [theme]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;

    if (group.current) {
      group.current.rotation.z = Math.sin(t * 0.26) * 0.09;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointerX * 0.26, 0.04);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointerY * 0.12, 0.04);
    }

    if (moon.current) {
      moon.current.rotation.y += 0.0012;
      moon.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        moon.current.material.emissiveIntensity,
        theme === 'dark' ? 0.48 + Math.abs(pointerX) * 0.2 : 0.16 + Math.abs(pointerX) * 0.08,
        0.08,
      );
    }

    if (shadowMoon.current) {
      shadowMoon.current.position.x = theme === 'dark' ? 0.55 : 0.46;
    }

    if (glow.current) {
      glow.current.material.opacity = (theme === 'dark' ? 0.18 : 0.11) + Math.sin(t * 1.15) * 0.025;
      glow.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.03);
    }
  });

  return (
    <group ref={group} {...props}>
      <mesh ref={moon} castShadow receiveShadow>
        <sphereGeometry args={[1.02, 144, 144]} />
        <meshStandardMaterial
          map={maps.texture}
          bumpMap={maps.texture}
          bumpScale={theme === 'dark' ? 0.08 : 0.05}
          displacementMap={maps.roughnessMap}
          displacementScale={theme === 'dark' ? 0.035 : 0.018}
          roughnessMap={maps.roughnessMap}
          color={theme === 'dark' ? '#f1ead2' : '#edf2f7'}
          emissive={theme === 'dark' ? '#facc15' : '#f8e16d'}
          emissiveIntensity={theme === 'dark' ? 0.52 : 0.15}
          metalness={0.04}
          roughness={0.92}
        />
      </mesh>

      <mesh ref={shadowMoon} position={[theme === 'dark' ? 0.55 : 0.46, 0.03, 0.38]}>
        <sphereGeometry args={[0.98, 96, 96]} />
        <meshBasicMaterial color={theme === 'dark' ? '#071224' : '#deedf8'} transparent opacity={1} />
      </mesh>

      <mesh ref={glow}>
        <sphereGeometry args={[1.95, 64, 64]} />
        <meshBasicMaterial
          color={theme === 'dark' ? '#fde68a' : '#fff4c7'}
          transparent
          opacity={theme === 'dark' ? 0.18 : 0.11}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
