/**
 * @fileoverview Location Picker Modal
 * @description A modal component that allows users to select a location on a map.
 * Features:
 * - Uses a fixed center pin pattern (like Uber/Grab)
 * - Reverse geocoding to get address from coordinates
 * - confirmation button to return selected location
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from '../../components/common/MapWrapper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../global/colors';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const LocationPickerModal = ({ visible, onClose, onLocationSelect, initialLocation }) => {
    const [region, setRegion] = useState(initialLocation ? {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    } : null);
    const [markerCoord, setMarkerCoord] = useState(initialLocation ? initialLocation.coords : null);
    const [address, setAddress] = useState('');
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);

    // Effect to reset region/marker when modal opens or initialLocation changes
    useEffect(() => {
        if (visible && initialLocation) {
            const newRegion = {
                latitude: initialLocation.coords.latitude,
                longitude: initialLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            setMarkerCoord(initialLocation.coords);
            // Optionally fetch initial address here if needed, but usually parent passes it
        } else if (visible && !initialLocation) {
            // Fallback to a default location (e.g., standard view) or try to get user current location immediately
            (async () => {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        const location = await Location.getCurrentPositionAsync({});
                        setRegion({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        });
                        setMarkerCoord(location.coords);
                        reverseGeocode(location.coords);
                    }
                } catch (e) {
                    // Ignore
                }
            })();
        }
    }, [visible, initialLocation]);


    const reverseGeocode = async (coordinate) => {
        setIsLoadingAddress(true);
        try {
            const [result] = await Location.reverseGeocodeAsync(coordinate);
            if (result) {
                const readableAddress = `${result.street || result.name || ''}, ${result.city || ''}, ${result.country || ''}`;
                setAddress(readableAddress);
            }
        } catch (error) {
            setAddress('Address unavailable');
        } finally {
            setIsLoadingAddress(false);
        }
    };

    const handleRegionChangeComplete = (newRegion) => {
        // If we want the marker to stay in center, we use the region center
        // But here we want a draggable marker or tap-to-move. 
        // Let's implement Tap-to-Move or LongPress-to-Move for better UX, or just center marker.
        // Common pattern: Pin fixed at center of screen, map moves.
    };

    // Pattern: Fixed Pin at center of screen. User moves map.
    const onRegionChangeComplete = (newRegion) => {
        setRegion(newRegion);
        setMarkerCoord({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude
        });
        reverseGeocode({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude
        });
    };

    const handleConfirm = () => {
        if (markerCoord) {
            onLocationSelect({
                coords: markerCoord,
                address: address
            });
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Select Location</Text>
                    <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                        <Text style={styles.confirmText}>Confirm</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                    {region && (
                        <MapView
                            provider={PROVIDER_DEFAULT}
                            style={styles.map}
                            region={region}
                            onRegionChangeComplete={onRegionChangeComplete}
                        >
                            {/* We don't need a Marker component if we use the "Fixed Pin" UI pattern.
                                The pin is a static View overlayed on top of the MapView.
                                This feels more native like Uber/Grab.
                             */}
                        </MapView>
                    )}

                    {/* Fixed Center Pin */}
                    <View style={styles.markerFixed}>
                        <Ionicons name="location" size={48} color={colors.primary} />
                    </View>
                </View>

                <View style={styles.footer}>
                    {isLoadingAddress ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <View style={styles.addressContainer}>
                            <Ionicons name="location-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.addressText} numberOfLines={2}>
                                {address || "Drag map to select location"}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.hintText}>Move the map to place the pin</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: colors.white,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    closeButton: {
        padding: 8,
    },
    confirmButton: {
        padding: 8,
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingHorizontal: 16,
    },
    confirmText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerFixed: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -24, // Half of size (48)
        marginTop: -48, // Full height (bottom of pin acts as pointer)
    },
    footer: {
        padding: 24,
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0px -4px 10px rgba(0,0,0,0.1)',
            }
        }),
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    hintText: {
        fontSize: 13,
        color: colors.textLight,
        textAlign: 'center',
    },
});

export default LocationPickerModal;
