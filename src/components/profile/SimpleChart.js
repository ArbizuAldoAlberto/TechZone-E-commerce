import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../../global/colors';
import { fonts } from '../../global/fonts';
import { theme } from '../../global/theme';

const SimpleChart = ({ data, themeColors, isDarkMode }) => {
    // data = [{ label: 'Jan', value: 40, full: 100 }, ...]
    const maxVal = Math.max(...data.map(d => d.value));

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#1C1917' : colors.white, borderColor: isDarkMode ? '#292524' : '#E5E5E5' }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: themeColors.text }]}>Spending Activity</Text>
                <Text style={{ color: colors.success, fontFamily: fonts.bold, fontSize: 12 }}>+12% this week</Text>
            </View>
            <View style={styles.chartArea}>
                {data.map((item, index) => (
                    <Bar key={index} item={item} max={maxVal} color={item.active ? colors.primary : (isDarkMode ? '#44403C' : '#E5E5E5')} themeColors={themeColors} index={index} />
                ))}
            </View>
        </View>
    );
};

const Bar = ({ item, max, color, themeColors, index }) => {
    const heightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(heightAnim, {
            toValue: (item.value / max) * 100, // percentage height relative to max
            friction: 6,
            tension: 40,
            useNativeDriver: false // width/height layout anim
        }).start();
    }, []);

    return (
        <View style={styles.barContainer}>
            <View style={styles.barTrack}>
                <Animated.View
                    style={[
                        styles.bar,
                        {
                            height: heightAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
                            backgroundColor: color
                        }
                    ]}
                />
            </View>
            <Text style={[styles.label, { color: themeColors.textLight }]}>{item.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        marginBottom: 24,
        ...theme.shadows.sm
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        alignItems: 'center'
    },
    title: {
        fontSize: 16,
        fontFamily: fonts.bold,
    },
    chartArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    barTrack: {
        height: '100%',
        width: 8,
        justifyContent: 'flex-end',
        borderRadius: 4,
        backgroundColor: 'transparent',
    },
    bar: {
        width: '100%',
        borderRadius: 4,
    },
    label: {
        marginTop: 8,
        fontSize: 10,
        fontFamily: fonts.medium,
    }
});

export default SimpleChart;
