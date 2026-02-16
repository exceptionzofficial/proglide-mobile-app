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
import { forgotPassword, verifyOtp, resetPassword } from '../services/api';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    // Stages: 1 = Email, 2 = OTP, 3 = New Password
    const [stage, setStage] = useState(1);

    // Form State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // UI State
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const cardAnim = useRef(new Animated.Value(100)).current;
    const float1 = useRef(new Animated.Value(0)).current;
    const float2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
        ]).start();

        // Ambient animations
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
    }, []);

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await forgotPassword(email);
            setStage(2);
            Alert.alert('Success', `OTP sent to ${email}`);
        } catch (error) {
            Alert.alert('Error', error.userMessage || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }

        setLoading(true);
        try {
            await verifyOtp(email, otp);
            setStage(3);
        } catch (error) {
            Alert.alert('Error', error.userMessage || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, newPassword);
            Alert.alert('Success', 'Password reset successfully', [
                { text: 'Login', onPress: () => navigation.replace('Login') }
            ]);
        } catch (error) {
            Alert.alert('Error', error.userMessage || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        value,
        setValue,
        placeholder,
        icon,
        isPassword = false,
        keyboardType = 'default',
        id // identifier for focus
    ) => (
        <View style={[
            styles.inputContainer,
            focusedInput === id && styles.inputFocused,
        ]}>
            <LinearGradient
                colors={focusedInput === id
                    ? ['rgba(207, 126, 43, 0.2)', 'rgba(157, 71, 10, 0.1)']
                    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                style={styles.inputGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.inputIconContainer}>
                    <Icon
                        name={icon}
                        size={22}
                        color={focusedInput === id ? '#CF7E2B' : '#888888'}
                    />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#666666"
                    keyboardType={keyboardType}
                    autoCapitalize="none"
                    secureTextEntry={isPassword && !showPassword}
                    value={value}
                    onChangeText={setValue}
                    onFocus={() => setFocusedInput(id)}
                    onBlur={() => setFocusedInput(null)}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}>
                        <Icon
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={22}
                            color="#888888"
                        />
                    </TouchableOpacity>
                )}
            </LinearGradient>
        </View>
    );

    // Dynamic floating shapes
    const translateY1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });
    const translateY2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F0F0F" translucent />

            {/* Background */}
            <LinearGradient
                colors={['#0F0F0F', '#1A1A1A', '#252525']}
                style={styles.backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Animated Shapes */}
            <Animated.View style={[styles.floatingShape, styles.shape1, { transform: [{ translateY: translateY1 }], opacity: fadeAnim }]}>
                <LinearGradient colors={['rgba(207, 126, 43, 0.3)', 'rgba(157, 71, 10, 0.1)']} style={styles.shapeGradient} />
            </Animated.View>
            <Animated.View style={[styles.floatingShape, styles.shape2, { transform: [{ translateY: translateY2 }], opacity: fadeAnim }]}>
                <LinearGradient colors={['rgba(207, 126, 43, 0.2)', 'rgba(157, 71, 10, 0.05)']} style={styles.shapeGradient} />
            </Animated.View>

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Icon name="arrow-left" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {stage === 1 ? 'Forgot Password' : stage === 2 ? 'Verify OTP' : 'Reset Password'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {stage === 1 ? 'Enter your email to receive a code'
                                : stage === 2 ? `Enter the code sent to ${email}`
                                    : 'Create a new secure password'}
                        </Text>
                    </Animated.View>

                    {/* Form Card */}
                    <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: cardAnim }] }]}>
                        <View style={styles.glassOverlay} />

                        {stage === 1 && (
                            <>
                                {renderInput(email, setEmail, 'Email Address', 'email-outline', false, 'email-address', 'email')}
                                <TouchableOpacity
                                    style={[styles.actionButton, loading && styles.disabledButton]}
                                    onPress={handleSendOtp}
                                    disabled={loading}>
                                    <LinearGradient
                                        colors={['#CF7E2B', '#9D470A', '#7A3508']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}>
                                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Send OTP</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {stage === 2 && (
                            <>
                                {renderInput(otp, setOtp, 'Enter OTP', 'message-text-outline', false, 'number-pad', 'otp')}
                                <TouchableOpacity
                                    style={[styles.actionButton, loading && styles.disabledButton]}
                                    onPress={handleVerifyOtp}
                                    disabled={loading}>
                                    <LinearGradient
                                        colors={['#CF7E2B', '#9D470A', '#7A3508']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}>
                                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Verify Code</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setStage(1)} style={styles.linkButton}>
                                    <Text style={styles.linkText}>Change Email</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {stage === 3 && (
                            <>
                                {renderInput(newPassword, setNewPassword, 'New Password', 'lock-outline', true, 'default', 'newPass')}
                                {renderInput(confirmPassword, setConfirmPassword, 'Confirm Password', 'lock-check-outline', true, 'default', 'confirmPass')}
                                <TouchableOpacity
                                    style={[styles.actionButton, loading && styles.disabledButton]}
                                    onPress={handleResetPassword}
                                    disabled={loading}>
                                    <LinearGradient
                                        colors={['#CF7E2B', '#9D470A', '#7A3508']}
                                        style={styles.buttonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}>
                                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Update Password</Text>}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

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
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 10,
        letterSpacing: 0.5,
        marginTop: 10,
        fontFamily: 'Barlow',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 0.3,
        textAlign: 'center',
        fontFamily: 'Barlow',
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
        fontFamily: 'Barlow',
    },
    eyeIcon: {
        padding: 16,
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 10,
        shadowColor: '#CF7E2B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonGradient: {
        height: 58,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
        fontFamily: 'Barlow',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#CF7E2B',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'Barlow',
    },
});

export default ForgotPasswordScreen;
