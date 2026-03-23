/**
 * @fileoverview Shop Service (RTK Query API Layer)
 * @module services/shopService
 * @description Centralized data access layer for TechZone e-commerce operations.
 * Handles interactions with Firebase Realtime Database for products, categories,
 * orders, and reviews.
 */

import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../global/constants';

// Create a base query with retry logic
// Note: Firebase RTDB uses ?auth=TOKEN not Authorization header
const rawBaseQuery = fetchBaseQuery({
    baseUrl: BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`,
    prepareHeaders: (headers) => {
        headers.set('Content-Type', 'application/json');
        return headers;
    }
});

/**
 * @function customBaseQuery
 * @description Dynamically appends the auth token to Firebase URL parameters.
 */
const customBaseQuery = async (args, api, extraOptions) => {
    const token = api.getState().auth.token;
    let urlArg = typeof args === 'string' ? args : args.url;
    
    if (token) {
        urlArg += urlArg.includes('?') ? `&auth=${token}` : `?auth=${token}`;
    }
    
    const modifiedArgs = typeof args === 'string' ? urlArg : { ...args, url: urlArg };
    return rawBaseQuery(modifiedArgs, api, extraOptions);
};

const baseQueryWithRetry = retry(customBaseQuery, { maxRetries: 3 });

/**
 * @const shopApi
 * @description RTK Query API slice for all shop-related network requests.
 */
export const shopApi = createApi({
    reducerPath: 'shopApi',
    baseQuery: baseQueryWithRetry,
    tagTypes: ['Reviews', 'Orders', 'Products'],
    endpoints: (builder) => ({

        /**
         * @function getCategories
         * @returns {Object[]} list of product categories
         */
        getCategories: builder.query({
            query: () => 'categories.json',
            transformResponse: (response) => {
                if (!response) return [];
                if (Array.isArray(response)) return response;
                return Object.entries(response).map(([id, data]) => ({ id: data.id || id, ...data }));
            },
        }),

        /**
         * @function getProducts
         * @param {string} [category] optional category filter
         * @returns {Object[]} product array - transformed from Firebase object
         */
        getProducts: builder.query({
            query: (category) => category ? `products.json?orderBy="category"&equalTo="${category}"` : 'products.json',
            transformResponse: (response) => {
                if (!response) return [];
                if (Array.isArray(response)) return response;
                return Object.entries(response).map(([id, data]) => ({
                    id: data.id || id,
                    ...data
                }));
            },
            providesTags: ['Products'],
        }),

        getProductById: builder.query({
            query: (productId) => `products/${productId}.json`,
        }),

        /**
         * @function postOrder
         * @description Submits order with "Offline-First" fallback logic.
         */
        postOrder: builder.mutation({
            queryFn: async (order, { getState }) => {
                const endpoint = 'orders.json';
                const method = 'POST';
                const token = getState().auth.token;
                const finalOrder = {
                    ...order,
                    status: 'pending',
                    serverTimestamp: new Date().toISOString()
                };

                try {
                    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
                    const url = token ? `${cleanBaseUrl}${endpoint}?auth=${token}` : `${cleanBaseUrl}${endpoint}`;

                    const response = await fetch(url, {
                        method,
                        body: JSON.stringify(finalOrder),
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const data = await response.json();
                    return { data: { name: data.name } };

                } catch (error) {
                    console.warn("Sentinel: Network failed, queuing mutation...", error);
                    const { enqueueMutation } = require('../db');
                    await enqueueMutation(endpoint, method, finalOrder);
                    return { data: { name: `offline_${Date.now()}` }, meta: { isOffline: true } };
                }
            },
            invalidatesTags: ['Orders'],
        }),

        getOrders: builder.query({
            query: (localId) => `orders.json?orderBy="user"&equalTo="${localId}"`,
            transformResponse: (response) => {
                if (!response) return [];
                return Object.entries(response)
                    .map(([id, data]) => ({ id, ...data }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            },
            providesTags: ['Orders'],
        }),

        getReviews: builder.query({
            query: (productId) => `reviews.json?orderBy="productId"&equalTo="${productId}"`,
            transformResponse: (response) => {
                if (!response) return [];
                return Object.entries(response)
                    .map(([id, data]) => ({ id, ...data }))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            },
            providesTags: (result, error, productId) => [{ type: 'Reviews', id: productId }],
        }),

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
