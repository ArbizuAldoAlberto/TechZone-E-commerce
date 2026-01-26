/**
 * @fileoverview User Favorites/Wishlist State
 * @description Manages products saved to user's wishlist.
 * Synced to Firebase via userApi for cross-device persistence.
 */
import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: {
        items: [],
    },
    reducers: {
        /**
         * @description Toggles product in favorites (add if not present, remove if exists).
         * @param {Object} action.payload - Complete product object to toggle
         */
        toggleFavorite: (state, action) => {
            const product = action.payload;
            const index = state.items.findIndex((item) => item.id === product.id);
            if (index >= 0) {
                state.items.splice(index, 1);
            } else {
                state.items.push(product);
            }
        },
    },
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
