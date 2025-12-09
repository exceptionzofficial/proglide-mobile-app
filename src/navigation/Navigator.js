import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import Login from '../screens/Login';
import Register from '../screens/Register';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsScreen from '../screens/TermsScreen';
import HowToUseScreen from '../screens/HowToUseScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabNavigator = () => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.icon,
                tabBarStyle: {
                    backgroundColor: isDark ? colors.card : '#FFFFFF',
                    borderTopWidth: 0,
                    elevation: 15,
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                    borderTopColor: isDark ? colors.border : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                },
                tabBarIconStyle: {
                    marginBottom: -2,
                },
            }}>
            <Tab.Screen
                name="HomeTab"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon
                            name={focused ? 'home-variant' : 'home-variant-outline'}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon
                            name={focused ? 'account-circle' : 'account-circle-outline'}
                            size={focused ? 26 : 24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Root Stack Navigator
const Navigator = () => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    animationDuration: 300,
                    contentStyle: { backgroundColor: colors.background },
                }}>
                <Stack.Screen
                    name="Splash"
                    component={SplashScreen}
                    options={{
                        animation: 'fade',
                    }}
                />
                <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{
                        animation: 'fade_from_bottom',
                        animationDuration: 400,
                    }}
                />
                <Stack.Screen
                    name="Register"
                    component={Register}
                    options={{
                        animation: 'slide_from_right',
                    }}
                />

                {/* Main App Flow (Tabs) */}
                <Stack.Screen
                    name="Home"
                    component={MainTabNavigator}
                    options={{
                        gestureEnabled: false,
                        animation: 'fade',
                        animationDuration: 300,
                    }}
                />

                {/* Detail Screens (Pushed on top of tabs) */}
                <Stack.Screen
                    name="ProductDetails"
                    component={ProductDetailsScreen}
                    options={{
                        animation: 'slide_from_right',
                        animationDuration: 250,
                    }}
                />

                {/* Info Screens */}
                <Stack.Screen
                    name="PrivacyPolicy"
                    component={PrivacyPolicyScreen}
                    options={{
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="Terms"
                    component={TermsScreen}
                    options={{
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="HowToUse"
                    component={HowToUseScreen}
                    options={{
                        animation: 'slide_from_right',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigator;

