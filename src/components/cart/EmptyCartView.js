import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ParticlesBackground from '../3d/ParticlesBackground';
import Button from '../common/Button';
import { fonts } from '../../global/fonts';

export const EmptyCartView = ({ navigation, themeColors, isDarkMode }) => (
    <SafeAreaView style={[styles.center, { backgroundColor: themeColors.background }]} edges={['top']}>
        <ParticlesBackground />
        <View style={styles.emptyCircle}>
            <Ionicons name="cart-outline" size={48} color={isDarkMode ? '#555' : '#CCC'} />
        </View>
        <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Your Cart is Empty</Text>
        <Text style={[styles.emptySub, { color: themeColors.textLight }]}>Looks like you haven't added anything yet.</Text>
        <Button
            title="Start Shopping"
            onPress={() => navigation.navigate('Shop')}
            type="primary"
            style={{ marginTop: 32, width: 200 }}
        />
    </SafeAreaView>
);

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(150,150,150,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emptyTitle: { fontSize: 24, fontFamily: fonts.bold, marginBottom: 8 },
    emptySub: { fontSize: 16, fontFamily: fonts.medium },
});
