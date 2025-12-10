import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    RefreshControl,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const PrivacyPolicyScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={[styles.content, { backgroundColor: colors.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
                    Last Updated: December 2024
                </Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        ProGlide collects the following information when you register:{'\n\n'}
                        • Full Name{'\n'}
                        • Email Address{'\n'}
                        • Phone Number{'\n'}
                        • Shop Name{'\n\n'}
                        This information is used solely for account management and to provide you with our accessory finder services.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        We use your information to:{'\n\n'}
                        • Create and manage your account{'\n'}
                        • Provide product compatibility search services{'\n'}
                        • Send important updates about the app{'\n'}
                        • Improve our services based on usage patterns
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Data Security</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        Your data is securely stored and protected. We use industry-standard encryption to protect your personal information. We do not sell or share your data with third parties.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Your Rights</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        You have the right to:{'\n\n'}
                        • Access your personal data{'\n'}
                        • Request deletion of your account{'\n'}
                        • Opt-out of promotional communications{'\n\n'}
                        Contact us at proglideapp@gmail.com for any privacy-related requests.
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        © 2024 ProGlide. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        elevation: 4,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    lastUpdated: {
        fontSize: 12,
        marginBottom: 24,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    footerText: {
        fontSize: 12,
    },
});

export default PrivacyPolicyScreen;
