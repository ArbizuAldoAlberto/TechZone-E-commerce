import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../global/constants';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
    tagTypes: ['Profile', 'Favorites'],
    endpoints: (builder) => ({
        // Get user profile (image, location, etc.)
        getProfile: builder.query({
            query: (localId) => `users/${localId}.json`,
            providesTags: ['Profile'],
        }),
        // Update profile image
        updateProfileImage: builder.mutation({
            query: ({ localId, image }) => ({
                url: `users/${localId}/profileImage.json`,
                method: 'PUT',
                body: JSON.stringify(image),
            }),
            invalidatesTags: ['Profile'],
        }),
        // Update user location
        updateUserLocation: builder.mutation({
            query: ({ localId, location }) => ({
                url: `users/${localId}/location.json`,
                method: 'PUT',
                body: location,
            }),
            invalidatesTags: ['Profile'],
        }),
        // Get favorites
        getFavorites: builder.query({
            query: (localId) => `users/${localId}/favorites.json`,
            providesTags: ['Favorites'],
            transformResponse: (response) => response || [],
        }),
        // Update favorites (sync entire list)
        updateFavorites: builder.mutation({
            query: ({ localId, favorites }) => ({
                url: `users/${localId}/favorites.json`,
                method: 'PUT',
                body: favorites,
            }),
            invalidatesTags: ['Favorites'],
            async onQueryStarted({ localId, favorites }, { dispatch, queryFulfilled }) {
                // Optimistic Update: Update the cache immediately
                const patchResult = dispatch(
                    userApi.util.updateQueryData('getFavorites', localId, (draft) => {
                        return favorites;
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    // Rollback if network fails
                    patchResult.undo();
                }
            },
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileImageMutation,
    useUpdateUserLocationMutation,
    useGetFavoritesQuery,
    useUpdateFavoritesMutation,
} = userApi;
