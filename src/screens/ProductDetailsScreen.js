import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
    const { product } = route.params;
    const { theme, isDark } = useTheme();
    const { colors } = theme;

    const DetailRow = ({ label, value, icon }) => (
        <View style={[styles.detailRow, { borderBottomColor: colors.background }]}>
            <View style={styles.detailLabelContainer}>
                <Icon name={icon} size={20} color={colors.primary} style={styles.detailIcon} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>{value || 'N/A'}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.statusBarBg}
            />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDark ? colors.card : colors.primary }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    Product Details
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Product Title Card */}
                <View style={[styles.titleCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(157, 71, 10, 0.2)' : '#FFF7ED' }]}>
                        <Icon name="cellphone" size={40} color={colors.primary} />
                    </View>
                    <Text style={[styles.categoryTag, { color: colors.primary }]}>{product.category}</Text>
                    <Text style={[styles.productTitle, { color: colors.text }]}>
                        {product.compatibleDevices || 'Unknown Device'}
                    </Text>
                    <Text style={[styles.productId, { color: colors.textSecondary }]}>ID: {product._id?.slice(-6).toUpperCase()}</Text>
                </View>

                {/* Specifications Section */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Specifications</Text>

                    {product.specs?.originalDrawingModel && (
                        <DetailRow
                            icon="drawing"
                            label="Drawing Model"
                            value={product.specs.originalDrawingModel}
                        />
                    )}

                    {product.specs?.baseModel && (
                        <DetailRow
                            icon="cellphone-settings"
                            label="Base Model"
                            value={product.specs.baseModel}
                        />
                    )}

                    {product.specs?.brandName && (
                        <DetailRow
                            icon="tag-outline"
                            label="Brand"
                            value={product.specs.brandName}
                        />
                    )}

                    {product.specs?.modelNo && (
                        <DetailRow
                            icon="barcode"
                            label="Model Number"
                            value={product.specs.modelNo}
                        />
                    )}
                </View>

                {/* Dimensions Section (if available) */}
                {(product.specs?.height || product.specs?.width) && (
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, borderLeftColor: colors.primary }]}>Dimensions</Text>
                        <View style={[styles.dimensionsContainer, { backgroundColor: isDark ? colors.background : '#F9FAFB' }]}>
                            <View style={styles.dimensionBox}>
                                <Text style={[styles.dimensionLabel, { color: colors.textSecondary }]}>Height</Text>
                                <Text style={[styles.dimensionValue, { color: colors.primary }]}>{product.specs.height || '-'} mm</Text>
                            </View>
                            <View style={[styles.dimensionDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.dimensionBox}>
                                <Text style={[styles.dimensionLabel, { color: colors.textSecondary }]}>Width</Text>
                                <Text style={[styles.dimensionValue, { color: colors.primary }]}>{product.specs.width || '-'} mm</Text>
                            </View>
                        </View>

                        {/* Corner Radii Grid */}
                        {(product.specs?.radiusTopLeft || product.specs?.radiusTopRight) && (
                            <View style={[styles.radiiGrid, { backgroundColor: isDark ? colors.background : '#F9FAFB' }]}>
                                <Text style={[styles.radiiTitle, { color: colors.textSecondary }]}>Corner Radii</Text>
                                <View style={styles.radiiRow}>
                                    <View style={[styles.radiiItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Icon name="arrow-top-left" size={16} color={colors.icon} />
                                        <Text style={[styles.radiiValue, { color: colors.text }]}>{product.specs.radiusTopLeft || 0}</Text>
                                    </View>
                                    <View style={[styles.radiiItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Icon name="arrow-top-right" size={16} color={colors.icon} />
                                        <Text style={[styles.radiiValue, { color: colors.text }]}>{product.specs.radiusTopRight || 0}</Text>
                                    </View>
                                </View>
                                <View style={styles.radiiRow}>
                                    <View style={[styles.radiiItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Icon name="arrow-bottom-left" size={16} color={colors.icon} />
                                        <Text style={[styles.radiiValue, { color: colors.text }]}>{product.specs.radiusBottomLeft || 0}</Text>
                                    </View>
                                    <View style={[styles.radiiItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Icon name="arrow-bottom-right" size={16} color={colors.icon} />
                                        <Text style={[styles.radiiValue, { color: colors.text }]}>{product.specs.radiusBottomRight || 0}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Action Button */}
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                    <Icon name="download" size={24} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Download Template</Text>
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    titleCard: {
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        fontSize: 12,
    },
    section: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        borderLeftWidth: 4,
        paddingLeft: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    detailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        marginRight: 12,
        width: 24,
    },
    detailLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        maxWidth: '50%',
        textAlign: 'right',
    },
    dimensionsContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    dimensionBox: {
        flex: 1,
        alignItems: 'center',
    },
    dimensionDivider: {
        width: 1,
    },
    dimensionLabel: {
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    dimensionValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    radiiGrid: {
        marginTop: 8,
        borderRadius: 12,
        padding: 12,
    },
    radiiTitle: {
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'center',
    },
    radiiRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    radiiItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        minWidth: 80,
        justifyContent: 'center',
        borderWidth: 1,
    },
    radiiValue: {
        marginLeft: 6,
        fontWeight: '600',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});

export default ProductDetailsScreen;
