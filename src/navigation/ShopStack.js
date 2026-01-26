/**
 * @fileoverview Shop Navigation Stack
 * @description Manages navigation within the shopping experience (Home -> Details, etc).
 * NOTE: ProductDetail is currently handled in MainNavigator for global access (like from cart).
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home/Home';

const Stack = createNativeStackNavigator();

const ShopStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
        </Stack.Navigator>
    );
};

export default ShopStack;
