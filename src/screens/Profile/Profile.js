/**
 * @fileoverview User Profile Screen (Elite)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActionSheetIOS,
    Platform,
    Switch,
    Animated,
    StatusBar,
    ActivityIndicator,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Data & Logic
import { colors, getColors } from '../../global/colors';
import { theme } from '../../global/theme';
import { fonts } from '../../global/fonts';
import { setProfileImage, setUserLocation, clearUser } from '../../store/authSlice';
import { toggleTheme } from '../../store/themeSlice';
import { deleteSession, updateSession } from '../../db';
import { useUpdateProfileImageMutation, useUpdateUserLocationMutation, useUpdateThemePreferenceMutation } from '../../services/userService';
import { useImagePicker } from '../../hooks/useImagePicker';
import { useUserLocation } from '../../hooks/useUserLocation';

// Components
import MapView, { Marker, PROVIDER_DEFAULT } from '../../components/common/MapWrapper';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';
import LocationPickerModal from '../../components/profile/LocationPickerModal';
import Avatar3D from '../../components/3d/Avatar3D';
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import SimpleChart from '../../components/profile/SimpleChart';

const Profile = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    // Selectors
    const { profileImage, userLocation, user: userEmail, localId } = useSelector(state => state.auth);
    const { isDarkMode } = useSelector(state => state.theme);
    const favorites = useSelector(state => state.favorites?.items || []);
    const themeColors = getColors(isDarkMode);

    // API
    const [saveImage] = useUpdateProfileImageMutation();
    const [saveLocation] = useUpdateUserLocationMutation();
    const [saveTheme] = useUpdateThemePreferenceMutation();

    // Hooks
    const { isCompressing, pickImage } = useImagePicker(profileImage || 'https://i.pravatar.cc/300?img=11');
    const { location, address, isLocating, getUserLocation, setAddress, setLocation } = useUserLocation(userLocation);
    const [showLocModal, setShowLocModal] = useState(false);

    // Anim
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    // Handlers
    const handleLocationSelect = (newLoc) => {
        const payload = { coords: newLoc.coords, address: newLoc.address || 'Custom Location', timestamp: Date.now() };
        setLocation(payload);
        setAddress(payload.address);
        dispatch(setUserLocation(payload));
        if (localId) saveLocation({ localId, location: payload });
    };

    const handlePhotoUpdate = (uri) => {
        dispatch(setProfileImage(uri));
        if (localId) saveImage({ localId, image: uri });
    };

    const showPhotoOptions = () => {
        const handler = (type) => pickImage(type, handlePhotoUpdate, showAlert);
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ['Cancel', 'Take Photo', 'Choose from Gallery'], cancelButtonIndex: 0 },
                (idx) => { if (idx === 1) handler('camera'); if (idx === 2) handler('gallery'); }
            );
        } else {
            showAlert('Update Photo', '', [
                { text: 'Camera', onPress: () => handler('camera') },
                { text: 'Gallery', onPress: () => handler('gallery') },
                { text: 'Cancel', style: 'cancel' }
            ], 'camera');
        }
    };

    const handleThemeToggle = async () => {
        const newTheme = !isDarkMode;
        dispatch(toggleTheme());
        if (localId) saveTheme({ localId, themePreference: newTheme ? 'dark' : 'light' });
        await updateSession({ themePreference: newTheme ? 'dark' : 'light' });
    };

    const handleLogout = () => {
        showAlert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    await deleteSession();
                    dispatch(clearUser());
                }
            }
        ], 'log-out-outline');
    };

    // Layout
    // Percentage based layout handled in styles


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]} edges={['top']}>
            <ParticlesBackground />
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <CustomAlert {...alertConfig} onClose={hideAlert} />
            <LocationPickerModal visible={showLocModal} onClose={() => setShowLocModal(false)} onLocationSelect={handleLocationSelect} initialLocation={location} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.title, { color: themeColors.text }]}>Profile</Text>
                            <Text style={{ color: themeColors.textLight, fontFamily: fonts.medium }}>Manage your identity</Text>
                        </View>
                    </View>

                    <HeroCard
                        userEmail={userEmail}
                        themeColors={themeColors}
                        isDarkMode={isDarkMode}
                        showPhotoOptions={showPhotoOptions}
                        isCompressing={isCompressing}
                    />
                </Animated.View>

                {/* Dashboard Grid */}
                <View style={styles.grid}>
                    <ActionCard title="Orders" icon="receipt-outline" color="#5856D6" onPress={() => navigation.navigate('Orders')} themeColors={themeColors} isDarkMode={isDarkMode} />
                    <ActionCard title="Wishlist" icon="heart-outline" color="#FF2D55" onPress={() => showAlert('Wishlist', `${favorites.length} items saved`, [{ text: 'OK' }], 'heart')} themeColors={themeColors} isDarkMode={isDarkMode} />
                    <ActionCard title="Payments" icon="card-outline" color="#34C759" onPress={() => showAlert('Payments', 'Manage cards', [{ text: 'OK' }], 'card')} themeColors={themeColors} isDarkMode={isDarkMode} />
                    <ActionCard title="Rewards" icon="gift-outline" color="#FF9500" onPress={() => showAlert('Rewards', '2,450 Points', [{ text: 'OK' }], 'gift')} themeColors={themeColors} isDarkMode={isDarkMode} />
                </View>

                {/* Pro Max: Spending Chart */}
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Activity</Text>
                <SimpleChart
                    data={[
                        { label: 'Jan', value: 320 },
                        { label: 'Feb', value: 450 },
                        { label: 'Mar', value: 280 },
                        { label: 'Apr', value: 600, active: true },
                        { label: 'May', value: 410 },
                        { label: 'Jun', value: 520 }
                    ]}
                    themeColors={themeColors}
                    isDarkMode={isDarkMode}
                />

                {/* Location Section */}
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Location</Text>
                <LocationCard
                    location={location}
                    address={address}
                    isLocating={isLocating}
                    onLocate={() => getUserLocation((d) => { dispatch(setUserLocation(d)); if (localId) saveLocation({ localId, location: d }); }, showAlert)}
                    onEdit={() => setShowLocModal(true)}
                    themeColors={themeColors}
                    isDarkMode={isDarkMode}
                />

                {/* Settings Section */}
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Settings</Text>
                <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? '#1C1917' : colors.white, borderColor: isDarkMode ? '#292524' : '#E5E5E5' }]}>
                    <View style={styles.settingRow}>
                        <SettingItem icon={isDarkMode ? "moon" : "sunny"} color={isDarkMode ? '#5856D6' : '#FF9500'} label="Appearance" value={isDarkMode ? 'Dark' : 'Light'} themeColors={themeColors} />
                        <Switch value={isDarkMode} onValueChange={handleThemeToggle} trackColor={{ true: colors.primary }} thumbColor="#FFF" />
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDarkMode ? '#292524' : '#F5F5F4' }]} />

                    <TouchableOpacity style={styles.settingRow} onPress={() => showAlert('Notifs', 'Manage Alerts', [{ text: 'OK' }], 'notifications')}>
                        <SettingItem icon="notifications-outline" color="#FF2D55" label="Notifications" value="On" themeColors={themeColors} />
                        <Ionicons name="chevron-forward" size={18} color={themeColors.textLight} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={[styles.version, { color: themeColors.textLight }]}>TechZone Elite v2.1</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

