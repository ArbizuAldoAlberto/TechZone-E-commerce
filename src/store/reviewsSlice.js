/**
 * @fileoverview [DEPRECATED] Product Reviews State Management
 * @description This file is deprecated in favor of backend persistence via `shopService.js`.
 * It is kept temporarily to prevent build errors if referenced elsewhere, but should be removed in the next major refactor.
 */
import { createSlice } from '@reduxjs/toolkit';

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState: {
        byProductId: {},
    },
    reducers: {
        addReview: (state, action) => {
            // No-op: Reviews are now handled by RTK Query mutations
            console.warn('Redux addReview is deprecated. Use usePostReviewMutation hook instead.');
        },
        removeReview: (state, action) => {
            // No-op
        },
        clearProductReviews: (state, action) => {
            // No-op
        },
    },
});

export const selectReviewsByProductId = (state, productId) => []; // Return empty array to avoid crashes
export const selectAverageRating = (state, productId) => 0;
export const selectReviewCount = (state, productId) => 0;

export const { addReview, removeReview, clearProductReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
