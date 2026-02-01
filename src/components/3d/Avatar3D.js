import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Icosahedron, Float } from '@react-three/drei/native';

const AvatarMesh = (props) => {
    const mesh = useRef(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.y += delta * 0.5;
            mesh.current.rotation.x += delta * 0.2;
        }
    });

    return (
        <group {...props}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <Icosahedron
                    ref={mesh}
                    args={[1, 0]}
                    scale={hovered ? 1.2 : 1}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                >
                    <MeshDistortMaterial
                        color={hovered ? "#FF0055" : "#00D2FF"}
                        attach="material"
                        distort={0.6}
                        speed={2}
                        roughness={0}
                        metalness={0.9}
                    />
                </Icosahedron>
            </Float>
        </group>
    );
};

const Avatar3D = () => {
    return (
        <View style={styles.container}>
            <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <AvatarMesh position={[0, 0, 0]} />
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        backgroundColor: '#1a1a2e', // Dark background for contrast
        borderWidth: 2,
        borderColor: '#00D2FF',
    },
});

export default Avatar3D;
