/**
 * @fileoverview RTK Query API for User Profile Management
 * @description Handles user preferences, profile data, and favorites with cross-device sync.
 * Uses cache invalidation tags for automatic refetching on mutations.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../global/constants';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: ['Profile', 'Favorites'],
    endpoints: (builder) => ({
        /** Fetches complete user profile from Firebase */
        getProfile: builder.query({
            query: (localId) => `users/${localId}.json`,
            providesTags: ['Profile'],
        }),

        /** Updates profile image URI in Firebase */
        updateProfileImage: builder.mutation({
            query: ({ localId, image }) => ({
                url: `users/${localId}/profileImage.json`,
                method: 'PUT',
                body: JSON.stringify(image),
            }),
            invalidatesTags: ['Profile'],
        }),

        /** Updates user location (coords + address) */
        updateUserLocation: builder.mutation({
            query: ({ localId, location }) => ({
                url: `users/${localId}/location.json`,
                method: 'PUT',
                body: location,
            }),
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

        /** Updates theme preference for cross-device sync */
        updateThemePreference: builder.mutation({
            query: ({ localId, themePreference }) => ({
                url: `users/${localId}/themePreference.json`,
                method: 'PUT',
                body: JSON.stringify(themePreference),
            }),
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
