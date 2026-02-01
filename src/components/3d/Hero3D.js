import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei/native';

/**
 * @component EliteTechObject
 * @description Internal component. A premium 3D torus knot with interactive "breathing" animation and gold finishing.
 * @param {Object} props - Mesh props.
 */
function EliteTechObject(props) {
    const mesh = useRef(null);
    const [active, setActive] = useState(false);

    // Smooth auto-rotation with sine wave for organic feel
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.15;
            mesh.current.rotation.y += delta * 0.3;
            // Subtle breathing scale effect
            const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
            mesh.current.scale.setScalar(active ? 1.3 + breathe : 1.1 + breathe);
        }
    });

    return (
        <mesh
            {...props}
            ref={mesh}
            onClick={() => setActive(!active)}
        >
            <torusKnotGeometry args={[1, 0.35, 128, 32]} />
            <meshPhysicalMaterial
                // Elite Gold Color
                color={active ? '#CA8A04' : '#1C1917'}
                metalness={0.95}
                roughness={0.05}
                // Emissive glow when active
                emissive={active ? '#CA8A04' : '#000000'}
                emissiveIntensity={active ? 0.3 : 0}
                // Premium reflections
                clearcoat={1}
                clearcoatRoughness={0.1}
                reflectivity={1}
            />
        </mesh>
    );
}

/**
 * @component Hero3D
 * @description Elite 3D Scene for the App Hero Section.
 * Features:
 * - Premium gold lighting with dramatic shadows
 * - Studio-quality environment reflections
 * - Interactive floating object with luxury materials
 */
const Hero3D = () => {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{
                flex: 1,
                backgroundColor: 'transparent'
            }}
            gl={{
                preserveDrawingBuffer: true,
                antialias: true,
            }}
        >
            {/* Ambient Fill */}
            <ambientLight intensity={0.3} />

            {/* Main Key Light - Warm Gold */}
            <spotLight
                position={[5, 8, 5]}
                angle={0.3}
                penumbra={1}
                intensity={2}
                color="#FEF3C7"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            {/* Rim Light - Premium Gold Accent */}
            <pointLight
                position={[-5, 5, -5]}
                intensity={1.5}
                color="#CA8A04"
            />

            {/* Fill Light - Subtle Cyan for depth */}
            <pointLight
                position={[5, -5, 5]}
                intensity={0.5}
                color="#08D9D6"
            />

            {/* Floating Object with Premium Animation */}
            <Float
                speed={1.5}
                rotationIntensity={0.8}
                floatIntensity={0.8}
            >
                <EliteTechObject position={[0, 0, 0]} />
            </Float>

            {/* Soft Contact Shadow */}
            <ContactShadows
                position={[0, -2.5, 0]}
                opacity={0.4}
                scale={12}
                blur={3}
                far={4}
                color="#1C1917"
            />

            {/* Studio Environment for Premium Reflections */}
            <Environment preset="studio" />
        </Canvas>
    );
};

export default Hero3D;
