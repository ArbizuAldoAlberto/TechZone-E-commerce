/**
 * @fileoverview Shopping Cart Screen.
 * @description Manages cart items, offline synchronization, and checkout process.
 * Includes "Wishlist" integration and "The Purge" optimizations.
 * 
 * @module screens/Cart
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    ScrollView,
    Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

// Logic & Storage
import { addItem, decreaseItem, removeItem, confirmCart, loadPendingItems } from '../../store/cartSlice';
import { toggleFavorite } from '../../store/favoritesSlice';
import { usePostOrderMutation } from '../../services/shopService';
import { fetchPendingCartItems, clearPendingCartItems } from '../../db';
import { colors, getColors } from '../../global/colors';
import { theme } from '../../global/theme';
import { fonts } from '../../global/fonts';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

// Components
import CartItem from '../../components/CartItem';
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import Button from '../../components/common/Button';

/**
 * @component Cart
 * @description Main Cart Screen.
 * @param {object} props.navigation - Navigation prop.
 */
const Cart = ({ navigation }) => {
    const dispatch = useDispatch();
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    // Selectors
    const { items, total, isOffline } = useSelector(state => state.cart);
    const { localId, user } = useSelector(state => state.auth);
    const favorites = useSelector(state => state.favorites?.items || []);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    // Local State
    const [isLoadingPending, setIsLoadingPending] = useState(true);
    const [triggerPostOrder, { isLoading: isPostingOrder }] = usePostOrderMutation();

    // Derived
    const themeColors = getColors(isDarkMode);
    const pendingCount = items.filter(i => i.isPending).length;

    /**
     * @effect SyncPendingItems
     * @description Loads local SQLite cart items on mount to sync offline data.
     */
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const pending = await fetchPendingCartItems();
                if (mounted && pending?.length) {
                    dispatch(loadPendingItems(pending));
                }
            } catch (e) {
                console.warn('DB Sync Error', e);
            } finally {
                if (mounted) setIsLoadingPending(false);
            }
        })();
        return () => { mounted = false; };
    }, [dispatch]);

    /**
     * @memo transactionDetails
     * @description Calculates tax, shipping, and final total.
     */
    const { finalTotal, tax, shipping } = useMemo(() => {
        const taxVal = total * 0.08;
        const shippingVal = total > 50 ? 0 : 15;
        return {
            tax: taxVal,
            shipping: shippingVal,
            finalTotal: total + taxVal + shippingVal
        };
    }, [total]);

    /**
     * @function handleCheckout
     * @description Processes order submission or local save if offline.
     */
    const handleCheckout = async () => {
        if (isOffline) {
            showAlert('Offline Mode', 'Saved locally. Sync later.', [{ text: 'OK' }]);
            return;
        }

        const payload = {
            items,
            total: finalTotal,
            user: localId || 'anonymous',
            userEmail: user || 'guest',
            createdAt: new Date().toISOString(),
        };

        try {
            await triggerPostOrder(payload).unwrap();
            await clearPendingCartItems();
            dispatch(confirmCart());
            showAlert('Confirmed', 'Order placed successfully.', [
                { text: 'Orders', onPress: () => navigation.navigate('Orders') }
            ]);
        } catch (error) {
            showAlert('Error', 'Transaction failed.', [{ text: 'OK' }]);
        }
    };

    if (isLoadingPending) return <LoadingView themeColors={themeColors} />;

    if (items.length === 0 && favorites.length === 0) {
        return <EmptyCartView navigation={navigation} themeColors={themeColors} isDarkMode={isDarkMode} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
            <ParticlesBackground />
            <CustomAlert {...alertConfig} onClose={hideAlert} />

            {isOffline && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline-outline" size={14} color="#FFF" />
                    <Text style={styles.offlineText}>Offline Mode • Local Save</Text>
                </View>
            )}

            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: themeColors.text }]}>Cart ({items.length})</Text>
                    {pendingCount > 0 && (
                        <Text style={{ color: colors.accent, fontSize: 12 }}>{pendingCount} offline items</Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Shop')}>
                    <Text style={styles.linkText}>Keep Shopping</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {favorites.length > 0 && (
                    <WishlistSection
                        favorites={favorites}
                        dispatch={dispatch}
                        navigation={navigation}
                        themeColors={themeColors}
                        isDarkMode={isDarkMode}
                    />
                )}

                {items.length > 0 && items.map((item, index) => (
                    <Animated.View
                        key={item.pendingId || item.id}
                        entering={FadeInRight.delay(index * 50)}
                        layout={Layout.springify()}
                    >
                        <CartItem
                            item={item}
                            onPress={() => navigation.navigate('ProductDetail', { product: item })}
                            onIncrement={() => dispatch(addItem(item))}
                            onDecrement={() => dispatch(decreaseItem(item.id))}
                            onRemove={() => dispatch(removeItem(item.id))}
                            isDarkMode={isDarkMode}
                        />
                    </Animated.View>
                ))}
            </ScrollView>

            {items.length > 0 && (
                <CheckoutFooter
                    total={total}
                    shipping={shipping}
                    finalTotal={finalTotal}
                    onCheckout={handleCheckout}
                    isOffline={isOffline}
                    isProcessing={isPostingOrder}
                    themeColors={themeColors}
                    isDarkMode={isDarkMode}
                />
            )}
        </SafeAreaView>
    );
};

