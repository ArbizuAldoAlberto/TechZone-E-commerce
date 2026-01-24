import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import AuthStack from './AuthStack';
import TabNavigator from './TabNavigator';
import ProductDetail from '../screens/ProductDetail/ProductDetail';
import { fetchSession } from '../db';
import { setUser } from '../store/authSlice';

const Stack = createNativeStackNavigator();

import NetInfo from '@react-native-community/netinfo';
import { setOfflineStatus } from '../store/cartSlice';

const MainNavigator = () => {
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    // Monitor Network State
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const isOffline = !state.isConnected;
            dispatch(setOfflineStatus(isOffline));
        });

        return () => unsubscribe();
    }, [dispatch]);

    // Restore Session
    useEffect(() => {
        (async () => {
            try {
                const session = await fetchSession();
                if (session) {
                    dispatch(setUser(session));
                }
            } catch (error) {
                // Session recovery failed silently
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
