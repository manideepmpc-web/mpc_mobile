import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    RefreshControl, Alert, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loanService } from '../services/loanService';
import { COLORS } from '../constants/colors';

export default function LoanHistoryScreen({ navigation }) {
    const [allPayments, setAllPayments] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const loansRes = await loanService.getLoans();
            const loanList = loansRes.data.data || [];
            setLoans(loanList);

            // Fetch payments for every loan in parallel
            const paymentResults = await Promise.allSettled(
                loanList.map(async (loan) => {
                    const pRes = await loanService.getPayments(loan.id);
                    return (pRes.data.data || []).map((p) => ({
                        ...p,
                        loanBorrower: loan.borrower_name,
                        loanType: loan.type,
                        loanId: loan.id,
                    }));
                })
            );

            const flat = paymentResults
                .filter((r) => r.status === 'fulfilled')
                .flatMap((r) => r.value)
                .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

            setAllPayments(flat);
        } catch {
            Alert.alert('Development Mode', 'App is under development mode.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const totalPaid = allPayments.reduce((s, p) => s + Number(p.amount), 0);

    const fmtDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const fmtAmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

    const renderItem = ({ item, index }) => {
        const isGiven = item.loanType === 'given';
        return (
            <TouchableOpacity
                style={styles.paymentCard}
                onPress={() => navigation.navigate('LoanDetail', { loanId: item.loanId })}
                activeOpacity={0.8}
            >
                <View style={[styles.iconWrap, { backgroundColor: isGiven ? COLORS.successLight : COLORS.dangerLight }]}>
                    <Ionicons name={isGiven ? 'arrow-up' : 'arrow-down'} size={16} color={isGiven ? COLORS.success : COLORS.danger} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.borrowerName}>{item.loanBorrower}</Text>
                    <Text style={styles.noteText}>{item.note || (isGiven ? 'Repayment received' : 'Payment made')}</Text>
                    <Text style={styles.dateText}>{fmtDate(item.payment_date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.amtText, { color: isGiven ? COLORS.success : COLORS.danger }]}>
                        {isGiven ? '+' : '-'} {fmtAmt(item.amount)}
                    </Text>
                    <Text style={styles.loanTypeLabel}>{isGiven ? 'Given' : 'Taken'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.header}>
                <Text style={styles.headerTitle}>Payment History</Text>
                <Text style={styles.headerSub}>All loan repayments — {allPayments.length} transactions</Text>
                <View style={styles.totalWrap}>
                    <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Total Transactions</Text>
                        <Text style={styles.totalValue}>{allPayments.length}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>{fmtAmt(totalPaid)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Loans</Text>
                        <Text style={styles.totalValue}>{loans.length}</Text>
                    </View>
                </View>
            </LinearGradient>

            <FlatList
                data={allPayments}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); fetchData(); }}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="time-outline" size={56} color={COLORS.textMuted} />
                        <Text style={styles.emptyTitle}>No payment history yet</Text>
                        <Text style={styles.emptySub}>Record a payment on any loan to see it here.</Text>
                        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Loans')}>
                            <Text style={styles.emptyBtnText}>View Loans</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 20 },
    totalWrap: {
        flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 14, paddingVertical: 14, paddingHorizontal: 12,
    },
    totalItem: { flex: 1, alignItems: 'center' },
    totalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
    totalValue: { fontSize: 16, fontWeight: '900', color: '#fff' },
    divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
    paymentCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: 14, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
    },
    iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    borrowerName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    noteText: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
    dateText: { fontSize: 11, color: COLORS.textMuted, marginTop: 3, fontWeight: '500' },
    amtText: { fontSize: 15, fontWeight: '800' },
    loanTypeLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary, marginTop: 16 },
    emptySub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },
    emptyBtn: { marginTop: 20, backgroundColor: COLORS.primaryLight, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
    emptyBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});
