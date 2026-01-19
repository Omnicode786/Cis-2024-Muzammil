import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Link } from 'react-router-dom';

function Model() {
    return (
        <mesh castShadow receiveShadow>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="#FF3366" roughness={0.1} metalness={0.5} />
        </mesh>
    );
}

export default function SpatialPlatform() {
    return (
        <div className="w-full h-screen bg-[#FFFBF0]">
            <Link to="/" className="absolute top-8 left-8 z-50 font-mono font-bold text-xl text-black border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                ← EXIT_SPATIAL
            </Link>

            <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }}>
                <Stage environment="city" intensity={0.6}>
                    <Model />
                </Stage>
                <OrbitControls autoRotate />
            </Canvas>

            <div className="absolute bottom-8 right-8 font-mono text-xs text-right opacity-50 pointer-events-none">
                <span className="font-bold text-lg">SPATIAL PLATFORM</span> <br />
                INTERACTIVE ARCHITECTURE
            </div>
        </div>
    );
}
