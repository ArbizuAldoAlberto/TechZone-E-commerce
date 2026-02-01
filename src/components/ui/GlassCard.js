import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import { COLORS, SHADOWS, SPACING, RADIUS, ANIMATION } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * @component GlassCard
 * @description Elite "Liquid Glass" card with iridescent border and premium effects.
 * 
 * @param {ReactNode} children - Content to render inside the card
 * @param {object} style - Additional styles
 * @param {number} intensity - Blur intensity (default: 50)
 * @param {boolean} isDarkMode - Theme mode for adaptive styling
 * @param {boolean} glow - Enable gold glow effect
 * @param {boolean} interactive - Enable press animation
 * @param {function} onPress - Press handler
 */
export const GlassCard = ({
    children,
    style,
    intensity = 50,
    isDarkMode = true,
    glow = false,
    interactive = false,
    onPress,
}) => {
    const pressed = useSharedValue(0);

    const onPressIn = () => {
        if (interactive) {
            pressed.value = withSpring(1, ANIMATION.spring.bouncy);
        }
    };

    const onPressOut = () => {
        if (interactive) {
            pressed.value = withSpring(0, ANIMATION.spring.default);
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        const scale = 1 - pressed.value * 0.02;
        const translateY = pressed.value * -2;

        return {
            transform: [{ scale }, { translateY }],
        };
    });

    // Dynamic styling based on theme
    const themeStyles = isDarkMode ? styles.glassDark : styles.glassLight;
    const borderColors = isDarkMode
        ? ['rgba(202, 138, 4, 0.3)', 'rgba(8, 217, 214, 0.2)', 'rgba(202, 138, 4, 0.3)']
        : ['rgba(0, 0, 0, 0.05)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)'];

    const glowStyles = glow ? (isDarkMode ? SHADOWS.glow : SHADOWS.lg) : SHADOWS.md;

    const CardWrapper = interactive ? AnimatedPressable : Animated.View;

    // Android fallback (BlurView can be inconsistent)
    if (Platform.OS === 'android') {
        return (
            <CardWrapper
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={onPress}
                style={[
                    styles.androidGlass,
                    isDarkMode ? styles.androidDark : styles.androidLight,
                    glowStyles,
                    animatedStyle,
                    style,
                ]}
            >
                {children}
            </CardWrapper>
        );
    }

    // iOS with BlurView and iridescent border
    return (
        <CardWrapper
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={onPress}
            style={[animatedStyle]}
        >
            {/* Iridescent Border Gradient */}
            <LinearGradient
                colors={borderColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.borderGradient, glowStyles, style]}
            >
                <BlurView
                    intensity={intensity}
                    tint={isDarkMode ? 'dark' : 'light'}
                    style={[styles.glass, themeStyles]}
                >
                    {children}
                </BlurView>
            </LinearGradient>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    borderGradient: {
        borderRadius: RADIUS.lg,
        padding: 1.5, // Border width via gradient
    },
    glass: {
        borderRadius: RADIUS.lg - 1,
        padding: SPACING.lg,
        overflow: 'hidden',
    },
    glassDark: {
        backgroundColor: COLORS.glassBgDark,
    },
    glassLight: {
        backgroundColor: COLORS.glassBg,
    },
    androidGlass: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
    },
    androidDark: {
        backgroundColor: 'rgba(28, 25, 23, 0.9)',
        borderColor: 'rgba(202, 138, 4, 0.3)',
    },
    androidLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(0, 0, 0, 0.08)',
    },
});
