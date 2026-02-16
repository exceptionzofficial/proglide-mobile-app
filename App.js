/**
 * ProGlide - Mobile Accessory Finder App
 * Main Application Entry Point
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigator from './src/navigation/Navigator';
import { ThemeProvider } from './src/context/ThemeContext';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import { initializeAds } from './src/services/AdService';
import { loadInterstitial } from './src/services/InterstitialAdManager';

const App = () => {
    useEffect(() => {
        initializeAds();
        loadInterstitial();
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <SubscriptionProvider>
                    <Navigator />
                </SubscriptionProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default App;
