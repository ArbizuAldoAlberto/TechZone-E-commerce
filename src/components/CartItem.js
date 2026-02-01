/**
 * @fileoverview Cart Item Component (Elite)
 */
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { colors, getColors } from '../global/colors';
import { fonts } from '../global/fonts';
import { theme } from '../global/theme';
import { Ionicons } from '@expo/vector-icons';

// Helper to stop event propagation
const stopPropagation = (e, callback) => {
    if (Platform.OS === 'web') {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        e?.nativeEvent?.stopImmediatePropagation?.();
    } else if (e?.stopPropagation) {
        e.stopPropagation();
    }
    callback?.();
};

const CartItem = ({ item, onIncrement, onDecrement, onRemove, onPress, isDarkMode = false }) => {
    const themeColors = getColors(isDarkMode);
    const ButtonWrapper = Platform.OS === 'web' ? Pressable : TouchableOpacity;

    // Dynamic styles based on theme
    const containerBg = isDarkMode ? '#1C1917' : colors.white;
    const imgBg = isDarkMode ? '#292524' : '#F5F5F4';

    return (
        <ButtonWrapper
            style={[styles.container, { backgroundColor: containerBg }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Pending Badge */}
            {item.isPending && (
                <View style={styles.pendingBadge}>
                    <Ionicons name="cloud-offline" size={12} color={colors.white} />
                </View>
            )}

            {/* Image */}
            <View style={[styles.imageContainer, { backgroundColor: imgBg }]}>
                <Image
                    source={{ uri: item.image || item.thumbnail }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
                <View style={styles.topRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {item.isPending && (
                            <View style={styles.syncRow}>
                                <Ionicons name="sync" size={10} color={colors.accent} />
                                <Text style={styles.syncText}>Syncing</Text>
                            </View>
                        )}
                        <Text style={[styles.category, { color: themeColors.textLight }]}>{item.category || 'Product'}</Text>
                    </View>

                    <TouchableOpacity onPress={(e) => stopPropagation(e, onRemove)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomRow}>
                    <View>
                        <Text style={[styles.price, { color: themeColors.text }]}>${item.price}</Text>
                        <Text style={[styles.subtotal, { color: themeColors.textLight }]}>
                            x {item.quantity}
                        </Text>
                    </View>

                    {/* Quantity Control */}
                    <View style={[styles.qtyControl, { backgroundColor: isDarkMode ? '#292524' : '#F5F5F4' }]}>
                        <TouchableOpacity
                            onPress={(e) => stopPropagation(e, onDecrement)}
                            style={styles.qtyBtn}
                        >
                            <Ionicons name="remove" size={14} color={themeColors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.qtyText, { color: themeColors.text }]}>{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={(e) => stopPropagation(e, onIncrement)}
                            style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                        >
                            <Ionicons name="add" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ButtonWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: theme.borderRadius.lg, // 16px
        marginBottom: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.sm, // Elite shadow token
        // Web shadow fix
        ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } })
    },
    pendingBadge: {
        position: 'absolute',
        top: -6, right: -6,
        backgroundColor: colors.accent,
        width: 24, height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 2,
        borderColor: colors.white
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    image: { width: '80%', height: '80%' },
    infoContainer: { flex: 1, justifyContent: 'space-between', height: 80 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontFamily: fonts.bold, fontSize: 13, marginBottom: 2 },
    syncRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
    syncText: { fontSize: 10, color: colors.accent, fontFamily: fonts.bold },
    category: { fontSize: 11, fontFamily: fonts.medium },
    deleteBtn: { padding: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 },
    bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    price: { fontFamily: fonts.bold, fontSize: 15 },
    subtotal: { fontSize: 10, fontFamily: fonts.medium },
    qtyControl: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, padding: 2 },
    qtyBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderRadius: 6 },
    qtyText: { fontFamily: fonts.bold, fontSize: 12, minWidth: 20, textAlign: 'center' },
});

export default CartItem;
