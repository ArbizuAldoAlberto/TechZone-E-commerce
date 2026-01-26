/**
 * @fileoverview Shopping Cart State with Offline-First Support
 * @description Manages cart items, totals, and offline sync queue.
 * Items added while offline are marked with `isPending` and sync when connection restores.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    total: 0,
    isOffline: false,
    pendingSyncCount: 0,
};

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        /**
         * @description Adds product to cart or increments quantity if exists.
         * Marks item as pending if offline for later sync.
         */
        addItem: (state, action) => {
            const productToAdd = action.payload;
            const inCart = state.items.find((item) => item.id === productToAdd.id);

            if (inCart) {
                inCart.quantity += 1;
                if (state.isOffline && !inCart.isPending) {
                    inCart.isPending = true;
                    state.pendingSyncCount += 1;
                }
            } else {
                state.items.push({
                    ...productToAdd,
                    quantity: 1,
                    isPending: state.isOffline,
                });
                if (state.isOffline) {
                    state.pendingSyncCount += 1;
                }
            }
            state.total += productToAdd.price;
        },

        /**
         * @description Decreases item quantity or removes if quantity reaches 0.
         */
        decreaseItem: (state, action) => {
            const itemId = action.payload;
            const inCart = state.items.find((item) => item.id === itemId);

            if (!inCart) return;

            if (inCart.quantity > 1) {
                inCart.quantity -= 1;
                state.total -= inCart.price;
                if (state.isOffline && !inCart.isPending) {
                    inCart.isPending = true;
                    state.pendingSyncCount += 1;
                }
            } else {
                if (inCart.isPending) {
                    state.pendingSyncCount = Math.max(0, state.pendingSyncCount - 1);
                }
                state.items = state.items.filter((item) => item.id !== itemId);
                state.total -= inCart.price;
            }
        },

        /**
         * @description Removes item completely from cart regardless of quantity.
         */
        removeItem: (state, action) => {
            const itemId = action.payload;
            const inCart = state.items.find((item) => item.id === itemId);

            if (!inCart) return;

            if (inCart.isPending) {
                state.pendingSyncCount = Math.max(0, state.pendingSyncCount - 1);
            }
            state.total -= inCart.price * inCart.quantity;
            state.items = state.items.filter((item) => item.id !== itemId);
        },

        /** Clears entire cart after successful order confirmation */
        confirmCart: (state) => {
            state.items = [];
            state.total = 0;
            state.pendingSyncCount = 0;
        },

        /** Updates network connectivity status from NetInfo listener */
        setOfflineStatus: (state, action) => {
            state.isOffline = action.payload;
        },

        /** Marks all pending items as synced after successful backend sync */
        markItemsSynced: (state) => {
            state.items = state.items.map((item) => ({ ...item, isPending: false }));
            state.pendingSyncCount = 0;
        },

        /**
         * @description Loads pending items from SQLite on app restart.
         * Merges with existing cart, avoiding duplicates.
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

        /** Manually updates pending sync count for edge cases */
        setPendingSyncCount: (state, action) => {
            state.pendingSyncCount = action.payload;
        },
    },
});

export const {
    addItem,
    decreaseItem,
    removeItem,
    confirmCart,
    setOfflineStatus,
    markItemsSynced,
    loadPendingItems,
    setPendingSyncCount,
} = cartSlice.actions;

export default cartSlice.reducer;
