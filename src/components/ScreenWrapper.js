import React from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AdComponent from './AdComponent';
import { useSubscription } from '../context/SubscriptionContext';

const ScreenWrapper = ({
    children,
    statusBarColor,
    isScrollable = true,
    showAd = true,
    contentContainerStyle = {},
    refreshControl
}) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const { shouldShowAds } = useSubscription();

    // Determine Status Bar Color
    const finalStatusBarColor = statusBarColor || colors.statusBarBg || colors.primary;

    // Render Content Logic
    const renderContent = () => (
        <View style={[styles.contentWrapper, contentContainerStyle]}>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={finalStatusBarColor}
                translucent={true} // Allow content to flow behind status bar (we handle padding with Header)
            />

            <View style={styles.flexContainer}>
                {isScrollable ? (
                    <ScrollView
                        style={styles.flexContainer}
                        contentContainerStyle={styles.scrollContentContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={refreshControl}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View style={styles.flexContainer}>
                        {children}
                    </View>
                )}
            </View>

            {/* Ad Container - Footer */}
            {shouldShowAds && showAd && (
                <View style={[styles.adContainer, { backgroundColor: colors.background }]}>
                    <AdComponent />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flexContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    adContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#FFFFFF', // Ensure visual separation
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        elevation: 2, // Slight shadow to lift it off the navigator (or content)
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 0, // Ensure it sits flush but styling separates it
    }
});

export default ScreenWrapper;
