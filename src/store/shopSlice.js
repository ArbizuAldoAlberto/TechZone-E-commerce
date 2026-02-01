/**
 * @fileoverview Shop UI State
 * @description Manages ephemeral UI state for the browsing experience.
 * Controls filters, navigation selection, and active view contexts.
 * 
 * @note This slice does NOT store actual product data (handled by RTK Query cache).
 * It only stores POINTERS (IDs) or FILTERS.
 * 
 * @layer Presentation State (Redux Slice)
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    /** @type {string|null} - ID of the active category filter */
    selectedCategory: null,
    /** @type {string|null} - ID of the product currently being viewed */
    selectedProduct: null,
};

/**
 * @const shopSlice
 * @context UI Interaction State
 */
export const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {

        /**
         * @function setCategorySelected
         * @description Filters the product grid by category.
         * @param {Object} state
         * @param {Object} action - Payload: Category ID string or null (for "All").
         */
        setCategorySelected: (state, action) => {
            state.selectedCategory = action.payload;
        },

        /**
         * @function setProductIdSelected
         * @description Sets the active product for Detail View.
         * @param {Object} state
         * @param {Object} action - Payload: Product ID string.
         */
        setProductIdSelected: (state, action) => {
            state.selectedProduct = action.payload;
        },
    },
});

export const { setCategorySelected, setProductIdSelected } = shopSlice.actions;

export default shopSlice.reducer;
