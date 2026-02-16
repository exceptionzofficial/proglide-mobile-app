import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenWrapper from '../components/ScreenWrapper';

const PaywallScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const { purchasePackage, restorePurchases } = useSubscription();

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        const getOfferings = async () => {
            try {
                const offerings = await Purchases.getOfferings();
                if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                } else {
                    throw new Error("No packages found");
                }
            } catch (e) {
                console.log("Using Mock Packages due to RC Error:", e.message);
                // Fallback Mock Packages ONLY in DEV
                if (__DEV__) {
                    setPackages([
                        {
                            identifier: 'monthly_pro',
                            isMock: true,
                            product: { identifier: 'monthly_pro', priceString: '₹20', title: 'Monthly Pro', description: 'Unlimited Searches (With Ads)' }
                        },
                        {
                            identifier: 'monthly_premium',
                            isMock: true,
                            product: { identifier: 'monthly_premium', priceString: '₹40', title: 'Monthly Premium', description: 'Unlimited Searches (No Ads)' }
                        },
                        {
                            identifier: 'yearly_pro',
                            isMock: true,
                            product: { identifier: 'yearly_pro', priceString: '₹200', title: 'Yearly Pro', description: 'Unlimited Searches (With Ads)' }
                        },
                        {
                            identifier: 'yearly_premium',
                            isMock: true,
                            product: { identifier: 'yearly_premium', priceString: '₹400', title: 'Yearly Premium', description: 'Unlimited Searches (No Ads)' }
                        }
                    ]);
                } else {
                    // In production, just show empty or let error persist manually
                    setPackages([]);
                }
            } finally {
                setLoading(false);
            }
        };
        getOfferings();
    }, []);

    const onPurchase = async () => {
        if (!selectedPackage) return;
        setLoading(true);
        const success = await purchasePackage(selectedPackage);
        setLoading(false);
        if (success) {
            navigation.goBack();
        }
    };

    const renderPackage = (pkg) => {
        const isSelected = selectedPackage?.identifier === pkg.identifier;

        // Determine Plan Type and Interval for display (Parsing title or relying on RC data)
        const price = pkg.product.priceString;
        const title = pkg.product.title; // e.g., "Monthly Pro"

        return (
            <TouchableOpacity
                key={pkg.identifier}
                style={[
                    styles.packageCard,
                    {
                        borderColor: isSelected ? colors.primary : 'transparent',
                        backgroundColor: isSelected ? colors.card : colors.background, // Or a slightly different shade if inactive
                        borderWidth: isSelected ? 2 : 0,
                        elevation: isSelected ? 4 : 1, // Add elevation
                    }
                ]}
                onPress={() => setSelectedPackage(pkg)}
            >
                <View style={styles.cardInner}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.pkgTitle, { color: colors.text }]}>{title}</Text>
                        <Text style={[styles.pkgDesc, { color: colors.textSecondary }]}>{pkg.product.description}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.pkgPrice, { color: colors.primary }]}>{price}</Text>
                        {isSelected && <Icon name="check-circle" size={24} color={colors.primary} style={styles.checkIconStatic} />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <ScreenWrapper isScrollable={false} showAd={false}>
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            isScrollable={true}
            showAd={false} // Don't show ads on paywall usually
            statusBarColor={colors.primary}
            contentContainerStyle={{ paddingBottom: 80 }} // Fix for close button being covered
        >
            {/* Custom Header */}
            <View style={[styles.headerBar, { backgroundColor: colors.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Premium Access</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.container}>
                <View style={styles.contentHeader}>
                    <Text style={[styles.title, { color: colors.text }]}>Unlock Unlimited Searches</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        You have reached your free search limit. Upgrade to continue finding parts.
                    </Text>
                </View>

                <View style={styles.plansContainer}>
                    {packages.length > 0 ? (
                        packages.map(renderPackage)
                    ) : (
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>
                            No plans available. Please check configuration or internet connection.
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.purchaseButton, { backgroundColor: selectedPackage ? colors.primary : '#ccc' }]}
                    disabled={!selectedPackage}
                    onPress={onPurchase}
                >
                    <Text style={styles.buttonText}>Subscribe Now</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.restoreButton} onPress={restorePurchases}>
                    <Text style={[styles.restoreText, { color: colors.textSecondary }]}>Restore Purchases</Text>
                </TouchableOpacity>

                {/* Bottom Close Button (Optional if we have header close, but keeping as requested/existing flow) */}
                {/* The user complained it goes under navigator. We added paddingBottom to ScreenWrapper, so this should be fine now. */}
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Text style={[styles.restoreText, { color: colors.textSecondary }]}>No Thanks, Close</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    headerBar: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        paddingBottom: 15,
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
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    container: {
        padding: 20,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentHeader: {
        marginTop: 10,
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'Barlow',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        fontFamily: 'Barlow',
    },
    plansContainer: {
        marginBottom: 30,
    },
    packageCard: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    cardInner: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    pkgTitle: {
        fontSize: 16, // Slightly smaller to prevent wrap issues
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'Barlow',
    },
    pkgDesc: {
        fontSize: 12,
        fontFamily: 'Barlow',
    },
    priceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: 80,
    },
    pkgPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        fontFamily: 'Barlow',
    },
    checkIconStatic: {
        marginTop: 4,
    },
    purchaseButton: {
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    restoreButton: {
        alignItems: 'center',
        padding: 10,
    },
    closeButton: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20, // Extra margin inside logic
    },
    restoreText: {
        fontSize: 14,
        textDecorationLine: 'underline',
        fontFamily: 'Barlow',
    },
});

export default PaywallScreen;
