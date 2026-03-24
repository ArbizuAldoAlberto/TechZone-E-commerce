/**
 * @fileoverview Consolidated Sentinel Sync Engine (V2.1)
 * @module app/services/SyncManager
 * @description Centralized orchestrator for all offline-to-online synchronization.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useConnection } from '../hooks/useConnection';
import { setOfflineStatus, markItemsSynced } from '../../store/cartSlice';
import { clearUser } from '../../store/authSlice';
import { 
    fetchPendingCartItems, 
    clearPendingCartItems, 
    getMutationQueue, 
    removeMutation, 
    incrementRetry, 
    deleteSession,
    MAX_RETRIES 
} from '../../db';
import { shopApi } from '../../services/shopService';
import { userApi } from '../../services/userService';
import { BASE_URL } from '../../global/constants';

/**
 * @component SyncManager
 * @description Headless provider that monitors connectivity and executes background sync.
 */
const SyncManager = ({ children }) => {
    const dispatch = useDispatch();
    const { isConnected, isInternetReachable } = useConnection();
    const { pendingSyncCount } = useSelector(state => state.cart);
    const { token } = useSelector(state => state.auth);
    const [isSyncing, setIsSyncing] = useState(false);
    const wasOffline = useRef(false);
    
    // Sentinel Security: Maintain a real-time reference to the auth token
    const tokenRef = useRef(token);
    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    // 1. Lifecycle Monitor (Connectivity + Auth Readiness)
    useEffect(() => {
        const offline = !isConnected || !isInternetReachable;
        dispatch(setOfflineStatus(offline));

        if (!offline && token) {
            if (wasOffline.current) {
                console.log("Sentinel: Connection restored. Triggering sync engine...");
            }
            triggerFullSync();
        }

        wasOffline.current = offline;
    }, [isConnected, isInternetReachable, token]);

    const triggerFullSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);

        try {
            // A. Sync Pending Cart Items
            if (pendingSyncCount > 0) {
                await syncCartItems();
            }

            // B. Process General Mutation Queue
            if (token) {
                await processMutationQueue();
            } else {
                console.log("Sentinel: Deferring mutation queue until identity is available.");
            }

        } catch (error) {
            console.error("Sentinel: Full Sync Error:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const syncCartItems = async () => {
        try {
            const pendingItems = await fetchPendingCartItems();
            if (pendingItems.length === 0) return;

            await clearPendingCartItems();
            dispatch(markItemsSynced());
            console.log("Sentinel: Cart synced successfully.");
        } catch (e) {
            console.error("Sentinel: Cart sync failed", e);
        }
    };

    const processMutationQueue = async () => {
        if (!token) return;

        try {
            const queue = await getMutationQueue();
            if (queue.length === 0) {
                console.log("Sentinel: Mutation queue is clean.");
                return;
            }

            console.log(`Sentinel: Processing ${queue.length} queued mutations...`);

            for (const mutation of queue) {
                try {
                    await executeMutation(mutation);
                    await removeMutation(mutation.id);
                    handleCacheInvalidation(mutation.endpoint);
                    console.log(`Sentinel: ✅ Synced mutation ${mutation.id}`);
                } catch (error) {
                    console.error(`Sentinel: ❌ Mutation ${mutation.id} failed:`, error.message);
                    
                    if (error.message.includes('401')) {
                        console.warn('Sentinel: Unauthorized mutation. Forcing logout.');
                        await deleteSession();
                        dispatch(clearUser());
                        break;
                    }

                    const retries = await incrementRetry(mutation.id);
                    if (retries >= MAX_RETRIES) {
                        console.warn(`Sentinel: ☠️ Dead-letter reached. Discarding ${mutation.id}`);
                        await removeMutation(mutation.id);
                    }
                }
            }
        } catch (e) {
            console.error("Sentinel: Queue processing error", e);
        }
    };

    const executeMutation = async (mutation) => {
        const currentToken = tokenRef.current;
        if (!currentToken) throw new Error("HTTP 401 - Unauthorized");

        const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
        let url = `${cleanBaseUrl}${mutation.endpoint}`;
        url += url.includes('?') ? `&auth=${currentToken}` : `?auth=${currentToken}`;
        
        const body = typeof mutation.payload === 'string' 
            ? mutation.payload 
            : JSON.stringify(mutation.payload);

        const response = await fetch(url, {
            method: mutation.method,
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        return response.json();
    };

    const handleCacheInvalidation = (endpoint) => {
        if (endpoint.includes('orders')) {
            dispatch(shopApi.util.invalidateTags(['Orders']));
        } else if (endpoint.includes('users')) {
            dispatch(userApi.util.invalidateTags(['Profile']));
        } else if (endpoint.includes('favorites')) {
            dispatch(userApi.util.invalidateTags(['Favorites']));
        } else if (endpoint.includes('reviews')) {
            dispatch(shopApi.util.invalidateTags(['Reviews']));
        }
    };

    return children;
};

export default SyncManager;
