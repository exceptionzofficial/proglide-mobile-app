import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
    mode: 'light',
    colors: {
        background: '#F3F4F6',
        card: '#FFFFFF',
        text: '#000000',
        textSecondary: '#6B7280',
        primary: '#A04000', // Deep Burnt Orange from reference
        primaryLight: '#FFF7ED',
        border: '#E5E7EB',
        error: '#EF4444',
        success: '#10B981',
        tint: '#FFF7ED',
        icon: '#6B7280',
        inputBg: '#FFFFFF',
        placeholder: '#9CA3AF',
        statusBar: 'light-content',
        statusBarBg: '#A04000',
    },
    fontFamily: 'Barlow',
    borderRadius: 16, // Rounded corners
};

export const darkTheme = {
    mode: 'dark',
    colors: {
        background: '#111827',
        card: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#9CA3AF',
        primary: '#A04000', // Deep Burnt Orange
        primaryLight: 'rgba(160, 64, 0, 0.2)',
        border: '#374151',
        error: '#F87171',
        success: '#34D399',
        tint: 'rgba(160, 64, 0, 0.2)',
        icon: '#9CA3AF',
        inputBg: '#374151',
        placeholder: '#6B7280',
        statusBar: 'light-content',
        statusBarBg: '#1F2937',
    },
    fontFamily: 'Barlow',
    borderRadius: 16, // Rounded corners
};

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(false); // Force light mode default
    const [theme, setTheme] = useState(lightTheme); // Force light theme default

    // Force Light Mode - overriding any logic
    const forcedIsDark = false;
    const forcedTheme = lightTheme;

    return (
        <ThemeContext.Provider value={{ theme: forcedTheme, isDark: forcedIsDark, toggleTheme: () => { } }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
