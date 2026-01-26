/**
 * @fileoverview Shop UI State Management
 * @description Manages category/product selection for UI navigation and filtering.
 * Note: Actual products data is fetched via RTK Query (shopApi), not stored here.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedCategory: null,
    selectedProduct: null,
};

export const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        /** Sets the active category filter (null = all categories) */
        setCategorySelected: (state, action) => {
            state.selectedCategory = action.payload;
        },
        /** Sets the selected product ID for detail view navigation */
        setProductIdSelected: (state, action) => {
            state.selectedProduct = action.payload;
        },
    },
});

export const { setCategorySelected, setProductIdSelected } = shopSlice.actions;
export default shopSlice.reducer;
