import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: {
        items: [], // Array of product IDs or objects
    },
    reducers: {
        toggleFavorite: (state, action) => {
            const product = action.payload;
            const index = state.items.findIndex(item => item.id === product.id);
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
