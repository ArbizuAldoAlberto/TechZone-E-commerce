/**
 * @fileoverview Root Navigation Controller
 * @description Manages auth flow, session restoration from SQLite/Firebase,
 * and network connectivity monitoring for offline-first support.
 */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import ProductDetail from '../screens/ProductDetail/ProductDetail';
import { fetchSession } from '../db';
import { setUser, setProfileImage, setUserLocation } from '../store/authSlice';
import { setDarkMode } from '../store/themeSlice';
import { setOfflineStatus } from '../store/cartSlice';

const Stack = createNativeStackNavigator();

/**
 * @description Helper to hydrate profile data with cloud priority, local fallback
 */
const hydrateProfileFromCloud = async (session, dispatch) => {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_FIREBASE_URL}users/${session.localId}.json`
        );
        const cloudProfile = await response.json();

        if (cloudProfile) {
            dispatch(setProfileImage(cloudProfile.profileImage || session.profileImage || null));
            dispatch(setUserLocation(cloudProfile.location || session.userLocation || null));
            dispatch(setDarkMode((cloudProfile.themePreference || session.themePreference) === 'dark'));
        } else {
            hydrateProfileFromLocal(session, dispatch);
        }
    } catch {
        hydrateProfileFromLocal(session, dispatch);
    }
};

const hydrateProfileFromLocal = (session, dispatch) => {
    if (session.profileImage) dispatch(setProfileImage(session.profileImage));
    if (session.userLocation) dispatch(setUserLocation(session.userLocation));
    if (session.themePreference) dispatch(setDarkMode(session.themePreference === 'dark'));
};

const MainNavigator = () => {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    // Monitor network connectivity
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            dispatch(setOfflineStatus(!state.isConnected));
        });
        return () => unsubscribe();
    }, [dispatch]);

    // Restore session with cloud-first strategy
    useEffect(() => {
        (async () => {
            try {
                const session = await fetchSession();
                if (!session) return;

                dispatch(setUser({
                    email: session.email,
                    token: session.token,
                    localId: session.localId,
                }));

                await hydrateProfileFromCloud(session, dispatch);
            } catch {
                // Session restoration failed silently
            }
        })();
    }, [dispatch]);

    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={TabNavigator} />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetail}
                        options={{
                            headerShown: true,
                            headerTitle: 'Product Details',
                            headerBackTitleVisible: false,
                        }}
                    />
                </Stack.Navigator>
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default MainNavigator;
