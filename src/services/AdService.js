import mobileAds from 'react-native-google-mobile-ads';

export const initializeAds = async () => {
    try {
        await mobileAds().initialize();
        console.log('AdMob initialized successfully');
    } catch (error) {
        console.error('Failed to initialize AdMob:', error);
    }
};
