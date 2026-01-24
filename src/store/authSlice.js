import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    localId: null,
    profileImage: null,
    userLocation: null,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.email;
            state.token = action.payload.token;
            state.localId = action.payload.localId;
        },
        clearUser: (state) => {
            state.user = null;
            state.token = null;
            state.localId = null;
            state.profileImage = null;
            state.userLocation = null;
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
