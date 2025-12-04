import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { getProducts } from '../services/api';

const { width } = Dimensions.get('window');

// Updated Category Data with specific descriptions
const CATEGORIES_DATA = [
    {
        id: 'Screen Guard',
        label: 'Screen Guards',
        icon: 'cellphone-screenshot',
        description: 'Stop guessing if a glass fits. We list the exact drawing model and precise corner radius (mm) so you get the perfect edge-to-edge fit every time.'
    },
    {
        id: 'Phone Case',
        label: 'Phone Cases',
        icon: 'cellphone-check',
        description: 'Easily identify which cases fit multiple phones. We group inventory by Base Model so you know exactly which covers are interchangeable.'
    },
    {
        id: 'Combo Folder', // ID matches API category
        label: 'Combo Folders',
        icon: 'cellphone-link',
        description: 'Avoid returns due to wrong versions. Search by specific Brand Name & Model Number to ensure the display connector matches perfectly.'
    },
    {
        id: 'CC Board',
        label: 'CC Boards',
        icon: 'chip',
        description: 'Charging issues solved. We verify Model Numbers to ensure microphone and fast-charging compatibility on every sub-board.'
    },
    {
        id: 'Battery',
        label: 'Batteries',
        icon: 'battery-charging',
        description: 'Don\'t just guess the size. Match the Model Code (e.g., BN-50) to the device to guarantee proper fitting and battery health.'
    },
    {
        id: 'Center Panel',
        label: 'Center Panels',
        icon: 'tablet-cellphone',
        description: 'Structural body replacements that align with the Base Model chassis for a seamless, factory-finish repair.'
    }
];

// Tabs list including 'All'
const TABS = [
    { id: 'All', label: 'All' },
    ...CATEGORIES_DATA.map(c => ({ id: c.id, label: c.label }))
];

const HomeScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [activeTab, setActiveTab] = useState('All');

    const [products, setProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

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

            setSuggestions(uniqueMatchingDevices.slice(0, 10));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            if (text.trim().length === 0) {
                setSelectedDevice(null); // Clear selection if search is cleared
            }
        }
    };

    const handleSelectDevice = (device) => {
        setSearchQuery(device);
        setSelectedDevice(device);
        setShowSuggestions(false);
    };

    const sendFeedback = () => {
        Linking.openURL('mailto:proglideapp@gmail.com?subject=App Feedback');
    };

    const renderHeader = () => (
        <View style={[styles.headerContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                <Icon name="magnify" size={24} color={colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text, fontFamily: 'serif' }]}
                    placeholder="Search Device (e.g. Vivo V19)"
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedDevice(null); }}>
                        <Icon name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={TABS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.tabsContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                        ]}
                        onPress={() => setActiveTab(item.id)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === item.id ? '#FFFFFF' : colors.text, fontFamily: 'serif' }
                        ]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderSuggestions = () => (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.card }]}>
            <FlatList
                data={suggestions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
                        onPress={() => handleSelectDevice(item)}
                    >
                        <Icon name="history" size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
                        <Text style={{ color: colors.text, fontSize: 16, fontFamily: 'serif' }}>{item}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    const renderCategoryBox = (item) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.categoryBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setActiveTab(item.id)}
        >
            <View style={styles.catHeader}>
                <Icon name={item.icon} size={32} color={colors.primary} />
                <Text style={[styles.catTitle, { color: colors.text, fontFamily: 'serif' }]}>{item.label}</Text>
            </View>
            <Text style={[styles.catDesc, { color: colors.textSecondary, fontFamily: 'serif' }]}>
                {item.description}
            </Text>
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'serif' }}>Loading...</Text>
                </View>
            );
        }

        // 1. "All" Tab Logic
        if (activeTab === 'All') {
            // Filter products based on search query to show tags
            let displayedDevices = [];
            const isSearching = searchQuery.trim().length > 0;

            if (isSearching) {
                // Get all devices from all products
                const allDevices = products.flatMap(p =>
                    p.compatibleDevices ? p.compatibleDevices.split(',').map(d => d.trim()) : []
                );
                // Filter by search query and unique
                displayedDevices = [...new Set(allDevices
                    .filter(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
                )];
            }

            return (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    {/* Show Search Results as Tags in "All" Tab */}
                    {isSearching && displayedDevices.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'serif' }]}>
                                Search Results
                            </Text>
                            <View style={styles.tagContainer}>
                                {displayedDevices.map(device => {
                                    const isSelected = selectedDevice === device;
                                    return (
                                        <TouchableOpacity
                                            key={device}
                                            style={[
                                                styles.tag,
                                                {
                                                    backgroundColor: isSelected ? colors.primary : '#F3F4F6',
                                                    borderColor: isSelected ? colors.primary : '#F3F4F6'
                                                }
                                            ]}
                                            onPress={() => handleSelectDevice(device)}
                                        >
                                            <Text style={[
                                                styles.tagText,
                                                {
                                                    color: isSelected ? '#FFFFFF' : colors.text,
                                                    fontFamily: 'serif'
                                                }
                                            ]}>
                                                {device}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {/* Show "No Results" if searching but no matches */}
                    {isSearching && displayedDevices.length === 0 && (
                        <View style={styles.emptyState}>
                            <Icon name="magnify-remove-outline" size={48} color={colors.textSecondary} />
                            <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'serif' }}>
                                No devices found matching "{searchQuery}"
                            </Text>
                        </View>
                    )}

                    {/* Only show Category Boxes when NOT searching */}
                    {!isSearching && (
                        <View style={styles.gridContainer}>
                            {CATEGORIES_DATA.map(renderCategoryBox)}
                        </View>
                    )}

                    {/* Feedback Form */}
                    <View style={[styles.feedbackSection, { backgroundColor: colors.card }]}>
                        <Text style={[styles.feedbackTitle, { color: colors.text, fontFamily: 'serif' }]}>Have Feedback?</Text>
                        <Text style={[styles.feedbackSubtitle, { color: colors.textSecondary, fontFamily: 'serif' }]}>
                            We'd love to hear from you. Let us know how we can improve.
                        </Text>
                        <TouchableOpacity
                            style={[styles.feedbackButton, { backgroundColor: colors.primary }]}
                            onPress={sendFeedback}
                        >
                            <Text style={[styles.feedbackButtonText, { fontFamily: 'serif' }]}>Send Feedback</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            );
        }

        // 2. Specific Category Tab Logic
        if (!selectedDevice) {
            return (
                <View style={styles.emptyState}>
                    <Icon name="magnify" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: 'serif' }]}>
                        Search for a device to see details
                    </Text>
                </View>
            );
        }

        // Device IS selected -> Show Contextual Details
        // Find matching product(s)
        const matchingProduct = products.find(p =>
            p.category === activeTab &&
            p.compatibleDevices?.toLowerCase().includes(selectedDevice.toLowerCase())
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
            />
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

            {renderHeader()}

            {showSuggestions ? renderSuggestions() : (
                <View style={styles.contentContainer}>
                    {renderContent()}
                </View>
            )}
        </SafeAreaView>
    );
};

