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
    // Wrap baseQuery asyncedly to dynamically append token from Redux state to URL params for REST operations.
    baseQuery: async (args, api, extraOptions) => {
        const token = api.getState().auth.token;
        let urlArg = typeof args === 'string' ? args : args.url;
        
        if (token) {
            urlArg += urlArg.includes('?') ? `&auth=${token}` : `?auth=${token}`;
        }
        
        const modifiedArgs = typeof args === 'string' ? urlArg : { ...args, url: urlArg };
        
        const rawBaseQuery = fetchBaseQuery({
            baseUrl: BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`,
            prepareHeaders: (headers) => {
                headers.set('Content-Type', 'application/json');
                return headers;
            }
        });
        
        return rawBaseQuery(modifiedArgs, api, extraOptions);
    },
    tagTypes: ['Profile', 'Favorites'],
    endpoints: (builder) => ({
        /** Fetches complete user profile from Firebase */
        getProfile: builder.query({
            query: (localId) => `users/${localId}.json`,
            providesTags: ['Profile'],
        }),

        /** Updates profile image with Offline Fallback */
        updateProfileImage: builder.mutation({
            queryFn: async ({ localId, image }, { getState }) => {
                const endpoint = `users/${localId}/profileImage.json`;
                const method = 'PUT';
                const body = JSON.stringify(image);

                try {
                    const token = getState().auth.token;
                    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
                    const url = token ? `${cleanBaseUrl}${endpoint}?auth=${token}` : `${cleanBaseUrl}${endpoint}`;
                    
                    const response = await fetch(url, { 
                        method, 
                        body,
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return { data: await response.json() };
                } catch (e) {
                    console.warn("Sentinel: Queuing Profile Image Update");
                    const { enqueueMutation } = require('../db');
                    await enqueueMutation(endpoint, method, image);
                    return { data: image };
                }
            },
            invalidatesTags: ['Profile'],
        }),

        /** Updates user location with Offline Fallback */
        updateUserLocation: builder.mutation({
            queryFn: async ({ localId, location }, { getState }) => {
                const endpoint = `users/${localId}/location.json`;
                const method = 'PUT';

                try {
                    const token = getState().auth.token;
                    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
                    const url = token ? `${cleanBaseUrl}${endpoint}?auth=${token}` : `${cleanBaseUrl}${endpoint}`;
                    
                    const response = await fetch(url, {
                        method,
                        body: JSON.stringify(location),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
            queryFn: async ({ localId, themePreference }, { getState }) => {
                const endpoint = `users/${localId}/themePreference.json`;
                const method = 'PUT';
                const body = JSON.stringify(themePreference);

                try {
                    const token = getState().auth.token;
                    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
                    const url = token ? `${cleanBaseUrl}${endpoint}?auth=${token}` : `${cleanBaseUrl}${endpoint}`;
                    
                    const response = await fetch(url, { 
                        method, 
                        body,
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
