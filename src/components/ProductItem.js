import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors, getColors } from '../global/colors';
import { fonts } from '../global/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../store/favoritesSlice';
import { addItem } from '../store/cartSlice';

const ProductItem = ({ product, onPress, containerStyle, isDarkMode: propIsDarkMode }) => {
    const dispatch = useDispatch();
    const favorites = useSelector(state => state.favorites.items);
    const reduxIsDarkMode = useSelector(state => state.theme.isDarkMode);

    // Use prop if provided, otherwise use Redux state
    const isDarkMode = propIsDarkMode !== undefined ? propIsDarkMode : reduxIsDarkMode;
    const themeColors = getColors(isDarkMode);

    const isFavorite = favorites.some(fav => fav.id === product.id);

    const handleToggleFavorite = (e) => {
        dispatch(toggleFavorite(product));
    };

    const handleAddToCart = () => {
        dispatch(addItem({ ...product, quantity: 1 }));
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={containerStyle}>
            <View style={[styles.container, isDarkMode && styles.containerDark]}>
                <View style={[styles.imageContainer, isDarkMode && styles.imageContainerDark]}>
                    <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
                    <TouchableOpacity style={[styles.favoriteButton, isDarkMode && styles.favoriteButtonDark]} onPress={handleToggleFavorite}>
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={20}
                            color={isFavorite ? colors.error : themeColors.textLight}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.details}>
                    <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>{product.title}</Text>
                    <Text style={[styles.category, { color: themeColors.textLight }]}>{product.category}</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${product.price.toLocaleString()}</Text>
                        <TouchableOpacity style={[styles.addButton, isDarkMode && styles.addButtonDark]} onPress={handleAddToCart}>
                            <Ionicons name="add" size={20} color={themeColors.text} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                // boxShadow or standard styles
            }
        })
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
    },
    imageContainer: {
        width: '100%',
        height: 120,
        backgroundColor: '#F8F9FA',
        borderRadius: 15,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    imageContainerDark: {
        backgroundColor: '#2C2C2E',
    },
    image: {
        width: '80%',
        height: '80%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: colors.white,
        padding: 4,
        borderRadius: 50,
    },
    favoriteButtonDark: {
        backgroundColor: '#3A3A3C',
    },
    details: {
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        fontFamily: fonts.bold,
    },
    category: {
        fontSize: 12,
        marginBottom: 8,
        fontFamily: fonts.regular,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
        fontFamily: fonts.bold,
    },
    addButton: {
        backgroundColor: colors.background,
        padding: 6,
        borderRadius: 50,
    },
    addButtonDark: {
        backgroundColor: '#2C2C2E',
    },
});

export default ProductItem;
