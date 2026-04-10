import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loanService } from '../services/loanService';
import { COLORS } from '../constants/colors';

const FILTERS = ['All', 'Given', 'Taken'];

const SummaryCard = ({ label, value, icon, color, bg }) => (
    <View style={[styles.summaryCard, { backgroundColor: bg }]}>
        <View style={[styles.summaryIcon, { backgroundColor: color + '22' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.summaryValue, { color }]}>₹{Number(value || 0).toLocaleString('en-IN')}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const StatusBadge = ({ status }) => {
    const map = {
        active: { color: COLORS.info, bg: COLORS.infoLight, label: 'Active' },
        settled: { color: COLORS.success, bg: COLORS.successLight, label: 'Settled' },
        overdue: { color: COLORS.danger, bg: COLORS.dangerLight, label: 'Overdue' },
    };
    const s = map[status] || map.active;
    return (
        <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
    );
};

export default function LoansScreen({ navigation }) {
    const [summary, setSummary] = useState(null);
    const [loans, setLoans] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [sumRes, loansRes] = await Promise.all([
                loanService.getSummary(),
                loanService.getLoans(),
            ]);
            setSummary(sumRes.data.data);
            setLoans(loansRes.data.data || []);
        } catch (e) {
            Alert.alert('Error', 'Failed to load loans. Please check your connection.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const filteredLoans = loans.filter(l => {
        if (filter === 'Given') return l.type === 'given';
        if (filter === 'Taken') return l.type === 'taken';
        return true;
    });

    const handleDelete = (id) => {
        Alert.alert('Delete Loan', 'Are you sure you want to delete this loan?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await loanService.deleteLoan(id);
                        fetchData();
                    } catch {
                        Alert.alert('Error', 'Failed to delete loan.');
                    }
                }
            },
        ]);
    };

    const renderLoan = ({ item }) => {
        const progress = item.principal_amount > 0
            ? Math.min(((item.paid_amount || 0) / item.principal_amount) * 100, 100)
            : 0;
        const isGiven = item.type === 'given';

        return (
            <TouchableOpacity
                style={styles.loanCard}
                onPress={() => navigation.navigate('LoanDetail', { loanId: item.id })}
                activeOpacity={0.85}
            >
                <View style={styles.loanCardHeader}>
                    <View style={styles.loanTypeIcon}>
                        <LinearGradient
                            colors={isGiven ? [COLORS.success, '#20C997'] : [COLORS.danger, '#E0386A']}
                            style={styles.typeGradient}
                        >
                            <Ionicons name={isGiven ? 'arrow-up-outline' : 'arrow-down-outline'} size={16} color="#fff" />
                        </LinearGradient>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.borrowerName}>{item.borrower_name}</Text>
                            <Text style={styles.loanType}>{isGiven ? 'Money Given' : 'Money Taken'}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <StatusBadge status={item.status} />
                        <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.amountRow}>
                    <View>
                        <Text style={styles.amountLabel}>Principal</Text>
                        <Text style={styles.amountValue}>₹{Number(item.principal_amount).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.amountLabel}>Remaining</Text>
                        <Text style={[styles.amountValue, { color: item.remaining_amount <= 0 ? COLORS.success : COLORS.danger }]}>
                            ₹{Math.max(0, Number(item.remaining_amount)).toLocaleString('en-IN')}
                        </Text>
                    </View>
                </View>

                <View style={styles.progressBg}>
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressText}>Paid {progress.toFixed(0)}%</Text>
                    {item.due_date && (
                        <Text style={[styles.progressText, item.status === 'overdue' && { color: COLORS.danger }]}>
                            Due: {new Date(item.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Summary */}
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.headerGradient}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
                    <SummaryCard label="Total Given" value={summary?.total_given} icon="arrow-up-circle" color="#00C896" bg="#fff" />
                    <SummaryCard label="Total Taken" value={summary?.total_taken} icon="arrow-down-circle" color={COLORS.danger} bg="#fff" />
                    <SummaryCard label="Receivable" value={summary?.pending_receivable} icon="cash" color={COLORS.info} bg="#fff" />
                    <SummaryCard label="Payable" value={summary?.pending_payable} icon="wallet" color={COLORS.warning} bg="#fff" />
                </ScrollView>
            </LinearGradient>

            {/* Filters */}
            <View style={styles.filterRow}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
                {(summary?.overdue_count > 0) && (
                    <View style={styles.overdueBadge}>
                        <Ionicons name="warning" size={13} color={COLORS.danger} />
                        <Text style={styles.overdueText}>{summary.overdue_count} Overdue</Text>
                    </View>
                )}
            </View>

            <FlatList
                data={filteredLoans}
                keyExtractor={i => String(i.id)}
                renderItem={renderLoan}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cash-outline" size={56} color={COLORS.textMuted} />
                        <Text style={styles.emptyText}>No loans found</Text>
                        <Text style={styles.emptySubText}>Tap + to add your first loan</Text>
                    </View>
                }
            />

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddLoan')}>
                <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.fabGradient}>
                    <Ionicons name="add" size={30} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    headerGradient: { paddingTop: 16, paddingBottom: 20, paddingHorizontal: 8 },
    summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 8 },
    summaryCard: {
        width: 130, borderRadius: 16, padding: 14, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
    },
    summaryIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    summaryValue: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    summaryLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },
    filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: 'center' },
    filterChip: {
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20,
        backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    },
    filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
    filterTextActive: { color: '#fff' },
    overdueBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
        backgroundColor: COLORS.dangerLight, marginLeft: 'auto',
    },
    overdueText: { fontSize: 12, fontWeight: '700', color: COLORS.danger },
    loanCard: {
        backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
    },
    loanCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    loanTypeIcon: { flexDirection: 'row', alignItems: 'center' },
    typeGradient: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    borrowerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
    loanType: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: '700' },
    amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    amountLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500', marginBottom: 2 },
    amountValue: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
    progressBg: { height: 6, backgroundColor: COLORS.primaryLight, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    progressText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, marginTop: 16 },
    emptySubText: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
    fab: { position: 'absolute', bottom: 24, right: 24, borderRadius: 28, overflow: 'hidden', elevation: 6, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
    fabGradient: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
});
