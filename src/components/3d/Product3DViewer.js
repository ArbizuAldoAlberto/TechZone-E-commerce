import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Environment, OrbitControls } from '@react-three/drei/native';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { COLORS, ANIMATION } from '../../theme';

// Conditional import for gesture handler (not supported on web)
let Gesture, GestureDetector, GestureHandlerRootView;
if (Platform.OS !== 'web') {
    const GH = require('react-native-gesture-handler');
    Gesture = GH.Gesture;
    GestureDetector = GH.GestureDetector;
    GestureHandlerRootView = GH.GestureHandlerRootView;
}

/**
 * @component SceneLighting
 * @description Centralized premium lighting setup for 3D scenes.
 */
const SceneLighting = () => (
    <>
        <ambientLight intensity={0.4} />
        <spotLight
            position={[8, 10, 8]}
            angle={0.25}
            penumbra={1}
            intensity={2.5}
            color="#FEF3C7"
            castShadow
        />
        <pointLight position={[-8, 5, -5]} intensity={2} color="#CA8A04" />
        <pointLight position={[5, -5, 8]} intensity={0.6} color="#08D9D6" />
    </>
);

/**
 * @component ProductMesh
 * @description Elite product mesh with gesture-controlled rotation.
 */
function ProductMesh({ rotationX, rotationY, isWeb, ...props }) {
    const mesh = useRef(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (mesh.current) {
            if (!isWeb && rotationX && rotationY) {
                mesh.current.rotation.x = rotationX.value;
                mesh.current.rotation.y = rotationY.value;
                if (!hovered) rotationY.value += delta * 0.3;
            }
        }
    });

    return (
        <mesh
            {...props}
            ref={mesh}
            scale={hovered ? 1.05 : 1}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <boxGeometry args={[1.6, 2.2, 0.4]} />
            <meshPhysicalMaterial
                color={hovered ? '#CA8A04' : '#1C1917'}
                metalness={0.9}
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.05}
                reflectivity={1}
                emissive={hovered ? '#CA8A04' : '#000000'}
                emissiveIntensity={hovered ? 0.15 : 0}
            />
        </mesh>
    );
}

/**
 * @component Product3DViewer
 * @description Elite interactive 3D product viewer with gesture controls.
 */
const Product3DViewer = () => {
    const isWeb = Platform.OS === 'web';
    const rotationX = useSharedValue(0);
    const rotationY = useSharedValue(0);

    const SceneContent = ({ isWeb }) => (
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 40 }} style={{ flex: 1 }} gl={{ antialias: true }}>
            <SceneLighting />
            <Float speed={1} rotationIntensity={0.3} floatIntensity={0.4}>
                <ProductMesh position={[0, 0, 0]} rotationX={rotationX} rotationY={rotationY} isWeb={isWeb} />
            </Float>
            <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={12} blur={3} far={5} color="#1C1917" />
            {isWeb && <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />}
            <Environment preset="studio" />
        </Canvas>
    );

    if (isWeb) {
        return (
            <View style={styles.container}>
                <SceneContent isWeb={true} />
                <View style={styles.hint}><Animated.Text style={styles.hintText}>↔ Arrastra para rotar</Animated.Text></View>
            </View>
        );
    }

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            rotationY.value += e.velocityX * 0.0001;
            rotationX.value += e.velocityY * 0.0001;
        })
        .onEnd(() => {
            rotationX.value = withSpring(0, ANIMATION.spring.gentle);
        });

    return (
        <GestureHandlerRootView style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={styles.canvasContainer}>
                    <SceneContent isWeb={false} />
                </Animated.View>
            </GestureDetector>
            <View style={styles.hint}><Animated.Text style={styles.hintText}>↔ Desliza para rotar</Animated.Text></View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { height: 380, width: '100%', backgroundColor: 'transparent' },
    canvasContainer: { flex: 1 },
    hint: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
    hintText: { color: COLORS.secondary, fontSize: 12, fontFamily: 'Montserrat', opacity: 0.7 },
});

export default Product3DViewer;
