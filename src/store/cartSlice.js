/**
 * @fileoverview Cart State Management (Offline-First)
 * @module store/cartSlice
 * @description Manages the shopping cart lifecycle, including CRUD operations,
 * price calculation, and offline synchronization strategy using a persistent queue.
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} CartItem
 * @property {string} id - Product Unique Identifier
 * @property {string} title - Product Name
 * @property {number} price - Unit Price
 * @property {number} quantity - Purchase Quantity
 * @property {boolean} [isPending] - Sync status flag (true = waiting for network)
 */

const initialState = {
    /** @type {CartItem[]} */
    items: [],
    /** @type {number} */
    total: 0,
    /** @type {boolean} */
    isOffline: false,
    /** @type {number} */
    pendingSyncCount: 0,
    /** @type {object|null} Snapshot for rollback on sync failure */
    snapshot: null,
};

/**
 * @const cartSlice
 * @description Redux slice for cart domain.
 * Uses Immer for immutable state updates via mutable syntax.
 */
export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        /**
         * @function addItem
         * @description Adds or increments a product in the cart.
         * Automatically flags item as 'pending' if device is offline.
         * @param {Object} state - Draft state
         * @param {Object} action - { payload: Product }
         */
        addItem: (state, action) => {
            const product = action.payload;
            const existing = state.items.find((item) => item.id === product.id);

            if (existing) {
                existing.quantity += 1;
                // If offline and not yet pending, mark it
                if (state.isOffline && !existing.isPending) {
                    existing.isPending = true;
                    state.pendingSyncCount += 1;
                }
            } else {
                state.items.push({
                    ...product,
                    quantity: 1,
                    isPending: state.isOffline,
                });
                if (state.isOffline) state.pendingSyncCount += 1;
            }

            state.total += product.price;
        },

        /**
         * @function decreaseItem
         * @description Decrements quantity. Removes item if count reaches 0.
         * Handles pending count adjustment.
         */
        decreaseItem: (state, action) => {
            const itemId = action.payload;
            const existing = state.items.find((item) => item.id === itemId);

            if (!existing) return;

            if (existing.quantity > 1) {
                existing.quantity -= 1;
                state.total -= existing.price;

                if (state.isOffline && !existing.isPending) {
                    existing.isPending = true;
                    state.pendingSyncCount += 1;
                }
            } else {
                // Delegate to internal remove logic
                removeItemInternal(state, existing);
            }
        },

        /**
         * @function removeItem
         * @description Completely removes an item from the cart.
         */
        removeItem: (state, action) => {
            const existing = state.items.find((item) => item.id === action.payload);
            if (existing) removeItemInternal(state, existing);
        },

        /**
         * @function confirmCart
         * @description Resets cart after successful checkout.
         */
        confirmCart: (state) => {
            state.items = [];
            state.total = 0;
            state.pendingSyncCount = 0;
        },

        setOfflineStatus: (state, action) => {
            state.isOffline = action.payload;
        },

        markItemsSynced: (state) => {
            state.items.forEach(item => { item.isPending = false; });
            state.pendingSyncCount = 0;
        },

        /**
         * @function loadPendingItems
         * @description Merges persisted offline items into the active cart on boot.
         */
        loadPendingItems: (state, action) => {
            const pendingItems = action.payload;
            pendingItems.forEach((pendingItem) => {
                const existing = state.items.find((item) => item.id === pendingItem.id);
                if (existing) {
                    existing.quantity += pendingItem.quantity;
                    existing.isPending = true;
                } else {
                    state.items.push({ ...pendingItem, isPending: true });
                }
                state.total += pendingItem.price * pendingItem.quantity;
            });
            state.pendingSyncCount = pendingItems.length;
        },

        /**
         * @function saveSnapshot
         * @description Saves current cart state before optimistic mutation.
         * Call this BEFORE making an offline mutation.
         */
        saveSnapshot: (state) => {
            state.snapshot = {
                items: JSON.parse(JSON.stringify(state.items)),
                total: state.total,
                pendingSyncCount: state.pendingSyncCount
            };
        },

        /**
         * @function rollbackCart
         * @description Restores cart to last snapshot on sync failure.
         * Used for Optimistic UI recovery.
         */
        rollbackCart: (state) => {
            if (state.snapshot) {
                state.items = state.snapshot.items;
                state.total = state.snapshot.total;
                state.pendingSyncCount = state.snapshot.pendingSyncCount;
                state.snapshot = null;
            }
        },

        /**
         * @function clearSnapshot
         * @description Clears snapshot after successful sync.
         */
        clearSnapshot: (state) => {
            state.snapshot = null;
        },
    },
});

/**
 * @helper removeItemInternal
 * @description Encapsulates removal logic to DRY up reducers.
 * @private
 */
const removeItemInternal = (state, item) => {
    state.total -= item.price * item.quantity;
    if (item.isPending) {
        state.pendingSyncCount = Math.max(0, state.pendingSyncCount - 1);
    }
    state.items = state.items.filter((i) => i.id !== item.id);
};

export const {
    addItem,
    decreaseItem,
    removeItem,
    confirmCart,
    setOfflineStatus,
    markItemsSynced,
    loadPendingItems,
    saveSnapshot,
    rollbackCart,
    clearSnapshot
} = cartSlice.actions;

export default cartSlice.reducer;
