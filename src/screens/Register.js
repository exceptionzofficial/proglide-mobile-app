import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { register } from '../services/api';
import { useTheme } from '../context/ThemeContext';

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

    const { theme, isDark } = useTheme();
    const { colors } = theme;

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

        setLoading(true);
        try {
            await register({ name, email, phone, shopName, password });
            Alert.alert('Success', 'Registration successful!', [
                { text: 'OK', onPress: () => navigation.replace('Home') },
            ]);
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert(
                'Registration Failed',
                error.response?.data?.message || 'Something went wrong. Please try again.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle="light-content" backgroundColor={colors.statusBarBg} />

            {/* Background Gradient */}
            <View style={[styles.gradientTop, { backgroundColor: colors.primary }]} />
            <View style={[styles.gradientBottom, { backgroundColor: isDark ? colors.card : '#5B21B6' }]} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join ProGlide today</Text>
                </View>

                {/* Form Card */}
                <View style={[styles.formCard, { backgroundColor: colors.card }]}>
                    {/* Name Input */}
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.inputBg : '#F3F4F6' }]}>
                        <Icon name="account-outline" size={22} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Full Name"
                            placeholderTextColor={colors.placeholder}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.inputBg : '#F3F4F6' }]}>
                        <Icon name="email-outline" size={22} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Email Address"
                            placeholderTextColor={colors.placeholder}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Phone Input */}
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.inputBg : '#F3F4F6' }]}>
                        <Icon name="phone-outline" size={22} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Phone Number"
                            placeholderTextColor={colors.placeholder}
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    {/* Shop Name Input */}
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.inputBg : '#F3F4F6' }]}>
                        <Icon name="store-outline" size={22} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Shop Name"
                            placeholderTextColor={colors.placeholder}
                            value={shopName}
                            onChangeText={setShopName}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.inputBg : '#F3F4F6' }]}>
                        <Icon name="lock-outline" size={22} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Password"
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Icon
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={22}
                                color={colors.icon}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View style={[styles.inputContainer, { backgroundColor: isDark ? colors.inputBg : '#F3F4F6' }]}>
                        <Icon name="lock-check-outline" size={22} color={colors.icon} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Confirm Password"
                            placeholderTextColor={colors.placeholder}
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                            <Icon
                                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={22}
                                color={colors.icon}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.registerButton, { backgroundColor: colors.primary }, loading && styles.registerButtonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.registerButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={[styles.loginText, { color: colors.textSecondary }]}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.loginLink, { color: colors.primary }]}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientTop: {
        position: 'absolute',
        top: -100,
        left: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    gradientBottom: {
        position: 'absolute',
        bottom: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        paddingTop: 40,
    },
    header: {
        marginBottom: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    formCard: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 4,
    },
    registerButton: {
        borderRadius: 12,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default Register;