// Sub-Components
const HeroCard = ({ userEmail, themeColors, isDarkMode, showPhotoOptions, isCompressing }) => (
    <View style={[styles.hero, { backgroundColor: isDarkMode ? '#1C1917' : colors.white }]}>
        <View style={[styles.heroGradient, { backgroundColor: colors.primary }]} />
        <View style={styles.avatarWrapper}>
            <Avatar3D />
            <TouchableOpacity style={styles.camBtn} onPress={showPhotoOptions}>
                {isCompressing ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="camera" size={14} color="#FFF" />}
            </TouchableOpacity>
        </View>
        <Text style={[styles.username, { color: themeColors.text }]}>{userEmail || 'Guest User'}</Text>
        <View style={styles.badges}>
            <Badge icon="diamond" text="ELITE MEMBER" color="#FFB700" bg="rgba(255,183,0,0.1)" />
            <Badge icon="shield-checkmark" text="Verified" color={colors.success} bg="rgba(16,185,129,0.1)" />
        </View>
        <View style={styles.stats}>
            <Stat val="12" lbl="Orders" color={themeColors.text} />
            <View style={styles.vDiv} />
            <Stat val="4.9" lbl="Rating" color={themeColors.text} />
        </View>
    </View>
);

const Badge = ({ icon, text, color, bg }) => (
    <View style={[styles.badge, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={10} color={color} />
        <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
);

const Stat = ({ val, lbl, color }) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={{ fontSize: 18, fontFamily: fonts.bold, color }}>{val}</Text>
        <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: 'gray' }}>{lbl}</Text>
    </View>
);

