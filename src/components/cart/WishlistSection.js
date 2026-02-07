import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleFavorite } from '../../store/favoritesSlice';
import { addItem } from '../../store/cartSlice';
import { colors } from '../../global/colors'; // Legacy colors usage, might need unification
import { fonts } from '../../global/fonts';

export const WishlistSection = ({ favorites, dispatch, navigation, themeColors, isDarkMode }) => (
    <View style={styles.wishSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Saved for Later ({favorites.length})</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {favorites.map((fav) => (
                <View key={fav.id} style={[styles.favCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                    <TouchableOpacity
                        style={styles.removeFav}
                        onPress={() => dispatch(toggleFavorite(fav))}
                    >
                        <Ionicons name="close" size={12} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.favContent}
                        onPress={() => navigation.navigate('ProductDetail', { product: fav })}
                    >
                        <Image source={{ uri: fav.thumbnail || fav.images?.[0] }} style={styles.favImg} resizeMode="contain" />
                        <Text numberOfLines={1} style={[styles.favTitle, { color: themeColors.text }]}>{fav.title}</Text>
                        <Text style={styles.favPrice}>${fav.price}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.favAdd}
                        onPress={() => dispatch(addItem(fav))}
                    >
                        <Ionicons name="add" size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    wishSection: { marginBottom: 24 },
    sectionTitle: { fontSize: 18, fontFamily: fonts.bold, marginBottom: 12 },
    favCard: {
        width: 120,
        padding: 10,
        borderRadius: 16,
        alignItems: 'center',
        position: 'relative'
    },
    removeFav: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: colors.error,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    favContent: { alignItems: 'center', width: '100%' },
    favImg: { width: 64, height: 64, marginBottom: 8 },
    favTitle: { fontSize: 11, fontFamily: fonts.semiBold, textAlign: 'center', marginBottom: 2 },
    favPrice: { fontSize: 12, fontFamily: fonts.bold, color: colors.primary },
    favAdd: {
        marginTop: 8,
        backgroundColor: colors.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
});
