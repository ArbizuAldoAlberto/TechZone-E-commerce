import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';
import { theme } from '../../global/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const DailyDrop = ({ themeColors, isDarkMode, navigation }) => {
    // Mock Countdown
    const [timeLeft, setTimeLeft] = useState({ h: 14, m: 22, s: 45 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { h, m, s } = prev;
                if (s > 0) s--;
                else {
                    s = 59;
                    if (m > 0) m--;
                    else {
                        m = 59;
                        if (h > 0) h--;
                    }
                }
                return { h, m, s };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const format = (n) => n < 10 ? `0${n}` : n;

    return (
        <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={[styles.container, { backgroundColor: isDarkMode ? '#1C1917' : '#FFF' }]}
        >
            <View style={styles.badge}>
                <Text style={styles.badgeText}>DAILY DROP</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.info}>
                    <Text style={[styles.title, { color: themeColors.text }]}>Sony WH-1000XM5</Text>
                    <Text style={[styles.subtitle, { color: themeColors.textLight }]}>Limit One Per Customer</Text>

                    <View style={styles.timerRow}>
                        <TimeBox val={format(timeLeft.h)} label="HRS" color={colors.primary} />
                        <Text style={styles.colon}>:</Text>
                        <TimeBox val={format(timeLeft.m)} label="MIN" color={colors.primary} />
                        <Text style={styles.colon}>:</Text>
                        <TimeBox val={format(timeLeft.s)} label="SEC" color={colors.primary} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.8 : 1 }]}
                        onPress={() => navigation.navigate('ProductDetail', {
                            product: {
                                id: 999,
                                title: 'Sony WH-1000XM5',
                                price: 349,
                                image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80',
                                description: 'Industry leading noise cancellation.'
                            }
                        })}
                    >
                        <Text style={styles.btnText}>Grab Now - $349</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFF" />
                    </Pressable>
                </View>

                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80' }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            </View>
        </Animated.View>
    );
};

const TimeBox = ({ val, label, color }) => (
    <View style={styles.timeBox}>
        <View style={[styles.timeValBox, { backgroundColor: `${color}15` }]}>
            <Text style={[styles.timeVal, { color }]}>{val}</Text>
        </View>
        <Text style={styles.timeLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
        borderRadius: theme.borderRadius.xl,
        padding: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(202, 138, 4, 0.2)', // subtle gold border
        position: 'relative',
        ...Platform.select({
            ios: { shadowColor: '#CA8A04', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
            android: { elevation: 6 },
            web: { boxShadow: '0 8px 24px rgba(202, 138, 4, 0.15)' }
        })
    },
    badge: {
        position: 'absolute',
        top: 0, left: 0,
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderBottomRightRadius: 16,
        zIndex: 10
    },
    badgeText: { color: '#FFF', fontSize: 10, fontFamily: fonts.black, letterSpacing: 1 },
    content: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    info: { flex: 1, paddingTop: 10 },
    title: { fontSize: 20, fontFamily: fonts.black, marginBottom: 4 },
    subtitle: { fontSize: 12, fontFamily: fonts.medium, marginBottom: 16 },
    timerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 4 },
    colon: { fontSize: 20, fontWeight: '800', marginHorizontal: 2, color: colors.primary, marginBottom: 12 },
    timeBox: { alignItems: 'center' },
    timeValBox: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, minWidth: 36, alignItems: 'center' },
    timeVal: { fontSize: 18, fontFamily: fonts.black },
    timeLabel: { fontSize: 9, fontFamily: fonts.bold, color: 'gray', marginTop: 4 },
    btn: { flexDirection: 'row', backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
    btnText: { color: "#FFF", fontSize: 12, fontFamily: fonts.bold },
    imageWrapper: { width: 100, height: 120, borderRadius: 16, overflow: 'hidden', transform: [{ rotate: '5deg' }] },
    image: { width: '100%', height: '100%' }
});

export default DailyDrop;
