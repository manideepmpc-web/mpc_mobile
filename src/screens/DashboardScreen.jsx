import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loanService } from '../services/loanService';
import { useAuth } from '../store/authStore';
import { COLORS } from '../constants/colors';

const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
        <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
            <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text style={[styles.statValue, { color }]}>₹{Number(value || 0).toLocaleString('en-IN')}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
);

const QuickAction = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient colors={[color, color + 'BB']} style={styles.quickActionIcon}>
            <Ionicons name={icon} size={22} color="#fff" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
);

export default function DashboardScreen({ navigation }) {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [recentLoans, setRecentLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [sumRes, loansRes] = await Promise.all([
                loanService.getSummary(),
                loanService.getLoans(),
            ]);
            setSummary(sumRes.data.data);
            setRecentLoans((loansRes.data.data || []).slice(0, 5));
        } catch {
            // Silent error handling for offline APK builds
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const netBalance = (summary?.pending_receivable || 0) - (summary?.pending_payable || 0);
    const isPositive = netBalance >= 0;

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 30 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
            showsVerticalScrollIndicator={false}
        >
            {/* Hero Header */}
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]} style={styles.hero}>
                <View style={styles.heroTop}>
                    <View>
                        <Text style={styles.greeting}>{greeting} 👋</Text>
                        <Text style={styles.heroName}>{user?.name || 'User'}</Text>
                    </View>
                    <TouchableOpacity style={styles.notifBtn}>
                        {(summary?.overdue_count > 0) && <View style={styles.notifDot} />}
                        <Ionicons name="notifications-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Net Balance Large */}
                <View style={styles.netBalanceWrap}>
                    <Text style={styles.netLabel}>Net Balance</Text>
                    <Text style={[styles.netValue, { color: isPositive ? '#7FFFCE' : '#FFB3B3' }]}>
                        {isPositive ? '+' : '-'} ₹{Math.abs(netBalance).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.netSubtitle}>
                        {isPositive ? 'You are owed more than you owe' : 'You owe more than you are owed'}
                    </Text>
                </View>

                {/* Overdue Alert */}
                {summary?.overdue_count > 0 && (
                    <TouchableOpacity
                        style={styles.overdueAlert}
                        onPress={() => navigation.navigate('Loans')}
                    >
                        <Ionicons name="warning" size={14} color={COLORS.warning} />
                        <Text style={styles.overdueAlertText}>
                            {summary.overdue_count} loan{summary.overdue_count > 1 ? 's are' : ' is'} overdue — Tap to review
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={COLORS.warning} />
                    </TouchableOpacity>
                )}
            </LinearGradient>

            {/* Stat Cards */}
            <View style={styles.statsGrid}>
                <StatCard icon="arrow-up-circle" label="Total Given" value={summary?.total_given} color={COLORS.success} onPress={() => navigation.navigate('Loans')} />
                <StatCard icon="arrow-down-circle" label="Total Taken" value={summary?.total_taken} color={COLORS.danger} onPress={() => navigation.navigate('Loans')} />
                <StatCard icon="cash" label="Receivable" value={summary?.pending_receivable} color={COLORS.info} />
                <StatCard icon="wallet" label="Payable" value={summary?.pending_payable} color={COLORS.warning} />
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickRow}>
                    <QuickAction icon="add-circle" label="New Loan" color={COLORS.primary} onPress={() => navigation.navigate('AddLoan')} />
                    <QuickAction icon="cash-outline" label="My Loans" color={COLORS.success} onPress={() => navigation.navigate('Loans')} />
                    <QuickAction icon="time-outline" label="History" color={COLORS.info} onPress={() => navigation.navigate('History')} />
                    <QuickAction icon="person-outline" label="Profile" color={COLORS.warning} onPress={() => navigation.navigate('Profile')} />
                </View>
            </View>

            {/* Loan Overview Bars */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.overviewCard}>
                    {[
                        { label: 'Active Loans', count: (summary?.total_loans || 0) - (summary?.overdue_count || 0), color: COLORS.info },
                        { label: 'Overdue', count: summary?.overdue_count || 0, color: COLORS.danger },
                        { label: 'Total Loans', count: summary?.total_loans || 0, color: COLORS.primary },
                    ].map((item, i) => (
                        <View key={i} style={[styles.overviewRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                            <View style={[styles.overviewDot, { backgroundColor: item.color }]} />
                            <Text style={styles.overviewLabel}>{item.label}</Text>
                            <Text style={[styles.overviewCount, { color: item.color }]}>{item.count}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Recent Loans */}
            {recentLoans.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Loans</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Loans')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    {recentLoans.map((loan) => {
                        const progress = loan.principal_amount > 0
                            ? Math.min(((loan.paid_amount || 0) / loan.principal_amount) * 100, 100) : 0;
                        const isGiven = loan.type === 'given';
                        return (
                            <TouchableOpacity
                                key={loan.id}
                                style={styles.recentCard}
                                onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.recentIcon, { backgroundColor: isGiven ? COLORS.successLight : COLORS.dangerLight }]}>
                                    <Ionicons name={isGiven ? 'arrow-up' : 'arrow-down'} size={16} color={isGiven ? COLORS.success : COLORS.danger} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.recentName}>{loan.borrower_name}</Text>
                                    <View style={styles.recentProgressBg}>
                                        <View style={[styles.recentProgressFill, { width: `${progress}%`, backgroundColor: isGiven ? COLORS.success : COLORS.danger }]} />
                                    </View>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.recentAmt}>₹{Number(loan.principal_amount).toLocaleString('en-IN')}</Text>
                                    <Text style={[styles.recentRem, { color: loan.remaining_amount <= 0 ? COLORS.success : COLORS.textMuted }]}>
                                        {loan.remaining_amount <= 0 ? 'Settled' : `₹${Number(loan.remaining_amount).toLocaleString('en-IN')} left`}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    hero: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
    heroName: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2 },
    notifBtn: { padding: 4, position: 'relative' },
    notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.warning, position: 'absolute', top: 2, right: 2, zIndex: 1 },
    netBalanceWrap: { alignItems: 'center', paddingVertical: 8 },
    netLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 6 },
    netValue: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
    netSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    overdueAlert: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 8, marginTop: 16,
    },
    overdueAlertText: { flex: 1, fontSize: 12, color: COLORS.warning, fontWeight: '600' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16, paddingBottom: 4 },
    statCard: {
        width: '47%', backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    },
    statIconWrap: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statValue: { fontSize: 17, fontWeight: '900', marginBottom: 2 },
    statLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
    section: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 10 },
    seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
    quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
    quickAction: { alignItems: 'center', gap: 6, flex: 1 },
    quickActionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    quickActionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
    overviewCard: {
        backgroundColor: COLORS.surface, borderRadius: 16, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    overviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
    overviewDot: { width: 10, height: 10, borderRadius: 5 },
    overviewLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
    overviewCount: { fontSize: 20, fontWeight: '900' },
    recentCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: 14, padding: 14, marginBottom: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
    },
    recentIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    recentName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
    recentProgressBg: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
    recentProgressFill: { height: '100%', borderRadius: 2 },
    recentAmt: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
    recentRem: { fontSize: 11, marginTop: 2, fontWeight: '500' },
});
