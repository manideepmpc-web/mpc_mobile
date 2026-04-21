// src/store/authStore.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';
import { authService } from '../services';
import DEMO_MODE from '../config/demoMode';
import mockAuthService from '../services/mockAuthService';

const AuthContext = createContext();

const initialState = {
    token: null,
    user: null,
    isLoading: true,      // true until we check AsyncStorage
    isAuthenticated: false,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, token: action.payload.token, user: action.payload.user, isAuthenticated: true, isLoading: false };
        case 'LOGOUT':
            return { ...state, token: null, user: null, isAuthenticated: false, isLoading: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => { loadStoredToken(); }, []);

    // On app start — check if we have a saved token
    const loadStoredToken = async () => {
        try {
            const token = await AsyncStorage.getItem('moneytracker_token');
            const userStr = await AsyncStorage.getItem('moneytracker_user');
            if (token && userStr) {
                setAuthToken(token);
                // Verify token is still valid by calling /me
                try {
                    await authService.getMe();
                    dispatch({ type: 'LOGIN', payload: { token, user: JSON.parse(userStr) } });
                } catch {
                    // Token expired — clear and show Login
                    await clearStorage();
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        } catch {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const clearStorage = async () => {
        try {
            await AsyncStorage.removeItem('moneytracker_token');
            await AsyncStorage.removeItem('moneytracker_user');
        } catch (err) {
            console.error('Error clearing storage:', err);
        }
        setAuthToken(null);
    };

    const login = async (email, password) => {
        try {
            // Use mock auth in demo mode, real auth otherwise
            const authService_ = DEMO_MODE ? mockAuthService : authService;
            const res = await authService_.login(email, password);
            const { token, employee } = res.data.data;
            await AsyncStorage.setItem('moneytracker_token', token);
            await AsyncStorage.setItem('moneytracker_user', JSON.stringify(employee));
            setAuthToken(token);
            dispatch({ type: 'LOGIN', payload: { token, user: employee } });
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed. Check your credentials.',
            };
        }
    };

    // Called after OTP verification is successful — registers the user, then logs them in.
    // Backend /auth/register returns { employee_id } only, so we chain a login call.
    const register = async (formData) => {
        try {
            // Use mock auth in demo mode, real auth otherwise
            const authService_ = DEMO_MODE ? mockAuthService : authService;

            // Step 1: Create the account
            await authService_.register(formData);

            // Step 2: Login to get token + full employee data
            const loginRes = await authService_.login(formData.email, formData.password);
            const { token, employee } = loginRes.data.data;

            await AsyncStorage.setItem('moneytracker_token', token);
            await AsyncStorage.setItem('moneytracker_user', JSON.stringify(employee));
            setAuthToken(token);
            dispatch({ type: 'LOGIN', payload: { token, user: employee } });
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || 'Registration failed. Please try again.',
            };
        }
    };

    const logout = async () => {
        dispatch({ type: 'LOGOUT' });
        await clearStorage();
    };

    const updateUser = (userData) => {
        dispatch({ type: 'UPDATE_USER', payload: userData });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
