import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../global/constants';

export const shopApi = createApi({
    reducerPath: 'shopApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    endpoints: (builder) => ({
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
        getProducts: builder.query({
            query: (category) =>
                category ? `products.json?orderBy="category"&equalTo="${category}"` : 'products.json',
        }),
        getProductById: builder.query({
            query: (productId) => `products/${productId}.json`, // Assuming products are indexed or we can filter client side if structure is array
        }),
        postOrder: builder.mutation({
            query: (order) => ({
                url: 'orders.json',
                method: 'POST',
                body: order,
            }),
        }),
        getOrders: builder.query({
            query: (localId) => `orders.json?orderBy="user"&equalTo="${localId}"`,
            transformResponse: (response) => {
                if (!response) return [];
                return Object.entries(response).map(([id, data]) => ({
                    id,
                    ...data,
                }));
            },
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetProductsQuery,
    useGetProductByIdQuery,
    usePostOrderMutation,
    useGetOrdersQuery,
} = shopApi;
