import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import ScreenWrapper from '../components/ScreenWrapper';

const NotificationsScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    const [notifications, setNotifications] = useState([
        {
            id: '1',
            title: 'Welcome to ProGlide!',
            message: 'Thanks for joining. Start searching for compatible accessories now.',
            time: 'Just now',
            read: false,
            icon: 'party-popper',
            color: '#FFD700'
        },
        {
            id: '2',
            title: 'New Feature Alert',
            message: 'You can now search by specific Brand Name & Model Number in Combo Folders.',
            time: '2 hours ago',
            read: true,
            icon: 'new-box',
            color: '#4CAF50'
        }
    ]);

    const renderNotificationItem = ({ item }) => (
        <View style={[
            styles.notificationItem,
            {
                backgroundColor: item.read ? colors.card : colors.background, // Read = standard card, Unread = highlighted/lighter bg? Or standard logic
                // Actually, commonly unread is highlighted. Let's make:
                // Unread: Card Background (White/Dark) + Border/LeftStrip?
                // Read: Slightly grayed out?
                // Let's stick to user's current logic but prettier.
                backgroundColor: colors.card,
                opacity: item.read ? 0.7 : 1, // Fade out read items slightly
            }
        ]}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Icon name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.time, { color: colors.textSecondary }]}>{item.time}</Text>
                </View>
                <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={3}>
                    {item.message}
                </Text>
            </View>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
    );

    return (
        <ScreenWrapper isScrollable={false} showAd={true}>
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={[styles.content, { backgroundColor: colors.background }]}>
                {notifications.length > 0 ? (
                    <FlatList
                        data={notifications}
                        renderItem={renderNotificationItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="bell-off-outline" size={64} color={colors.textSecondary} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40, // Adjust top padding for status bar
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    content: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 16,
        borderRadius: 16,
        alignItems: 'flex-start', // Align top so long text doesn't center icon weirdly
        elevation: 2, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        alignItems: 'center', // Align time with title
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
        fontFamily: 'Barlow',
    },
    time: {
        fontSize: 12,
        fontWeight: '500',
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Barlow',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        position: 'absolute',
        top: 16,
        right: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Barlow',
    },
});

export default NotificationsScreen;
