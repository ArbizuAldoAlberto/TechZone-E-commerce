/**
 * @fileoverview Authentication State Management
 * @module store/authSlice
 * @description Manages user identity, session tokens, and security context.
 * Serves as the single source of truth for the current user's authentication state.
 */

import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} UserLocation
 * @property {Object} coords - Latitude and longitude coordinates
 * @property {string} address - Reversed geocoded address
 */

const initialState = {
    user: null,         // Email/ID
    token: null,        // JWT Token
    localId: null,      // Firebase UID
    profileImage: null, // Avatar URI
    userLocation: null, // Last known location
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * @function setUser
         * @description Hydrates auth state after login.
         * @param {Object} action - { payload: { email, token, localId } }
         */
        setUser: (state, action) => {
            state.user = action.payload.email;
            state.token = action.payload.token;
            state.localId = action.payload.localId;
        },

        /**
         * @function clearUser
         * @description Securely clears all session data on logout.
         */
        clearUser: (state) => {
            Object.keys(initialState).forEach(key => state[key] = null);
        },

        setProfileImage: (state, action) => {
            state.profileImage = action.payload;
        },

        setUserLocation: (state, action) => {
            state.userLocation = action.payload;
        },
    },
});

export const { setUser, clearUser, setProfileImage, setUserLocation } = authSlice.actions;
export default authSlice.reducer;
