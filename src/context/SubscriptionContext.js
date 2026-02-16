import React, { createContext, useState, useEffect, useContext } from 'react';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const SubscriptionContext = createContext();

const REVENUECAT_KEY = 'goog_OHgHdGSomTUktlzgLXmqgqZIlQs'; // User provided public key

export const SubscriptionProvider = ({ children }) => {
    const [customerInfo, setCustomerInfo] = useState(null);
    const [isPro, setIsPro] = useState(false); // Unlimited Search + Ads
    const [isPremium, setIsPremium] = useState(false); // Unlimited Search + No Ads
    const [isInitialized, setIsInitialized] = useState(false);
    // Mock state for when RevenueCat fails
    const [isMockPro, setIsMockPro] = useState(false);
    const [isMockPremium, setIsMockPremium] = useState(false);

    // Free search limit logic
    const FREE_SEARCH_LIMIT = 5;
    const [freeSearchCount, setFreeSearchCount] = useState(0);
    const [userId, setUserId] = useState(null);

    const [isBillingAvailable, setIsBillingAvailable] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                if (Platform.OS === 'android') {
                    await Purchases.configure({ apiKey: REVENUECAT_KEY });
                }

                // Get initial customer info
                const info = await Purchases.getCustomerInfo();
                console.log("Initial Customer Info:", JSON.stringify(info, null, 2));
                setCustomerInfo(info);
                checkEntitlements(info);

                // Check for existing user login
                let currentUserId = null;
                const userDataStr = await AsyncStorage.getItem('userData');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    currentUserId = userData.id || userData._id;
                    if (currentUserId) {
                        setUserId(currentUserId);
                        await Purchases.logIn(currentUserId);
                        console.log("Auto-logged into RevenueCat with:", currentUserId);
                    }
                }

                // Load local search count with user-specific key
                let storageKey = 'freeSearchCount';
                if (currentUserId) {
                    storageKey = `freeSearchCount_${currentUserId}`;
                }

                const countStr = await AsyncStorage.getItem(storageKey);
                if (countStr) {
                    setFreeSearchCount(parseInt(countStr, 10));
                } else {
                    setFreeSearchCount(0); // Default to 0 if no record found
                }

                // Load Mock Mode state
                const mockPro = await AsyncStorage.getItem('isMockPro');
                const mockPremium = await AsyncStorage.getItem('isMockPremium');
                if (mockPro === 'true') setIsMockPro(true);
                if (mockPremium === 'true') setIsMockPremium(true);

                setIsInitialized(true);
            } catch (error) {
                console.error("RevenueCat Init Error", error);
                if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR ||
                    error.message.includes("Billing is not available")) {
                    setIsBillingAvailable(false);
                }
                setIsInitialized(true); // Proceed anyway to not block app
            }
        };

        init();
    }, []);

    const checkEntitlements = (info) => {
        if (!info || !info.entitlements) {
            console.log("checkEntitlements: No info or entitlements found");
            return;
        }

        const activeEntitlements = info.entitlements.active;
        console.log("✅ ACTIVE ENTITLEMENTS FROM REVENUECAT:", JSON.stringify(activeEntitlements, null, 2));

        // Get all active entitlement keys
        const activeKeys = Object.keys(activeEntitlements);

        // Check if ANY active entitlement contains 'pro' or 'premium' (case insensitive)
        const hasPro = activeKeys.some(key => key.toLowerCase().includes('pro') && !key.toLowerCase().includes('premium'));
        const hasPremium = activeKeys.some(key => key.toLowerCase().includes('premium'));

        console.log(`Key Check Results -> hasPro: ${hasPro}, hasPremium: ${hasPremium}`);

        setIsPro(hasPro);
        setIsPremium(hasPremium);
    };

    const updateCustomerInfo = async (info) => {
        setCustomerInfo(info);
        checkEntitlements(info);
    };

    // Purchase a package selected from the Paywall
    const purchasePackage = async (rcPackage) => {
        // Handle MOCK packages
        if (rcPackage.isMock) {
            try {
                if (rcPackage.identifier.includes('premium')) {
                    setIsMockPremium(true);
                    setIsMockPro(false);
                    await AsyncStorage.setItem('isMockPremium', 'true');
                    await AsyncStorage.setItem('isMockPro', 'false');
                } else {
                    setIsMockPro(true);
                    setIsMockPremium(false);
                    await AsyncStorage.setItem('isMockPro', 'true');
                    await AsyncStorage.setItem('isMockPremium', 'false');
                }
                Alert.alert('Success', 'Mock purchase successful! You now have ' + rcPackage.product.title);
                return true;
            } catch (error) {
                console.error("Error saving mock state", error);
                return false;
            }
        }

        try {
            const { customerInfo } = await Purchases.purchasePackage(rcPackage);
            console.log("Purchase Successful. Customer Info:", customerInfo);
            updateCustomerInfo(customerInfo);
            return true;
        } catch (e) {
            if (!e.userCancelled) {
                Alert.alert('Purchase Error', e.message);
            }
            return false;
        }
    };

    const restorePurchases = async () => {
        try {
            const info = await Purchases.restorePurchases();
            updateCustomerInfo(info);

            if (info.entitlements.active['pro'] || info.entitlements.active['premium']) {
                Alert.alert('Success', 'Purchases restored successfully');
            } else {
                Alert.alert('Info', 'No active subscriptions found to restore');
            }
        } catch (e) {
            Alert.alert('Error', e.message);
        }
    };

    // Link subscription to a specific user ID (from your backend)
    const login = async (newUserId) => {
        try {
            const { customerInfo } = await Purchases.logIn(newUserId);
            console.log("RevenueCat Login Success:", customerInfo);
            updateCustomerInfo(customerInfo);

            // Switch to user-specific search count
            setUserId(newUserId);
            const countStr = await AsyncStorage.getItem(`freeSearchCount_${newUserId}`);
            setFreeSearchCount(countStr ? parseInt(countStr, 10) : 0);
        } catch (e) {
            console.error("RevenueCat Login Error:", e);
        }
    };

    const logout = async () => {
        try {
            const { customerInfo } = await Purchases.logOut();
            console.log("RevenueCat Logout Success:", customerInfo);
            updateCustomerInfo(customerInfo);
            // Reset mock state on logout if desired
            setIsMockPro(false);
            setIsMockPremium(false);
            setUserId(null);
            // Reset search count or revert to anonymous count? 
            // For now, reset to 0 for safety or load generic 'freeSearchCount'
            const countStr = await AsyncStorage.getItem('freeSearchCount');
            setFreeSearchCount(countStr ? parseInt(countStr, 10) : 0);

            await AsyncStorage.multiRemove(['isMockPro', 'isMockPremium']);
        } catch (e) {
            console.error("RevenueCat Logout Error:", e);
        }
    };

    // Returns TRUE if user can search, FALSE if limit reached
    const checkSearchLimit = async () => {
        // If subscribed (Pro or Premium) or Mock Subscribed, always allow
        if (isPro || isPremium || isMockPro || isMockPremium) return true;

        if (freeSearchCount < FREE_SEARCH_LIMIT) {
            return true;
        } else {
            return false;
        }
    };

    const incrementSearchCount = async () => {
        // Only increment if NOT subscribed
        if (!isPro && !isPremium && !isMockPro && !isMockPremium) {
            const newCount = freeSearchCount + 1;
            setFreeSearchCount(newCount);

            const storageKey = userId ? `freeSearchCount_${userId}` : 'freeSearchCount';
            await AsyncStorage.setItem(storageKey, newCount.toString());
        }
    };

    // Helper to check if we should show ads
    // Show ads if: Users is Free OR User is Pro
    // Hide ads if: User is Premium
    const shouldShowAds = !(isPremium || isMockPremium);

    return (
        <SubscriptionContext.Provider value={{
            isPro: isPro || isMockPro,
            isPremium: isPremium || isMockPremium,
            isInitialized,
            isBillingAvailable,
            purchasePackage,
            restorePurchases,
            checkSearchLimit,
            incrementSearchCount,
            shouldShowAds,
            freeSearchCount,
            limit: FREE_SEARCH_LIMIT,
            login,
            logout,
            activeProductIdentifier: customerInfo?.activeSubscriptions?.[0] || (isMockPremium ? 'mock_premium' : (isMockPro ? 'mock_pro' : null)),
            daysRemaining: (() => {
                if (!customerInfo?.latestExpirationDate) return null;
                const expirationDate = new Date(customerInfo.latestExpirationDate);
                const now = new Date();
                const diffTime = expirationDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? diffDays : 0; // Return 0 if expired
            })(),
            expirationDate: customerInfo?.latestExpirationDate
                ? new Date(customerInfo.latestExpirationDate).toLocaleDateString()
                : null
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
