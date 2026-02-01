/**
 * @fileoverview TechZone Elite Animation System
 * @description Centralized animation configurations for Reanimated 3.
 * All animations use spring physics for organic, premium feel.
 */

import {
    withSpring,
    withTiming,
    FadeIn,
    FadeInUp,
    FadeInDown,
    FadeOut,
    FadeOutDown,
    SlideInRight,
    SlideOutLeft,
    ZoomIn,
    Layout,
} from 'react-native-reanimated';
import { ANIMATION } from './index';

// ═══════════════════════════════════════════════════════════════════════════
// SPRING PRESETS
// ═══════════════════════════════════════════════════════════════════════════

export const springs = {
    default: ANIMATION.spring.default,
    gentle: ANIMATION.spring.gentle,
    bouncy: ANIMATION.spring.bouncy,
    stiff: ANIMATION.spring.stiff,
};

// ═══════════════════════════════════════════════════════════════════════════
// ENTERING ANIMATIONS (Layout Animations)
// ═══════════════════════════════════════════════════════════════════════════

export const entering = {
    // Fade in with upward motion (best for cards, list items)
    fadeUp: FadeInUp.springify()
        .damping(springs.default.damping)
        .stiffness(springs.default.stiffness),

    // Fade in with downward motion (best for dropdowns, menus)
    fadeDown: FadeInDown.springify()
        .damping(springs.default.damping)
        .stiffness(springs.default.stiffness),

    // Simple fade (best for overlays, modals)
    fade: FadeIn.duration(ANIMATION.duration.normal),

    // Zoom in (best for hero elements, featured items)
    zoom: ZoomIn.springify()
        .damping(springs.gentle.damping)
        .stiffness(springs.gentle.stiffness),

    // Slide from right (best for navigation, drawers)
    slideRight: SlideInRight.springify()
        .damping(springs.default.damping),
};

// ═══════════════════════════════════════════════════════════════════════════
// EXITING ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const exiting = {
    fadeDown: FadeOutDown.duration(ANIMATION.duration.fast),
    fade: FadeOut.duration(ANIMATION.duration.fast),
    slideLeft: SlideOutLeft.duration(ANIMATION.duration.normal),
};

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT ANIMATIONS (for list reordering)
// ═══════════════════════════════════════════════════════════════════════════

export const layout = {
    default: Layout.springify()
        .damping(springs.default.damping)
        .stiffness(springs.default.stiffness),

    gentle: Layout.springify()
        .damping(springs.gentle.damping)
        .stiffness(springs.gentle.stiffness),
};

// ═══════════════════════════════════════════════════════════════════════════
// STAGGERED LIST ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a staggered entering animation for list items.
 * @param {number} index - Item index in the list
 * @param {number} delayMultiplier - Delay between items (ms)
 * @returns {object} Reanimated entering animation
 */
export const staggeredEnter = (index, delayMultiplier = ANIMATION.stagger.normal) => {
    return FadeInUp.springify()
        .damping(springs.default.damping)
        .stiffness(springs.default.stiffness)
        .delay(index * delayMultiplier);
};

/**
 * Creates a staggered zoom animation for featured items.
 * @param {number} index - Item index
 * @param {number} delayMultiplier - Delay between items
 */
export const staggeredZoom = (index, delayMultiplier = ANIMATION.stagger.fast) => {
    return ZoomIn.springify()
        .damping(springs.gentle.damping)
        .stiffness(springs.gentle.stiffness)
        .delay(index * delayMultiplier);
};

// ═══════════════════════════════════════════════════════════════════════════
// GESTURE RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Spring-based scale animation for press feedback.
 * @param {SharedValue} sharedValue - Target value (0 or 1)
 * @param {boolean} isPressed - Current pressed state
 */
export const pressSpring = (toValue, config = springs.bouncy) => {
    return withSpring(toValue, config);
};

/**
 * Creates a press feedback animation style.
 * @param {SharedValue} pressed - Shared value (0 = released, 1 = pressed)
 * @param {number} scaleAmount - How much to scale down (default: 0.04 = 96%)
 */
export const createPressStyle = (pressed, scaleAmount = 0.04) => {
    'worklet';
    return {
        transform: [{ scale: 1 - pressed * scaleAmount }],
    };
};

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL-LINKED ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates a parallax effect based on scroll position.
 * @param {number} scrollY - Current scroll Y position
 * @param {number} factor - Parallax intensity (0.5 = half speed)
 */
export const parallaxTransform = (scrollY, factor = 0.5) => {
    'worklet';
    return {
        transform: [{ translateY: scrollY * factor }],
    };
};

/**
 * Creates a fade effect based on scroll position.
 * @param {number} scrollY - Current scroll Y position
 * @param {number} threshold - When to start fading (px)
 */
export const scrollFade = (scrollY, threshold = 100) => {
    'worklet';
    const opacity = Math.max(0, 1 - scrollY / threshold);
    return { opacity };
};
