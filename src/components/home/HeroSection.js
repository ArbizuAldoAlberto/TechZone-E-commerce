import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../ui/GlassCard';
import { GradientText } from '../ui/GradientText';
import { NeoButton } from '../ui/NeoButton';
import Hero3D from '../3d/Hero3D';
import { COLORS, FONTS, SPACING } from '../../theme';

/**
 * @component HeroSection
 * @description Featured content section with 3D elements.
 */
export const HeroSection = ({ isDarkMode }) => (
    <View style={{ marginHorizontal: SPACING.lg }}>
        <GlassCard
            intensity={isDarkMode ? 80 : 60}
            isDarkMode={isDarkMode}
            style={[styles.heroCard, {
                backgroundColor: isDarkMode ? 'rgba(28,25,23,0.85)' : 'rgba(255,255,255,0.95)',
                borderColor: isDarkMode ? COLORS.glassBorder : 'rgba(0,0,0,0.1)',
            }]}
        >
            <View style={styles.heroInner}>
                <View style={styles.heroContent}>
                    <Text style={[styles.heroLabel, { color: COLORS.cta }]}>🔥 DROPPING NOW</Text>
                    <GradientText style={styles.heroTitle}>FUTURE TECH</GradientText>
                    <Text style={[styles.heroDesc, { color: isDarkMode ? '#CBD5E1' : COLORS.secondary }]}>
                        Experience the next generation of elite technology.
                    </Text>
                    <View style={{ marginTop: SPACING.lg }}>
                        <NeoButton
                            title="Shop Now"
                            style={{ paddingHorizontal: 28, paddingVertical: 14 }}
                            icon="arrow-forward"
                        />
                    </View>
                </View>
                <View style={styles.heroModel}>
                    <React.Suspense fallback={<View style={{ width: 180, height: 180 }} />}>
                        <Hero3D />
                    </React.Suspense>
                </View>
            </View>
        </GlassCard>
    </View>
);

const styles = StyleSheet.create({
    heroCard: {
        minHeight: 260,
        height: 'auto',
        justifyContent: 'center', // Centra el contenido verticalmente
        padding: 0, // Reset padding
    },
    heroInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },
    heroContent: {
        flex: 1,
        zIndex: 10,
        paddingLeft: SPACING.sm,
        paddingVertical: SPACING.sm,
    },
    heroLabel: {
        color: COLORS.cta,
        fontSize: 12,
        fontFamily: FONTS.body,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: 'uppercase'
    },
    heroTitle: {
        fontSize: 28,
        lineHeight: 34,
        marginBottom: 10,
    },
    heroDesc: {
        fontSize: 14,
        fontFamily: FONTS.body,
        lineHeight: 20,
        maxWidth: 180,
        opacity: 0.9
    },
    heroModel: {
        flex: 1,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0
    },
});
