import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, RefreshControl, Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../store/authStore';
import { loanService } from '../services/loanService';
import { COLORS } from '../constants/colors';

const StatRow = ({ icon, label, value, color }) => (
    <View style={styles.statRow}>
        <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
);

const MenuRow = ({ icon, label, subtitle, color, onPress, isDanger, noBorder, noChevron }) => (
    <TouchableOpacity
        style={[styles.menuRow, noBorder && { borderBottomWidth: 0 }]}
        onPress={onPress}
        activeOpacity={0.75}
    >
        <View style={[styles.menuIcon, { backgroundColor: (color || COLORS.primary) + '18' }]}>
            <Ionicons name={icon} size={18} color={color || COLORS.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.menuLabel, isDanger && { color: COLORS.danger }]}>{label}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
        {!noChevron && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
    </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await loanService.getSummary();
            setSummary(res.data.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            Alert.alert('Error', 'Failed to logout.');
        }
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Hero */}
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]} style={styles.hero}>
                <View style={styles.avatarWrap}>
                    <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={styles.avatarBorder}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    </LinearGradient>
                </View>
                <Text style={styles.heroName}>{user?.name || 'User'}</Text>
                <Text style={styles.heroEmail}>{user?.email || ''}</Text>
                {user?.phone && (
                    <View style={styles.heroPill}>
                        <Ionicons name="call-outline" size={13} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.heroPillText}>{user.phone}</Text>
                    </View>
                )}
            </LinearGradient>

            {/* Loan Stats */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>My Loan Stats</Text>
                <StatRow icon="layers-outline" label="Total Loans" value={summary?.total_loans || 0} color={COLORS.primary} />
                <StatRow icon="arrow-up-circle-outline" label="Total Given" value={`₹${Number(summary?.total_given || 0).toLocaleString('en-IN')}`} color={COLORS.success} />
                <StatRow icon="arrow-down-circle-outline" label="Total Taken" value={`₹${Number(summary?.total_taken || 0).toLocaleString('en-IN')}`} color={COLORS.danger} />
                <StatRow icon="cash-outline" label="Pending Receivable" value={`₹${Number(summary?.pending_receivable || 0).toLocaleString('en-IN')}`} color={COLORS.info} />
                <StatRow icon="wallet-outline" label="Pending Payable" value={`₹${Number(summary?.pending_payable || 0).toLocaleString('en-IN')}`} color={COLORS.warning} />
                {(summary?.overdue_count > 0) && (
                    <StatRow icon="warning-outline" label="Overdue Loans" value={summary.overdue_count} color={COLORS.danger} />
                )}
            </View>

            {/* Quick Nav */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Quick Navigation</Text>
                <MenuRow icon="home-outline" label="Dashboard" subtitle="Overview & summary" color={COLORS.primary} onPress={() => navigation.navigate('Dashboard')} />
                <MenuRow icon="cash-outline" label="My Loans" subtitle="All given & taken loans" color={COLORS.success} onPress={() => navigation.navigate('Loans')} />
                <MenuRow icon="add-circle-outline" label="Add New Loan" subtitle="Record a new loan" color={COLORS.accent} onPress={() => navigation.navigate('AddLoan')} />
                <MenuRow icon="time-outline" label="Payment History" subtitle="All repayments" color={COLORS.info} onPress={() => navigation.navigate('History')} />
            </View>

            {/* Account */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{user?.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
                {user?.designation && (
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Role</Text>
                        <Text style={styles.infoValue}>{user.designation}</Text>
                    </View>
                )}
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleLogout}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#FF4B2B', '#FF416C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.logoutGradient}
                >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutBtnText}>Logout Account Now</Text>
                </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.versionText}>Money Tracker v1.0.3</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    hero: { paddingTop: 52, paddingBottom: 32, alignItems: 'center', paddingHorizontal: 20 },
    avatarWrap: { marginBottom: 14 },
    avatarBorder: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', padding: 3 },
    avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
    heroName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
    heroPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5,
    },
    heroPillText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    card: {
        backgroundColor: COLORS.surface, borderRadius: 16, marginHorizontal: 16, marginTop: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
    statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10 },
    statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    statLabel: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
    statValue: { fontSize: 14, fontWeight: '800' },
    menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    menuLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    menuSubtitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    infoLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    infoValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
    logoutBtn: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
        borderRadius: 14,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#FF416C',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    logoutBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    versionText: {
        textAlign: 'center',
        color: COLORS.textMuted,
        fontSize: 11,
        marginTop: 10,
        marginBottom: 20,
    },
});
