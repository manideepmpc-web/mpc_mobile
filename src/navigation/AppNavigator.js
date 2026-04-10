import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import SignupScreen from '../screens/SignupScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import LoanDetailScreen from '../screens/LoanDetailScreen';
import AddLoanScreen from '../screens/AddLoanScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
                <ActivityIndicator size="large" color={COLORS.white} />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Unauthenticated flow */}
            {!isAuthenticated ? (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Main" component={BottomTabNavigator} />
                    {/* Loan module screens */}
                    <Stack.Screen name="LoanDetail" component={LoanDetailScreen} options={{ headerShown: true, title: 'Loan Details', headerStyle: { backgroundColor: COLORS.white }, headerTintColor: COLORS.primary, headerTitleStyle: { fontWeight: '800', color: COLORS.textPrimary } }} />
                    <Stack.Screen name="AddLoan" component={AddLoanScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AddPayment" component={AddPaymentScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;
