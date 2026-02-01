/**
 * @fileoverview Reusable Quantity Selector Component
 * @module components/common/QuantitySelector
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../../theme';

/**
 * @component QuantitySelector
 * @description A pill-shaped counter control for managing item quantities.
 * @param {Object} props
 * @param {number} props.quantity - Current count value.
 * @param {Function} props.onIncrement - Callback for plus button.
 * @param {Function} props.onDecrement - Callback for minus button.
 * @param {number} [props.max] - Max limit (disables increment when reached).
 * @param {boolean} [props.isDarkMode=false] - Theme toggle.
 * @param {Object} [props.containerStyle] - Additional style overrides.
 */
const QuantitySelector = ({ quantity, onIncrement, onDecrement, max, isDarkMode, containerStyle }) => {
    const textColor = isDarkMode ? COLORS.white : COLORS.text;
    const borderColor = isDarkMode ? COLORS.secondary : '#E5E5E5';
    const bg = isDarkMode ? '#292524' : '#F5F5F4';

    return (
        <View style={[styles.container, { backgroundColor: bg, borderColor }, containerStyle]}>
            <TouchableOpacity
                style={styles.button}
                onPress={onDecrement}
                disabled={quantity <= 1}
                activeOpacity={0.7}
            >
                <Ionicons name="remove" size={18} color={quantity <= 1 ? COLORS.secondary : textColor} />
            </TouchableOpacity>

            <View style={styles.valueContainer}>
                <Text style={[styles.value, { color: textColor }]}>{quantity}</Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={onIncrement}
                disabled={max ? quantity >= max : false}
                activeOpacity={0.7}
            >
                <Ionicons name="add" size={18} color={max && quantity >= max ? COLORS.secondary : textColor} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.full,
        height: 44,
        overflow: 'hidden',
        borderWidth: 1,
    },
    button: {
        width: 44,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueContainer: {
        width: 32,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    value: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    }
});

export default QuantitySelector;
