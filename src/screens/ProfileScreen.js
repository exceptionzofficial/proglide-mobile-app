import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    StatusBar,
    Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const { theme, isDark, toggleTheme } = useTheme();
    const { colors } = theme;

    useEffect(() => {
        loadUser();
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

    const MenuItem = ({ icon, title, subtitle, onPress, color, rightElement }) => (
        <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.background }]}
            onPress={onPress}
            disabled={!!rightElement}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.background : '#F3F4F6' }]}>
                <Icon name={icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: color || colors.text }]}>{title}</Text>
                {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
            </View>
            {rightElement ? rightElement : (
                <Icon name="chevron-right" size={24} color={colors.icon} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'light-content'}
                backgroundColor={colors.statusBarBg}
            />

            {/* Header Section */}
            <View style={[styles.header, { backgroundColor: isDark ? colors.card : colors.primary }]}>
                <View style={styles.profileInfo}>
                    <View style={[styles.avatarContainer, { borderColor: isDark ? colors.border : 'rgba(255,255,255,0.3)' }]}>
                        <Text style={[styles.avatarText, { color: colors.primary }]}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                        <View style={styles.shopBadge}>
                            <Icon name="store" size={12} color="#FFFFFF" />
                            <Text style={styles.shopName}>{user?.shopName || 'My Shop'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Appearance Settings */}
                <View style={[styles.section, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : '#000' }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
                    <MenuItem
                        icon="theme-light-dark"
                        title="Dark Mode"
                        subtitle={isDark ? "On" : "Off"}
                        rightElement={
                            <Switch
                                trackColor={{ false: '#767577', true: colors.primary }}
                                thumbColor={isDark ? '#FFFFFF' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleTheme}
                                value={isDark}
                            />
                        }
                    />
                </View>

                {/* Account Settings */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
                    <MenuItem
                        icon="account-edit-outline"
                        title="Edit Profile"
                        subtitle="Update your personal information"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="lock-outline"
                        title="Change Password"
                        subtitle="Reset your security credentials"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="bell-outline"
                        title="Notifications"
                        subtitle="Manage app alerts"
                        onPress={() => { }}
                    />
                </View>

                {/* App Settings */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>App Support</Text>
                    <MenuItem
                        icon="help-circle-outline"
                        title="Help & Support"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="file-document-outline"
                        title="Terms & Conditions"
                        onPress={() => { }}
                    />
                    <MenuItem
                        icon="information-outline"
                        title="About ProGlide"
                        subtitle="Version 1.0.0"
                        onPress={() => { }}
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2' }]}
                    onPress={handleLogout}>
                    <Icon name="logout" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>ProGlide Mobile v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 3,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 6,
    },
    shopBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    shopName: {
        color: '#FFFFFF',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 30,
    },
    logoutText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    footer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    footerText: {
        fontSize: 12,
    },
});

export default ProfileScreen;
