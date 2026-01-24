import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { useConnection } from '../hooks/useConnection';
import { setOfflineStatus, markItemsSynced } from '../../store/cartSlice';
import {
    fetchPendingCartItems,
    clearPendingCartItems,
    insertPendingCartItem
} from '../../db';

/**
 * SyncManager Component
 * Monitors network connectivity and handles automatic synchronization
 * of pending cart items when connection is restored.
 */
const SyncManager = ({ children }) => {
    const dispatch = useDispatch();
    const { isConnected, isInternetReachable } = useConnection();
    const { items, isOffline, pendingSyncCount } = useSelector(state => state.cart);
    const wasOffline = useRef(false);

    // Update offline status in Redux
    useEffect(() => {
        const offline = !isConnected || !isInternetReachable;
        dispatch(setOfflineStatus(offline));

        // Was offline, now online - trigger sync
        if (wasOffline.current && !offline && pendingSyncCount > 0) {
            syncPendingItems();
        }

        wasOffline.current = offline;
    }, [isConnected, isInternetReachable]);

    // Save items to SQLite when offline
    useEffect(() => {
        if (isOffline && items.length > 0) {
            savePendingItemsToDb();
        }
    }, [items, isOffline]);

    const savePendingItemsToDb = async () => {
        const pendingItems = items.filter(item => item.isPending);
        for (const item of pendingItems) {
            await insertPendingCartItem(item);
        }
    };

    const syncPendingItems = async () => {
        try {
            const pendingItems = await fetchPendingCartItems();

            if (pendingItems.length === 0) return;

            // Here you would typically sync with Firebase
            // For now, we just clear the pending items and mark as synced

            // In a real implementation:
            // await syncCartToFirebase(pendingItems);

            await clearPendingCartItems();
            dispatch(markItemsSynced());

            // Optional: Show success notification
            // Alert.alert('Synced!', 'Your cart has been synchronized.');

        } catch (error) {
            // Sync failed - will retry on next connection
        }
    };

    // Load pending items on mount
    useEffect(() => {
        loadPendingItemsOnMount();
    }, []);

    const loadPendingItemsOnMount = async () => {
        try {
            const pendingItems = await fetchPendingCartItems();
            if (pendingItems.length > 0) {
                // Items exist in SQLite that haven't been synced
                // They will be displayed with the pending icon
            }
        } catch (error) {
            // Error loading pending items - silent fail
        }
    };

    return children;
};

export default SyncManager;
