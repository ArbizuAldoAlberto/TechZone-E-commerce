// Light theme (default)
export const lightColors = {
    primary: '#007AFF', // Tech Blue
    darkBackground: '#1A1A1A',
    cardBackground: '#FFFFFF',
    text: '#1C1C1E',
    textLight: '#8E8E93',
    background: '#F2F2F7',
    white: '#FFFFFF',
    error: '#FF3B30',
    success: '#34C759',
    secondary: '#5856D6',
    accent: '#FF9500',
    border: '#E5E5EA',
};

// Dark theme
export const darkColors = {
    primary: '#0A84FF', // Brighter blue for dark mode
    darkBackground: '#000000',
    cardBackground: '#1C1C1E',
    text: '#FFFFFF',
    textLight: '#8E8E93',
    background: '#000000',
    white: '#FFFFFF',
    error: '#FF453A',
    success: '#32D74B',
    secondary: '#5E5CE6',
    accent: '#FF9F0A',
    border: '#38383A',
};

// Default export for backwards compatibility (light theme)
export const colors = lightColors;

/**
 * Get the appropriate color palette based on theme
 * @param {boolean} isDarkMode 
 * @returns {typeof lightColors}
 */
export const getColors = (isDarkMode) => {
    return isDarkMode ? darkColors : lightColors;
};
