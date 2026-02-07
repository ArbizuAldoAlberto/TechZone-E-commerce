import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme';

export const FloatingHeader = ({ navigation, cartCount, viewMode, toggleViewMode, isDarkMode = true, isFavorite, onFavoritePress }) => {
    // Dynamic colors for light/dark mode visibility
    const iconColor = isDarkMode ? COLORS.white : COLORS.primary;
    const iconBg = isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.95)';
    const iconBorder = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';

    return (
        <SafeAreaView style={styles.floatingHeader} edges={['top']}>
            <TouchableOpacity
                style={[styles.glassIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
            <View style={styles.headerRight}>
                {/* Favorites Button */}
                <TouchableOpacity
                    style={[styles.glassIcon, {
                        backgroundColor: isFavorite ? COLORS.cta : iconBg,
                        borderColor: isFavorite ? COLORS.cta : iconBorder
                    }]}
                    onPress={onFavoritePress}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={22}
                        color={isFavorite ? COLORS.white : iconColor}
                    />
                </TouchableOpacity>

                {/* View Mode Toggle */}
                <TouchableOpacity
                    style={[styles.glassIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}
                    onPress={toggleViewMode}
                >
                    <Ionicons name={viewMode === '3D' ? "images-outline" : "cube-outline"} size={22} color={iconColor} />
                </TouchableOpacity>

                {/* Cart Button */}
                <TouchableOpacity
                    style={[styles.glassIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Cart' })}
                >
                    <Ionicons name="bag-handle-outline" size={22} color={iconColor} />
                    {cartCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{cartCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12 },
    glassIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    headerRight: { flexDirection: 'row', gap: 10 },
    badge: { position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.cta, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    badgeText: { color: COLORS.white, fontSize: 9, fontWeight: 'bold' },
});
