import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    StatusBar,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';
import Purchases from 'react-native-purchases';
import ScreenWrapper from '../components/ScreenWrapper';

const SubscriptionScreen = ({ navigation }) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;
    const { isPro, isPremium, purchasePackage, restorePurchases, isBillingAvailable, isInitialized, activeProductIdentifier, daysRemaining, expirationDate } = useSubscription();

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isMockMode, setIsMockMode] = useState(false);

    useEffect(() => {
        const getPackages = async () => {
            if (!isInitialized) return;

            setErrorMsg(null);

            // If context already knows billing is unavailable, skip fetching
            if (!isBillingAvailable) {
                setLoading(false);
                setErrorMsg("Billing is currently unavailable on this device. Enable Mock Mode for testing.");
                return;
            }

            try {
                const offerings = await Purchases.getOfferings();

                // Check for the specific offering ID provided by user
                const specificOffering = offerings.all['ofrng5780fa8954'];

                if (specificOffering && specificOffering.availablePackages.length !== 0) {
                    console.log("Found specific offering: ofrng5780fa8954");
                    setPackages(specificOffering.availablePackages);
                } else if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                    console.log("Using default current offering");
                    setPackages(offerings.current.availablePackages);
                }
            } catch (e) {
                console.error("Error fetching offerings", e);
                if (e.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR ||
                    e.message.includes("Billing is not available")) {
                    setErrorMsg("Billing is currently unavailable on this device. Enable Mock Mode for testing.");
                } else {
                    setErrorMsg("Unable to load plans. Please check your connection.");
                }
            } finally {
                setLoading(false);
            }
        };

        getPackages();
    }, [isBillingAvailable, isInitialized]);

    const handleEnableMockMode = () => {
        setIsMockMode(true);
        // Create mock packages
        const mockPackages = [
            {
                identifier: 'mock_pro_monthly',
                isMock: true,
                product: {
                    title: 'Pro Monthly (Mock)',
                    priceString: '$4.99',
                    description: 'Unlimited searches with ads (Mock)',
                    price: 4.99,
                }
            },
            {
                identifier: 'mock_premium_yearly',
                isMock: true,
                product: {
                    title: 'Premium Yearly (Mock)',
                    priceString: '$49.99',
                    description: 'Unlimited searches, NO ads (Mock)',
                    price: 49.99,
                }
            }
        ];
        setPackages(mockPackages);
        setErrorMsg(null);
    };

    const handlePurchase = async (pkg) => {
        setLoading(true);
        try {
            const success = await purchasePackage(pkg);
            if (success) {
                navigation.goBack();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        await restorePurchases();
        setLoading(false);
    };

    const PlanItem = ({ pkg, isCurrent }) => {
        const { product } = pkg;
        const isPremiumPlan = product.title.toLowerCase().includes('premium');

        return (
            <TouchableOpacity
                style={[
                    styles.planItem,
                    {
                        backgroundColor: colors.card,
                        borderColor: isCurrent ? colors.primary : 'transparent',
                        borderWidth: isCurrent ? 2 : 0,
                        opacity: 1
                    }
                ]}
                onPress={() => {
                    // Only allow purchase if NO plan is active
                    if (!activeProductIdentifier && !isCurrent) {
                        handlePurchase(pkg);
                    }
                }}
                activeOpacity={0.9}
                disabled={isCurrent || !!activeProductIdentifier} // Disable touch if current OR if any subscription active
            >
                <View style={styles.planHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: isPremiumPlan ? '#FFD700' + '20' : colors.primary + '15' }]}>
                        <Icon
                            name={isPremiumPlan ? "crown" : "star"}
                            size={24}
                            color={isPremiumPlan ? '#FFD700' : colors.primary}
                        />
                    </View>
                    <View style={styles.planInfo}>
                        <Text style={[styles.planTitle, { color: colors.text }]}>{product.title}</Text>
                        <Text style={[styles.planPrice, { color: colors.primary }]}>{product.priceString}</Text>
                    </View>
                </View>

                <Text style={[styles.planDesc, { color: colors.textSecondary }]}>{product.description}</Text>

                {isCurrent ? (
                    <View style={[styles.currentBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.currentText, { color: colors.success }]}>
                            {daysRemaining !== null
                                ? daysRemaining > 0
                                    ? `Current Plan (Exp: ${expirationDate || ''})`
                                    : 'Plan Expired'
                                : 'Current Plan (Lifetime)'}
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.subscribeButton,
                            {
                                backgroundColor: activeProductIdentifier ? colors.textSecondary : colors.primary, // Grey if active sub exists
                                opacity: activeProductIdentifier ? 0.3 : 1
                            }
                        ]}
                        onPress={() => handlePurchase(pkg)}
                        disabled={!!activeProductIdentifier} // Disable if any subscription exists
                    >
                        <Text style={styles.subscribeText}>
                            {activeProductIdentifier ? 'Unavailable' : `Subscribe ${pkg.isMock ? '(Mock)' : ''}`}
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper isScrollable={false} showAd={true}>
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscription</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <View style={styles.statusCard}>
                    <Text style={[styles.statusTitle, { color: colors.text }]}>Current Status</Text>
                    <View style={styles.statusRow}>
                        <Icon
                            name={isPremium ? "crown" : isPro ? "star" : "account"}
                            size={32}
                            color={isPremium ? "#FFD700" : isPro ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[styles.statusText, { color: isPremium ? "#FFD700" : isPro ? colors.primary : colors.textSecondary }]}>
                            {isPremium ? "Premium User" : isPro ? "Pro User" : "Free User"}
                        </Text>
                    </View>
                    {!isPro && !isPremium && (
                        <Text style={[styles.limitText, { color: colors.textSecondary }]}>
                            You have limited searches. Upgrade for unlimited access!
                        </Text>
                    )}
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>AVAILABLE PLANS</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                ) : (
                    packages.length > 0 ? (
                        packages
                            .sort((a, b) => {
                                // Helper to check if a package is active
                                const isACurrent = activeProductIdentifier && activeProductIdentifier.includes(a.product.identifier);
                                const isBCurrent = activeProductIdentifier && activeProductIdentifier.includes(b.product.identifier);
                                // Active plan comes first (return -1)
                                if (isACurrent && !isBCurrent) return -1;
                                if (!isACurrent && isBCurrent) return 1;
                                return 0; // Keep original order otherwise
                            })
                            .map((pkg) => {
                                // Check if the active product identifier contains the package's product identifier
                                const isCurrent = activeProductIdentifier && activeProductIdentifier.includes(pkg.product.identifier);

                                return (
                                    <PlanItem
                                        key={pkg.identifier}
                                        pkg={pkg}
                                        isCurrent={isCurrent}
                                    />
                                );
                            })
                    ) : (
                        <View style={{ alignItems: 'center', marginTop: 20, paddingHorizontal: 20 }}>
                            <Icon name="alert-circle-outline" size={40} color={colors.textSecondary} style={{ marginBottom: 10 }} />
                            <Text style={[styles.noPlansText, { color: colors.textSecondary }]}>
                                {errorMsg || "No plans available. Please check your internet connection or try again later."}
                            </Text>

                            {(errorMsg && (errorMsg.includes("Billing is currently unavailable") || !isBillingAvailable) && !isMockMode) && (
                                <TouchableOpacity
                                    style={[styles.subscribeButton, { backgroundColor: colors.secondary, marginTop: 20, paddingHorizontal: 20, borderRadius: 8 }]}
                                    onPress={handleEnableMockMode}
                                >
                                    <Text style={styles.subscribeText}>Enable Mock Mode (Dev Only)</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                )}

                <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 24 }]}>FEATURES</Text>

                <View style={[styles.featureCard, { backgroundColor: colors.card }]}>
                    <View style={styles.featureItem}>
                        <Icon name="check-circle" size={20} color={colors.success} />
                        <Text style={[styles.featureText, { color: colors.text }]}>Unlimited Searches</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.featureItem}>
                        <Icon name="check-circle" size={20} color={colors.success} />
                        <Text style={[styles.featureText, { color: colors.text }]}>Ad-Free Experience (Premium)</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.featureItem}>
                        <Icon name="check-circle" size={20} color={colors.success} />
                        <Text style={[styles.featureText, { color: colors.text }]}>Priority Support</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.restoreButton, { borderColor: colors.primary }]}
                    onPress={handleRestore}
                >
                    <Text style={[styles.restoreText, { color: colors.primary }]}>Restore Purchases</Text>
                </TouchableOpacity>

                <View style={styles.footerLinks}>
                    <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                        <Text style={[styles.linkText, { color: colors.textSecondary }]}>Terms of Service</Text>
                    </TouchableOpacity>
                    <Text style={[styles.linkText, { color: colors.textSecondary }]}> • </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                        <Text style={[styles.linkText, { color: colors.textSecondary }]}>Privacy Policy</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Barlow',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    statusCard: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 20,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        fontFamily: 'Barlow',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
        fontFamily: 'Barlow',
    },
    limitText: {
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'Barlow',
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
        fontFamily: 'Barlow',
    },
    planItem: {
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        borderRadius: 16,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderRadius: 12,
    },
    planInfo: {
        flex: 1,
    },
    planTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    planPrice: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
        fontFamily: 'Barlow',
    },
    planDesc: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
        fontFamily: 'Barlow',
    },
    subscribeButton: {
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 16,
    },
    subscribeText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'Barlow',
    },
    currentBadge: {
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    currentText: {
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Barlow',
    },
    noPlansText: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
        fontFamily: 'Barlow',
    },
    featureCard: {
        padding: 16,
        marginBottom: 24,
        borderRadius: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    featureText: {
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'Barlow',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    restoreButton: {
        padding: 16,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 24,
        borderRadius: 16,
    },
    restoreText: {
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Barlow',
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    linkText: {
        fontSize: 12,
        fontFamily: 'Barlow',
    },
});

export default SubscriptionScreen;
