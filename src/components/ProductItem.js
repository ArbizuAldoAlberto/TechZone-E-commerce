/**
 * @fileoverview Individual Product Card Component
 * @module components/ProductItem
 */
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassCard } from './ui/GlassCard';
import { toggleFavorite } from '../store/favoritesSlice';
import { COLORS, FONTS, SPACING } from '../theme';

/**
 * @component ProductItem
 * @description Renders a single product card with glassmorphism effects and favorite toggle.
 * @param {Object} props
 * @param {Object} props.product - Product data object.
 * @param {Function} props.onPress - Navigation callback.
 * @param {Object} [props.containerStyle] - Style overrides.
 * @param {boolean} props.isDarkMode - Theme mode flag.
 */
const ProductItem = ({ product, onPress, containerStyle, isDarkMode }) => {
    const dispatch = useDispatch();
    const favorites = useSelector(state => state.favorites.items);
    const isFavorite = favorites.some(item => item.id === product.id);

    const handleFavoritePress = (e) => {
        e.stopPropagation();
        dispatch(toggleFavorite(product));
    };

    return (
        <Animated.View
            entering={FadeInUp.delay(100 + product.id * 50).springify()}
            style={containerStyle}
        >
            <Pressable onPress={onPress}>
                <GlassCard
                    style={[styles.card, { borderColor: isDarkMode ? COLORS.glassBorder : 'rgba(0,0,0,0.1)' }]}
                    intensity={20}
                    isDarkMode={isDarkMode}
                    strokeColor={isDarkMode ? COLORS.glassBorder : 'rgba(0,0,0,0.1)'}
                >
                    {/* Image Container */}
                    <View style={[styles.imageContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }]}>
                        <Image
                            source={{ uri: product.image }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                        {/* Favorite/Heart Button */}
                        <TouchableOpacity
                            style={[
                                styles.favBtn,
                                {
                                    backgroundColor: isFavorite ? COLORS.cta : (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')
                                }
                            ]}
                            onPress={handleFavoritePress}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={16}
                                color={isFavorite ? COLORS.white : (isDarkMode ? COLORS.white : COLORS.secondary)}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={[styles.category, { color: isDarkMode ? COLORS.textLight : COLORS.secondary }]} numberOfLines={1}>{product.category}</Text>
                        <Text style={[styles.title, { color: isDarkMode ? COLORS.white : COLORS.text }]} numberOfLines={2}>{product.title}</Text>

                        <View style={styles.footer}>
                            <Text style={styles.price}>${product.price.toLocaleString()}</Text>
                            <View style={[styles.rating, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Ionicons name="star" size={12} color={COLORS.cta} />
                                <Text style={[styles.ratingText, { color: isDarkMode ? COLORS.white : COLORS.text }]}>{product.rating?.rate || product.rating || 4.5}</Text>
                            </View>
                        </View>
                    </View>
                </GlassCard>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: SPACING.sm,
        borderRadius: 20,
        overflow: 'hidden',
        minHeight: 220,
        borderWidth: 1
    },
    imageContainer: {
        height: 140,
        width: '100%',
        marginBottom: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16
    },
    image: {
        width: '90%',
        height: '90%'
    },
    favBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    content: {
        gap: 4
    },
    category: {
        fontSize: 10,
        fontFamily: FONTS.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    title: {
        fontSize: 14,
        fontFamily: FONTS.bold,
        height: 38 // enforce 2 lines height roughly
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.xs
    },
    price: {
        fontSize: 16,
        color: COLORS.cta,
        fontFamily: FONTS.bold
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8
    },
    ratingText: {
        fontSize: 10,
        fontFamily: FONTS.bold
    }
});

export default ProductItem;
