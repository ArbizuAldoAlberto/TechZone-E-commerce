import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor
} from 'react-native-reanimated';
import { COLORS, SPACING, SHADOWS, FONTS, ANIMATION, RADIUS } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * @component NeoButton
 * @description Elite button with spring physics, glow effect, and premium styling.
 * Uses Reanimated 3 for 120fps animations.
 */
export const NeoButton = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    style,
    textStyle,
}) => {
    const pressed = useSharedValue(0);
    const isPrimary = variant === 'primary';

    const onPressIn = () => {
        pressed.value = withSpring(1, ANIMATION.spring.bouncy);
    };

    const onPressOut = () => {
        pressed.value = withSpring(0, ANIMATION.spring.default);
    };

    const animatedStyle = useAnimatedStyle(() => {
        const scale = 1 - pressed.value * 0.04;

        return {
            transform: [{ scale }],
            // Gold glow effect on press
            shadowOpacity: isPrimary ? 0.3 + pressed.value * 0.3 : 0.1,
            shadowRadius: isPrimary ? 15 + pressed.value * 10 : 6,
        };
    });

    const sizeStyles = {
        sm: { paddingVertical: 10, paddingHorizontal: 20 },
        md: { paddingVertical: 14, paddingHorizontal: 28 },
        lg: { paddingVertical: 18, paddingHorizontal: 36 },
    };

    return (
        <AnimatedPressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={disabled ? undefined : onPress}
            style={[
                styles.button,
                isPrimary ? styles.primary : styles.secondary,
                sizeStyles[size],
                disabled && styles.disabled,
                animatedStyle,
                style,
            ]}
        >
            <Text style={[
                styles.text,
                isPrimary ? styles.textPrimary : styles.textSecondary,
                disabled && styles.textDisabled,
                textStyle,
            ]}>
                {title}
            </Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        // Gold glow shadow
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    primary: {
        backgroundColor: COLORS.cta,
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.cta,
        // Remove glow for secondary
        shadowColor: '#000',
        shadowOpacity: 0.1,
    },
    disabled: {
        backgroundColor: COLORS.secondary,
        opacity: 0.5,
    },
    text: {
        fontFamily: FONTS.semiBold,
        fontSize: 16,
        letterSpacing: 0.5,
    },
    textPrimary: {
        color: COLORS.white,
    },
    textSecondary: {
        color: COLORS.cta,
    },
    textDisabled: {
        color: COLORS.textLight,
    },
});
