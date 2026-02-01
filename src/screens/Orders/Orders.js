/**
 * @fileoverview Orders Screen
 * @module screens/Orders/Orders
 * @description Displays order history with caching and offline support.
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useGetOrdersQuery } from '../../services/shopService';
import { cacheOrders, getCachedOrders } from '../../db';
import { colors, getColors } from '../../global/colors';
import ParticlesBackground from '../../components/3d/ParticlesBackground';

const Orders = () => {
    const { localId } = useSelector(state => state.auth);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);

    // States
    const [localOrders, setLocalOrders] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const { data: serverOrders, isLoading: isServerLoading, refetch, isError } = useGetOrdersQuery(localId || 'anonymous');
    const themeColors = useMemo(() => getColors(isDarkMode), [isDarkMode]);

    // Cache Hydration
    useEffect(() => {
        let mounted = true;
        const hydrate = async () => {
            if (!localId) return;
            const cached = await getCachedOrders(localId);
            if (mounted) {
                if (cached?.length) setLocalOrders(cached);
                setIsInitialLoad(false);
            }
        };
        hydrate();
        return () => { mounted = false; };
    }, [localId]);

    // Server Sync
    useEffect(() => {
        if (serverOrders?.length && localId) {
            setLocalOrders(serverOrders);
            cacheOrders(serverOrders, localId);
        }
    }, [serverOrders, localId]);

    if (isInitialLoad && isServerLoading && !localOrders.length) {
        return <LoadingState themeColors={themeColors} isDarkMode={isDarkMode} />;
    }

    if (!isInitialLoad && !localOrders.length && !isServerLoading) {
        return <EmptyState refetch={refetch} themeColors={themeColors} isError={isError} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
            <ParticlesBackground />
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

            <View style={[styles.header, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)' }]}>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>My Orders</Text>
                {isServerLoading && <ActivityIndicator size="small" color={themeColors.text} style={{ marginLeft: 10 }} />}
            </View>

            <FlatList
                data={localOrders}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onRefresh={refetch}
                refreshing={isServerLoading}
                renderItem={({ item, index }) => (
                    <OrderCard item={item} index={index} themeColors={themeColors} isDarkMode={isDarkMode} />
                )}
                ListFooterComponent={<View style={{ height: 40 }} />}
            />
        </SafeAreaView>
    );
};

// --- Sub-Components ---

const LoadingState = ({ themeColors, isDarkMode }) => (
    <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
);

const EmptyState = ({ refetch, themeColors, isError }) => (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <ParticlesBackground />
        <View style={styles.emptyContainer}>
            <View style={[styles.iconBox, { backgroundColor: themeColors.bgSecondary }]}>
                <Ionicons name="receipt-outline" size={60} color={themeColors.textLight} />
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.text }]}>No orders found</Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textLight }]}>
                Looks like you haven't placed any orders yet.
                {isError && "\n(Network error occurred)"}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={refetch} activeOpacity={0.8}>
                <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
);

const OrderCard = ({ item, index, themeColors, isDarkMode }) => (
    <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        style={[styles.orderCard, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFF', borderColor: isDarkMode ? '#2C2C2E' : '#F2F2F7' }]}
    >
        <View style={styles.cardHeader}>
            <View>
                <Text style={[styles.orderId, { color: themeColors.text }]}>ORDER #{item.id.slice(-6).toUpperCase()}</Text>
                <Text style={[styles.orderDate, { color: themeColors.textLight }]}>
                    {new Date(item.createdAt).toLocaleDateString()} {item.isCached && '• Offline Cache'}
                </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.isCached ? '#FF950015' : 'rgba(52, 199, 89, 0.1)' }]}>
                <Text style={[styles.statusText, { color: item.isCached ? '#FF9500' : colors.success }]}>
                    {item.status ? item.status.toUpperCase() : 'DELIVERED'}
                </Text>
            </View>
        </View>

        <View style={[styles.divider, { backgroundColor: isDarkMode ? '#38383A' : '#F2F2F7' }]} />

        <View style={styles.cardFooter}>
            <View style={styles.thumbnails}>
                {item.items.slice(0, 3).map((prod, i) => (
                    <View key={i} style={[styles.thumb, { backgroundColor: themeColors.bgSecondary }]}>
                        <Ionicons name="cube-outline" size={10} color={themeColors.textLight} />
                    </View>
                ))}
                {item.items.length > 3 && <Text style={{ fontSize: 10, color: themeColors.textLight }}>+{item.items.length - 3}</Text>}
            </View>
            <View>
                <Text style={[styles.itemCount, { color: themeColors.textLight }]}>{item.items.length} Items</Text>
                <Text style={styles.totalPrice}>Total: ${item.total.toFixed(2)}</Text>
            </View>
        </View>
    </Animated.View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
    listContent: { padding: 20 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, marginTop: 100 },
    iconBox: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
    emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, opacity: 0.7, marginBottom: 24 },
    retryButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 20 },
    retryText: { color: '#FFF', fontWeight: '700' },
    orderCard: { borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12 }, android: { elevation: 3 } }) },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    orderId: { fontSize: 16, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    orderDate: { fontSize: 12, fontWeight: '500', marginTop: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '800' },
    divider: { height: 1, marginBottom: 16 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    thumbnails: { flexDirection: 'row', gap: 4, alignItems: 'center' },
    thumb: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    itemCount: { fontSize: 12, fontWeight: '600', marginBottom: 2, textAlign: 'right' },
    totalPrice: { fontSize: 18, fontWeight: '900', color: colors.primary }
});

export default Orders;
