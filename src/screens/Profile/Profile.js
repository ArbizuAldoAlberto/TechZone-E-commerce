import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActionSheetIOS,
    Platform,
    Switch,
    Animated,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    useWindowDimensions
} from 'react-native';
import { colors, getColors } from '../../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from '../../components/common/MapWrapper';

import { useDispatch, useSelector } from 'react-redux';
import { setProfileImage, setUserLocation, clearUser } from '../../store/authSlice';
import { toggleTheme } from '../../store/themeSlice';
import { deleteSession } from '../../db';
import { useNavigation } from '@react-navigation/native';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

import { useUpdateProfileImageMutation, useUpdateUserLocationMutation } from '../../services/userService';
import { useImagePicker } from '../../hooks/useImagePicker';
import { useUserLocation } from '../../hooks/useUserLocation';
import LocationPickerModal from '../../components/profile/LocationPickerModal';

const Profile = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const reduxImage = useSelector(state => state.auth.profileImage);
    const reduxLocation = useSelector(state => state.auth.userLocation);
    const userEmail = useSelector(state => state.auth.user);
    const isDarkMode = useSelector(state => state.theme.isDarkMode);
    const favorites = useSelector(state => state.favorites?.items || []);
    const { localId } = useSelector(state => state.auth);

    // Backend mutations
    const [triggerSaveImage] = useUpdateProfileImageMutation();
    const [triggerSaveLocation] = useUpdateUserLocationMutation();

    // CustomAlert hook
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    // Custom Hooks
    const { image, setImage, isCompressing, pickImage } = useImagePicker(reduxImage || 'https://i.pravatar.cc/300?img=11');
    const { location, address, isLocating, getUserLocation, setAddress, setLocation } = useUserLocation(reduxLocation);

    // Modal State
    const [showLocationModal, setShowLocationModal] = useState(false);

    const handleLocationSelect = (newLocation) => {
        const locationData = {
            coords: newLocation.coords,
            address: newLocation.address || 'Custom Location'
        };

        // Update local state and Redux
        setLocation({ ...locationData, timestamp: Date.now() });
        setAddress(locationData.address);
        dispatch(setUserLocation(locationData));

        // Save to backend
        if (localId) {
            triggerSaveLocation({ localId, location: locationData });
        }
    };

    // Initial sync for address if location exists in Redux but address is empty in local state
    // This is needed because the hook initializes state only once.
    useEffect(() => {
        if (reduxLocation && reduxLocation.address && (!address || address === 'Tap "Locate" to get your address')) {
            setAddress(reduxLocation.address);
        }
        if (reduxLocation && !location) {
            setLocation(reduxLocation);
        }
    }, [reduxLocation]);

    // Theme colors
    const themeColors = getColors(isDarkMode);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const avatarScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Entry animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(avatarScale, {
                toValue: 1,
                tension: 100,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleImageSelection = (uri) => {
        // Optimistic update already happened in hook
        dispatch(setProfileImage(uri));
        if (localId) {
            triggerSaveImage({ localId, image: uri });
        }
    };

    const handleTakePhoto = () => pickImage('camera', handleImageSelection, showAlert);
    const handlePickGallery = () => pickImage('gallery', handleImageSelection, showAlert);

    const showImageOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', '📷 Take Photo', '🖼️ Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) handleTakePhoto();
                    else if (buttonIndex === 2) handlePickGallery();
                }
            );
        } else {
            showAlert(
                '📸 Update Profile Picture',
                'Choose how you want to update your photo',
                [
                    { text: '📷 Take Photo', onPress: handleTakePhoto },
                    { text: '🖼️ Gallery', onPress: handlePickGallery },
                    { text: 'Cancel', style: 'cancel' },
                ],
                'camera-outline'
            );
        }
    };

    const handleGetLocation = () => {
        getUserLocation((locationData) => {
            dispatch(setUserLocation(locationData));
            if (localId) {
                triggerSaveLocation({ localId, location: locationData });
            }
        }, showAlert);
    };

    const onLogout = async () => {
        showAlert(
            '👋 Sign Out',
            'Are you sure you want to sign out of TechZone?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSession();
                            dispatch(clearUser());
                        } catch (error) {
                            showAlert('Error', 'Could not sign out properly.', [{ text: 'OK' }], 'alert-circle-outline');
                        }
                    }
                },
            ],
            'log-out-outline'
        );
    };

    const dynamicStyles = getDynamicStyles(isDarkMode, themeColors);
    const { width } = useWindowDimensions();
    const cardWidth = (width - 40 - 12) / 2;

    return (
        <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={styles.webContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Premium Header */}
                    <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View>
                            <Text style={[styles.headerTitle, dynamicStyles.text]}>My Profile</Text>
                            <Text style={[styles.headerSubtitle, dynamicStyles.textLight]}>Manage your account settings</Text>
                        </View>
                    </Animated.View>

                    {/* Profile Hero Card */}
                    <Animated.View style={[styles.heroCard, dynamicStyles.heroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.gradientOverlay}>
                            <View style={[styles.gradientTop, { backgroundColor: themeColors.primary }]} />
                        </View>

                        <Animated.View style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}>
                            <Image source={{ uri: image }} style={styles.avatar} />
                            <TouchableOpacity style={styles.cameraButton} onPress={showImageOptions} activeOpacity={0.8}>
                                {isCompressing ? (
                                    <ActivityIndicator size="small" color={colors.white} />
                                ) : (
                                    <Ionicons name="camera" size={18} color={colors.white} />
                                )}
                            </TouchableOpacity>
                            <Animated.View style={[styles.onlineIndicator, { transform: [{ scale: pulseAnim }] }]} />
                        </Animated.View>

                        <Text style={styles.userName}>{userEmail || 'Tech Enthusiast'}</Text>

                        <View style={styles.badgeContainer}>
                            <View style={styles.premiumBadge}>
                                <Ionicons name="diamond" size={12} color="#FFD700" />
                                <Text style={styles.premiumText}>PREMIUM</Text>
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                                <Text style={styles.verifiedText}>Verified</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>47</Text>
                                <Text style={styles.statLabel}>Orders</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>12</Text>
                                <Text style={styles.statLabel}>Wishlist</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>4.9★</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.editProfileButton} onPress={showImageOptions} activeOpacity={0.8}>
                            <Ionicons name="pencil" size={16} color={colors.white} />
                            <Text style={styles.editProfileText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Quick Actions */}
                    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Quick Actions</Text>
                        <View style={styles.quickActionsGrid}>
                            <TouchableOpacity
                                style={[styles.quickActionCard, dynamicStyles.card, { width: cardWidth }]}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('Orders')}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#5856D615' }]}>
                                    <Ionicons name="receipt-outline" size={24} color="#5856D6" />
                                </View>
                                <Text style={[styles.quickActionLabel, dynamicStyles.text]}>Orders</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionCard, dynamicStyles.card, { width: cardWidth }]}
                                activeOpacity={0.7}
                                onPress={() => {
                                    if (favorites.length === 0) {
                                        showAlert(
                                            'Wishlist',
                                            'Tu wishlist está vacía.\n\nNavega por los productos y toca el corazón para guardar items!',
                                            [
                                                {
                                                    text: 'Explorar',
                                                    onPress: () => {
                                                        // Navigate to Shop tab, then reset/navigate to Home screen
                                                        navigation.navigate('Shop', { screen: 'Home' });
                                                    }
                                                },
                                                { text: 'OK', style: 'cancel' }
                                            ],
                                            'heart-outline'
                                        );
                                    } else {
                                        const itemNames = favorites.slice(0, 3).map(f => f.title || f.name).join('\n• ');
                                        showAlert(
                                            'Wishlist',
                                            `Tienes ${favorites.length} producto${favorites.length > 1 ? 's' : ''} guardado${favorites.length > 1 ? 's' : ''}:\n\n• ${itemNames}${favorites.length > 3 ? `\n...y ${favorites.length - 3} más` : ''}`,
                                            [
                                                { text: 'Ver Carrito', onPress: () => navigation.navigate('Cart') },
                                                { text: 'OK', style: 'cancel' }
                                            ],
                                            'heart'
                                        );
                                    }
                                }}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#FF2D5515' }]}>
                                    <Ionicons name="heart-outline" size={24} color="#FF2D55" />
                                </View>
                                <Text style={[styles.quickActionLabel, dynamicStyles.text]}>Wishlist</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionCard, dynamicStyles.card, { width: cardWidth }]}
                                activeOpacity={0.7}
                                onPress={() => showAlert(
                                    'Pagos',
                                    'Administra tus métodos de pago:\n\n• Visa ****4582\n• PayPal vinculado\n• Apple Pay habilitado',
                                    [
                                        { text: 'Agregar', onPress: () => showAlert('Agregado', 'Método de pago agregado correctamente', [{ text: 'OK' }], 'checkmark-circle-outline') },
                                        { text: 'OK', style: 'cancel' }
                                    ],
                                    'card-outline'
                                )}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#34C75915' }]}>
                                    <Ionicons name="card-outline" size={24} color="#34C759" />
                                </View>
                                <Text style={[styles.quickActionLabel, dynamicStyles.text]}>Payments</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.quickActionCard, dynamicStyles.card, { width: cardWidth }]}
                                activeOpacity={0.7}
                                onPress={() => showAlert(
                                    'Rewards',
                                    'Tus TechZone Rewards:\n\n2,450 Puntos\nMiembro Gold\n\n¡Canjea puntos por descuentos!',
                                    [
                                        { text: 'Canjear', onPress: () => showAlert('Canjeado', 'Visita nuestro centro de rewards para canjear tus puntos', [{ text: 'OK' }], 'gift-outline') },
                                        { text: 'OK', style: 'cancel' }
                                    ],
                                    'gift-outline'
                                )}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: '#FF950015' }]}>
                                    <Ionicons name="gift-outline" size={24} color="#FF9500" />
                                </View>
                                <Text style={[styles.quickActionLabel, dynamicStyles.text]}>Rewards</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Location Card */}
                    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Location</Text>
                        <View style={[styles.locationCard, dynamicStyles.card]}>
                            <View style={styles.mapContainer}>
                                {location ? (
                                    <MapView
                                        provider={PROVIDER_DEFAULT}
                                        style={styles.mapMap}
                                        region={{
                                            latitude: location.coords.latitude,
                                            longitude: location.coords.longitude,
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: location.coords.latitude,
                                                longitude: location.coords.longitude,
                                            }}
                                        />
                                    </MapView>
                                ) : (
                                    <Image
                                        source={{
                                            uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3'
                                        }}
                                        style={styles.mapImage}
                                        resizeMode="cover"
                                    />
                                )}
                                {!location && <View style={styles.mapOverlay} />}

                                <TouchableOpacity
                                    style={styles.editMapButton}
                                    onPress={() => setShowLocationModal(true)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="map" size={18} color={colors.white} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.locateButton, isLocating && styles.locateButtonLoading]}
                                    onPress={handleGetLocation}
                                    disabled={isLocating}
                                    activeOpacity={0.8}
                                >
                                    {isLocating ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <>
                                            <Ionicons name="navigate" size={18} color={colors.white} />
                                            <Text style={styles.locateText}>{location ? 'Update' : 'Locate Me'}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.addressInfo}>
                                <View style={styles.addressRow}>
                                    <View style={[styles.addressIcon, { backgroundColor: `${themeColors.primary}15` }]}>
                                        <Ionicons name="location-outline" size={20} color={themeColors.primary} />
                                    </View>
                                    <View style={styles.addressTextContainer}>
                                        <Text style={[styles.addressLabel, dynamicStyles.textLight]}>Current Address</Text>
                                        <Text style={[styles.addressText, dynamicStyles.text]} numberOfLines={2}>{address}</Text>
                                    </View>
                                    <Ionicons
                                        name={location ? "checkmark-circle" : "time"}
                                        size={22}
                                        color={location ? colors.success : themeColors.textLight}
                                    />
                                </View>
                                {location && (
                                    <View style={styles.coordinatesRow}>
                                        <Text style={[styles.coordText, dynamicStyles.textLight]}>
                                            📍 {location.coords.latitude.toFixed(4)}° N, {location.coords.longitude.toFixed(4)}° W
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Animated.View>

                    {/* Settings Section */}
                    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
                        <Text style={[styles.sectionTitle, dynamicStyles.text]}>Settings</Text>
                        <View style={[styles.settingsCard, dynamicStyles.card]}>
                            {/* Theme Toggle */}
                            <View style={styles.settingRow}>
                                <View style={styles.settingLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: isDarkMode ? '#5856D615' : '#FF950015' }]}>
                                        <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={isDarkMode ? '#5856D6' : '#FF9500'} />
                                    </View>
                                    <View>
                                        <Text style={[styles.settingLabel, dynamicStyles.text]}>Appearance</Text>
                                        <Text style={[styles.settingValue, dynamicStyles.textLight]}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={() => dispatch(toggleTheme())}
                                    trackColor={{ false: '#E5E5EA', true: themeColors.primary }}
                                    thumbColor={colors.white}
                                    ios_backgroundColor="#E5E5EA"
                                />
                            </View>

                            <View style={[styles.settingDivider, dynamicStyles.divider]} />

                            {/* Notifications */}
                            <TouchableOpacity
                                style={styles.settingRow}
                                activeOpacity={0.7}
                                onPress={() => showAlert(
                                    'Notificaciones',
                                    'Administra tus preferencias de notificaciones',
                                    [
                                        { text: 'Actualizaciones de Pedidos: ON' },
                                        { text: 'Promociones: ON' },
                                        { text: 'Deshabilitar Todas', style: 'destructive' },
                                        { text: 'Cancelar', style: 'cancel' }
                                    ],
                                    'notifications-outline'
                                )}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: '#FF2D5515' }]}>
                                        <Ionicons name="notifications-outline" size={20} color="#FF2D55" />
                                    </View>
                                    <View>
                                        <Text style={[styles.settingLabel, dynamicStyles.text]}>Notifications</Text>
                                        <Text style={[styles.settingValue, dynamicStyles.textLight]}>Manage alerts</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={themeColors.textLight} />
                            </TouchableOpacity>

                            <View style={[styles.settingDivider, dynamicStyles.divider]} />

                            {/* Privacy */}
                            <TouchableOpacity
                                style={styles.settingRow}
                                activeOpacity={0.7}
                                onPress={() => showAlert(
                                    'Privacidad y Seguridad',
                                    'Tu cuenta está protegida:\n\nAutenticación 2FA: Habilitada\nLogin Biométrico: Disponible\nEncriptación: Activa',
                                    [
                                        { text: 'Cambiar Contraseña' },
                                        { text: 'Historial de Logins' },
                                        { text: 'OK', style: 'cancel' }
                                    ],
                                    'shield-checkmark-outline'
                                )}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: '#34C75915' }]}>
                                        <Ionicons name="shield-checkmark-outline" size={20} color="#34C759" />
                                    </View>
                                    <View>
                                        <Text style={[styles.settingLabel, dynamicStyles.text]}>Privacy & Security</Text>
                                        <Text style={[styles.settingValue, dynamicStyles.textLight]}>Account protection</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={themeColors.textLight} />
                            </TouchableOpacity>

                            <View style={[styles.settingDivider, dynamicStyles.divider]} />

                            {/* Help */}
                            <TouchableOpacity
                                style={styles.settingRow}
                                activeOpacity={0.7}
                                onPress={() => showAlert(
                                    'Ayuda y Soporte',
                                    '¿Cómo podemos ayudarte hoy?',
                                    [
                                        { text: 'Contactar Soporte' },
                                        { text: 'Preguntas Frecuentes' },
                                        { text: 'Chat en Vivo' },
                                        { text: 'Cancelar', style: 'cancel' }
                                    ],
                                    'help-circle-outline'
                                )}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.settingIcon, { backgroundColor: '#007AFF15' }]}>
                                        <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
                                    </View>
                                    <View>
                                        <Text style={[styles.settingLabel, dynamicStyles.text]}>Help & Support</Text>
                                        <Text style={[styles.settingValue, dynamicStyles.textLight]}>Get assistance</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={themeColors.textLight} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
                        <Ionicons name="log-out-outline" size={22} color={colors.white} />
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>

                    {/* App Version */}
                    <Text style={[styles.versionText, dynamicStyles.textLight]}>TechZone v1.1.0 (Advanced)</Text>

                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>

            {/* CustomAlert Modal */}
            <CustomAlert {...alertConfig} onClose={hideAlert} />

            {/* Location Picker Modal */}
            <LocationPickerModal
                visible={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                onLocationSelect={handleLocationSelect}
                initialLocation={location}
            />
        </SafeAreaView>
    );
};

