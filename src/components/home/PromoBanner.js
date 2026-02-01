/**
 * @fileoverview Promotional Banner Component (TechZone Elite)
 */
import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';
import { theme } from '../../global/theme';

const PromoBanner = ({ image, title, subtitle, onPress, containerStyle }) => {
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.container, containerStyle]}>
            <ImageBackground
                source={{ uri: image }}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: theme.borderRadius.lg }} // 16px
            >
                <View style={styles.overlay} />
                <View style={styles.content}>
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>Limited Offer</Text>
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    <View style={styles.button}>
                        <Text style={styles.buttonText}>Shop Now</Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 180,
        width: '100%',
        marginBottom: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.md,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)', // Darker for text constrast
        borderRadius: theme.borderRadius.lg,
    },
    content: {
        padding: theme.spacing.xl,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    tagContainer: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.full,
        marginBottom: theme.spacing.sm,
    },
    tagText: {
        color: colors.white,
        fontSize: 10,
        fontFamily: fonts.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    title: {
        color: colors.white,
        fontSize: 28,
        fontFamily: fonts.black,
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    subtitle: {
        color: '#E5E5E5',
        fontSize: 14,
        fontFamily: fonts.medium,
        marginBottom: theme.spacing.lg,
    },
    button: {
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: theme.borderRadius.full,
    },
    buttonText: {
        color: colors.black,
        fontFamily: fonts.bold,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});

export default PromoBanner;
