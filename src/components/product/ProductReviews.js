import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NeoButton } from '../ui/NeoButton';
import { COLORS, FONTS } from '../../theme';

export const ReviewInput = ({ rating, comment, setRating, setComment, onSubmit, isLoading }) => (
    <View style={styles.reviewInputBox}>
        <Text style={styles.writeTitle}>Write a Review</Text>
        <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <Ionicons name={s <= rating ? "star" : "star-outline"} size={24} color={COLORS.cta} />
                </TouchableOpacity>
            ))}
        </View>
        <TextInput
            style={styles.textInput}
            placeholder="Your thoughts..."
            placeholderTextColor={COLORS.secondary}
            multiline
            value={comment}
            onChangeText={setComment}
        />
        <NeoButton title="Post Review" onPress={onSubmit} variant="secondary" style={{ marginTop: 12 }} />
    </View>
);

export const ReviewsList = ({ reviews }) => {
    if (!reviews.length) return <Text style={{ color: COLORS.textLight, marginTop: 10, fontFamily: FONTS.body }}>No reviews yet.</Text>;
    return reviews.map((r, i) => (
        <View key={i} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{r.userName}</Text>
                <View style={{ flexDirection: 'row' }}>
                    {[...Array(5)].map((_, k) => (
                        <Ionicons key={k} name={k < r.rating ? "star" : "star-outline"} size={12} color={COLORS.cta} />
                    ))}
                </View>
            </View>
            <Text style={styles.reviewText}>{r.comment}</Text>
        </View>
    ));
};

const styles = StyleSheet.create({
    reviewInputBox: { padding: 20, borderRadius: 20, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
    writeTitle: { fontFamily: FONTS.bold, marginBottom: 12, color: COLORS.textLight },
    starRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    textInput: { borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top', fontFamily: FONTS.body, marginBottom: 12, backgroundColor: 'rgba(0,0,0,0.2)', color: COLORS.white },

    reviewItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    reviewUser: { fontFamily: FONTS.bold, color: COLORS.white },
    reviewText: { fontFamily: FONTS.body, lineHeight: 22, color: COLORS.textLight },
});