// Dynamic styles based on theme
const getDynamicStyles = (isDarkMode, themeColors) => StyleSheet.create({
    container: {
        backgroundColor: isDarkMode ? '#000000' : '#F2F6FF',
    },
    text: {
        color: themeColors.text,
    },
    textLight: {
        color: themeColors.textLight,
    },
    card: {
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    },
    heroCard: {
        backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    },
    divider: {
        backgroundColor: isDarkMode ? '#38383A' : '#F2F2F7',
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    settingsButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }
        }),
    },
    heroCard: {
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)',
            }
        }),
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    gradientTop: {
        height: 100,
        opacity: 0.15,
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    avatarContainer: {
        alignSelf: 'center',
        position: 'relative',
        marginBottom: 16,
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: 'rgba(0,122,255,0.2)',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.white,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: `0px 4px 8px ${colors.primary}4D`,
            }
        }),
    },
    onlineIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.success,
        borderWidth: 3,
        borderColor: colors.white,
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 12,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    premiumText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#B8860B',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(52, 199, 89, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.success,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textLight,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E5E5EA',
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: `0px 4px 12px ${colors.primary}4D`,
            }
        }),
    },
    editProfileText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionCard: {
        // Width is handled dynamically using style prop
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            }
        }),
    },
    webContainer: {
        alignSelf: 'center',
        flex: 1,
        width: '100%',
        maxWidth: 800,
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    quickActionLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    locationCard: {
        borderRadius: 24,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
            }
        }),
    },
    mapContainer: {
        height: 160,
        position: 'relative',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapMap: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    locationPinContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        alignItems: 'center',
        transform: [{ translateX: -20 }, { translateY: -40 }],
    },
    locationPin: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
            web: {
                boxShadow: `0px 4px 8px ${colors.primary}66`,
            }
        }),
    },
    locationPinShadow: {
        width: 20,
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 10,
        marginTop: 4,
    },
    locateButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 25,
        gap: 6,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            }
        }),
    },
    editMapButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    locateButtonLoading: {
        paddingHorizontal: 16,
    },
    locateText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
    },
    addressInfo: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    addressIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressTextContainer: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
    coordinatesRow: {
        marginTop: 8,
        marginLeft: 56,
    },
    coordText: {
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    settingsCard: {
        borderRadius: 24,
        padding: 8,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    settingValue: {
        fontSize: 12,
        marginTop: 2,
    },
    settingDivider: {
        height: 1,
        marginLeft: 72,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        paddingVertical: 16,
        borderRadius: 24,
        marginBottom: 16,
        gap: 8,
    },
    logoutText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 30,
    }
});

export default Profile;