const ActionCard = ({ title, icon, color, onPress, themeColors, isDarkMode }) => (
    <TouchableOpacity
        style={[styles.actionCard, { backgroundColor: isDarkMode ? '#1C1917' : colors.white }]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.actionText, { color: themeColors.text }]}>{title}</Text>
    </TouchableOpacity>
);

const LocationCard = ({ location, address, isLocating, onLocate, onEdit, themeColors, isDarkMode }) => (
    <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? '#1C1917' : colors.white, overflow: 'hidden', padding: 0 }]}>
        <View style={styles.mapFrame}>
            {location ? (
                <MapView
                    provider={PROVIDER_DEFAULT}
                    style={styles.map}
                    region={{ ...location.coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
                    scrollEnabled={false}
                >
                    <Marker coordinate={location.coords} />
                </MapView>
            ) : <View style={[styles.map, { backgroundColor: isDarkMode ? '#292524' : '#F5F5F4' }]} />}

            <TouchableOpacity style={styles.editLocBtn} onPress={onEdit}>
                <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.locateBtn} onPress={onLocate} disabled={isLocating}>
                {isLocating ? <ActivityIndicator color="#FFF" size="small" /> : (
                    <>
                        <Ionicons name="navigate" size={14} color="#FFF" />
                        <Text style={{ color: '#FFF', fontFamily: fonts.bold, fontSize: 11 }}>{location ? 'UPDATE' : 'LOCATE'}</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
        <View style={styles.locInfo}>
            <View style={[styles.iconCircle, { width: 32, height: 32, backgroundColor: 'rgba(202, 138, 4, 0.1)' }]}>
                <Ionicons name="location" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: 'gray', fontFamily: fonts.bold, textTransform: 'uppercase' }}>Current Address</Text>
                <Text style={{ fontSize: 13, color: themeColors.text, fontFamily: fonts.medium }} numberOfLines={1}>{address || 'Not set'}</Text>
            </View>
        </View>
    </View>
);

const SettingItem = ({ icon, color, label, value, themeColors }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[styles.iconCircle, { width: 36, height: 36, backgroundColor: `${color}15` }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <View>
            <Text style={{ fontSize: 14, fontFamily: fonts.bold, color: themeColors.text }}>{label}</Text>
            <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: themeColors.textLight }}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: theme.spacing.lg, paddingBottom: 40 },
    header: { marginTop: theme.spacing.md, marginBottom: theme.spacing.lg },
    title: { fontSize: 32, fontFamily: fonts.black },

    hero: { borderRadius: theme.borderRadius.lg, padding: 24, marginBottom: 24, overflow: 'hidden', alignItems: 'center', ...theme.shadows.sm },
    heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, opacity: 0.1 },
    avatarWrapper: { marginBottom: 12 },
    camBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, padding: 6, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
    username: { fontSize: 20, fontFamily: fonts.bold, marginBottom: 12 },
    badges: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    badgeText: { fontSize: 9, fontFamily: fonts.bold, textTransform: 'uppercase' },
    stats: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 16 },
    vDiv: { width: 1, backgroundColor: 'rgba(0,0,0,0.05)' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    actionCard: { width: '48%', padding: 16, borderRadius: theme.borderRadius.lg, alignItems: 'center', gap: 8, marginBottom: theme.spacing.md, ...theme.shadows.sm },
    iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    actionText: { fontFamily: fonts.bold, fontSize: 12 },

    sectionTitle: { fontSize: 16, fontFamily: fonts.bold, marginBottom: 12, marginTop: 12, textTransform: 'uppercase', opacity: 0.6 },
    settingsCard: { borderRadius: theme.borderRadius.lg, borderWidth: 1, ...theme.shadows.sm },

    mapFrame: { height: 140, position: 'relative' },
    map: { width: '100%', height: '100%' },
    editLocBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
    locateBtn: { position: 'absolute', bottom: 10, right: 10, backgroundColor: colors.primary, flexDirection: 'row', padding: 8, borderRadius: 20, alignItems: 'center', gap: 4 },
    locInfo: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },

    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    divider: { height: 1, marginLeft: 64 },

    logoutBtn: { backgroundColor: '#EF4444', flexDirection: 'row', justifyContent: 'center', padding: 16, borderRadius: theme.borderRadius.lg, alignItems: 'center', gap: 8, marginTop: 32, marginBottom: 16 },
    logoutText: { color: '#FFF', fontFamily: fonts.bold, fontSize: 14, textTransform: 'uppercase' },
    version: { textAlign: 'center', fontSize: 10, fontFamily: fonts.medium }
});

export default Profile;
