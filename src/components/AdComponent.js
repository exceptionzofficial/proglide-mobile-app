import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use TestIds.BANNER for development.
// In production, replace this with your actual Ad Unit ID.
// REAL ID: ca-app-pub-3067918720033946/2198846322
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-3067918720933946/2198846322';

const AdComponent = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleAdLoaded = () => {
        console.log('✅ Ad loaded successfully');
        console.log('📍 Using Ad Unit ID:', adUnitId);
        console.log('🔧 Dev Mode:', __DEV__);
        setIsLoading(false);
        setError(null);
    };

    const handleAdFailedToLoad = (err) => {
        console.log('❌ Ad failed to load');
        console.log('📍 Using Ad Unit ID:', adUnitId);
        console.log('🔧 Dev Mode:', __DEV__);
        console.log('❗ Error Code:', err.code);
        console.log('❗ Error Message:', err.message);
        console.log('❗ Full Error:', JSON.stringify(err, null, 2));
        setIsLoading(false);
        setError(err.message);
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#999" />
                </View>
            )}
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={handleAdLoaded}
                onAdFailedToLoad={handleAdFailedToLoad}
            />
            {/* Show error in dev mode only for debugging */}
            {__DEV__ && error && (
                <Text style={styles.errorText}>Ad Error: {error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    loadingContainer: {
        padding: 10,
    },
    errorText: {
        fontSize: 10,
        color: 'red',
        padding: 5,
        textAlign: 'center',
    },
});

export default AdComponent;
