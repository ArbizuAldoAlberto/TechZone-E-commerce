/**
 * @fileoverview Skeleton Loader Component
 * @description Displays animated placeholder content while data is loading.
 * Contains specialized skeletons for:
 * - Product Cards
 * - Categories
 * - Banners
 * - Home Screen (Full layout)
 * - Cart Screen (Full layout)
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { colors } from '../../global/colors';

/**
 * Skeleton Loader Component
 * Displays animated placeholder content while data is loading
 */
const SkeletonLoader = ({ width, height, borderRadius = 8, style }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.ease,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

/**
 * Product Skeleton Card
 * Placeholder for product cards while loading
 */
export const ProductSkeleton = ({ containerStyle }) => {
    return (
        <View style={[styles.productContainer, containerStyle]}>
            <SkeletonLoader width="100%" height={120} borderRadius={16} />
            <View style={styles.productInfo}>
                <SkeletonLoader width="70%" height={14} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="50%" height={12} style={{ marginBottom: 12 }} />
                <SkeletonLoader width="40%" height={18} />
            </View>
        </View>
    );
};

/**
 * Category Skeleton
 * Placeholder for category buttons while loading
 */
export const CategorySkeleton = () => {
    return (
        <View style={styles.categoryRow}>
            {[1, 2, 3, 4].map((i) => (
                <SkeletonLoader
                    key={i}
                    width={80}
                    height={40}
                    borderRadius={20}
                    style={{ marginRight: 12 }}
                />
            ))}
        </View>
    );
};

/**
 * Banner Skeleton
 * Placeholder for banner while loading
 */
export const BannerSkeleton = () => {
    return <SkeletonLoader width="100%" height={200} borderRadius={24} />;
};

/**
 * Home Screen Skeleton
 * Complete skeleton layout for home screen
 */
export const HomeSkeleton = () => {
    return (
        <View style={styles.homeContainer}>
            {/* Search skeleton */}
            <SkeletonLoader width="100%" height={50} borderRadius={16} style={{ marginBottom: 24 }} />

            {/* Categories skeleton */}
            <CategorySkeleton />

            {/* Banner skeleton */}
            <View style={{ marginVertical: 24 }}>
                <BannerSkeleton />
            </View>

            {/* Section header skeleton */}
            <View style={styles.sectionHeader}>
                <SkeletonLoader width={120} height={20} />
                <SkeletonLoader width={60} height={16} />
            </View>

            {/* Products grid skeleton */}
            <View style={styles.productsGrid}>
                <ProductSkeleton containerStyle={styles.productGridItem} />
                <ProductSkeleton containerStyle={styles.productGridItem} />
                <ProductSkeleton containerStyle={styles.productGridItem} />
                <ProductSkeleton containerStyle={styles.productGridItem} />
            </View>
        </View>
    );
};

/**
 * Cart Skeleton
 * Complete skeleton layout for cart screen
 */
export const CartSkeleton = () => {
    return (
        <View style={styles.cartContainer}>
            {/* Header skeleton */}
            <View style={styles.cartHeader}>
                <SkeletonLoader width={150} height={32} borderRadius={8} />
                <SkeletonLoader width={100} height={24} borderRadius={12} />
            </View>

            {/* Cart items skeleton */}
            {[1, 2, 3].map((i) => (
                <View key={i} style={styles.cartItemRow}>
                    <SkeletonLoader width={80} height={80} borderRadius={12} />
                    <View style={styles.cartItemInfo}>
                        <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
                        <SkeletonLoader width="40%" height={14} style={{ marginBottom: 8 }} />
                        <SkeletonLoader width="30%" height={20} />
                    </View>
                </View>
            ))}

            {/* Footer skeleton */}
            <View style={styles.cartFooter}>
                <SkeletonLoader width="100%" height={50} borderRadius={16} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E1E9EE',
    },
    productContainer: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
    },
    productInfo: {
        marginTop: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    homeContainer: {
        flex: 1,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productGridItem: {
        width: '48%',
        marginBottom: 16,
    },
    cartContainer: {
        flex: 1,
        padding: 20,
    },
    cartHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    cartItemRow: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 16,
    },
    cartItemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cartFooter: {
        marginTop: 'auto',
        paddingTop: 20,
    }
});

export default SkeletonLoader;
