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

const HowToUseScreen = ({ navigation }) => {
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

    const Step = ({ number, title, description, icon }) => (
        <View style={[styles.stepCard, { backgroundColor: colors.card }]}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{number}</Text>
            </View>
            <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                    <Icon name={icon} size={24} color={colors.primary} />
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{title}</Text>
                </View>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{description}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>How to Use</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={[styles.content, { backgroundColor: colors.background }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
                <Text style={[styles.intro, { color: colors.text }]}>
                    Welcome to ProGlide! Here's how to find compatible accessories for any device.
                </Text>

                <Step
                    number="1"
                    icon="magnify"
                    title="Search for a Device"
                    description="Type the device name in the search bar (e.g., 'Vivo V19'). Suggestions will appear as you type."
                />

                <Step
                    number="2"
                    icon="tab"
                    title="Select a Category"
                    description="Choose from Screen Guards, Phone Cases, Batteries, CC Boards, Center Panels, or Combo Folders using the tabs."
                />

                <Step
                    number="3"
                    icon="cellphone-screenshot"
                    title="View Screen Guard Results"
                    description="For Screen Guards, you'll see: Original Drawing (compatible devices for the same model) and Full Temper (devices with exact same dimensions)."
                />

                <Step
                    number="4"
                    icon="devices"
                    title="View Other Categories"
                    description="For other categories, you'll see all compatible devices that share the same product specifications."
                />

                <Step
                    number="5"
                    icon="tag-outline"
                    title="Tap on Results"
                    description="Tap any device in the results to search for that device and see its compatible accessories."
                />

                <View style={[styles.tipCard, { backgroundColor: colors.primary + '15' }]}>
                    <Icon name="lightbulb-outline" size={24} color={colors.primary} />
                    <View style={styles.tipContent}>
                        <Text style={[styles.tipTitle, { color: colors.primary }]}>Pro Tip</Text>
                        <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                            Use the "All" tab to search across all categories at once!
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Need help? Contact proglideapp@gmail.com
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
    intro: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
        fontWeight: '500',
    },
    stepCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    stepNumber: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    stepNumberText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepContent: {
        flex: 1,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    stepDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    tipCard: {
        flexDirection: 'row',
        padding: 16,
        marginTop: 10,
        marginBottom: 20,
    },
    tipContent: {
        flex: 1,
        marginLeft: 12,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    footerText: {
        fontSize: 12,
    },
});

export default HowToUseScreen;
