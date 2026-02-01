/**
 * @fileoverview TechZone Elite Design System
 * @description Premium theme tokens aligned with MASTER.md
 * Style: Liquid Glass | Palette: Dark + Gold
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE (Elite Design System - MASTER.md)
// ═══════════════════════════════════════════════════════════════════════════

export const COLORS = {
    // Core Palette
    primary: '#1C1917',       // Rich Black (Stone 900)
    secondary: '#44403C',     // Warm Gray (Stone 700)
    cta: '#CA8A04',           // Premium Gold (Yellow 600)
    background: '#FAFAF9',    // Off-White (Stone 50)
    text: '#0C0A09',          // Deep Black (Stone 950)

    // Extended Palette
    gold: '#CA8A04',          // CTA Alias
    goldLight: '#FEF3C7',     // Gold Tint for backgrounds
    goldDark: '#92400E',      // Gold Shade for pressed states
    neon: '#08D9D6',          // Accent Cyan (for 3D highlights)

    // Semantic Colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Glass Effects - ELITE Light Mode (min 80% opacity per design system)
    white: '#FFFFFF',
    textLight: '#F1F5F9',     // For dark backgrounds
    textMuted: '#57534E',     // Stone 600 - for light mode muted text (4.5:1 contrast)
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    glassBorderDark: 'rgba(0, 0, 0, 0.12)',
    glassBg: 'rgba(255, 255, 255, 0.92)',  // Increased from 0.7 for proper visibility
    glassBgDark: 'rgba(28, 25, 23, 0.8)',

    // Gradients as strings (for LinearGradient)
    gradientGold: ['#CA8A04', '#F59E0B'],
    gradientDark: ['#1C1917', '#44403C'],
    gradientGlass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
};

// ═══════════════════════════════════════════════════════════════════════════
// SPACING SYSTEM (8px Grid)
// ═══════════════════════════════════════════════════════════════════════════

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    hero: 64,
    section: 80,
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY (Cormorant + Montserrat)
// ═══════════════════════════════════════════════════════════════════════════

export const FONTS = {
    // Font Families
    heading: 'Cormorant',
    body: 'Montserrat',

    // Weight Aliases
    light: 'Montserrat-Light',
    regular: 'Montserrat-Regular',
    medium: 'Montserrat-Medium',
    semiBold: 'Montserrat-SemiBold',
    bold: 'Montserrat-Bold',

    // Heading Weights
    headingRegular: 'Cormorant-Regular',
    headingMedium: 'Cormorant-Medium',
    headingSemiBold: 'Cormorant-SemiBold',
    headingBold: 'Cormorant-Bold',
};

export const FONT_SIZES = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    hero: 32,
    display: 48,
};

// ═══════════════════════════════════════════════════════════════════════════
// SHADOWS (Elevation System)
// ═══════════════════════════════════════════════════════════════════════════

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 25,
        elevation: 12,
    },
    glow: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION CONFIG (Spring Physics - Reanimated 3)
// ═══════════════════════════════════════════════════════════════════════════

export const ANIMATION = {
    // Spring Configurations
    spring: {
        default: { damping: 15, stiffness: 150, mass: 0.5 },
        gentle: { damping: 20, stiffness: 100, mass: 0.8 },
        bouncy: { damping: 10, stiffness: 200, mass: 0.3 },
        stiff: { damping: 25, stiffness: 300, mass: 0.5 },
    },

    // Timing Durations (ms)
    duration: {
        instant: 100,
        fast: 200,
        normal: 300,
        slow: 500,
        dramatic: 800,
    },

    // Stagger Delay for Lists
    stagger: {
        fast: 50,
        normal: 100,
        slow: 150,
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════════════════

export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};
