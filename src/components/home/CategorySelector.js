import React from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../theme';

/**
 * @component CategorySelector
 * @description Horizontal list for filtering products by category.
 */
export const CategorySelector = ({ categories, selectedCategory, onSelect, isDarkMode }) => (
    <View>
        <FlatList
            horizontal
            data={categories ? [{ id: null, title: 'All' }, ...categories] : []}
            keyExtractor={item => item.id?.toString() || 'all'}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScrollContent}
            renderItem={({ item }) => (
                <CategoryPill
                    title={item.title}
                    active={selectedCategory === item.title || (!selectedCategory && item.title === 'All')}
                    onPress={() => onSelect(item.title === 'All' ? null : item.title)}
                    isDarkMode={isDarkMode}
                />
            )}
        />
    </View>
);

const CategoryPill = ({ title, active, onPress, isDarkMode }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[
            styles.pill,
            active ? styles.pillActive : (isDarkMode ? styles.pillInactive : styles.pillInactiveLight)
        ]}
    >
        <Text style={[
            styles.pillText,
            active ? styles.pillTextActive : (isDarkMode ? styles.pillTextInactive : styles.pillTextInactiveLight)
        ]}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    catScrollContent: { gap: 10, paddingHorizontal: SPACING.lg, paddingBottom: 10 },
    pill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30, // Fully rounded
        borderWidth: 1,
    },
    pillActive: {
        backgroundColor: COLORS.cta,
        borderColor: COLORS.cta,
    },
    pillInactive: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: COLORS.secondary,
    },
    pillInactiveLight: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderColor: '#E2E8F0',
    },
    pillText: {
        fontFamily: FONTS.body,
        fontSize: 14,
        fontWeight: '600'
    },
    pillTextActive: { color: COLORS.white },
    pillTextInactive: { color: COLORS.textLight },
    pillTextInactiveLight: { color: COLORS.secondary },
});