// --- Sub-Components (Internal) ---

/**
 * @component LoadingView
 * @description Full screen loader.
 */
const LoadingView = ({ themeColors }) => (
    <View style={[styles.center, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
    </View>
);

/**
 * @component EmptyCartView
 * @description Displayed when cart and wishlist are empty.
 */
const EmptyCartView = ({ navigation, themeColors, isDarkMode }) => (
    <SafeAreaView style={[styles.center, { backgroundColor: themeColors.background }]} edges={['top']}>
        <ParticlesBackground />
        <View style={styles.emptyCircle}>
            <Ionicons name="cart-outline" size={48} color={isDarkMode ? '#555' : '#CCC'} />
        </View>
        <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Your Cart is Empty</Text>
        <Text style={[styles.emptySub, { color: themeColors.textLight }]}>Looks like you haven't added anything yet.</Text>
        <Button
            title="Start Shopping"
            onPress={() => navigation.navigate('Shop')}
            type="primary"
            style={{ marginTop: 32, width: 200 }}
        />
    </SafeAreaView>
);

/**
 * @component WishlistSection
 * @description Horizontal list of saved items.
 */
const WishlistSection = ({ favorites, dispatch, navigation, themeColors, isDarkMode }) => (
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

/**
 * @component CheckoutFooter
 * @description Fixed bottom footer with totals and checkout button.
 */
const CheckoutFooter = ({ total, shipping, finalTotal, onCheckout, isOffline, isProcessing, themeColors, isDarkMode }) => {
    const { bottom } = useSafeAreaInsets();

    // Style override to handle web/native shadow differences if needed
    // Using standard Native shadow props which work on both (with strict React Native or Expo)

    return (
        <View style={[
            styles.footer,
            {
                backgroundColor: isDarkMode ? '#1C1917' : '#FFF',
                borderTopColor: themeColors.border,
                paddingBottom: Math.max(20, bottom + 10)
            }
        ]}>
            <View style={styles.row}>
                <Text style={{ color: themeColors.textLight, fontFamily: fonts.medium }}>Subtotal</Text>
                <Text style={{ color: themeColors.text, fontFamily: fonts.bold }}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={{ color: themeColors.textLight, fontFamily: fonts.medium }}>Shipping</Text>
                <Text style={{ color: shipping === 0 ? colors.success : themeColors.text, fontFamily: fonts.bold }}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
            <View style={[styles.row, { marginBottom: 20 }]}>
                <Text style={{ color: themeColors.text, fontFamily: fonts.black, fontSize: 18 }}>Total</Text>
                <Text style={{ color: colors.primary, fontFamily: fonts.black, fontSize: 24 }}>${finalTotal.toFixed(2)}</Text>
            </View>
            <Button
                title={isOffline ? "Save Offline" : "Checkout"}
                onPress={onCheckout}
                loading={isProcessing}
                icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    offlineBanner: {
        backgroundColor: colors.accent,
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 6,
        gap: 6,
        alignItems: 'center'
    },
    offlineText: { color: '#FFF', fontSize: 12, fontFamily: fonts.bold },
    header: {
        padding: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    title: { fontSize: 32, fontFamily: fonts.black, letterSpacing: -1 },
    linkText: { color: colors.primary, fontFamily: fonts.bold },
    scrollContent: {
        paddingBottom: 250,
        paddingHorizontal: theme.spacing.lg
    },

    // Empty View Styles
    emptyCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(150,150,150,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: { fontSize: 24, fontFamily: fonts.bold, marginBottom: 8 },
    emptySub: { fontSize: 16, fontFamily: fonts.medium },

    // Wishlist Styles
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

    // Footer Styles
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { height: -4, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, marginVertical: 12 },
});

export default Cart;
