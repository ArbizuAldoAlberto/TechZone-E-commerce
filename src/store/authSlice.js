import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    localId: null,
    profileImage: null,
    userLocation: null,
};

/**
 * @module authSlice
 * @description Redux slice for managing user authentication state and session persistence.
 * Handles user profile data including token, email, localId, and environmental preferences like location and avatar.
 */
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /**
         * @function setUser
         * @description Sets the authenticated user's session data.
         * @param {Object} state - Current Redux state.
         * @param {Object} action - Payload containing email, token, and localId.
         */
        setUser: (state, action) => {
            state.user = action.payload.email;
            state.token = action.payload.token;
            state.localId = action.payload.localId;
        },
        /**
         * @function clearUser
         * @description Clears all user data from the state (Logout).
         */
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.localId = null;
            state.profileImage = null;
            state.userLocation = null;
        },
        /**
         * @function setProfileImage
         * @description Updates the user's profile picture URI.
         * @param {Object} state
         * @param {Object} action - Payload containing image URI string.
         */
        setProfileImage: (state, action) => {
            state.profileImage = action.payload;
        },
        /**
         * @function setUserLocation
         * @description Updates the user's geographical location and address.
         * @param {Object} state
         * @param {Object} action - Payload containing coords object and address string.
         */
        setUserLocation: (state, action) => {
            state.userLocation = action.payload;
        },
    },
});

export const { setUser, clearUser, setProfileImage, setUserLocation } = authSlice.actions;

export default authSlice.reducer;
