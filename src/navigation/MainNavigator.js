/**
 * @fileoverview Root Navigation Controller
 * @module navigation/MainNavigator
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';

// Navigation Stacks
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import ProductDetail from '../screens/ProductDetail/ProductDetail';

// Core Services & State
import { fetchSession, insertSession, deleteSession } from '../db';
import { setUser, setProfileImage, setUserLocation, clearUser } from '../store/authSlice';
import { setDarkMode } from '../store/themeSlice';
import { setOfflineStatus } from '../store/cartSlice';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createNativeStackNavigator();

/**
 * @function getFirebaseUser
 * @description Waits for the initial Firebase Auth state resolution.
 */
const getFirebaseUser = () => new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
        unsubscribe();
        resolve(user);
    });
});

const MainNavigator = () => {
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const [isSessionLoading, setIsSessionLoading] = useState(true);

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
                // A. Local Hydration
                let session = await fetchSession();
                if (!session) return;

                const firebaseUser = await getFirebaseUser();
                let { email, token, localId, profileImage, userLocation, themePreference } = session;

                if (firebaseUser && firebaseUser.uid === localId) {
                    try {
                        const freshToken = await firebaseUser.getIdToken(true);
                        if (freshToken && freshToken !== token) {
                            token = freshToken;
                            await insertSession({ ...session, token: freshToken });
                        }
                    } catch (e) {
                        console.warn('Sentinel: Token refresh failed.', e);
                    }
                }

                dispatch(setUser({ email, token, localId }));

                // Local UI Update
                if (profileImage) dispatch(setProfileImage(profileImage));
                if (userLocation) dispatch(setUserLocation(userLocation));
                if (themePreference) dispatch(setDarkMode(themePreference === 'dark'));

                // B. Cloud Hydration
                try {
                    const baseUrl = process.env.EXPO_PUBLIC_FIREBASE_URL;
                    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
                    const response = await fetch(`${cleanBaseUrl}users/${localId}.json?auth=${token}`);
                    
                    if (response.ok) {
                        const cloudProfile = await response.json();
                        if (cloudProfile) {
                            dispatch(setProfileImage(cloudProfile.profileImage || profileImage));
                            dispatch(setUserLocation(cloudProfile.location || userLocation));
                            dispatch(setDarkMode((cloudProfile.themePreference || themePreference) === 'dark'));
                        }
                    } else if (response.status === 401) {
                        console.warn('Sentinel: Unauthorized. Forcing logout.');
                        await deleteSession();
                        dispatch(clearUser());
                        return;
                    }
                } catch (e) {
                    console.warn('Sentinel: Cloud hydration failed.', e);
                }

            } catch (e) {
                console.log('Sentinel: Session restoration failed.', e);
            } finally {
                setIsSessionLoading(false);
            }
        };

        restoreSession();
    }, [dispatch]);

    if (isSessionLoading) return null;

    return (
        <NavigationContainer>
            {user ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={TabNavigator} />
                    <Stack.Screen
                        name="ProductDetail"
                        component={ProductDetail}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            ) : (
                <AuthStack />
            )}
        </NavigationContainer>
    );
};

export default MainNavigator;
