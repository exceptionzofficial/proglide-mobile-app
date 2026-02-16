import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    RefreshControl,
    StatusBar,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import ScreenWrapper from '../components/ScreenWrapper';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const { isPro, isPremium } = useSubscription();

    useEffect(() => {
        loadUser();
    }, []);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUser();
        setRefreshing(false);
    }, []);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Failed to load user', error);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('userToken');
                    await AsyncStorage.removeItem('userData');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                },
            },
        ]);
    };

    const sendFeedback = () => {
        Linking.openURL('mailto:proglideapp@gmail.com?subject=App Feedback');
    };

    const MenuItem = ({ icon, title, subtitle, onPress }) => (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Icon name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>
            <Icon name="chevron-right" size={24} color={colors.icon} />
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper isScrollable={false} showAd={true} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }>
            {/* Header Section */}
            <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
                <View style={[styles.headerContent, { paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50 }]}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatarContainer}>
                            <Text style={[styles.avatarText, { color: colors.primary }]}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                            <View style={styles.shopBadge}>
                                <Icon name="store" size={12} color="#FFFFFF" />
                                <Text style={styles.shopName}>{user?.shopName || 'My Shop'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* App Information Section */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APP INFORMATION</Text>

                <MenuItem
                    icon="help-circle-outline"
                    title="How to Use"
                    subtitle="Learn how to use ProGlide"
                    onPress={() => navigation.navigate('HowToUse')}
                />

                <MenuItem
                    icon="file-document-outline"
                    title="Terms & Conditions"
                    subtitle="Read our terms of service"
                    onPress={() => navigation.navigate('Terms')}
                />

                <MenuItem
                    icon="shield-lock-outline"
                    title="Privacy Policy"
                    subtitle="How we protect your data"
                    onPress={() => navigation.navigate('PrivacyPolicy')}
                />

                <MenuItem
                    icon="crown-outline"
                    title="Subscription"
                    subtitle={
                        isPremium ? "Current Plan: Premium" :
                            isPro ? "Current Plan: Pro" :
                                "Current Plan: Free"
                    }
                    onPress={() => navigation.navigate('Subscription')}
                />

                <MenuItem
                    icon="message-draw"
                    title="Send Feedback"
                    subtitle="Help us improve the app"
                    onPress={sendFeedback}
                />

                {/* About Section */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 20 }]}>ABOUT</Text>

                <View style={[styles.aboutCard, { backgroundColor: colors.card }]}>
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>App Version</Text>
                        <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.1</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.background }]} />
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Contact</Text>
                        <Text style={[styles.aboutValue, { color: colors.primary }]}>proglideapp@gmail.com</Text>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}
                    onPress={handleLogout}>
                    <Icon name="logout" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Made with ❤️ for mobile retailers
                    </Text>
                    <Text style={[styles.footerText, { color: colors.textSecondary, marginTop: 4 }]}>
                        ProGlide © 2024
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        paddingBottom: 30,
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
        fontFamily: 'Barlow',
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderRadius: 35,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Barlow',
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 6,
        fontFamily: 'Barlow',
    },
    shopBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        alignSelf: 'flex-start',
        borderRadius: 8,
    },
    shopName: {
        color: '#FFFFFF',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
        fontFamily: 'Barlow',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingLeft: 86,
    },
    phoneText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginLeft: 8,
        fontFamily: 'Barlow',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
        fontFamily: 'Barlow',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 10,
        elevation: 1,
        borderRadius: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        borderRadius: 12,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Barlow',
    },
    menuSubtitle: {
        fontSize: 12,
        marginTop: 2,
        fontFamily: 'Barlow',
    },
    aboutCard: {
        padding: 16,
        marginBottom: 20,
        elevation: 1,
        borderRadius: 16,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    aboutLabel: {
        fontSize: 14,
        fontFamily: 'Barlow',
    },
    aboutValue: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Barlow',
    },
    divider: {
        height: 1,
        marginVertical: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginTop: 10,
        borderRadius: 16,
    },
    logoutText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
        fontFamily: 'Barlow',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    footerText: {
        fontSize: 12,
        fontFamily: 'Barlow',
    },
});

export default ProfileScreen;
