/**
 * @fileoverview Theme State Management
 * @description Controls app-wide light/dark mode preference.
 * Synced to Firebase (cloud) and SQLite (local) for cross-device persistence.
 */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isDarkMode: true,
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        /** Toggles between light and dark mode */
        toggleTheme: (state) => {
            state.isDarkMode = !state.isDarkMode;
        },
        /** Explicitly sets dark mode on/off */
        setDarkMode: (state, action) => {
            state.isDarkMode = action.payload;
        },
    },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
