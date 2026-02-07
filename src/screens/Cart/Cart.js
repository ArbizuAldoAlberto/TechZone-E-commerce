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
    ScrollView,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

// Logic & Storage
import { addItem, decreaseItem, removeItem, confirmCart, loadPendingItems } from '../../store/cartSlice';
import { usePostOrderMutation } from '../../services/shopService';
import { fetchPendingCartItems, clearPendingCartItems } from '../../db';
import { colors, getColors } from '../../global/colors';
import { theme } from '../../global/theme';
import { fonts } from '../../global/fonts';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

// Components
import CartItem from '../../components/CartItem';
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import { WishlistSection } from '../../components/cart/WishlistSection';
import { CheckoutFooter } from '../../components/cart/CheckoutFooter';
import { EmptyCartView } from '../../components/cart/EmptyCartView';

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

            // Try to clear local DB, but don't block success if it fails
            try {
                await clearPendingCartItems();
            } catch (dbError) {
                console.warn('Failed to clear local cart after successful order:', dbError);
                // Optionally alert the user or just log it, as the primary order succeeded
            }

            dispatch(confirmCart());
            showAlert('Confirmed', 'Order placed successfully.', [
                { text: 'Orders', onPress: () => navigation.navigate('Orders') }
            ]);
        } catch (error) {
            console.error('Checkout failed:', error);
            const errorMessage = error?.data?.message || error?.message || 'Transaction failed. Please try again.';
            showAlert('Error', errorMessage, [{ text: 'OK' }]);
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
});

export default Cart;
