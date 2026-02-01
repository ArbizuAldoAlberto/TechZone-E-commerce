import React, { useState } from 'react';
import { View, Image, FlatList, StyleSheet, useWindowDimensions, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../global/colors';
import Animated, { FadeIn } from 'react-native-reanimated';

const ImageGallery = ({ images = [], height = 400 }) => {
    const { width } = useWindowDimensions();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Ensure we always have at least one image (or placeholder)
    const data = images.length > 0 ? images : ['https://via.placeholder.com/400'];

    const renderItem = ({ item }) => (
        <TouchableOpacity activeOpacity={0.9} onPress={() => setIsFullScreen(true)}>
            <Image
                source={{ uri: item }}
                style={{ width, height }}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );

    const onScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    return (
        <View style={[styles.container, { height }]}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
            />

            {/* Pagination Dots */}
            {data.length > 1 && (
                <View style={styles.pagination}>
                    {data.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === activeIndex ? colors.primary : 'rgba(200,200,200,0.5)' }
                            ]}
                        />
                    ))}
                </View>
            )}

            {/* Full Screen Modal (Simple implementation) */}
            <Modal visible={isFullScreen} transparent={true} animationType="fade">
                <View style={styles.fullScreenContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsFullScreen(false)}>
                        <Ionicons name="close" size={30} color="#FFF" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: data[activeIndex] }}
                        style={{ width: '100%', height: '80%' }}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    pagination: {
        position: 'absolute',
        bottom: 20,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    fullScreenContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        zIndex: 10,
    }
});

export default ImageGallery;
