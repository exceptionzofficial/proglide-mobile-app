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
        primary: '#9D470A', // Rust Orange
        primaryLight: '#FFF7ED',
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
    borderRadius: 0, // Sharp corners
};

export const darkTheme = {
    mode: 'dark',
    colors: {
        background: '#111827',
        card: '#1F2937',
        text: '#F9FAFB',
        textSecondary: '#9CA3AF',
        primary: '#9D470A', // Rust Orange (Consistent)
        primaryLight: 'rgba(157, 71, 10, 0.2)',
        border: '#374151',
        error: '#F87171',
        success: '#34D399',
        tint: 'rgba(157, 71, 10, 0.2)',
        icon: '#9CA3AF',
        inputBg: '#374151',
        placeholder: '#6B7280',
        statusBar: 'light-content',
        statusBarBg: '#1F2937',
    },
    borderRadius: 0, // Sharp corners
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
