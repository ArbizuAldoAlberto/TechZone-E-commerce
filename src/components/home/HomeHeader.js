import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../ui/GlassCard';
import { GradientText } from '../ui/GradientText';
import { COLORS, FONTS, SPACING } from '../../theme';

/**
 * @component HomeHeader
 * @description Header component for the Home screen featuring branding and profile access.
 */
export const HomeHeader = ({ title, onProfilePress, profileImage, isDarkMode }) => (
    <GlassCard
        style={[styles.headerContainer, { borderColor: isDarkMode ? COLORS.glassBorder : 'rgba(0,0,0,0.1)' }]}
        intensity={30}
        isDarkMode={isDarkMode}
    >
        <View style={styles.headerContent}>
            <View style={styles.logoRow}>
                <View style={styles.logoBadge}>
                    <Ionicons name="diamond-outline" size={22} color={COLORS.cta} />
                </View>
                <GradientText style={[styles.appTitle, { color: isDarkMode ? COLORS.white : COLORS.primary }]}>
                    {title}
                </GradientText>
            </View>

            <TouchableOpacity onPress={onProfilePress} activeOpacity={0.8}>
                <Image source={{ uri: profileImage }} style={styles.avatar} />
            </TouchableOpacity>
        </View>
    </GlassCard>
);

const styles = StyleSheet.create({
    headerContainer: {
        marginHorizontal: SPACING.lg,
        padding: 0,
        borderRadius: 24,
        minHeight: 80,
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16
    },
    logoBadge: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: 'rgba(202, 138, 4, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.cta
    },
    appTitle: {
        fontSize: 26,
        letterSpacing: 0.5,
        fontFamily: FONTS.heading,
        fontWeight: '700'
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 2.5,
        borderColor: COLORS.cta
    },
});
