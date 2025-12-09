import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const TermsScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
                    Last Updated: December 2024
                </Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        By using ProGlide, you agree to these Terms and Conditions. If you do not agree, please do not use the application.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Use of Service</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        ProGlide is designed to help mobile accessory retailers find compatible products. The service includes:{'\n\n'}
                        • Screen Guard compatibility search{'\n'}
                        • Phone Case matching{'\n'}
                        • Battery compatibility lookup{'\n'}
                        • CC Board and Center Panel search{'\n'}
                        • Combo/Display matching
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Responsibilities</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        Users are responsible for:{'\n\n'}
                        • Providing accurate registration information{'\n'}
                        • Maintaining the confidentiality of their account{'\n'}
                        • Using the app for legitimate business purposes{'\n'}
                        • Reporting any errors in product data
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Disclaimer</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        While we strive for accuracy, ProGlide does not guarantee 100% accuracy of compatibility data. Users should verify critical dimensions before making purchases. ProGlide is not liable for any losses arising from the use of our data.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Contact</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                        For questions about these terms, contact us at:{'\n'}
                        proglideapp@gmail.com
                    </Text>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        © 2024 ProGlide. All rights reserved.
                    </Text>
                </View>
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
    content: {
        flex: 1,
        padding: 20,
    },
    lastUpdated: {
        fontSize: 12,
        marginBottom: 24,
        fontStyle: 'italic',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 22,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    footerText: {
        fontSize: 12,
    },
});

export default TermsScreen;
