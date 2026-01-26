/**
 * @fileoverview Generic Button Component
 * @description A customizable button component supporting multiple styles and loading state.
 * Types:
 * - primary: Solid background (default)
 * - secondary: Secondary background color
 * - outline: Border only, transparent background
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';

const Button = ({ title, onPress, style, textStyle, loading, disabled, type = 'primary' }) => {
    const getButtonStyle = () => {
        if (type === 'outline') return styles.outlineButton;
        if (type === 'secondary') return styles.secondaryButton;
        return styles.primaryButton;
    };

    const getTextStyle = () => {
        if (type === 'outline') return styles.outlineText;
        return styles.primaryText;
    };

    return (
        <TouchableOpacity
            style={[styles.button, getButtonStyle(), style, (disabled || loading) && styles.disabled]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={type === 'outline' ? colors.primary : colors.white} />
            ) : (
                <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: colors.secondary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: fonts.bold,
    },
    primaryText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.primary,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Button;
