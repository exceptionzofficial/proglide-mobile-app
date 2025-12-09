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
import { login } from '../services/api';

const { width, height } = Dimensions.get('window');

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
    const pulseAnim = useRef(new Animated.Value(1)).current;

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

        // Logo pulse animation
        const createPulse = () => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        createFloat(float1, 4000).start();
        createFloat(float2, 5000).start();
        createPulse().start();

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
    }, [fadeAnim, slideAnim, cardAnim, scaleAnim, float1, float2, pulseAnim]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
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
            await login(email, password);
            navigation.replace('Home');
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.userMessage || error.response?.data?.message || 'Invalid credentials. Please try again.';
            Alert.alert('Login Failed', errorMessage);
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
                        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
                            <LinearGradient
                                colors={['#CF7E2B', '#9D470A', '#7A3508']}
                                style={styles.logoOuter}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.logoInner}>
                                    <Text style={styles.logoText}>P</Text>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue to ProGlide</Text>
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

                        {/* Email Input */}
                        <View style={[
                            styles.inputContainer,
                            focusedInput === 'email' && styles.inputFocused,
                        ]}>
                            <LinearGradient
                                colors={focusedInput === 'email'
                                    ? ['rgba(207, 126, 43, 0.2)', 'rgba(157, 71, 10, 0.1)']
                                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                                style={styles.inputGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.inputIconContainer}>
                                    <Icon
                                        name="email-outline"
                                        size={22}
                                        color={focusedInput === 'email' ? '#CF7E2B' : '#888888'}
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email Address"
                                    placeholderTextColor="#666666"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </LinearGradient>
                        </View>

                        {/* Password Input */}
                        <View style={[
                            styles.inputContainer,
                            focusedInput === 'password' && styles.inputFocused,
                        ]}>
                            <LinearGradient
                                colors={focusedInput === 'password'
                                    ? ['rgba(207, 126, 43, 0.2)', 'rgba(157, 71, 10, 0.1)']
                                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                                style={styles.inputGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.inputIconContainer}>
                                    <Icon
                                        name="lock-outline"
                                        size={22}
                                        color={focusedInput === 'password' ? '#CF7E2B' : '#888888'}
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#666666"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}>
                                    <Icon
                                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                        size={22}
                                        color="#888888"
                                    />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
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
                                            <Text style={styles.loginButtonText}>Sign In</Text>
                                            <Icon name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <LinearGradient
                                colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
                                style={styles.dividerLine}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                            <Text style={styles.dividerText}>OR</Text>
                            <LinearGradient
                                colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
                                style={styles.dividerLine}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />
                        </View>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Footer */}
                    <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                        <Text style={styles.footerText}>By signing in, you agree to our</Text>
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
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -100,
        right: -100,
    },
    shape2: {
        width: 200,
        height: 200,
        borderRadius: 100,
        bottom: 100,
        left: -80,
    },
    shape3: {
        width: 150,
        height: 150,
        borderRadius: 75,
        top: height * 0.4,
        right: -30,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 28,
    },
    logoOuter: {
        width: 100,
        height: 100,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#CF7E2B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 25,
        elevation: 20,
    },
    logoInner: {
        width: 75,
        height: 75,
        backgroundColor: 'rgba(15, 15, 15, 0.9)',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(207, 126, 43, 0.3)',
    },
    logoText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#CF7E2B',
        letterSpacing: 2,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 0.3,
    },
    formCard: {
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: 28,
        marginBottom: 30,
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
    inputContainer: {
        marginBottom: 18,
        borderRadius: 16,
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
        height: 58,
    },
    inputIconContainer: {
        width: 55,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: 4,
        fontSize: 16,
        color: '#FFFFFF',
    },
    eyeIcon: {
        padding: 16,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 28,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#CF7E2B',
    },
    loginButton: {
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
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 18,
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.3)',
        fontWeight: '700',
        letterSpacing: 2,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    registerLink: {
        fontSize: 15,
        fontWeight: '700',
        color: '#CF7E2B',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
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

export default Login;
