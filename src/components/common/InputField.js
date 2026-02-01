/**
 * @fileoverview Enhanced Input Field (TechZone Elite)
 * @description Premium input component with focus transitions and validation.
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';
import { theme } from '../../global/theme';

const InputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    icon,
    rightIcon,
    onRightIconPress,
    multiline = false,
    numberOfLines = 1,
    darkMode = false,
    style,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Derived State
    const isSecure = secureTextEntry && !showPassword;
    const effectiveRightIcon = secureTextEntry ? (showPassword ? 'eye-off' : 'eye') : rightIcon;
    const handleRightIcon = secureTextEntry ? () => setShowPassword(!showPassword) : onRightIconPress;

    // Theme Colors
    const containerBg = darkMode ? '#2C2C2E' : '#FFFFFF'; // Subtle fill (White for light mode crispness)
    const textColor = darkMode ? colors.white : colors.text;
    const placeholderColor = darkMode ? '#A1A1AA' : '#A8A29E';

    // Focus Animation
    const borderOpacity = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(borderOpacity, { toValue: 1, duration: 200, useNativeDriver: false }).start();
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        onBlur && onBlur(e);
        Animated.timing(borderOpacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    };

    return (
        <View style={[styles.root, style]}>
            {label && <Text style={[styles.label, darkMode && styles.labelDark]}>{label}</Text>}

            <View style={[styles.fieldWrapper, { backgroundColor: containerBg }]}>
                {/* Visual Border/Glow Layer */}
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.activeBorder,
                        {
                            borderColor: colors.primary,
                            opacity: borderOpacity,
                        }
                    ]}
                />

                {/* Error Border Layer */}
                {error && <View style={[StyleSheet.absoluteFill, styles.errorBorder, { borderColor: colors.error }]} />}

                <View style={styles.contentContainer}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={error ? colors.error : isFocused ? colors.primary : placeholderColor}
                            style={styles.iconLeft}
                        />
                    )}

                    <TextInput
                        style={[styles.input, { color: textColor, minHeight: multiline ? 100 : 48 }]}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderColor}
                        value={value}
                        onChangeText={onChangeText}
                        onBlur={handleBlur}
                        onFocus={handleFocus}
                        secureTextEntry={isSecure}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        textAlignVertical={multiline ? 'top' : 'center'}
                    />

                    {effectiveRightIcon && (
                        <TouchableOpacity onPress={handleRightIcon} style={styles.iconRight} activeOpacity={0.7}>
                            <Ionicons name={effectiveRightIcon} size={20} color={placeholderColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {error && (
                <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
        fontFamily: fonts.medium,
        marginLeft: 2,
    },
    labelDark: {
        color: '#D4D4D8',
    },
    fieldWrapper: {
        borderRadius: theme.borderRadius.sm, // 8px
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E5E7EB', // Default neutral border
        overflow: 'hidden',
    },
    activeBorder: {
        borderWidth: 2,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: 'transparent',
    },
    errorBorder: {
        borderWidth: 2,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontFamily: fonts.regular,
        paddingVertical: 12,
    },
    iconLeft: {
        marginRight: 10,
    },
    iconRight: {
        padding: 8,
        marginRight: -8,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginLeft: 4,
        gap: 4,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        fontFamily: fonts.medium,
    },
});

export default InputField;
