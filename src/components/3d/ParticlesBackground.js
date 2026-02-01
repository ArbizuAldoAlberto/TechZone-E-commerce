/**
 * @fileoverview 3D Particle Background
 * @description Ambient background effect using R3F.
 * Optimized for mobile performance (low poly count, simple shader).
 * 
 * @layer Presentation/Background
 */
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei/native';
import { View, StyleSheet } from 'react-native';

const PARTICLE_COUNT = 3000; // Reduced from 5000 for mobile stability

/**
 * @component
 * @description Renders a rotating sphere of particles.
 */
const ParticleField = (props) => {
    const ref = useRef();

    // Generate random points in a sphere (Lazy Init)
    const [sphere] = useState(() => {
        const points = new Float32Array(PARTICLE_COUNT * 3);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const r = 1.5 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);

            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            points[i * 3] = x;
            points[i * 3 + 1] = y;
            points[i * 3 + 2] = z;
        }
        return points;
    });

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color={props.color || "#00D2FF"}
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
};

const ParticlesBackground = () => {
    // Get theme from Redux
    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    const particleColor = isDarkMode ? "#00D2FF" : "#5856D6"; // Cyan for dark, Purple for light
    const backgroundColor = isDarkMode ? "#050510" : "#F2F2F7"; // Deep space vs Light Gray

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <Canvas camera={{ position: [0, 0, 1] }}>
                <ParticleField color={particleColor} />
            </Canvas>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
});

export default ParticlesBackground;
