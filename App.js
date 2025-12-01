/**
 * ProGlide - Mobile Accessory Finder App
 * Main Application Entry Point
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigator from './src/navigation/Navigator';
import { ThemeProvider } from './src/context/ThemeContext';

const App = () => {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <Navigator />
            </ThemeProvider>
        </SafeAreaProvider>
    );
};

export default App;
