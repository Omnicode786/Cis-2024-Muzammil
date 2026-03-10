import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import useMouseRipple from '../hooks/useMouseRipple';
import WaterReflection from '../three/WaterReflection';
import StarField from '../three/StarField';

function WaterScene({ mouse, ripple, theme }) {
  return (
    <>
      <ambientLight intensity={theme === 'dark' ? 0.84 : 0.19} />
      <directionalLight position={[2, 4, 2]} intensity={theme === 'dark' ? 0.98 : 1.2} color={theme === 'dark' ? '#fff7d6' : '#fff9ed'} />
      <pointLight position={[0, 4, -4]} intensity={theme === 'dark' ? 1.8 : 1.05} color={theme === 'dark' ? '#facc15' : '#fff0a8'} />
      <fog attach="fog" args={[theme === 'dark' ? '#061321' : '#d7e7f5', 4, 14]} />
      <StarField count={theme === 'dark' ? 12500 : 650} depth={14} factor={1.6} theme={theme} />
      <WaterReflection mouse={mouse} ripple={ripple} theme={theme} />
    </>
  );
}

export default function WaterFooter({ theme }) {
  const { mouse, ripple, bind } = useMouseRipple();

  return (
    <div className="water-shell" {...bind}>
      <Canvas camera={{ position: [0.1, 1.1, 4.1], fov: 16 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <WaterScene mouse={mouse} ripple={ripple} theme={theme} />
        </Suspense>
      </Canvas>

     

    </div>
  );
}
