/**
 * @fileoverview Root Navigation Controller
 * @module navigation/MainNavigator
 * @description Orchestrates the application's root navigation state.
 * Responsibilities:
 * 1. Auth Flow Switching (Stack vs Tabs)
 * 2. Session Restoration (Disk -> Cloud -> State)
 * 3. Network Monitoring (Offline/Online Global State)
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';

// Navigation Stacks
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import ProductDetail from '../screens/ProductDetail/ProductDetail';

// Core Services & State
import { fetchSession } from '../db';
import { setUser, setProfileImage, setUserLocation } from '../store/authSlice';
import { setDarkMode } from '../store/themeSlice';
import { setOfflineStatus } from '../store/cartSlice';
import SyncManager from '../services/SyncManager';

const Stack = createNativeStackNavigator();

/**
 * @function MainNavigator
 * @description Root component. Handles "Cloud-First" profile hydration strategy:
 * 1. Load Session from SQLite (Fastest).
 * 2. If valid, Optimistically Hydrate State.
 * 3. Background: Fetch latest profile from Firebase and update State.
 */
const MainNavigator = () => {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    // 1. Network Monitor
    useEffect(() => {
        return NetInfo.addEventListener((state) => {
            dispatch(setOfflineStatus(!state.isConnected));
        });
    }, [dispatch]);

    // 2. Session Restoration Logic
    useEffect(() => {
        const restoreSession = async () => {
            try {
                // A. Local Hydration (Instant)
                const session = await fetchSession();
                if (!session) return;

                const { email, token, localId, profileImage, userLocation, themePreference } = session;

                dispatch(setUser({ email, token, localId }));

                // Fallback hydration from local if cloud fetch fails later
                const hydrateLocal = () => {
                    if (profileImage) dispatch(setProfileImage(profileImage));
                    if (userLocation) dispatch(setUserLocation(userLocation));
                    if (themePreference) dispatch(setDarkMode(themePreference === 'dark'));
                };
                hydrateLocal();

                // B. Cloud Hydration (Freshness)
                try {
                    const response = await fetch(`${process.env.EXPO_PUBLIC_FIREBASE_URL}users/${localId}.json`);
                    if (response.ok) {
                        const cloudProfile = await response.json();
                        if (cloudProfile) {
                            dispatch(setProfileImage(cloudProfile.profileImage || profileImage));
                            dispatch(setUserLocation(cloudProfile.location || userLocation));
                            dispatch(setDarkMode((cloudProfile.themePreference || themePreference) === 'dark'));
                        }
                    }
                } catch (e) {
                    console.warn('Cloud hydration failed, sticking to local.', e);
                }

            } catch (e) {
                console.log('No valid session found.', e);
            }
        };

        restoreSession();
    }, [dispatch]);

    return (
        <NavigationContainer>
            <SyncManager />
            {user ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={TabNavigator} />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetail}
                        options={{
                            headerShown: false,
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
