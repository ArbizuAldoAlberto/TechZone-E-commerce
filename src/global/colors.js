/**
 * @fileoverview Elite Color Palette for TechZone (SO v7.1 Edition)
 * @description Centralized color management with optimized dark mode contrast.
 */

export const colors = {
    // Core Brand
    primary: '#0F172A',      // Midnight Slate
    secondary: '#1E293B',    // Slate Deep
    cta: '#06B6D4',          // Electric Cyan
    accent: '#8B5CF6',       // Vivid Violet
    
    // Status & Feedback
    success: '#10B981',      // Emerald Green
    warning: '#F59E0B',      // Amber Gold
    danger: '#EF4444',       // Rose Red
    info: '#3B82F6',         // Royal Blue
    
    // UI Elements
    background: '#020617',   // Deep Ocean (Perfect for OLED)
    surface: '#0F172A',      // Card Surface
    border: 'rgba(255, 255, 255, 0.08)',
    glassBg: 'rgba(15, 23, 42, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    
    // Typography
    text: '#F8FAFC',         // White Slate
    textLight: '#94A3B8',    // Muted Slate
    white: '#FFFFFF',
    black: '#000000',
    gray: '#64748B',
    
    // Special
    skeleton: '#1E293B',
    skeletonHighlight: '#334155'
};

/**
 * @function getColors
 * @description Helper to dynamically select color schemes based on theme state.
 */
export const getColors = (isDarkMode) => {
    if (isDarkMode) return colors;
    
    // Legacy Light Mode support if needed
    return {
        ...colors,
        background: '#F1F5F9',
        surface: '#FFFFFF',
        text: '#0F172A',
        textLight: '#475569',
        border: 'rgba(0, 0, 0, 0.1)',
        primary: '#FFFFFF',
        secondary: '#F8FAFC'
    };
};
