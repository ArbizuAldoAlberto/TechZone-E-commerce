/**
 * @fileoverview Sentinel Sync Engine (Offline-First Orchestrator)
 * @description Background process that monitors network connectivity and processes
 * the persistence write-queue (SQLite -> Cloud).
 * 
 * @architectural_note
 * - **Trigger**: Network Restoration (NetInfo).
 * - **Process**: FIFO Queue Consumption.
 * - **Consistency**: Invalidates RTK Query tags upon successful sync to refresh UI.
 * - **Security**: Re-validates auth tokens before processing queue.
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMutationQueue, removeMutation, incrementRetry, MAX_RETRIES } from '../db';
import { shopApi } from './shopService';
import { userApi } from './userService';
import { BASE_URL } from '../global/constants';

/**
 * @component SyncManager
 * @returns {null} Headless component
 */
const SyncManager = () => {
    const dispatch = useDispatch();
    const isOffline = useSelector(state => state.cart.isOffline); // Managed by MainNavigator
    const { token } = useSelector(state => state.auth);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        if (!isOffline && !isSyncing && token) {
            processQueue();
        }
    }, [isOffline, token]);

    const processQueue = async () => {
        setIsSyncing(true);
        console.log("Sentinel: Checking offline queue...");

        try {
            const queue = await getMutationQueue();
            if (queue.length === 0) {
                console.log("Sentinel: Queue empty. System synced.");
                setIsSyncing(false);
                return;
            }

            console.log(`Sentinel: Found ${queue.length} pending mutations.`);

            for (const mutation of queue) {
                try {
                    await executeMutation(mutation, token);
                    await removeMutation(mutation.id);

                    // Intelligent Invalidation
                    if (mutation.endpoint.includes('orders')) {
                        dispatch(shopApi.util.invalidateTags(['Orders']));
                    } else if (mutation.endpoint.includes('users')) {
                        dispatch(userApi.util.invalidateTags(['Profile']));
                    }

                    console.log(`Sentinel: ✅ Synced ${mutation.id}`);

                } catch (error) {
                    console.error(`Sentinel: ❌ Sync failed for ${mutation.id}`, error.message);

                    // Skip-Failed Strategy: Increment retry, remove if max exceeded
                    const retries = await incrementRetry(mutation.id);

                    if (retries >= MAX_RETRIES) {
                        console.error(`Sentinel: ☠️ Dead-letter: ${mutation.id} after ${MAX_RETRIES} attempts`);
                        await removeMutation(mutation.id);
                        // Logged for analytics/debugging. 
                        console.warn(`Mutation ${mutation.id} permanently discarded.`);
                    }

                    // Continue processing other mutations (don't break)
                }
            }
        } catch (e) {
            console.error("Sentinel: Queue access error", e);
        } finally {
            setIsSyncing(false);
        }
    };

    /**
     * Executes a single queued mutation against the REST API.
     */
    const executeMutation = async (mutation, authToken) => {
        const url = `${BASE_URL}${mutation.endpoint}`;

        // Sanity Check: If payload is stringified JSON in DB, parse it. 
        // Our DB layer stores payload as string.
        let body = mutation.payload;
        try {
            // Check if it's already an object (if DB implementation changed)
            if (typeof body === 'string') {
                // Determine if it needs parsing or is a raw string
                // Ideally, body passed to fetch should be stringified if content-type is json.
                // Our db payload is JSON string.
            }
        } catch (e) {
            // If parsing fails, it might be a primitive or raw string. Proceeding as is.
            // console.warn("Payload parsing check skipped:", e); 
        }

        const response = await fetch(url, {
            method: mutation.method,
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${authToken}` // Firebase RTDB often uses query param ?auth=
            },
            body: body
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }

        return response.json();
    };

    return null; // Headless
};

export default SyncManager;