// Component to render details inside the tab
const EmbeddedProductDetails = ({ product, targetDevice, theme, onDeviceSelect }) => {
    const { colors } = theme;
    const [matches, setMatches] = useState({ original: [], fullTemper: [], similar: [], perfect: [] });
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
    const calculateMatches = (allProducts) => {
        const { category, specs } = product;
        const targetHeight = parseFloat(specs?.height || 0);
        const targetWidth = parseFloat(specs?.width || 0);
        const targetRadius = parseFloat(specs?.radiusTopLeft || specs?.radius || 0);

        const newMatches = { original: [], fullTemper: [], similar: [], perfect: [] };
        const categoryProducts = allProducts.filter(p => p.category === category);

        if (category === 'Screen Guard') {
            if (product._id !== 'dummy' && product.compatibleDevices) {
                // ORIGINAL DRAWING: Only show the device that matches the search (targetDevice)
                const devices = product.compatibleDevices.split(',').map(d => d.trim());
                const matchedDevice = devices.find(d => d.toLowerCase() === targetDevice.toLowerCase());

                if (matchedDevice) {
                    newMatches.original = [matchedDevice];
                } else if (product.baseModel?.toLowerCase() === targetDevice.toLowerCase()) {
                    newMatches.original = [product.baseModel];
                }
            }

            categoryProducts.forEach(p => {
                const pHeight = parseFloat(p.specs?.height || 0);
                const pWidth = parseFloat(p.specs?.width || 0);
                const pRadius = parseFloat(p.specs?.radiusTopLeft || p.specs?.radius || 0);

                // Full Temper Logic: Height, Width, AND Radius must be same (approx)
                if (Math.abs(pHeight - targetHeight) < 0.1 &&
                    Math.abs(pWidth - targetWidth) < 0.1 &&
                    Math.abs(pRadius - targetRadius) < 0.1) {

                    if (p._id !== product._id && p.compatibleDevices) {
                        const devices = p.compatibleDevices.split(',').map(d => d.trim());
                        newMatches.fullTemper.push(...devices);
                    }
                }

                // Similar Match Logic: 0.5mm LESS than full temper (target)
                const widthDiff = targetWidth - pWidth;
                if (widthDiff >= 0.01 && widthDiff <= 0.5) {
                    if (Math.abs(pHeight - targetHeight) < 1.0) {
                        if (p.compatibleDevices) {
                            const devices = p.compatibleDevices.split(',').map(d => d.trim());
                            newMatches.similar.push(...devices);
                        }
                    }
                }
            });
            // Deduplicate
            newMatches.fullTemper = [...new Set(newMatches.fullTemper)];
            newMatches.similar = [...new Set(newMatches.similar)];

        } else {
            // Perfect Match Logic for other categories
            const perfectMatches = categoryProducts.filter(p =>
                p.compatibleDevices?.toLowerCase().includes(targetDevice.toLowerCase())
            );

            const allDevices = perfectMatches.flatMap(p =>
                p.compatibleDevices ? p.compatibleDevices.split(',').map(d => d.trim()) : []
            );

            const matched = allDevices.filter(d => d.toLowerCase() === targetDevice.toLowerCase());
            newMatches.perfect = [...new Set(matched.length > 0 ? matched : allDevices)];
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
                <Text style={[styles.tagText, { color: finalText, fontFamily: 'serif' }]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    if (calculating) {
        return (
            <View style={styles.emptyState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'serif' }}>Finding matches...</Text>
            </View>
        );
    }

    const hasAnyMatches = matches.original.length > 0 || matches.fullTemper.length > 0 || matches.similar.length > 0 || matches.perfect.length > 0;

    if (!hasAnyMatches) {
        return (
            <View style={styles.emptyState}>
                <Icon name="alert-circle-outline" size={48} color={colors.textSecondary} />
                <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'serif' }}>No matching products found for {targetDevice}</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View style={[styles.titleCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.categoryTag, { color: colors.primary, fontFamily: 'serif' }]}>{product.category}</Text>
                <Text style={[styles.productTitle, { color: colors.text, fontFamily: 'serif' }]}>{targetDevice}</Text>
            </View>

            {product.category === 'Screen Guard' ? (
                <View>
                    {matches.original.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'serif' }]}>Original Drawing</Text>
                            <View style={styles.tagContainer}>
                                {matches.original.map(d => renderTag(d, '#166534', '#FFFFFF'))}
                            </View>
                        </View>
                    )}
                    {matches.fullTemper.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'serif' }]}>Full Temper</Text>
                            <View style={styles.tagContainer}>
                                {matches.fullTemper.map(d => renderTag(d, '#DCFCE7', '#166534'))}
                            </View>
                        </View>
                    )}
                    {matches.similar.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'serif' }]}>Similar Match</Text>
                            <View style={styles.tagContainer}>
                                {matches.similar.map(d => renderTag(d, '#FEE2E2', '#991B1B'))}
                            </View>
                        </View>
                    )}
                </View>
            ) : (
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'serif' }]}>Compatible Devices</Text>
                    <View style={styles.tagContainer}>
                        {matches.perfect.length > 0 ?
                            matches.perfect.map(d => renderTag(d, '#F3F4F6', colors.text)) :
                            <Text style={{ color: colors.textSecondary, fontFamily: 'serif' }}>No exact match found for {targetDevice} in {product.category}</Text>
                        }
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight || 0,
    },
    headerContainer: {
        paddingVertical: 8,
        elevation: 4,
        zIndex: 100,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    tabsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontWeight: '600',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 110,
        left: 0,
        right: 0,
        zIndex: 200,
        elevation: 5,
        maxHeight: 300,
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
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderRadius: 0,
    },
    catHeader: {
        marginBottom: 8,
    },
    catTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    catDesc: {
        fontSize: 12,
        lineHeight: 16,
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
    },
    feedbackSubtitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    feedbackButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 0,
    },
    feedbackButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
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
    },
    productTitle: {
        fontSize: 20,
        fontWeight: 'bold',
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
        borderRadius: 0,
    },
    tagText: {
        fontSize: 14,
    },
});

export default HomeScreen;
