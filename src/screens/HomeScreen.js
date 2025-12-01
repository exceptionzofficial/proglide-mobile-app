import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    RefreshControl,
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProducts, getCurrentUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'all', label: 'All', icon: 'view-grid' },
    { id: 'Screen Guard', label: 'Screen Guard', icon: 'cellphone-screenshot' },
    { id: 'Phone Case', label: 'Phone Case', icon: 'cellphone-check' },
    { id: 'Combo/Display', label: 'Combo', icon: 'cellphone-link' },
    { id: 'CC Board', label: 'CC Board', icon: 'chip' },
    { id: 'Battery', label: 'Battery', icon: 'battery-charging' },
    { id: 'Center Panel', label: 'Panel', icon: 'tablet-cellphone' },
];

// Skeleton Loader Component
const SkeletonCard = ({ theme }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;
    const { colors, isDark } = theme;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, [opacity]);

    const skeletonColor = isDark ? '#374151' : '#E5E7EB';

    return (
        <View style={[styles.skeletonCard, { backgroundColor: colors.card }]}>
            <Animated.View style={[styles.skeletonBadge, { opacity, backgroundColor: skeletonColor }]} />
            <Animated.View style={[styles.skeletonText, { width: '80%', opacity, backgroundColor: skeletonColor }]} />
            <Animated.View style={[styles.skeletonText, { width: '60%', marginTop: 8, opacity, backgroundColor: skeletonColor }]} />
            <Animated.View style={[styles.skeletonButton, { opacity, backgroundColor: skeletonColor }]} />
        </View>
    );
};

const HomeScreen = ({ navigation }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState(null);

    const { theme, isDark } = useTheme();
    const { colors } = theme;

    // Animation Values
    const headerTranslateY = useRef(new Animated.Value(-100)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadUser();
        fetchProducts();
        animateEntry();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery]);

    const animateEntry = () => {
        Animated.parallel([
            Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 1000,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const loadUser = async () => {
        const userData = await getCurrentUser();
        setUser(userData);
    };

    const fetchProducts = async () => {
        try {
            if (!refreshing) setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchProducts();
        setRefreshing(false);
    }, []);

    const filterProducts = () => {
        let filtered = products;
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.compatibleDevices?.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        }
        setFilteredProducts(filtered);
    };

    const getIconForCategory = category => {
        const cat = CATEGORIES.find(c => c.id === category);
        return cat?.icon || 'package-variant';
    };

    const renderProduct = ({ item, index }) => {
        const translateY = new Animated.Value(50);
        const opacity = new Animated.Value(0);

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay: index * 50,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay: index * 50,
                useNativeDriver: true,
            }),
        ]).start();

        return (
            <Animated.View
                style={[
                    styles.productCardWrapper,
                    { opacity, transform: [{ translateY }] },
                ]}>
                <TouchableOpacity
                    style={[styles.productCard, { backgroundColor: colors.card }]}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProductDetails', { product: item })}>

                    <View style={styles.cardHeader}>
                        <View style={[styles.categoryBadge, { backgroundColor: isDark ? 'rgba(157, 71, 10, 0.2)' : '#FFF7ED' }]}>
                            <Icon
                                name={getIconForCategory(item.category)}
                                size={14}
                                color={colors.primary}
                            />
                            <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>{item.category}</Text>
                        </View>
                        <Icon name="chevron-right" size={20} color={colors.icon} />
                    </View>

                    <Text style={[styles.productDevices, { color: colors.text }]} numberOfLines={2}>
                        {item.compatibleDevices || 'Unknown Device'}
                    </Text>

                    <View style={styles.specsContainer}>
                        {item.specs?.modelNo && (
                            <Text style={[styles.specText, { color: colors.textSecondary }]}>Model: {item.specs.modelNo}</Text>
                        )}
                        {item.specs?.height && item.specs?.width && (
                            <Text style={[styles.specText, { color: colors.textSecondary }]}>
                                {item.specs.height} x {item.specs.width} mm
                            </Text>
                        )}
                    </View>

                    <View style={[styles.viewDetailsButton, { backgroundColor: isDark ? colors.background : '#F3F4F6' }]}>
                        <Text style={[styles.viewDetailsText, { color: colors.primary }]}>View Details</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.statusBarBg}
            />

            {/* Animated Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: isDark ? colors.card : colors.primary,
                        transform: [{ translateY: headerTranslateY }]
                    },
                ]}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerGreeting}>Welcome back,</Text>
                        <Text style={styles.headerName}>{user?.name || 'Guest'}</Text>
                    </View>
                    <View style={styles.headerIconContainer}>
                        <Icon name="bell-outline" size={24} color="#FFFFFF" />
                    </View>
                </View>

                {/* Search Bar */}
                <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.inputBg : '#FFFFFF' }]}>
                    <Icon name="magnify" size={22} color={colors.placeholder} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search devices..."
                        placeholderTextColor={colors.placeholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </Animated.View>

            {/* Main Content */}
            <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
                {/* Categories */}
                <View style={styles.categoriesWrapper}>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={CATEGORIES}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.categoriesList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    {
                                        backgroundColor: selectedCategory === item.id ? colors.primary : colors.card,
                                        borderColor: isDark ? colors.border : '#E5E7EB'
                                    }
                                ]}
                                onPress={() => setSelectedCategory(item.id)}>
                                <Icon
                                    name={item.icon}
                                    size={18}
                                    color={selectedCategory === item.id ? '#FFFFFF' : colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        { color: selectedCategory === item.id ? '#FFFFFF' : colors.textSecondary }
                                    ]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Product Grid */}
                {loading ? (
                    <View style={styles.skeletonContainer}>
                        {[1, 2, 3, 4, 5, 6].map(key => (
                            <SkeletonCard key={key} theme={{ colors, isDark }} />
                        ))}
                    </View>
                ) : (
                    <FlatList
                        data={filteredProducts}
                        renderItem={renderProduct}
                        keyExtractor={item => item._id}
                        numColumns={2}
                        contentContainerStyle={styles.productsList}
                        columnWrapperStyle={styles.productsRow}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="package-variant-closed" size={64} color={colors.icon} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Items Found</Text>
                                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                    Try changing your search or category
                                </Text>
                            </View>
                        }
                    />
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 24,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerGreeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    headerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    categoriesWrapper: {
        paddingVertical: 16,
    },
    categoriesList: {
        paddingHorizontal: 20,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryChipText: {
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '600',
    },
    productsList: {
        paddingHorizontal: 14,
        paddingBottom: 20,
    },
    productsRow: {
        justifyContent: 'space-between',
    },
    productCardWrapper: {
        width: (width - 40) / 2,
        marginBottom: 12,
    },
    productCard: {
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        height: 180,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    productDevices: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 8,
        lineHeight: 20,
    },
    specsContainer: {
        marginBottom: 8,
    },
    specText: {
        fontSize: 11,
        marginBottom: 2,
    },
    viewDetailsButton: {
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    viewDetailsText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Skeleton Styles
    skeletonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
    },
    skeletonCard: {
        width: (width - 40) / 2,
        height: 180,
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
    },
    skeletonBadge: {
        width: 60,
        height: 20,
        borderRadius: 8,
        marginBottom: 12,
    },
    skeletonText: {
        height: 12,
        borderRadius: 6,
        marginBottom: 6,
    },
    skeletonButton: {
        height: 30,
        borderRadius: 8,
        marginTop: 'auto',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        marginTop: 8,
    },
});

export default HomeScreen;
