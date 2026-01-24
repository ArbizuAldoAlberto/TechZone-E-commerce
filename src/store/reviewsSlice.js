import { createSlice } from '@reduxjs/toolkit';

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState: {
        byProductId: {}, // { [productId]: [{ id, rating, comment, userEmail, createdAt }] }
    },
    reducers: {
        addReview: (state, action) => {
            const { productId, rating, comment, userEmail } = action.payload;

            if (!state.byProductId[productId]) {
                state.byProductId[productId] = [];
            }

            const newReview = {
                id: Date.now().toString(),
                rating,
                comment,
                userEmail,
                createdAt: new Date().toISOString(),
            };

            // Add to beginning of array (newest first)
            state.byProductId[productId].unshift(newReview);
        },
        removeReview: (state, action) => {
            const { productId, reviewId } = action.payload;
            if (state.byProductId[productId]) {
                state.byProductId[productId] = state.byProductId[productId].filter(
                    review => review.id !== reviewId
                );
            }
        },
        clearProductReviews: (state, action) => {
            const productId = action.payload;
            delete state.byProductId[productId];
        },
    },
});

// Selector to get reviews for a specific product
export const selectReviewsByProductId = (state, productId) =>
    state.reviews.byProductId[productId] || [];

// Selector to get average rating for a product
export const selectAverageRating = (state, productId) => {
    const reviews = state.reviews.byProductId[productId] || [];
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
};

// Selector to get review count
export const selectReviewCount = (state, productId) =>
    (state.reviews.byProductId[productId] || []).length;

export const { addReview, removeReview, clearProductReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
