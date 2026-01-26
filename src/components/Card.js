/**
 * @fileoverview Card Component
 * @description A generic styled card container.
 * Features:
 * - Consistent styling (shadows, border radius)
 * - Optional favorite icon integration (coupled to Favorites Redux)
 * - Platform-specific shadow implementation
 */
import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { colors } from '../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite } from '../store/favoritesSlice';

const Card = ({ children, style, item, showFavorite = false }) => {
    const dispatch = useDispatch();
    const favorites = useSelector(state => state.favorites.items);
    const isFavorite = item && favorites.some(fav => fav.id === item.id);

    const handleToggle = () => {
        if (item) dispatch(toggleFavorite(item));
    };

    return (
        <View style={[styles.card, style]}>
            {showFavorite && item && (
                <TouchableOpacity style={styles.favoriteIcon} onPress={handleToggle}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? colors.error : colors.textLight}
                    />
                </TouchableOpacity>
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }
        })
    },
    favoriteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 4,
    }
});

export default Card;
