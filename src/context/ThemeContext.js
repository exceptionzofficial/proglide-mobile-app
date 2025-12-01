import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
    mode: 'light',
    colors: {
        background: '#F3F4F6',
        card: '#FFFFFF',
        text: '#1F2937',
        textSecondary: '#6B7280',
        primary: '#9D470A',
        primaryLight: '#FFF7ED', // Very light orange for backgrounds
        border: '#E5E7EB',
        error: '#EF4444',
        success: '#10B981',
        tint: '#FFF7ED',
        icon: '#6B7280',
        inputBg: '#F9FAFB',
        placeholder: '#9CA3AF',
        statusBar: 'light-content',
        statusBarBg: '#9D470A',
    },
};

export const darkTheme = {
    mode: 'dark',
    colors: {
        background: '#111827', // Gray 900
        card: '#1F2937', // Gray 800
        text: '#F9FAFB', // Gray 50
        textSecondary: '#9CA3AF', // Gray 400
        primary: '#F97316', // Orange 500 (Brighter for dark mode)
        primaryLight: 'rgba(249, 115, 22, 0.15)',
        border: '#374151', // Gray 700
        error: '#F87171',
        success: '#34D399',
        tint: 'rgba(249, 115, 22, 0.15)',
        icon: '#9CA3AF',
        inputBg: '#374151',
        placeholder: '#6B7280',
        statusBar: 'light-content',
        statusBarBg: '#1F2937', // Match card/header color in dark mode
    },
};

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');
    const [theme, setTheme] = useState(isDark ? darkTheme : lightTheme);

    useEffect(() => {
        loadTheme();
    }, []);

    useEffect(() => {
        setTheme(isDark ? darkTheme : lightTheme);
        saveTheme(isDark);
    }, [isDark]);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('themeMode');
            if (savedTheme !== null) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const saveTheme = async (darkMode) => {
        try {
            await AsyncStorage.setItem('themeMode', darkMode ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        setIsDark(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
