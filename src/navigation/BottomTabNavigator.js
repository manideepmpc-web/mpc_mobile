import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import DashboardScreen from '../screens/DashboardScreen';
import LoansScreen from '../screens/LoansScreen';
import LoanHistoryScreen from '../screens/LoanHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const GradientIcon = ({ name, size }) => (
    <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 48, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
    >
        <Ionicons name={name} size={size} color={COLORS.white} />
    </LinearGradient>
);

const tabs = [
    { name: 'Dashboard', component: DashboardScreen, icon: 'home' },
    { name: 'Loans', component: LoansScreen, icon: 'cash' },
    { name: 'History', component: LoanHistoryScreen, icon: 'time' },
    { name: 'Profile', component: ProfileScreen, icon: 'person' },
];

const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();
    // Ensure tab bar always sits above the system nav buttons
    const bottomPad = Platform.OS === 'android'
        ? Math.max(insets.bottom, 10)
        : insets.bottom || 24;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const tab = tabs.find((t) => t.name === route.name);
                return {
                    tabBarIcon: ({ focused, size }) => (
                        <View style={{ width: 48, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                            {focused ? (
                                <GradientIcon name={tab.icon} size={size - 2} />
                            ) : (
                                <Ionicons name={`${tab.icon}-outline`} size={size + 2} color={COLORS.textMuted} />
                            )}
                        </View>
                    ),
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textMuted,
                    tabBarStyle: {
                        backgroundColor: COLORS.white,
                        borderTopWidth: 1,
                        borderTopColor: COLORS.border,
                        height: 58 + bottomPad,
                        paddingBottom: bottomPad,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: COLORS.white,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: COLORS.border,
                    },
                    headerTitleStyle: {
                        fontWeight: '800',
                        color: COLORS.textPrimary,
                        fontSize: 18,
                    },
                };
            }}
        >
            {tabs.map((tab) => (
                <Tab.Screen
                    key={tab.name}
                    name={tab.name}
                    component={tab.component}
                    // Hide the default header on Dashboard & Profile since they have custom gradient headers
                    options={['Dashboard', 'History', 'Profile'].includes(tab.name) ? { headerShown: false } : {}}
                />
            ))}
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
