/**
 * @fileoverview RTK Query API for User Profile Management
 * @description Handles user preferences, profile data, and favorites with cross-device sync.
 * Uses cache invalidation tags for automatic refetching on mutations.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../global/constants';

export const userApi = createApi({
    reducerPath: 'userApi',
    // Note: Firebase RTDB uses ?auth=TOKEN for authenticated requests
    // For mutations, we'll add auth in the queryFn where needed
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers) => {
            headers.set('Content-Type', 'application/json');
            return headers;
        }
    }),
    tagTypes: ['Profile', 'Favorites'],
    endpoints: (builder) => ({
        /** Fetches complete user profile from Firebase */
        getProfile: builder.query({
            query: (localId) => `users/${localId}.json`,
            providesTags: ['Profile'],
        }),

        /** Updates profile image with Offline Fallback */
        updateProfileImage: builder.mutation({
            queryFn: async ({ localId, image }) => {
                const endpoint = `users/${localId}/profileImage.json`;
                const method = 'PUT';
                const body = JSON.stringify(image);

                try {
                    const response = await fetch(`${BASE_URL}${endpoint}`, { method, body });
                    if (!response.ok) throw new Error('Network Error');
                    return { data: await response.json() };
                } catch (e) {
                    console.warn("Sentinel: Queuing Profile Image Update");
                    const { enqueueMutation } = require('../db');
                    await enqueueMutation(endpoint, method, image); // Store raw value, SyncManager stringifies payload
                    return { data: image };
                }
            },
            invalidatesTags: ['Profile'],
        }),

        /** Updates user location with Offline Fallback */
        updateUserLocation: builder.mutation({
            queryFn: async ({ localId, location }) => {
                const endpoint = `users/${localId}/location.json`;
                const method = 'PUT';

                try {
                    const response = await fetch(`${BASE_URL}${endpoint}`, {
                        method,
                        body: JSON.stringify(location),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!response.ok) throw new Error('Network Error');
                    return { data: await response.json() };
                } catch (e) {
                    console.warn("Sentinel: Queuing Location Update");
                    const { enqueueMutation } = require('../db');
                    await enqueueMutation(endpoint, method, location);
                    return { data: location };
                }
            },
            invalidatesTags: ['Profile'],
        }),

        /** Fetches user's favorite products */
        getFavorites: builder.query({
            query: (localId) => `users/${localId}/favorites.json`,
            providesTags: ['Favorites'],
            transformResponse: (response) => response || [],
        }),

        /**
         * Syncs favorites with optimistic update.
         * Immediately updates cache, rolls back on network failure.
         */
        updateFavorites: builder.mutation({
            query: ({ localId, favorites }) => ({
                url: `users/${localId}/favorites.json`,
                method: 'PUT',
                body: favorites,
            }),
            invalidatesTags: ['Favorites'],
            async onQueryStarted({ localId, favorites }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    userApi.util.updateQueryData('getFavorites', localId, () => favorites)
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),

        /** Updates theme preference with Offline Fallback */
        updateThemePreference: builder.mutation({
            queryFn: async ({ localId, themePreference }) => {
                const endpoint = `users/${localId}/themePreference.json`;
                const method = 'PUT';
                // Firebase needs stringified primitive manually sometimes, but for PUT on a node it's usually automatic if standard JSON.
                // However, our original code did JSON.stringify(themePreference).
                const body = JSON.stringify(themePreference);

                try {
                    const response = await fetch(`${BASE_URL}${endpoint}`, { method, body });
                    if (!response.ok) throw new Error('Network Error');
                    return { data: await response.json() };
                } catch (e) {
                    console.warn("Sentinel: Queuing Theme Update");
                    const { enqueueMutation } = require('../db');
                    await enqueueMutation(endpoint, method, themePreference);
                    return { data: themePreference };
                }
            },
            invalidatesTags: ['Profile'],
        }),

        /** Batch updates multiple profile fields at once */
        updateFullProfile: builder.mutation({
            query: ({ localId, profileData }) => ({
                url: `users/${localId}.json`,
                method: 'PATCH',
                body: profileData,
            }),
            invalidatesTags: ['Profile'],
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileImageMutation,
    useUpdateUserLocationMutation,
    useGetFavoritesQuery,
    useUpdateFavoritesMutation,
    useUpdateThemePreferenceMutation,
    useUpdateFullProfileMutation,
} = userApi;
