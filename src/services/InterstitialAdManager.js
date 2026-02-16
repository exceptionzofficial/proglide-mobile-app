import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3067918720033946/3535978720';

let interstitial = null;
let loaded = false;

let onCloseCallback = null;

export const loadInterstitial = () => {
    if (loaded && interstitial) return;

    interstitial = InterstitialAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
    });

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
        loaded = true;
    });

    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        loaded = false;
        // Call the callback if it exists
        if (onCloseCallback) {
            onCloseCallback();
            onCloseCallback = null;
        }
        // Load the next one
        interstitial.load();
    });

    interstitial.load();
};

export const showInterstitial = (onClose) => {
    // Frequency Capping: Show ad only every 3rd time this is called
    // We increment first, so it shows on 3, 6, 9...
    // Adjust logic if you want it on 1, 4, 7...

    // Simple counter stored in module scope
    if (!global.adTriggerCount) global.adTriggerCount = 0;
    global.adTriggerCount++;

    const FREQUENCY_CAP = 3;
    const shouldShow = (global.adTriggerCount % FREQUENCY_CAP) === 0;

    if (shouldShow && loaded && interstitial) {
        onCloseCallback = onClose;
        interstitial.show();
        loaded = false;
    } else {
        // If not loaded yet OR not met frequency cap, just proceed
        if (onClose) onClose();
        // Try load if not loaded
        if (!interstitial || !loaded) loadInterstitial();
    }
};
