/**
 * @fileoverview Orders Screen
 * @description Displays a list of user's past orders.
 * Features:
 * - Fetches orders from Firebase via RTK Query
 * - Pull-to-refresh functionality
 * - Offline/Empty state handling
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { colors, getColors } from '../../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetOrdersQuery } from '../../services/shopService';
import { useSelector } from 'react-redux';

const Orders = () => {
    const { localId } = useSelector(state => state.auth);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const { data: orders, isLoading, refetch } = useGetOrdersQuery(localId || 'anonymous');

    // Get dynamic colors based on theme
    const themeColors = getColors(isDarkMode);
    const dynamicStyles = getDynamicStyles(isDarkMode, themeColors);

    const renderOrder = ({ item }) => (
        <View style={[styles.orderCard, dynamicStyles.card]}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={[styles.orderId, dynamicStyles.text]}>ORDER #{item.id.slice(-6).toUpperCase()}</Text>
                    <Text style={[styles.orderDate, dynamicStyles.textLight]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>DELIVERED</Text>
                </View>
            </View>
            <View style={[styles.divider, dynamicStyles.divider]} />
            <View style={styles.orderFooter}>
                <Text style={[styles.itemCountText, dynamicStyles.textLight]}>{item.items.length} Items</Text>
                <Text style={styles.totalText}>Total: ${item.total.toFixed(2)}</Text>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, dynamicStyles.background]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.background]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />
            <View style={[styles.header, dynamicStyles.headerBg]}>
                <Text style={[styles.headerTitle, dynamicStyles.text]}>My Orders</Text>
            </View>

            {orders && orders.length > 0 ? (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isLoading}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.emptyContainer}>
                        <View style={[styles.iconBox, dynamicStyles.card]}>
                            <Ionicons name="receipt-outline" size={60} color={themeColors.textLight} />
                        </View>
                        <Text style={[styles.emptyTitle, dynamicStyles.text]}>No orders yet</Text>
                        <Text style={[styles.emptySubtitle, dynamicStyles.textLight]}>When you shop, your orders will appear here for you to track.</Text>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

// Dynamic styles based on theme
const getDynamicStyles = (isDarkMode, themeColors) => StyleSheet.create({
    background: {
        backgroundColor: themeColors.background,
    },
    headerBg: {
        backgroundColor: isDarkMode ? '#1C1C1E' : colors.white,
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
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
    },
    listContent: {
        padding: 20,
    },
    orderCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            }
        }),
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '800',
    },
    orderDate: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    statusBadge: {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.success,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemCountText: {
        fontSize: 14,
        fontWeight: '600',
    },
    totalText: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.primary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyContainer: {
        alignItems: 'center',
    },
    iconBox: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            }
        }),
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default Orders;
