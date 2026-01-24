import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';

const Input = ({ label, error, style, ...props }) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <TextInput
                    style={styles.input}
                    placeholderTextColor={colors.textLight}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
        marginLeft: 4,
        fontFamily: fonts.bold,
    },
    inputContainer: {
        height: 50,
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    input: {
        fontSize: 16,
        color: colors.text,
        fontFamily: fonts.regular,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default Input;
