import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../common/Button';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';

export const CheckoutFooter = ({ total, shipping, finalTotal, onCheckout, isOffline, isProcessing, themeColors, isDarkMode }) => {
    const { bottom } = useSafeAreaInsets();

    return (
        <View style={[
            styles.footer,
            {
                backgroundColor: isDarkMode ? '#1C1917' : '#FFF',
                borderTopColor: themeColors.border,
                paddingBottom: Math.max(20, bottom + 10)
            }
        ]}>
            <View style={styles.row}>
                <Text style={{ color: themeColors.textLight, fontFamily: fonts.medium }}>Subtotal</Text>
                <Text style={{ color: themeColors.text, fontFamily: fonts.bold }}>${total.toFixed(2)}</Text>
            </View>
            <View style={styles.row}>
                <Text style={{ color: themeColors.textLight, fontFamily: fonts.medium }}>Shipping</Text>
                <Text style={{ color: shipping === 0 ? colors.success : themeColors.text, fontFamily: fonts.bold }}>
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
            <View style={[styles.row, { marginBottom: 20 }]}>
                <Text style={{ color: themeColors.text, fontFamily: fonts.black, fontSize: 18 }}>Total</Text>
                <Text style={{ color: colors.primary, fontFamily: fonts.black, fontSize: 24 }}>${finalTotal.toFixed(2)}</Text>
            </View>
            <Button
                title={isOffline ? "Save Offline" : "Checkout"}
                onPress={onCheckout}
                loading={isProcessing}
                icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { height: -4, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    divider: { height: 1, marginVertical: 12 },
});
