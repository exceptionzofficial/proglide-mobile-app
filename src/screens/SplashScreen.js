import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { isAuthenticated } from '../services/api';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(60)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Floating shapes animations
    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;
    const float3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Floating shapes continuous animation
        const createFloatAnimation = (animValue, duration) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: duration,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        // Start floating animations
        createFloatAnimation(float1, 3000).start();
        createFloatAnimation(float2, 4000).start();
        createFloatAnimation(float3, 3500).start();

        // Pulse animation for logo glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
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
        ).start();

        // Main entrance animations
        Animated.parallel([
            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            // Scale with spring
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 50,
                useNativeDriver: true,
            }),
            // Subtle rotation
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // Slide up text
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 1000,
                delay: 300,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
            // Glow effect
            Animated.timing(glowAnim, {
                toValue: 1,
                duration: 1500,
                delay: 500,
                useNativeDriver: true,
            }),
        ]).start();

        // Progress bar animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2200,
            delay: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();

        // Navigate after delay
        const timer = setTimeout(async () => {
            // Fade out animation before navigation
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(async () => {
                const isAuth = await isAuthenticated();
                if (isAuth) {
                    navigation.replace('Home');
                } else {
                    navigation.replace('Login');
                }
            });
        }, 2800);

        return () => clearTimeout(timer);
    }, [navigation, fadeAnim, scaleAnim, rotateAnim, slideUpAnim, progressAnim, glowAnim, pulseAnim, float1, float2, float3]);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-10deg', '0deg'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    // Floating translations
    const translateY1 = float1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -30],
    });
    const translateY2 = float2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 25],
    });
    const translateY3 = float3.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
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
                    {
                        transform: [{ translateY: translateY1 }, { translateX: translateX1 }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(207, 126, 43, 0.35)', 'rgba(157, 71, 10, 0.15)']}
                    style={styles.shapeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
            <Animated.View
                style={[
                    styles.floatingShape,
                    styles.shape2,
                    {
                        transform: [{ translateY: translateY2 }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(207, 126, 43, 0.25)', 'rgba(157, 71, 10, 0.08)']}
                    style={styles.shapeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>
            <Animated.View
                style={[
                    styles.floatingShape,
                    styles.shape3,
                    {
                        transform: [{ translateY: translateY3 }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(255, 183, 77, 0.2)', 'rgba(207, 126, 43, 0.08)']}
                    style={styles.shapeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Main Content */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { rotate: rotateInterpolate },
                        ],
                    },
                ]}>
                {/* Glow Effect */}
                <Animated.View
                    style={[
                        styles.glowEffect,
                        {
                            opacity: glowAnim,
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(207, 126, 43, 0.4)', 'rgba(157, 71, 10, 0.1)', 'transparent']}
                        style={styles.glowGradient}
                        start={{ x: 0.5, y: 0.5 }}
                        end={{ x: 1, y: 1 }}
                    />
                </Animated.View>

                {/* Logo */}
                <Animated.View style={[styles.logoWrapper, { transform: [{ scale: pulseAnim }] }]}>
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
            </Animated.View>

            {/* Title & Subtitle */}
            <Animated.View
                style={[
                    styles.textContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideUpAnim }],
                    },
                ]}>
                <Text style={styles.title}>ProGlide</Text>
                <Text style={styles.subtitle}>ACCESSORY FINDER</Text>
            </Animated.View>

            {/* Progress Bar */}
            <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
                <View style={styles.progressBg}>
                    <Animated.View style={[styles.progressBarWrapper, { width: progressWidth }]}>
                        <LinearGradient
                            colors={['#CF7E2B', '#9D470A', '#7A3508']}
                            style={styles.progressBar}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                    </Animated.View>
                </View>
                <Text style={styles.loadingText}>Preparing your experience...</Text>
            </Animated.View>

            {/* Version */}
            <Animated.View style={[styles.versionContainer, { opacity: glowAnim }]}>
                <Text style={styles.versionText}>v1.0.0</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0F0F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
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
        top: -80,
        right: -80,
    },
    shape2: {
        width: 200,
        height: 200,
        borderRadius: 100,
        bottom: 80,
        left: -70,
    },
    shape3: {
        width: 140,
        height: 140,
        borderRadius: 70,
        top: height * 0.42,
        right: 20,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    glowEffect: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        overflow: 'hidden',
    },
    glowGradient: {
        width: '100%',
        height: '100%',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoOuter: {
        width: 150,
        height: 150,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#CF7E2B',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.6,
        shadowRadius: 35,
        elevation: 25,
    },
    logoInner: {
        width: 115,
        height: 115,
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(207, 126, 43, 0.35)',
    },
    logoText: {
        fontSize: 68,
        fontWeight: '900',
        color: '#CF7E2B',
        letterSpacing: 4,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    title: {
        fontSize: 52,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 3,
        textShadowColor: 'rgba(207, 126, 43, 0.4)',
        textShadowOffset: { width: 0, height: 6 },
        textShadowRadius: 20,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 12,
        letterSpacing: 8,
        fontWeight: '600',
    },
    progressContainer: {
        position: 'absolute',
        bottom: 100,
        width: width * 0.7,
        alignItems: 'center',
    },
    progressBg: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarWrapper: {
        height: '100%',
    },
    progressBar: {
        height: '100%',
        width: '100%',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 1,
    },
    versionContainer: {
        position: 'absolute',
        bottom: 40,
    },
    versionText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.25)',
        letterSpacing: 2,
    },
});

export default SplashScreen;
