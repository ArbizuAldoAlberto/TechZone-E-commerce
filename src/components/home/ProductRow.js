/**
 * @fileoverview Horizontal Product List Section
 * @module components/home/ProductRow
 */
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../global/colors';
import { fonts } from '../../global/fonts';
import { theme } from '../../global/theme';
import ProductItem from '../ProductItem';
import Animated, { FadeInRight } from 'react-native-reanimated';

/**
 * @component ProductRow
 * @description Renders a horizontal scrolling list of product cards with a header section.
 * @param {Object} props
 * @param {string} props.title - Section title.
 * @param {Array} props.products - List of product objects to render.
 * @param {Function} [props.onSeeAll] - Optional callback for "See All" button.
 * @param {Object} props.navigation - Navigation prop for routing.
 * @param {boolean} props.isDarkMode - Theme mode flag.
 * @returns {JSX.Element|null} The rendered component or null if no products.
 */
const ProductRow = ({ title, products, onSeeAll, navigation, isDarkMode }) => {
    const themeColors = getColors(isDarkMode);
    const textColor = themeColors.text;
    const accentColor = themeColors.primary;

    if (!products || products.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                {onSeeAll && (
                    <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
                        <Text style={[styles.seeAllText, { color: accentColor }]}>See All</Text>
                        <Ionicons name="arrow-forward" size={14} color={accentColor} />
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                horizontal
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
                        <ProductItem
                            product={item}
                            onPress={() => navigation.navigate('ProductDetail', { product: item })}
                            containerStyle={styles.cardContainer}
                            isDarkMode={isDarkMode}
                        />
                    </Animated.View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg, // Added alignment
    },
    title: {
        fontSize: 20,
        fontFamily: fonts.bold,
        letterSpacing: -0.5,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontFamily: fonts.semiBold,
        fontSize: 14,
    },
    listContent: {
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg, // Align start and end
    },
    cardContainer: {
        width: 160,
    }
});

export default ProductRow;
