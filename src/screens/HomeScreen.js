import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    StatusBar,
    SafeAreaView,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    Linking,
    RefreshControl,
    BackHandler,
    Alert,
    Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { getProducts } from '../services/api';
import { useSubscription } from '../context/SubscriptionContext';
import ScreenWrapper from '../components/ScreenWrapper';
import { showInterstitial } from '../services/InterstitialAdManager';

const { width } = Dimensions.get('window');

// Updated Category Data with specific descriptions
const CATEGORIES_DATA = [
    {
        id: 'Screen Guard',
        label: 'Screen Guard',
        icon: 'cellphone-screenshot',
        description: 'Stop guessing if a glass fits. We list the exact drawing model and precise corner radius (mm) so you get the perfect edge-to-edge fit every time.'
    },
    {
        id: 'Phone Case',
        label: 'Phone Case',
        icon: 'cellphone-check',
        description: 'Easily identify which cases fit multiple phones. We group inventory by Base Model so you know exactly which covers are interchangeable.'
    },
    {
        id: 'Combo/Display', // ID matches API category
        label: 'Combo Folder',
        icon: 'cellphone-link',
        description: 'Avoid returns due to wrong versions. Search by specific Brand Name & Model Number to ensure the display connector matches perfectly.'
    },
    {
        id: 'CC Board',
        label: 'CC Board',
        icon: 'chip',
        description: 'Charging issues solved. We verify Model Numbers to ensure microphone and fast-charging compatibility on every sub-board.'
    },
    {
        id: 'Battery',
        label: 'Battery',
        icon: 'battery-charging',
        description: 'Don\'t just guess the size. Match the Model Code (e.g., BN-50) to the device to guarantee proper fitting and battery health.'
    },
    {
        id: 'Center Panel',
        label: 'Center Panel',
        icon: 'tablet-cellphone',
        description: 'Structural body replacements that align with the Base Model chassis for a seamless, factory-finish repair.'
    }
];

// Tabs list including 'All'
const TABS = [
    ...CATEGORIES_DATA.map(c => ({ id: c.id, label: c.label }))
];

const HomeScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const { checkSearchLimit, incrementSearchCount, shouldShowAds, isPro, isPremium } = useSubscription();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeTab, setActiveTab] = useState(CATEGORIES_DATA[0].id);

    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    }, []);

    const [userName, setUserName] = useState('User');

    useEffect(() => {
        loadUser();
        fetchProducts();
    }, []);

    const loadUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const parsed = JSON.parse(userData);
                setUserName(parsed.name || 'User');
            }
        } catch (e) {
            console.log("Error loading user", e);
        }
    };

    // Handle Back Press / Exit Logic with Ads
    const handleBack = useCallback(() => {
        // If viewing a specific device, close it (Trigger Ad)
        if (selectedDevice) {
            const closeDevice = () => {
                setSelectedDevice(null);
                setSearchQuery(''); // Optional: Keep query or clear? Clearing feels like "closing"
            };

            if (shouldShowAds) {
                showInterstitial(closeDevice);
            } else {
                closeDevice();
            }
            return true; // Prevent default back
        }

        // If in a specific category tab, go back to 'All' (Trigger Ad?)
        // Let's be less aggressive here; just go back without ad for tab switch, or mild ad.
        // For now, let's put ad here too as it shifts content significantly.
        if (activeTab !== CATEGORIES_DATA[0].id) {
            const closeTab = () => setActiveTab(CATEGORIES_DATA[0].id);

            // Optional: Uncomment to show ad on Tab Exit too.
            // if (shouldShowAds) showInterstitial(closeTab);
            // else closeTab();

            closeTab(); // Keeping it ad-free for now to be less annoying, or enable if requested.
            return true;
        }

        // If search query exists but no device selected (e.g. user typed but didn't select, or just wants to clear)
        if (searchQuery.length > 0) {
            setSearchQuery('');
            return true;
        }

        return false; // Default behavior (Exit App)
    }, [selectedDevice, activeTab, shouldShowAds, searchQuery]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBack
        );
        return () => backHandler.remove();
    }, [handleBack]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim().length > 0) {
            // Extract ALL compatible devices that match the search query
            const allDevices = products.flatMap(p =>
                p.compatibleDevices ? p.compatibleDevices.split(',').map(d => d.trim()) : []
            );

            const uniqueMatchingDevices = [...new Set(allDevices
                .filter(d => d.toLowerCase().includes(text.toLowerCase()))
            )];

            // Sort: Exact match > Starts with > Contains
            const sortedDevices = uniqueMatchingDevices.sort((a, b) => {
                const query = text.toLowerCase().trim();
                const aLower = a.toLowerCase();
                const bLower = b.toLowerCase();

                // Exact match priority (normalized)
                const aExact = aLower === query || aLower.replace(/\s+/g, '') === query.replace(/\s+/g, '');
                const bExact = bLower === query || bLower.replace(/\s+/g, '') === query.replace(/\s+/g, '');

                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                // Starts with priority
                const aStarts = aLower.startsWith(query);
                const bStarts = bLower.startsWith(query);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                return 0; // Keep original order otherwise
            });

            setSuggestions(sortedDevices.slice(0, 10));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            if (text.trim().length === 0) {
                setSelectedDevice(null); // Clear selection if search is cleared
            }
        }
    };

    const handleSelectDevice = async (device) => {
        const allowed = await checkSearchLimit();
        if (!allowed) {
            navigation.navigate('Paywall');
            return;
        }

        // Show content immediately (Ad on Exit)
        await incrementSearchCount();
        setSearchQuery(device);
        setSelectedDevice(device);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    const sendFeedback = () => {
        Linking.openURL('mailto:proglideapp@gmail.com?subject=App Feedback');
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedDevice(null);
        Keyboard.dismiss();
    };

    const renderHeader = () => (
        <View style={styles.mainHeaderWrapper}>
            <View style={[styles.curvedHeader, { backgroundColor: colors.primary }]}>
                {/* Top Section: Greeting & Notification */}
                <View style={styles.headerTopRow}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome Back,</Text>
                        <View style={styles.nameAndBadgeRow}>
                            <Text style={styles.userNameText}>{userName}</Text>
                            {(isPro || isPremium) && (
                                <View style={[styles.planBadge, { backgroundColor: isPremium ? '#FFD700' : '#FFF' }]}>
                                    <Icon
                                        name={isPremium ? "crown" : "star"}
                                        size={12}
                                        color={isPremium ? '#000' : colors.primary}
                                    />
                                    <Text style={[styles.planBadgeText, { color: isPremium ? '#000' : colors.primary }]}>
                                        {isPremium ? "PREMIUM" : "PRO"}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Icon name="bell-outline" size={24} color="#FFF" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: '#FFFFFF' }]}>
                    <Icon name="magnify" size={24} color={colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search devices..."
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {(searchQuery.length > 0 || showSuggestions) && (
                        <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Icon name="close" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsWrapper}>
                <FlatList
                    data={TABS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.tabsContainer}
                    renderItem={({ item }) => {
                        const isActive = activeTab === item.id;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    {
                                        backgroundColor: isActive ? colors.primary : colors.card,
                                        borderColor: isActive ? colors.primary : colors.border,
                                        borderWidth: isActive ? 0 : 1
                                    }
                                ]}
                                onPress={() => setActiveTab(item.id)}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: isActive ? '#FFFFFF' : colors.text }
                                ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );

    const renderSuggestions = () => {
        if (!showSuggestions || suggestions.length === 0) return null;

        return (
            <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
                <FlatList
                    data={suggestions}
                    keyExtractor={(item, index) => index.toString()}
                    keyboardShouldPersistTaps="always"
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                            onPress={() => handleSelectDevice(item)}
                        >
                            <Icon name="magnify" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                            <Text style={{ color: colors.text, fontSize: 16, fontFamily: 'Barlow' }}>{item}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    };

    const renderCategoryBox = (item) => (
        <View
            key={item.id}
            style={[styles.categoryBox, { backgroundColor: colors.card }]}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.cardTag, { backgroundColor: colors.primary + '15' }]}>
                    <Icon name={item.icon} size={14} color={colors.primary} />
                    <Text style={[styles.cardTagText, { color: colors.primary }]}> {item.label}</Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.viewDetailsButton, { backgroundColor: '#F3F4F6' }]}
                onPress={() => setActiveTab(item.id)}
            >
                <Text style={[styles.viewDetailsText, { color: colors.primary }]}>View Details</Text>
            </TouchableOpacity>
        </View>
    );

    const renderContent = () => {
        // Helper to sort devices within a category
        const sortDevices = (devices) => {
            const query = searchQuery.toLowerCase().trim();
            return devices.sort((aObj, bObj) => {
                const a = aObj.name;
                const b = bObj.name;
                const aLower = a.toLowerCase();
                const bLower = b.toLowerCase();

                // Exact match
                const aExact = aLower === query || aLower.replace(/\s+/g, '') === query.replace(/\s+/g, '');
                const bExact = bLower === query || bLower.replace(/\s+/g, '') === query.replace(/\s+/g, '');

                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;

                // Starts with
                const aStarts = aLower.startsWith(query);
                const bStarts = bLower.startsWith(query);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                return 0;
            });
        };

        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'Barlow' }}>Loading...</Text>
                </View>
            );
        }



        // 2. Specific Category Tab Logic
        if (!selectedDevice) {
            // Check if searching
            const isSearching = searchQuery.trim().length > 0;

            if (isSearching) {
                // Find matching devices in this category
                const queryRaw = searchQuery.toLowerCase().trim();
                const queryNormalized = queryRaw.replace(/\s+/g, '');

                const normalize = (str) => str ? str.replace(/\s+/g, '').toLowerCase() : '';

                const categoryMatches = new Map();

                products.filter(p => p.category === activeTab).forEach(p => {
                    if (p.compatibleDevices) {
                        const devices = p.compatibleDevices.split(',').map(d => d.trim());
                        const matching = devices.filter(d => normalize(d).includes(queryNormalized));

                        matching.forEach(d => {
                            // Model Number logic for list
                            const modelNo = p.modelNumber || p.modelNo || p.ModelNumber || p.specs?.modelNumber || p.specs?.modelNo;
                            let label = d;
                            if (p.category === 'Battery' && modelNo) {
                                label = `${d} (${modelNo})`;
                            }
                            categoryMatches.set(d, { name: d, label: label });
                        });
                    }
                });

                const sortedMatches = sortDevices([...categoryMatches.values()]);

                if (sortedMatches.length > 0) {
                    return (
                        <ScrollView contentContainerStyle={{ padding: 16 }}>
                            <View style={[styles.section, { backgroundColor: colors.card }]}>
                                <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow' }]}>
                                    Results for "{searchQuery}" in {activeTab}
                                </Text>
                                <View style={styles.tagContainer}>
                                    {sortedMatches.map(deviceObj => (
                                        <TouchableOpacity
                                            key={deviceObj.name}
                                            style={[styles.tag, { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6' }]}
                                            onPress={() => handleSelectDevice(deviceObj.name)}
                                        >
                                            <Text style={[styles.tagText, { color: colors.text, fontFamily: 'Barlow' }]}>
                                                {deviceObj.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    );
                }
            }

            return (
                <View style={styles.emptyState}>
                    <Icon name="magnify" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: 'Barlow' }]}>
                        {isSearching ? `No results found for "${searchQuery}"` : 'Search for a device to see details'}
                    </Text>
                </View>
            );
        }

        // Device IS selected -> Show Contextual Details
        // Find matching product(s)
        // Helper to normalize strings (remove spaces, lowercase)
        const normalize = (str) => str ? str.replace(/\s+/g, '').toLowerCase() : '';

        const matchingProduct = products.find(p =>
            p.category === activeTab &&
            p.compatibleDevices?.split(',').some(d => normalize(d) === normalize(selectedDevice))
        );

        // Even if no exact match found in this category, we pass a dummy to search for similar/perfect matches
        // logic is handled inside EmbeddedProductDetails
        const productToPass = matchingProduct || {
            category: activeTab,
            compatibleDevices: selectedDevice,
            specs: {},
            _id: 'dummy'
        };

        return (
            <EmbeddedProductDetails
                product={productToPass}
                targetDevice={selectedDevice}
                theme={theme}
                onDeviceSelect={handleSelectDevice}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
        );
    };

    return (
        <ScreenWrapper isScrollable={false} showAd={true}>
            {renderHeader()}

            {renderSuggestions()}

            <View style={styles.contentContainer}>
                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};

// Component to render details inside the tab
const EmbeddedProductDetails = ({ product, targetDevice, theme, onDeviceSelect, refreshing, onRefresh }) => {
    const { colors } = theme;
    const [matches, setMatches] = useState({ original: [], fullTemper: [], perfect: [] });
    const [calculating, setCalculating] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setCalculating(true);

        getProducts().then(data => {
            if (isMounted) {
                calculateMatches(data);
                setCalculating(false);
            }
        });

        return () => { isMounted = false; };
    }, [product, targetDevice]);
    // Helper to normalize strings (remove spaces, lowercase)
    const normalize = (str) => str ? str.replace(/\s+/g, '').toLowerCase() : '';

    const calculateMatches = (allProducts) => {
        const { category, specs } = product;
        const targetHeight = parseFloat(specs?.height || 0);
        const targetWidth = parseFloat(specs?.width || 0);
        const targetRadius = parseFloat(specs?.radiusTopLeft || specs?.radius || 0);
        const normalizedTarget = normalize(targetDevice);

        const newMatches = { original: [], fullTemper: [], perfect: [] };
        const categoryProducts = allProducts.filter(p => p.category === category);

        if (category === 'Screen Guard') {
            // ORIGINAL DRAWING: Find products where the searched device is in compatibleDevices
            // Then show ALL compatible devices from those products
            const originalDrawingProducts = categoryProducts.filter(p =>
                p.compatibleDevices?.split(',').some(d => normalize(d) === normalizedTarget)
            );

            // Collect all compatible devices from products containing the searched device
            originalDrawingProducts.forEach(p => {
                if (p.compatibleDevices) {
                    const devices = p.compatibleDevices.split(',').map(d => d.trim()).filter(d => d);
                    newMatches.original.push(...devices);
                }
            });
            // Deduplicate
            newMatches.original = [...new Set(newMatches.original)];

            // For Full Temper, use the first matching product's dimensions
            const targetProd = originalDrawingProducts[0];

            // FULL TEMPER: Find OTHER products with matching dimensions and show their compatible devices
            // Only run if we found a target product with valid dimensions
            if (targetProd) {
                // Handle null/undefined radius by converting to 0
                const targetH = parseFloat(targetProd.specs?.height) || 0;
                const targetW = parseFloat(targetProd.specs?.width) || 0;
                const targetR = parseFloat(targetProd.specs?.radiusTopLeft) || parseFloat(targetProd.specs?.radius) || 0;



                // Only process Full Temper if we have valid target dimensions (height and width required)
                if (targetH > 0 && targetW > 0) {
                    categoryProducts.forEach(p => {
                        // Skip the same product
                        if (p._id === targetProd._id) return;

                        // Handle null/undefined radius by converting to 0
                        const pHeight = parseFloat(p.specs?.height) || 0;
                        const pWidth = parseFloat(p.specs?.width) || 0;
                        const pRadius = parseFloat(p.specs?.radiusTopLeft) || parseFloat(p.specs?.radius) || 0;

                        // Skip products with no valid dimensions
                        if (pHeight <= 0 || pWidth <= 0) return;

                        // Full Temper Logic: Height, Width, AND Radius must match exactly (within 0.1mm tolerance)
                        const heightMatch = Math.abs(pHeight - targetH) < 0.1;
                        const widthMatch = Math.abs(pWidth - targetW) < 0.1;
                        const radiusMatch = Math.abs(pRadius - targetR) < 0.1;

                        if (heightMatch && widthMatch && radiusMatch) {

                            // Add all compatible devices from this matching product
                            if (p.compatibleDevices) {
                                const devices = p.compatibleDevices.split(',').map(d => d.trim()).filter(d => d);
                                newMatches.fullTemper.push({
                                    masterModel: p.specs?.originalDrawingModel || 'Unknown Model',
                                    devices: devices
                                });
                            }
                        }
                    });

                    // Deduplicate Full Temper Groups?
                    // We might have multiple products with same master model.
                    // Ideally we should merge them.
                    const mergedGroups = [];
                    newMatches.fullTemper.forEach(group => {
                        const existing = mergedGroups.find(g => g.masterModel === group.masterModel);
                        if (existing) {
                            existing.devices = [...new Set([...existing.devices, ...group.devices])];
                        } else {
                            mergedGroups.push(group);
                        }
                    });
                    newMatches.fullTemper = mergedGroups;
                }
            }

        } else {
            // OTHER CATEGORIES (Phone Case, CC Board, Battery, Center Panel, Combo Folder)
            // Find products that contain the searched device and show ALL their compatible devices
            const matchingProducts = categoryProducts.filter(p =>
                p.compatibleDevices?.split(',').some(d => normalize(d) === normalizedTarget)
            );

            // Get all compatible devices from matching products
            const allDevices = matchingProducts.flatMap(p =>
                p.compatibleDevices ? p.compatibleDevices.split(',').map(d => d.trim()).filter(d => d) : []
            );

            // Deduplicate
            newMatches.perfect = [...new Set(allDevices)];
        }
        setMatches(newMatches);
    };

    const renderTag = (label, colorBg, colorText) => {
        // Highlight if the tag matches the targetDevice (which is the search query)
        const isSelected = label.toLowerCase() === targetDevice.toLowerCase();

        const finalBg = isSelected ? colors.primary : colorBg;
        const finalText = isSelected ? '#FFFFFF' : colorText;

        return (
            <TouchableOpacity
                key={label + Math.random()}
                style={[styles.tag, { backgroundColor: finalBg, borderColor: finalBg }]}
                onPress={() => onDeviceSelect(label)}
            >
                <Text style={[styles.tagText, { color: finalText, fontFamily: 'Barlow-Bold' }]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    if (calculating) {
        return (
            <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'Barlow' }}>Finding matches...</Text>
            </View>
        );
    }

    const hasAnyMatches = matches.original.length > 0 || matches.fullTemper.length > 0 || matches.perfect.length > 0;

    if (!hasAnyMatches) {
        return (
            <View style={styles.emptyState}>
                <Icon name="alert-circle-outline" size={48} color={colors.textSecondary} />
                <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'Barlow' }}>No matching products found for {targetDevice}</Text>
            </View>
        );
    }

    const modelNo = product.modelNumber || product.modelNo || product.ModelNumber || product.specs?.modelNumber || product.specs?.modelNo;

    return (
        <ScrollView
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
            }
        >
            <View style={[styles.titleCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.categoryTag, { color: colors.primary, fontFamily: 'Barlow' }]}>{product.category}</Text>
                <Text style={[styles.productTitle, { color: colors.text, fontFamily: 'Barlow' }]}>{targetDevice}</Text>
            </View>

            {product.category === 'Screen Guard' ? (
                <View>
                    {matches.original.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>
                                Original Drawing {product.specs?.originalDrawingModel && `(${product.specs.originalDrawingModel})`}
                            </Text>
                            <View style={styles.tagContainer}>
                                {matches.original.map(d => renderTag(d, '#F3F4F6', '#000000'))}
                            </View>
                        </View>
                    )}

                    {matches.fullTemper.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>
                                Full Temper
                            </Text>
                            {matches.fullTemper.map((group, index) => (
                                <View key={index} style={{ marginBottom: 16 }}>
                                    <Text style={[styles.cardSubtitle, { color: '#000000', fontFamily: 'Barlow-Bold', fontWeight: 'bold', marginBottom: 8 }]}>
                                        Original Drawing: {group.masterModel}
                                    </Text>
                                    <View style={styles.tagContainer}>
                                        {group.devices.map(d => renderTag(d, '#F3F4F6', '#000000'))}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ) : product.category === 'Battery' ? (
                <View>
                    {/* Battery Model Display */}
                    {modelNo && (
                        <View style={[styles.section, { backgroundColor: colors.card, marginBottom: 16 }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>Battery Model No</Text>
                            <View style={[styles.tagContainer, { justifyContent: 'flex-start' }]}>
                                <View style={[styles.tag, { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6', paddingHorizontal: 20 }]}>
                                    <Text style={[styles.tagText, { color: '#000000', fontSize: 18, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>
                                        {modelNo}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow' }]}>Compatible Devices</Text>
                        <View style={styles.tagContainer}>
                            {matches.perfect.length > 0 ?
                                matches.perfect.map(d => renderTag(d, '#F3F4F6', colors.text)) :
                                <Text style={{ color: colors.textSecondary, fontFamily: 'Barlow' }}>No exact match found for {targetDevice}</Text>
                            }
                        </View>
                    </View>
                </View>
            ) : product.category === 'Combo/Display' ? (
                <View>
                    {/* Combo/Display Model Logic */}
                    <View style={[styles.section, { backgroundColor: colors.card, marginBottom: 16 }]}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>Model No</Text>
                        <View style={[styles.tagContainer, { justifyContent: 'flex-start' }]}>
                            <View style={[styles.tag, { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6', paddingHorizontal: 20 }]}>
                                <Text style={[styles.tagText, { color: '#000000', fontSize: 18, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>
                                    {modelNo || 'Unknown Model'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>Compatible Devices</Text>
                        <View style={styles.tagContainer}>
                            {matches.perfect.length > 0 ?
                                matches.perfect.map(d => renderTag(d, '#F3F4F6', '#000000')) :
                                <Text style={{ color: colors.textSecondary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }}>No exact match found for {targetDevice} in {product.category}</Text>
                            }
                        </View>
                    </View>
                </View>
            ) : (
                <View>
                    {/* Base Model Display for Phone Case, CC Board, Center Panel */}
                    {(product.category === 'Phone Case' || product.category === 'CC Board' || product.category === 'Center Panel') && product.specs?.baseModel && (
                        <View style={[styles.section, { backgroundColor: colors.card, marginBottom: 16 }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>Base Model</Text>
                            <View style={[styles.tagContainer, { justifyContent: 'flex-start' }]}>
                                <View style={[styles.tag, { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6', paddingHorizontal: 20 }]}>
                                    <Text style={[styles.tagText, { color: '#000000', fontSize: 18, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>
                                        {product.specs.baseModel}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }]}>Compatible Devices</Text>
                        <View style={styles.tagContainer}>
                            {matches.perfect.length > 0 ?
                                matches.perfect.map(d => renderTag(d, '#F3F4F6', '#000000')) :
                                <Text style={{ color: colors.textSecondary, fontFamily: 'Barlow-Bold', fontWeight: 'bold' }}>No exact match found for {targetDevice} in {product.category}</Text>
                            }
                        </View>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainHeaderWrapper: {
        marginBottom: 10,
    },
    curvedHeader: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 4,
        fontFamily: 'Barlow',
    },
    userNameText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    nameAndBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 8,
    },
    planBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
        fontFamily: 'Barlow',
    },
    notificationButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ADE80', // Green dot
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 25,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: 'Barlow', // Updated font
    },
    tabsWrapper: {
        marginTop: 16,
    },
    tabsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 10,
        borderRadius: 25,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
        fontFamily: 'Barlow',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    cardTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    cardContent: {
        marginBottom: 16,
        minHeight: 60,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'Barlow',
    },
    cardSubtitle: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'Barlow',
    },
    cardFooter: {
        marginTop: 'auto',
    },
    viewDetailsButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 180, // Adjusted for new header height
        left: 20,
        right: 20,
        zIndex: 200,
        elevation: 10,
        borderRadius: 16,
        maxHeight: 300,
        overflow: 'hidden',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    contentContainer: {
        flex: 1,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    categoryBox: {
        width: '48%',
        padding: 12,
        marginBottom: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },

    selectedDeviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderRadius: 0,
        marginBottom: 20,
    },
    selectedDeviceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    feedbackSection: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 0,
        marginTop: 10,
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'Barlow',
    },
    feedbackSubtitle: {
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Barlow',
    },
    feedbackButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 0,
    },
    feedbackButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
        marginBottom: 24,
        fontFamily: 'Barlow',
    },
    feedbackButton: {
        padding: 12,
    },
    resultCard: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 0,
        elevation: 2,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        fontFamily: 'Barlow',
    },
    titleCard: {
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 1,
    },
    categoryTag: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'Barlow',
    },
    productTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Barlow',
    },
    section: {
        padding: 16,
        marginBottom: 16,
        elevation: 1,
        borderRadius: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        fontFamily: 'Barlow',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderRadius: 20,
    },
    tagText: {
        fontSize: 14,
        fontFamily: 'Barlow',
    },
});

export default HomeScreen;
