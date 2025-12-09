import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Animated,
    Dimensions,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { register } from '../services/api';

const { width, height } = Dimensions.get('window');

const Register = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [shopName, setShopName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const cardAnim = useRef(new Animated.Value(100)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Floating animations
        const createFloat = (anim, duration) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        createFloat(float1, 4000).start();
        createFloat(float2, 5000).start();

        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),
            Animated.timing(cardAnim, {
                toValue: 0,
                duration: 1000,
                delay: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim, cardAnim, scaleAnim, float1, float2]);

    const handleRegister = async () => {
        if (!name || !email || !phone || !shopName || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        // Button press animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setLoading(true);
        try {
            await register({ name, email, phone, shopName, password });
            Alert.alert('Success', 'Registration successful!', [
                { text: 'OK', onPress: () => navigation.replace('Home') },
            ]);
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.userMessage || error.response?.data?.message || 'Something went wrong. Please try again.';
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const translateY1 = float1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -25],
    });

    const translateY2 = float2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 20],
    });

    const translateX1 = float1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 15],
    });

    const renderInput = (iconName, placeholder, value, setValue, keyboardType = 'default', isPassword = false, showPwd = false, setShowPwd = null) => (
        <View style={[
            styles.inputContainer,
            focusedInput === placeholder && styles.inputFocused,
        ]}>
            <LinearGradient
                colors={focusedInput === placeholder
                    ? ['rgba(207, 126, 43, 0.2)', 'rgba(157, 71, 10, 0.1)']
                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                style={styles.inputGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.inputIconContainer}>
                    <Icon
                        name={iconName}
                        size={20}
                        color={focusedInput === placeholder ? '#CF7E2B' : '#888888'}
                    />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#666666"
                    keyboardType={keyboardType}
                    autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
                    secureTextEntry={isPassword && !showPwd}
                    value={value}
                    onChangeText={setValue}
                    onFocus={() => setFocusedInput(placeholder)}
                    onBlur={() => setFocusedInput(null)}
                />
                {isPassword && setShowPwd && (
                    <TouchableOpacity
                        onPress={() => setShowPwd(!showPwd)}
                        style={styles.eyeIcon}>
                        <Icon
                            name={showPwd ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color="#888888"
                        />
                    </TouchableOpacity>
                )}
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" translucent />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#0F0F0F', '#1A1A1A', '#252525']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Animated Background Shapes */}
            <Animated.View
                style={[
                    styles.floatingShape,
                    styles.shape1,
                    { transform: [{ translateY: translateY1 }, { translateX: translateX1 }], opacity: fadeAnim },
                ]}
            >
                <LinearGradient
                    colors={['rgba(207, 126, 43, 0.3)', 'rgba(157, 71, 10, 0.1)']}
                    style={styles.shapeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
            <Animated.View
                style={[
                    styles.floatingShape,
                    styles.shape2,
                    { transform: [{ translateY: translateY2 }], opacity: fadeAnim },
                ]}
            >
                <LinearGradient
                    colors={['rgba(207, 126, 43, 0.2)', 'rgba(157, 71, 10, 0.05)']}
                    style={styles.shapeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
            <Animated.View
                style={[
                    styles.floatingShape,
                    styles.shape3,
                    { opacity: fadeAnim },
                ]}
            >
                <LinearGradient
                    colors={['rgba(255, 183, 77, 0.15)', 'rgba(207, 126, 43, 0.05)']}
                    style={styles.shapeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <Animated.View
                        style={[
                            styles.header,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}>
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}>
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                                style={styles.backButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Icon name="arrow-left" size={22} color="#FFFFFF" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join ProGlide and start finding accessories</Text>
                    </Animated.View>

                    {/* Progress Steps */}
                    <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
                        <View style={styles.progressStep}>
                            <LinearGradient
                                colors={['#CF7E2B', '#9D470A']}
                                style={styles.progressDotActive}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <Text style={styles.progressText}>Details</Text>
                        </View>
                        <View style={styles.progressLine}>
                            <LinearGradient
                                colors={['#CF7E2B', 'rgba(207, 126, 43, 0.3)']}
                                style={styles.progressLineGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </View>
                        <View style={styles.progressStep}>
                            <LinearGradient
                                colors={['#CF7E2B', '#9D470A']}
                                style={styles.progressDotActive}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <Text style={styles.progressText}>Security</Text>
                        </View>
                        <View style={styles.progressLine}>
                            <LinearGradient
                                colors={['rgba(207, 126, 43, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                                style={styles.progressLineGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </View>
                        <View style={styles.progressStep}>
                            <View style={styles.progressDot} />
                            <Text style={styles.progressText}>Done</Text>
                        </View>
                    </Animated.View>

                    {/* Form Card */}
                    <Animated.View
                        style={[
                            styles.formCard,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: cardAnim },
                                    { scale: scaleAnim },
                                ],
                            },
                        ]}>

                        {/* Glassmorphism effect */}
                        <View style={styles.glassOverlay} />

                        {/* Personal Info Section */}
                        <View style={styles.sectionHeader}>
                            <Icon name="account-outline" size={18} color="#CF7E2B" />
                            <Text style={styles.sectionTitle}>Personal Information</Text>
                        </View>

                        {renderInput('account-outline', 'Full Name', name, setName)}
                        {renderInput('email-outline', 'Email Address', email, setEmail, 'email-address')}
                        {renderInput('phone-outline', 'Phone Number', phone, setPhone, 'phone-pad')}
                        {renderInput('store-outline', 'Shop Name', shopName, setShopName)}

                        {/* Security Section */}
                        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                            <Icon name="shield-lock-outline" size={18} color="#CF7E2B" />
                            <Text style={styles.sectionTitle}>Security</Text>
                        </View>

                        {renderInput('lock-outline', 'Password', password, setPassword, 'default', true, showPassword, setShowPassword)}
                        {renderInput('lock-check-outline', 'Confirm Password', confirmPassword, setConfirmPassword, 'default', true, showConfirmPassword, setShowConfirmPassword)}

                        {/* Password Requirements */}
                        <View style={styles.passwordHint}>
                            <Icon name="information-outline" size={14} color="#666666" />
                            <Text style={styles.passwordHintText}>Password must be at least 6 characters</Text>
                        </View>

                        {/* Register Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 24 }}>
                            <TouchableOpacity
                                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                                onPress={handleRegister}
                                disabled={loading}
                                activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#CF7E2B', '#9D470A', '#7A3508']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.registerButtonText}>Create Account</Text>
                                            <Icon name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                        <Text style={styles.footerText}>By creating an account, you agree to our</Text>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
                                <Text style={styles.footerLink}>Terms of Service</Text>
                            </TouchableOpacity>
                            <Text style={styles.footerText}> & </Text>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Privacy Policy</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    keyboardView: {
        flex: 1,
    },
    floatingShape: {
        position: 'absolute',
        overflow: 'hidden',
    },
    shapeGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 200,
    },
    shape1: {
        width: 280,
        height: 280,
        borderRadius: 140,
        top: -100,
        right: -80,
    },
    shape2: {
        width: 180,
        height: 180,
        borderRadius: 90,
        bottom: 50,
        left: -70,
    },
    shape3: {
        width: 120,
        height: 120,
        borderRadius: 60,
        top: height * 0.55,
        right: -25,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 50,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        marginBottom: 24,
        overflow: 'hidden',
    },
    backButtonGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 0.3,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        paddingHorizontal: 10,
    },
    progressStep: {
        alignItems: 'center',
    },
    progressDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 8,
    },
    progressDotActive: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginBottom: 8,
    },
    progressText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.45)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    progressLine: {
        width: 45,
        height: 3,
        marginHorizontal: 10,
        marginBottom: 20,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressLineGradient: {
        width: '100%',
        height: '100%',
    },
    formCard: {
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        overflow: 'hidden',
    },
    glassOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#CF7E2B',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginLeft: 8,
    },
    inputContainer: {
        marginBottom: 14,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    inputFocused: {
        borderColor: 'rgba(207, 126, 43, 0.5)',
    },
    inputGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
    },
    inputIconContainer: {
        width: 48,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: 4,
        fontSize: 15,
        color: '#FFFFFF',
    },
    eyeIcon: {
        padding: 14,
    },
    passwordHint: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 8,
    },
    passwordHintText: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 6,
    },
    registerButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#CF7E2B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },
    buttonGradient: {
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    loginLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#CF7E2B',
    },
    footer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    footerText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.35)',
    },
    footerLinks: {
        flexDirection: 'row',
        marginTop: 6,
    },
    footerLink: {
        fontSize: 13,
        color: '#CF7E2B',
        fontWeight: '600',
    },
});

export default Register;
