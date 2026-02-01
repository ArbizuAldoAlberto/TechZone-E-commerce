/**
 * @fileoverview Theme Color Palettes (TechZone Elite)
 * @description Defines premium light and dark color schemes.
 */

export const lightColors = {
    primary: '#CA8A04', // Gold
    secondary: '#44403C', // Stone 700
    background: '#FAFAF9', // Warm Off-white
    cardBackground: '#FFFFFF',
    text: '#1C1917', // Nearly Black
    textLight: '#57534E', // Stone 500
    white: '#FFFFFF',
    error: '#DC2626',
    success: '#16A34A',
    accent: '#CA8A04',
    border: '#E7E5E4',
    darkBackground: '#1C1917',
};

export const darkColors = {
    primary: '#CA8A04',
    secondary: '#D6D3D1',
    background: '#0C0A09', // Deep Dark
    cardBackground: '#1C1917', // Stone 900
    text: '#FAFAF9', // Off-white
    textLight: '#A8A29E', // Stone 400
    white: '#FFFFFF',
    error: '#EF4444',
    success: '#22C55E',
    accent: '#FACC15',
    border: '#292524',
    darkBackground: '#000000',
};

export const colors = lightColors;

export const getColors = (isDarkMode) => (isDarkMode ? darkColors : lightColors);
