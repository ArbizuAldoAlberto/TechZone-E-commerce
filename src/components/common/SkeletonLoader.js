/**
 * @fileoverview Skeleton Loading Arrays
 * @module components/common/SkeletonLoader
 * @description Provides pulsating placeholder shapes to indicate content loading.
 * Contains pre-configured layouts for specific screens:
 * - HomeSkeleton
 * - CartSkeleton
 * - ProductSkeleton
 * 
 * @performance Uses native driver for generic animations where possible.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { colors } from '../../global/colors';

// Base Unit
const SkeletonItem = ({ width, height, borderRadius = 12, style }) => {
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web'
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web'
                })
            ])
        );
        anim.start();
        return () => anim.stop();
    }, []);

    const opacity = pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7]
    });

    return (
        <Animated.View style={[styles.base, { width, height, borderRadius, opacity }, style]} />
    );
};

// --- Presets ---

export const ProductSkeleton = ({ style }) => (
    <View style={[styles.card, style]}>
        <SkeletonItem width="100%" height={140} borderRadius={16} />
        <View style={styles.cardContent}>
            <SkeletonItem width="70%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonItem width="40%" height={12} style={{ marginBottom: 12 }} />
            <SkeletonItem width="50%" height={20} />
        </View>
    </View>
);

export const HomeSkeleton = () => (
    <View style={styles.container}>
        {/* Header/Search */}
        <SkeletonItem width="100%" height={56} borderRadius={16} style={{ marginBottom: 24 }} />

        {/* Categories */}
        <View style={styles.row}>
            {[1, 2, 3, 4].map(i => (
                <SkeletonItem key={i} width={80} height={36} borderRadius={18} style={{ marginRight: 10 }} />
            ))}
        </View>

        {/* Hero */}
        <View style={{ marginVertical: 24 }}>
            <SkeletonItem width="100%" height={200} borderRadius={24} />
        </View>

        {/* Grid */}
        <View style={styles.grid}>
            {[1, 2, 3, 4].map(i => <ProductSkeleton key={i} style={styles.gridItem} />)}
        </View>
    </View>
);

export const CartSkeleton = () => (
    <View style={styles.container}>
        <SkeletonItem width={120} height={30} style={{ marginBottom: 20 }} />
        {[1, 2, 3].map(i => (
            <View key={i} style={styles.rowItem}>
                <SkeletonItem width={80} height={80} borderRadius={16} />
                <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
                    <SkeletonItem width="80%" height={16} style={{ marginBottom: 8 }} />
                    <SkeletonItem width="40%" height={14} />
                </View>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    base: {
        backgroundColor: '#E1E9EE',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
    },
    cardContent: {
        marginTop: 12,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
    },
    rowItem: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 20
    }
});

export default SkeletonItem;
