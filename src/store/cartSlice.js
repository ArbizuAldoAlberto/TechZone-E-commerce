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
        addItem: (state, action) => {
            const productToAdd = action.payload;
            const inCart = state.items.find(
                (item) => item.id === productToAdd.id
            );

            if (inCart) {
                inCart.quantity += 1;
                // If offline, mark as pending
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
        decreaseItem: (state, action) => {
            const itemId = action.payload;
            const inCart = state.items.find(item => item.id === itemId);

            if (inCart) {
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
                    state.items = state.items.filter(item => item.id !== itemId);
                    state.total -= inCart.price;
                }
            }
        },
        removeItem: (state, action) => {
            const itemId = action.payload;
            const inCart = state.items.find(item => item.id === itemId);
            if (inCart) {
                if (inCart.isPending) {
                    state.pendingSyncCount = Math.max(0, state.pendingSyncCount - 1);
                }
                state.total -= inCart.price * inCart.quantity;
                state.items = state.items.filter(item => item.id !== itemId);
            }
        },
        confirmCart: (state) => {
            state.items = [];
            state.total = 0;
            state.pendingSyncCount = 0;
        },
        setOfflineStatus: (state, action) => {
            state.isOffline = action.payload;
        },
        markItemsSynced: (state) => {
            state.items = state.items.map(item => ({
                ...item,
                isPending: false,
            }));
            state.pendingSyncCount = 0;
        },
        loadPendingItems: (state, action) => {
            const pendingItems = action.payload;
            pendingItems.forEach(pendingItem => {
                const existing = state.items.find(item => item.id === pendingItem.id);
                if (existing) {
                    existing.quantity += pendingItem.quantity;
                    existing.isPending = true;
                } else {
                    state.items.push({
                        ...pendingItem,
                        isPending: true,
                    });
                }
                state.total += pendingItem.price * pendingItem.quantity;
            });
            state.pendingSyncCount = pendingItems.length;
        },
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
