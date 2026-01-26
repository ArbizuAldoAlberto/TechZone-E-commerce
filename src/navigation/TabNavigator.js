/**
 * @fileoverview Main Bottom Tab Navigation
 * @description Manages core app navigation (Home, Cart, Orders, Profile).
 * Features a custom swipeable tab bar with animated indicators and badges.
 */
import React from 'react';
import { View, Platform, StyleSheet, Animated as RNAnimated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TouchableOpacity } from 'react-native';

import ShopStack from './ShopStack';
import Cart from '../screens/Cart/Cart';
import Orders from '../screens/Orders/Orders';
import Profile from '../screens/Profile/Profile';
import { colors, getColors } from '../global/colors';

const TopTab = createMaterialTopTabNavigator();

const TabNavigator = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const themeColors = getColors(isDarkMode);
    const cartItems = useSelector((state) => state.cart.items);
    const insets = useSafeAreaInsets();

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Safe padding for bottom considering device navigation buttons
    const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);

    // Tab bar height with proper safe area
    const tabBarHeight = Platform.select({
        ios: 50 + bottomPadding,
        android: 56 + bottomPadding,
        default: 60,
    });

    // Custom tab bar component positioned at bottom
    const CustomTabBar = ({ state, descriptors, navigation }) => {
        return (
            <View
                style={[
                    styles.tabBarContainer,
                    {
                        backgroundColor: isDarkMode ? '#1C1C1E' : colors.white,
                        borderTopColor: isDarkMode ? '#38383A' : '#E5E5EA',
                        height: tabBarHeight,
                        paddingBottom: bottomPadding,
                    },
                ]}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel || options.title || route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const getIcon = () => {
                        let iconName;
                        switch (route.name) {
                            case 'Shop':
                                iconName = isFocused ? 'home' : 'home-outline';
                                break;
                            case 'Cart':
                                iconName = isFocused ? 'cart' : 'cart-outline';
                                break;
                            case 'Orders':
                                iconName = isFocused ? 'list' : 'list-outline';
                                break;
                            case 'Profile':
                                iconName = isFocused ? 'person' : 'person-outline';
                                break;
                            default:
                                iconName = 'ellipse';
                        }
                        return iconName;
                    };

                    const iconColor = isFocused ? themeColors.primary : themeColors.textLight;
                    const labelToShow = route.name === 'Shop' ? 'Home' : route.name;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name={getIcon()} size={24} color={iconColor} />
                                {route.name === 'Cart' && cartCount > 0 && (
                                    <View style={styles.badge}>
                                        <Ionicons name="cart" size={10} color={colors.white} />
                                    </View>
                                )}
                            </View>
                            <RNAnimated.Text
                                style={[
                                    styles.tabLabel,
                                    { color: iconColor },
                                    isFocused && styles.tabLabelFocused,
                                ]}
                            >
                                {labelToShow}
                            </RNAnimated.Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <TopTab.Navigator
            tabBarPosition="bottom"
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                swipeEnabled: true,
                animationEnabled: true,
                lazy: true,
                lazyPreloadDistance: 1,
            }}
            initialRouteName="Shop"
        >
            <TopTab.Screen
                name="Shop"
                component={ShopStack}
                options={{ tabBarLabel: 'Home' }}
            />
            <TopTab.Screen
                name="Cart"
                component={Cart}
                options={{ tabBarLabel: 'Cart' }}
            />
            <TopTab.Screen
                name="Orders"
                component={Orders}
                options={{ tabBarLabel: 'Orders' }}
            />
            <TopTab.Screen
                name="Profile"
                component={Profile}
                options={{ tabBarLabel: 'Profile' }}
            />
        </TopTab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },
    iconContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -10,
        backgroundColor: colors.error,
        borderRadius: 9,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },
    tabLabelFocused: {
        fontWeight: '600',
    },
});

export default TabNavigator;
