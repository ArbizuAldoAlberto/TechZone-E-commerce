import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../theme';

/**
 * GradientText Component
 * Note: True gradient text in React Native requires MaskedView, which adds native dependencies.
 * For this simplified 'Elite' version without extra native deps, we'll use a high-contrast style.
 */
export const GradientText = ({ style, children }) => {
    return (
        <Text style={[styles.text, style]}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: FONTS.heading,
        color: COLORS.primary,
        fontWeight: '700',
    },
});
