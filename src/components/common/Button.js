/**
 * @fileoverview Universal Button Component (TechZone Elite)
 * @module components/common/Button
 * @description Premium interaction element with micro-interactions and rigorous theming.
 */

import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Animated } from 'react-native';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';
import { theme } from '../../global/theme';

const Button = ({
    title,
    onPress,
    style,
    textStyle,
    loading = false,
    disabled = false,
    type = 'primary', // 'primary' | 'secondary' | 'outline'
    icon
}) => {
    // Micro-interaction: Scale on press
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 20,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1, // Spring back
            useNativeDriver: true,
            speed: 20,
            bounciness: 4,
        }).start();
    };

    const baseStyle = styles[type] || styles.primary;
    const textBaseStyle = styles[`${type}Text`] || styles.primaryText;
    const spinnerColor = type === 'outline' ? colors.primary : colors.white;

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                style={[
                    styles.container,
                    baseStyle,
                    (disabled || loading) && styles.disabled
                ]}
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={1} // Handled by scale animation
                accessibilityRole="button"
                accessibilityLabel={loading ? "Loading" : title}
                accessibilityState={{ disabled, busy: loading }}
            >
                {loading ? (
                    <ActivityIndicator color={spinnerColor} />
                ) : (
                    <View style={styles.content}>
                        {icon && <View style={styles.iconWrapper}>{icon}</View>}
                        <Text style={[styles.label, textBaseStyle, textStyle]}>{title}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 52, // Standard tap area, slightly refined
        borderRadius: theme.borderRadius.sm, // 8px (Elite Token)
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        // Default Shadow
        ...theme.shadows.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    iconWrapper: {
        marginRight: 4,
    },
    // Variants
    primary: {
        backgroundColor: colors.primary, // Gold
        ...theme.shadows.md, // Elevation pop
    },
    secondary: {
        backgroundColor: colors.secondary, // Stone 700 / 300
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary, // Gold Border
        elevation: 0,
        shadowOpacity: 0,
    },
    // States
    disabled: {
        opacity: 0.6,
        transform: [{ scale: 1 }], // Prevent scale on disabled? (Handled by pointerEvents mostly)
    },
    // Text Styling
    label: {
        fontSize: 16,
        fontFamily: fonts.semiBold, // Inter SemiBold
        letterSpacing: 0.5,
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.primary,
        fontFamily: fonts.bold,
    },
});

export default Button;
