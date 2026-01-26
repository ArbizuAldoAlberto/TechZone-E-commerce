/**
 * @fileoverview Advanced Input Field Component
 * @description A robust input component with support for:
 * - Left and Right icons (clickable right icon)
 * - Error state with icon and message
 * - Password toggle (via rightIcon)
 * - Multiline support
 * - Custom keyboard types
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../global/colors';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Input Field Component with validation support
 */
const InputField = ({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    icon,
    rightIcon,
    onRightIconPress,
    multiline = false,
    numberOfLines = 1,
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {icon && (
                    <Ionicons name={icon} size={20} color={error ? colors.error : colors.textLight} style={styles.leftIcon} />
                )}
                <TextInput
                    style={[styles.input, multiline && styles.multilineInput]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textLight}
                    value={value}
                    onChangeText={onChangeText}
                    onBlur={onBlur}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconButton}>
                        <Ionicons name={rightIcon} size={20} color={colors.textLight} />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
        paddingHorizontal: 14,
    },
    inputError: {
        borderColor: colors.error,
        backgroundColor: 'rgba(255, 59, 48, 0.05)',
    },
    leftIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: colors.text,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
        paddingBottom: 12,
    },
    rightIconButton: {
        padding: 4,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginLeft: 4,
    },
});

export default InputField;
