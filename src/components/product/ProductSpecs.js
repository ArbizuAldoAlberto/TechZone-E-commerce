import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { GlassCard } from '../ui/GlassCard';
import { COLORS, FONTS } from '../../theme';

export const ProductSpecs = ({ spec, index }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
        <GlassCard style={styles.specCard} intensity={20}>
            <Ionicons name={spec.icon} size={24} color={COLORS.cta} />
            <View>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
            </View>
        </GlassCard>
    </Animated.View>
);

const styles = StyleSheet.create({
    specCard: { width: 140, padding: 16, gap: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
    specLabel: { fontSize: 10, fontFamily: FONTS.bold, textTransform: 'uppercase', color: COLORS.secondary },
    specValue: { fontSize: 14, fontFamily: FONTS.body, fontWeight: '600', color: COLORS.white },
});
