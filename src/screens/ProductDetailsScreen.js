import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { getProducts } from '../services/api';

const ProductDetailsScreen = ({ route, navigation }) => {
    const { theme, isDark } = useTheme();
    const { colors } = theme;

    // Params can contain 'product' (Details Mode) or 'category' (Category Mode)
    const { product: initialProduct, category: initialCategory, mode } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]); // For category view
    const [matches, setMatches] = useState({
        original: [],
        fullTemper: [],
        similar: [],
        perfect: [],
    });

    // If we have a product, we are in Details Mode.
    // If we only have a category, we are in Category Mode.
    const isCategoryMode = mode === 'category_view' || (!initialProduct && initialCategory);
    const targetProduct = initialProduct; // The product whose details are being viewed

    useEffect(() => {
        if (isCategoryMode) {
            fetchCategoryProducts();
        } else if (targetProduct) {
            fetchMatches();
        }
    }, [initialProduct, initialCategory, mode]);

    const fetchCategoryProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts(initialCategory); // Assuming getProducts can take a category filter
            setProducts(data);
        } catch (error) {
            console.error('Failed to load category products', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const data = await getProducts(); // Fetch all to find matches
            calculateMatches(data, targetProduct);
        } catch (error) {
            console.error('Failed to load products for matching', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateMatches = (allProducts, product) => {
        if (!product) return;

        const { category, specs } = product;
        const targetHeight = parseFloat(specs?.height || 0);
        const targetWidth = parseFloat(specs?.width || 0);
        const targetRadius = parseFloat(specs?.radiusTopLeft || 0);

        const newMatches = {
            original: [],
            fullTemper: [],
            similar: [],
            perfect: [],
        };

        const categoryProducts = allProducts.filter(p => p.category === category && p._id !== product._id);

        if (category === 'Screen Guard') {
            if (product.compatibleDevices) {
                newMatches.original = product.compatibleDevices.split(',').map(d => d.trim());
            }

            categoryProducts.forEach(p => {
                const pHeight = parseFloat(p.specs?.height || 0);
                const pWidth = parseFloat(p.specs?.width || 0);
                const pRadius = parseFloat(p.specs?.radiusTopLeft || 0);

                if (
                    Math.abs(pHeight - targetHeight) < 0.1 &&
                    Math.abs(pWidth - targetWidth) < 0.1 &&
                    Math.abs(pRadius - targetRadius) < 0.1
                ) {
                    newMatches.fullTemper.push(p);
                }

                const widthDiff = targetWidth - pWidth;
                if (widthDiff > 0.01 && widthDiff <= 0.5) {
                    newMatches.similar.push(p);
                }
            });

            newMatches.similar.sort((a, b) => parseFloat(b.specs?.width) - parseFloat(a.specs?.width));

        } else {
            if (product.compatibleDevices) {
                newMatches.perfect = product.compatibleDevices.split(',').map(d => d.trim());
            }
        }

        setMatches(newMatches);
    };

    const shouldHideModelNo = (product) => {
        return product.category === 'CC Board' || product.category === 'Center Panel';
    };

    const renderTag = (label, colorBg, colorText, onPress = null) => (
        <TouchableOpacity
            key={label + Math.random()} // Added Math.random() for unique keys in case of duplicate labels
            style={[styles.tag, { backgroundColor: colorBg, borderColor: colorBg }]}
            onPress={onPress}
            disabled={!onPress}
        >
            <Text style={[styles.tagText, { color: colorText }]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderCategoryList = () => (
        <View style={styles.listContainer}>
            <Text style={[styles.sectionTitle, { color: colors.primary, marginLeft: 16, marginTop: 16 }]}>
                {initialCategory}s
            </Text>
            {products.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={{ color: colors.textSecondary }}>No products found in this category.</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.productCard, { backgroundColor: colors.card }]}
                            onPress={() => navigation.push('ProductDetails', { product: item })}
                        >
                            <View style={styles.cardContent}>
                                <Icon name="cellphone" size={32} color={colors.primary} />
                                <View style={styles.cardText}>
                                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                                        {item.compatibleDevices || 'Unknown Device'}
                                    </Text>
                                    {!shouldHideModelNo(item) && (
                                        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                                            Model: {item.specs?.modelNo || 'N/A'}
                                        </Text>
                                    )}
                                </View>
                                <Icon name="chevron-right" size={24} color={colors.textSecondary} />
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );

    const renderDetailsView = () => (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Product Header Card */}
            <View style={[styles.titleCard, { backgroundColor: colors.card }]}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(157, 71, 10, 0.2)' : '#FFF7ED' }]}>
                    <Icon name="cellphone" size={40} color={colors.primary} />
                </View>
                <Text style={[styles.categoryTag, { color: colors.primary }]}>{targetProduct.category}</Text>
                <Text style={[styles.productTitle, { color: colors.text }]}>
                    {targetProduct.compatibleDevices || 'Unknown Device'}
                </Text>

                {!shouldHideModelNo(targetProduct) && (
                    <Text style={[styles.productId, { color: colors.textSecondary }]}>
                        Model: {targetProduct.specs?.modelNo || 'N/A'}
                    </Text>
                )}
            </View>

            {/* Category Specific Logic */}
            {targetProduct.category === 'Screen Guard' ? (
                <View>
                    {/* 1. Original Drawing */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Original Drawing</Text>
                        <View style={styles.tagContainer}>
                            {matches.original.length > 0 ? (
                                matches.original.map((device) =>
                                    renderTag(device, '#DCFCE7', '#166534')
                                )
                            ) : (
                                <Text style={{ color: colors.textSecondary }}>No compatible devices listed.</Text>
                            )}
                        </View>
                    </View>

                    {/* 2. Full Temper */}
                    {matches.fullTemper.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Full Temper (Perfect Fit)</Text>
                            <View style={styles.tagContainer}>
                                {matches.fullTemper.map((p) =>
                                    renderTag(
                                        p.compatibleDevices || 'Unknown',
                                        '#DCFCE7',
                                        '#166534',
                                        () => navigation.push('ProductDetails', { product: p })
                                    )
                                )}
                            </View>
                        </View>
                    )}

                    {/* 3. Similar Match */}
                    {matches.similar.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Similar Match (Slightly Smaller)</Text>
                            <View style={styles.tagContainer}>
                                {matches.similar.map((p) =>
                                    renderTag(
                                        p.compatibleDevices || 'Unknown',
                                        '#FEE2E2',
                                        '#991B1B',
                                        () => navigation.push('ProductDetails', { product: p })
                                    )
                                )}
                            </View>
                        </View>
                    )}

                    {/* Dimensions */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Dimensions</Text>
                        <View style={styles.row}>
                            <Text style={{ color: colors.textSecondary }}>Height: </Text>
                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{targetProduct.specs?.height} mm</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={{ color: colors.textSecondary }}>Width: </Text>
                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{targetProduct.specs?.width} mm</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={{ color: colors.textSecondary }}>Radius: </Text>
                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>{targetProduct.specs?.radiusTopLeft} mm</Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>Compatible Devices (Perfect Match)</Text>
                    <View style={styles.tagContainer}>
                        {matches.perfect.length > 0 ? (
                            matches.perfect.map((device) =>
                                renderTag(device, isDark ? '#374151' : '#F3F4F6', colors.text)
                            )
                        ) : (
                            <Text style={{ color: colors.textSecondary }}>No compatible devices listed.</Text>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.statusBarBg} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {isCategoryMode ? initialCategory : 'Product Details'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                isCategoryMode ? renderCategoryList() : renderDetailsView()
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 60,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    listContainer: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    titleCard: {
        borderRadius: 0, // Sharp corners
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    categoryTag: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    productId: {
        fontSize: 14,
    },
    section: {
        borderRadius: 0, // Sharp corners
        padding: 16,
        marginBottom: 16,
        elevation: 1,
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 0, // Sharp corners
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    productCard: {
        borderRadius: 0,
        padding: 16,
        marginBottom: 12,
        elevation: 1,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardText: {
        flex: 1,
        marginLeft: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
    },
});

export default ProductDetailsScreen;
