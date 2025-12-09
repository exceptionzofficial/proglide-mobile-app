import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API base URL - Update this to match your backend server
const BASE_URL = 'https://proglide-backend.vercel.app/api';
// For local development with Android emulator: http://10.0.2.2:5000/api
// For iOS simulator: http://localhost:5000/api
// For physical device: http://YOUR_LOCAL_IP:5000/api

// Create axios instance with extended timeout for slow connections
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 seconds timeout for slower connections
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async config => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('Failed to get auth token:', e);
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

// Response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            // Timeout error
            console.error('Request Timeout:', error.message);
            error.userMessage = 'Connection timed out. Please check your internet and try again.';
        } else if (error.response) {
            // Server responded with error
            console.error('API Error:', error.response.status, error.response.data);
            error.userMessage = error.response.data?.message || 'Server error. Please try again.';
        } else if (error.request) {
            // Request made but no response (network error)
            console.error('Network Error:', error.message);
            error.userMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
            // Something else happened
            console.error('Error:', error.message);
            error.userMessage = 'An unexpected error occurred. Please try again.';
        }
        return Promise.reject(error);
    },
);

// ===== AUTH APIs =====

export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            await AsyncStorage.setItem('userToken', response.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async userData => {
    try {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            await AsyncStorage.setItem('userToken', response.data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
    } catch (error) {
        console.error('Logout error:', error);
    }
};

export const getCurrentUser = async () => {
    try {
        const userDataString = await AsyncStorage.getItem('userData');
        return userDataString ? JSON.parse(userDataString) : null;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

export const isAuthenticated = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        return !!token;
    } catch (error) {
        return false;
    }
};

// ===== PRODUCT APIs =====

export const getProducts = async (category = null) => {
    try {
        const params = category ? { category } : {};
        const response = await api.get('/products', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const searchProducts = async (query, category = null) => {
    try {
        const products = await getProducts(category);
        // Client-side search in compatible devices
        return products.filter(product =>
            product.compatibleDevices?.toLowerCase().includes(query.toLowerCase()),
        );
    } catch (error) {
        throw error;
    }
};

export default api;
