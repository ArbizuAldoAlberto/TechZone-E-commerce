/**
 * @fileoverview Cart Item Component
 * @description Renders a single item in the shopping cart.
 * Features:
 * - Displays product image, title, price, and quantity
 * - Controls for incrementing/decrementing quantity
 * - Remove item button
 * - Pending sync status indicator for offline items
 * - Web-compatible touch handling
 */
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { colors, getColors } from '../global/colors';
import { fonts } from '../global/fonts';
import { Ionicons } from '@expo/vector-icons';

// Helper to stop event propagation cross-platform
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
    const dynamicStyles = getDynamicStyles(isDarkMode, themeColors);

    // Use Pressable for better web compatibility
    const ButtonWrapper = Platform.OS === 'web' ? Pressable : TouchableOpacity;

    return (
        <ButtonWrapper
            style={[styles.container, dynamicStyles.container]}
            onPress={onPress}
            {...(Platform.OS !== 'web' && { activeOpacity: 0.8 })}
        >
            {/* Pending sync indicator - Corner badge */}
            {item.isPending && (
                <View style={styles.pendingBadge}>
                    <Ionicons name="cloud-offline" size={12} color={colors.white} />
                </View>
            )}

            {/* Product Image */}
            <View style={[styles.imageContainer, dynamicStyles.imageContainer]}>
                <Image
                    source={{ uri: item.image || item.thumbnail }}
                    style={styles.image}
                    resizeMode="contain"
                />
            </View>

            {/* Product Info */}
            <View style={styles.infoContainer}>
                <View style={styles.topRow}>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, dynamicStyles.text]} numberOfLines={2}>
                            {item.title || item.name}
                        </Text>
                        {item.isPending && (
                            <View style={styles.syncBadge}>
                                <Ionicons name="sync-outline" size={12} color={colors.accent} />
                                <Text style={styles.syncText}>Pending Sync</Text>
                            </View>
                        )}
                    </View>
                    <ButtonWrapper
                        onPress={(e) => stopPropagation(e, onRemove)}
                        style={styles.deleteButton}
                        {...(Platform.OS !== 'web' && { activeOpacity: 0.7 })}
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </ButtonWrapper>
                </View>

                {item.category && (
                    <Text style={[styles.category, dynamicStyles.textLight]}>{item.category}</Text>
                )}

                <View style={styles.bottomRow}>
                    <View>
                        <Text style={[styles.price, dynamicStyles.primaryText]}>
                            ${item.price.toFixed(2)}
                        </Text>
                        {item.quantity > 1 && (
                            <Text style={[styles.totalPrice, dynamicStyles.textLight]}>
                                Total: ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        )}
                    </View>

                    <View style={[styles.quantityContainer, dynamicStyles.quantityContainer]}>
                        <ButtonWrapper
                            onPress={(e) => stopPropagation(e, onDecrement)}
                            style={[styles.qtyButton, styles.qtyButtonMinus]}
                            {...(Platform.OS !== 'web' && { activeOpacity: 0.7 })}
                        >
                            <Ionicons name="remove" size={16} color={themeColors.text} />
                        </ButtonWrapper>
                        <Text style={[styles.quantity, dynamicStyles.text]}>{item.quantity}</Text>
                        <ButtonWrapper
                            onPress={(e) => stopPropagation(e, onIncrement)}
                            style={[styles.qtyButton, styles.qtyButtonPlus]}
                            {...(Platform.OS !== 'web' && { activeOpacity: 0.7 })}
                        >
                            <Ionicons name="add" size={16} color={colors.white} />
                        </ButtonWrapper>
                    </View>
                </View>
            </View>
        </ButtonWrapper>
    );
};

const getDynamicStyles = (isDarkMode, themeColors) => StyleSheet.create({
    container: {
        backgroundColor: isDarkMode ? '#1C1C1E' : colors.white,
    },
    imageContainer: {
        backgroundColor: isDarkMode ? '#2C2C2E' : '#F8F9FA',
    },
    text: {
        color: themeColors.text,
    },
    textLight: {
        color: themeColors.textLight,
    },
    primaryText: {
        color: themeColors.primary,
    },
    quantityContainer: {
        backgroundColor: isDarkMode ? '#2C2C2E' : colors.background,
    },
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 14,
        alignItems: 'center',
        position: 'relative',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }
        })
    },
    pendingBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.accent,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderWidth: 2,
        borderColor: colors.white,
        ...Platform.select({
            ios: {
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: `0 2px 4px ${colors.accent}4D`,
            }
        })
    },
    imageContainer: {
        width: 90,
        height: 90,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    image: {
        width: '85%',
        height: '85%',
    },
    infoContainer: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    titleContainer: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: fonts.bold,
        lineHeight: 20,
    },
    syncBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: 'rgba(255, 149, 0, 0.12)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 4,
    },
    syncText: {
        fontSize: 10,
        color: colors.accent,
        fontWeight: '700',
    },
    deleteButton: {
        padding: 6,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        borderRadius: 10,
    },
    category: {
        fontSize: 12,
        marginBottom: 10,
        fontFamily: fonts.regular,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 18,
        fontWeight: '800',
    },
    totalPrice: {
        fontSize: 11,
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        overflow: 'hidden',
    },
    qtyButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    qtyButtonMinus: {
        backgroundColor: 'transparent',
    },
    qtyButtonPlus: {
        backgroundColor: colors.primary,
    },
    quantity: {
        fontSize: 16,
        fontWeight: '700',
        minWidth: 28,
        textAlign: 'center',
    },
});

export default CartItem;
