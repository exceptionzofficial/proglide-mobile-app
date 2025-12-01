import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { isAuthenticated } from '../services/api';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate after delay
        const timer = setTimeout(async () => {
            const isAuth = await isAuthenticated();
            if (isAuth) {
                navigation.replace('Home');
            } else {
                navigation.replace('Login');
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigation, fadeAnim, scaleAnim, slideAnim]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6B46C1" />

            {/* Gradient Background Effect */}
            <View style={styles.gradientTop} />
            <View style={styles.gradientBottom} />

            {/* Animated Logo Container */}
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}>
                {/* Logo Icon */}
                <View style={styles.logoIcon}>
                    <View style={styles.logoInner}>
                        <Text style={styles.logoText}>P</Text>
                    </View>
                </View>

                {/* App Name */}
                <Animated.View
                    style={[
                        styles.titleContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}>
                    <Text style={styles.title}>ProGlide</Text>
                    <Text style={styles.subtitle}>Accessory Finder</Text>
                </Animated.View>
            </Animated.View>

            {/* Footer */}
            <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                <View style={styles.loadingDots}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={[styles.dot, styles.dotActive]} />
                </View>
                <Text style={styles.footerText}>Loading your experience...</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
        backgroundColor: '#6B46C1',
        borderBottomLeftRadius: 200,
        borderBottomRightRadius: 200,
        transform: [{ scaleX: 2 }],
    },
    gradientBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.3,
        backgroundColor: '#5B21B6',
        borderTopLeftRadius: 200,
        borderTopRightRadius: 200,
        transform: [{ scaleX: 2 }],
    },
    logoContainer: {
        alignItems: 'center',
        zIndex: 10,
    },
    logoIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    logoInner: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F97316',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    titleContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#E9D5FF',
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    loadingDots: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E9D5FF',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#F97316',
    },
    footerText: {
        fontSize: 14,
        color: '#E9D5FF',
        letterSpacing: 1,
    },
});

export default SplashScreen;
