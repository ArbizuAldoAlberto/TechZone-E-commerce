import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { colors, getColors } from '../../global/colors';
import { useSelector, useDispatch } from 'react-redux';
import { addItem, decreaseItem, removeItem, confirmCart, loadPendingItems } from '../../store/cartSlice';
import { toggleFavorite } from '../../store/favoritesSlice';
import CartItem from '../../components/CartItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostOrderMutation } from '../../services/shopService';
import { fetchPendingCartItems, clearPendingCartItems } from '../../db';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

const Cart = ({ navigation }) => {
    const { items, total, isOffline, pendingSyncCount } = useSelector(state => state.cart);
    const { localId, user } = useSelector(state => state.auth);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const favorites = useSelector(state => state.favorites?.items || []);
    const dispatch = useDispatch();
    const [triggerPostOrder, { isLoading }] = usePostOrderMutation();
    const [isLoadingPending, setIsLoadingPending] = useState(true);
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    const themeColors = getColors(isDarkMode);
    const dynamicStyles = getDynamicStyles(isDarkMode, themeColors);

    const taxRate = 0.08;
    const tax = total * taxRate;
    const shipping = total > 50 ? 0 : 15;
    const finalTotal = total + tax + shipping;

    // Load pending items from SQLite on mount
    useEffect(() => {
        loadPendingItemsFromDb();
    }, []);

    const loadPendingItemsFromDb = async () => {
        try {
            setIsLoadingPending(true);
            const pendingItems = await fetchPendingCartItems();
            if (pendingItems.length > 0) {
                dispatch(loadPendingItems(pendingItems));
            }
        } catch (error) {
            // Silent fail
        } finally {
            setIsLoadingPending(false);
        }
    };

    const handleConfirm = async () => {
        if (isOffline) {
            showAlert(
                'Sin Conexión',
                'No puedes confirmar la compra sin conexión a internet. Los items se guardarán localmente.',
                [{ text: 'Entendido' }],
                'cloud-offline-outline'
            );
            return;
        }

        const orderData = {
            items,
            total: finalTotal,
            user: localId || 'anonymous',
            userEmail: user || 'guest',
            createdAt: new Date().toISOString(),
        };

        try {
            await triggerPostOrder(orderData).unwrap();
            await clearPendingCartItems();
            showAlert(
                '¡Éxito!',
                'Tu orden ha sido procesada correctamente.',
                [{ text: 'Ver Pedidos', onPress: () => navigation.navigate('Orders') }],
                'checkmark-circle-outline'
            );
            dispatch(confirmCart());
        } catch (error) {
            showAlert(
                'Error',
                'No pudimos procesar tu orden. Intenta de nuevo.',
                [{ text: 'OK' }],
                'alert-circle-outline'
            );
        }
    };

    const pendingCount = items.filter(item => item.isPending).length;

    // Render wishlist item
    const renderWishlistItem = ({ item }) => (
        <View style={[styles.wishlistItem, dynamicStyles.card]}>
            {/* Delete from favorites button */}
            <TouchableOpacity
                style={styles.wishlistDeleteButton}
                onPress={() => {
                    dispatch(toggleFavorite(item));
                    showAlert('Eliminado', `${item.title} se eliminó de favoritos`, [{ text: 'OK' }], 'heart-dislike-outline');
                }}
            >
                <Ionicons name="close" size={14} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.wishlistContent}
                onPress={() => navigation.navigate('ProductDetail', { product: item })}
                activeOpacity={0.8}
            >
                <Image source={{ uri: item.image }} style={styles.wishlistImage} resizeMode="contain" />
                <Text style={[styles.wishlistTitle, dynamicStyles.text]} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.wishlistPrice}>${item.price}</Text>
            </TouchableOpacity>

            {/* Add to cart button */}
            <TouchableOpacity
                style={styles.addFromWishlist}
                onPress={() => {
                    dispatch(addItem({ ...item, quantity: 1 }));
                    showAlert('Agregado', `${item.title} se agregó al carrito`, [{ text: 'OK' }], 'cart-outline');
                }}
            >
                <Ionicons name="add" size={18} color={colors.white} />
            </TouchableOpacity>
        </View>
    );

    if (isLoadingPending) {
        return (
            <SafeAreaView style={[styles.emptyContainer, dynamicStyles.container]} edges={['top']}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={[styles.loadingText, dynamicStyles.textLight]}>Loading cart...</Text>
                <CustomAlert {...alertConfig} onClose={hideAlert} />
            </SafeAreaView>
        );
    }

    if (items.length === 0 && favorites.length === 0) {
        return (
            <SafeAreaView style={[styles.emptyContainer, dynamicStyles.container]} edges={['top']}>
                <View style={styles.emptyIconContainer}>
                    <Ionicons name="cart-outline" size={80} color={themeColors.textLight} />
                </View>
                <Text style={[styles.emptyTitle, dynamicStyles.text]}>Your cart is empty</Text>
                <Text style={[styles.emptySubtitle, dynamicStyles.textLight]}>
                    Add some products to get started
                </Text>
                <TouchableOpacity
                    style={styles.shopNowButton}
                    onPress={() => navigation.navigate('Shop')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="bag-handle-outline" size={20} color={colors.white} />
                    <Text style={styles.shopNowText}>Start Shopping</Text>
                </TouchableOpacity>
                <CustomAlert {...alertConfig} onClose={hideAlert} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, dynamicStyles.container]} edges={['top']}>
            <CustomAlert {...alertConfig} onClose={hideAlert} />

            {/* Offline Banner */}
            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline-outline" size={18} color={colors.white} />
                    <Text style={styles.offlineBannerText}>
                        Mode Offline - Los cambios se sincronizarán
                    </Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, dynamicStyles.text]}>My Cart</Text>
                        <Text style={[styles.itemCount, dynamicStyles.textLight]}>
                            {items.length} {items.length === 1 ? 'Item' : 'Items'}
                            {pendingCount > 0 && (
                                <Text style={styles.pendingText}> • {pendingCount} pending sync</Text>
                            )}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.clearButton, dynamicStyles.card]}
                        onPress={() => navigation.navigate('Shop')}
                    >
                        <Text style={styles.editText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>

                {/* Wishlist Section */}
                {favorites.length > 0 && (
                    <View style={styles.wishlistSection}>
                        <View style={styles.wishlistHeader}>
                            <Ionicons name="heart" size={20} color={colors.error} />
                            <Text style={[styles.wishlistHeaderText, dynamicStyles.text]}>
                                Wishlist ({favorites.length})
                            </Text>
                        </View>
                        <FlatList
                            data={favorites}
                            renderItem={renderWishlistItem}
                            keyExtractor={item => `wishlist-${item.id}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.wishlistList}
                        />
                    </View>
                )}

                {/* Pending Items Alert */}
                {pendingCount > 0 && !isOffline && (
                    <View style={styles.syncAlert}>
                        <Ionicons name="sync-outline" size={18} color={colors.accent} />
                        <Text style={styles.syncAlertText}>
                            {pendingCount} item(s) will sync when connected
                        </Text>
                    </View>
                )}

                {/* Cart Items */}
                {items.length > 0 && (
                    <View style={styles.cartItemsContainer}>
                        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Cart Items</Text>
                        {items.map((item) => (
                            <View key={item.pendingId || item.id.toString()} style={styles.cartItemWrapper}>
                                <CartItem
                                    item={item}
                                    onPress={() => navigation.navigate('ProductDetail', { product: item })}
                                    onIncrement={() => dispatch(addItem(item))}
                                    onDecrement={() => dispatch(decreaseItem(item.id))}
                                    onRemove={() => dispatch(removeItem(item.id))}
                                    isDarkMode={isDarkMode}
                                />
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 280 }} />
            </ScrollView>

            {/* Footer Summary */}
            {items.length > 0 && (
                <View style={[styles.footer, dynamicStyles.card]}>
                    <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, dynamicStyles.textLight]}>Subtotal</Text>
                            <Text style={[styles.summaryValue, dynamicStyles.text]}>${total.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, dynamicStyles.textLight]}>Tax (8%)</Text>
                            <Text style={[styles.summaryValue, dynamicStyles.text]}>${tax.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, dynamicStyles.textLight]}>Shipping</Text>
                            <Text style={[styles.summaryValue, { color: shipping === 0 ? colors.success : themeColors.text }]}>
                                {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, dynamicStyles.divider]} />

                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={[styles.totalLabel, dynamicStyles.text]}>Total</Text>
                        <Text style={[styles.totalValue, dynamicStyles.text]}>${finalTotal.toFixed(2)}</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.checkoutButton,
                            isLoading && styles.checkoutButtonLoading,
                            isOffline && styles.checkoutButtonOffline
                        ]}
                        onPress={handleConfirm}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <>
                                <Ionicons
                                    name={isOffline ? "cloud-offline-outline" : "bag-check-outline"}
                                    size={22}
                                    color={colors.white}
                                />
                                <Text style={styles.checkoutText}>
                                    {isOffline ? 'Offline - Save Locally' : 'Confirm Purchase'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.secureRow}>
                        <Ionicons name="shield-checkmark-outline" size={16} color={themeColors.textLight} />
                        <Text style={[styles.secureText, dynamicStyles.textLight]}>Secure Payment • SSL Encrypted</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const getDynamicStyles = (isDarkMode, themeColors) => StyleSheet.create({
    container: {
        backgroundColor: isDarkMode ? '#000000' : colors.background,
    },
    text: {
        color: themeColors.text,
    },
    textLight: {
        color: themeColors.textLight,
    },
    card: {
        backgroundColor: isDarkMode ? '#1C1C1E' : colors.white,
    },
    divider: {
        backgroundColor: isDarkMode ? '#38383A' : colors.border,
    },
});

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    shopNowButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    shopNowText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '700',
    },
    offlineBanner: {
        backgroundColor: colors.accent,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 8,
    },
    offlineBannerText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginTop: 16,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    itemCount: {
        fontSize: 14,
        marginTop: 4,
    },
    pendingText: {
        color: colors.accent,
        fontWeight: '600',
    },
    clearButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    // Wishlist styles
    wishlistSection: {
        marginBottom: 20,
    },
    wishlistHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
        gap: 8,
    },
    wishlistHeaderText: {
        fontSize: 18,
        fontWeight: '700',
    },
    wishlistList: {
        paddingHorizontal: 20,
        gap: 12,
    },
    wishlistItem: {
        width: 140,
        padding: 12,
        borderRadius: 16,
        marginRight: 12,
        alignItems: 'center',
    },
    wishlistImage: {
        width: 80,
        height: 80,
        marginBottom: 8,
    },
    wishlistTitle: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    wishlistPrice: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 8,
    },
    wishlistDeleteButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: colors.error,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    wishlistContent: {
        alignItems: 'center',
        width: '100%',
    },
    addFromWishlist: {
        backgroundColor: colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    cartItemsContainer: {
        paddingTop: 8,
    },
    cartItemWrapper: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    syncAlert: {
        backgroundColor: 'rgba(255, 149, 0, 0.12)',
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
    },
    syncAlertText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.accent,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 12,
    },
    summarySection: {},
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalRow: {
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 14,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    checkoutButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    checkoutButtonLoading: {
        opacity: 0.7,
    },
    checkoutButtonOffline: {
        backgroundColor: colors.accent,
    },
    checkoutText: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.white,
    },
    secureRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    secureText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default Cart;
