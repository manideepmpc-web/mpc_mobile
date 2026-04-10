import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
        style={{ width: size + 16, height: size + 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: -4 }}
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

const BottomTabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => {
            const tab = tabs.find((t) => t.name === route.name);
            return {
                tabBarIcon: ({ focused, size }) =>
                    focused
                        ? <GradientIcon name={tab.icon} size={size - 2} />
                        : <Ionicons name={`${tab.icon}-outline`} size={size} color={COLORS.textMuted} />,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 64,
                    paddingBottom: 10,
                    paddingTop: 6,
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

export default BottomTabNavigator;
