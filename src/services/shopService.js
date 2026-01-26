/**
 * @fileoverview RTK Query API for Shop Operations
 * @description Handles products, categories, orders, and reviews via Firebase Realtime Database.
 * Provides automatic caching, refetching, and optimistic updates.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../global/constants';

export const shopApi = createApi({
    reducerPath: 'shopApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: ['Reviews', 'Orders'], // Added tags for invalidation
    endpoints: (builder) => ({
        /** Fetches all product categories */
        getCategories: builder.query({
            query: () => 'categories.json',
            transformResponse: (response) => {
                if (!response) return [];
                if (Array.isArray(response)) return response;
                return Object.entries(response).map(([id, data]) => ({
                    id: data.id || id,
                    ...data,
                }));
            },
        }),

        /** Fetches products, optionally filtered by category */
        getProducts: builder.query({
            query: (category) =>
                category ? `products.json?orderBy="category"&equalTo="${category}"` : 'products.json',
        }),

        /** Fetches a single product by ID */
        getProductById: builder.query({
            query: (productId) => `products/${productId}.json`,
        }),

        /** Creates a new order */
        postOrder: builder.mutation({
            query: (order) => ({
                url: 'orders.json',
                method: 'POST',
                body: order,
            }),
            invalidatesTags: ['Orders'],
        }),

        /** Fetches orders for a specific user */
        getOrders: builder.query({
            query: (localId) => `orders.json?orderBy="user"&equalTo="${localId}"`,
            transformResponse: (response) => {
                if (!response) return [];
                return Object.entries(response).map(([id, data]) => ({ id, ...data }));
            },
            providesTags: ['Orders'],
        }),

        /** 
         * Fetches reviews for a specific product 
         * Firebase RTDB needs indexing on 'productId' to work efficiently with orderBy
         */
        getReviews: builder.query({
            query: (productId) => `reviews.json?orderBy="productId"&equalTo="${productId}"`,
            transformResponse: (response) => {
                if (!response) return [];
                return Object.entries(response).map(([id, data]) => ({
                    id,
                    ...data
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
            },
            providesTags: (result, error, productId) => [{ type: 'Reviews', id: productId }],
        }),

        /** Post a new review */
        postReview: builder.mutation({
            query: (review) => ({
                url: 'reviews.json',
                method: 'POST',
                body: { ...review, createdAt: new Date().toISOString() },
            }),
            invalidatesTags: (result, error, { productId }) => [{ type: 'Reviews', id: productId }],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetProductsQuery,
    useGetProductByIdQuery,
    usePostOrderMutation,
    useGetOrdersQuery,
    useGetReviewsQuery,
    usePostReviewMutation,
} = shopApi;
