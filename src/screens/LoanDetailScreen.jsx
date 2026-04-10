import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, FlatList,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loanService } from '../services/loanService';
import { COLORS } from '../constants/colors';

const InfoRow = ({ label, value, valueColor }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
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

export default function LoanDetailScreen({ route, navigation }) {
    const { loanId } = route.params;
    const [loan, setLoan] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [loanRes, paymentsRes] = await Promise.all([
                loanService.getLoan(loanId),
                loanService.getPayments(loanId),
            ]);
            setLoan(loanRes.data.data);
            setPayments(paymentsRes.data.data || []);
        } catch {
            Alert.alert('Error', 'Failed to load loan details.');
        } finally {
            setLoading(false);
        }
    }, [loanId]);

    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

    const handleMarkSettled = async () => {
        Alert.alert('Mark Settled', 'Mark this loan as fully settled?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Settle', onPress: async () => {
                    try {
                        await loanService.updateLoan(loanId, { ...loan, status: 'settled' });
                        fetchData();
                    } catch { Alert.alert('Error', 'Failed to update loan.'); }
                }
            }
        ]);
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
    if (!loan) return <View style={styles.center}><Text style={{ color: COLORS.textMuted }}>Loan not found.</Text></View>;

    // Simple interest: SI = P × R × T / 100
    const calcInterest = (l) => {
        if (!l || !l.interest_rate || l.interest_rate <= 0) return 0;
        const start = new Date(l.start_date);
        const end = l.due_date ? new Date(l.due_date) : new Date();
        const diffMs = Math.max(end - start, 0);
        const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
        return Math.round((l.principal_amount * l.interest_rate * years) / 100 * 100) / 100;
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const fmtAmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

    const progress = loan.principal_amount > 0
        ? Math.min(((loan.paid_amount || 0) / loan.principal_amount) * 100, 100)
        : 0;
    const remaining = Math.max(0, Number(loan.remaining_amount));
    const interestAmount = calcInterest(loan);
    const totalDue = Number(loan.principal_amount) + interestAmount;
    const isGiven = loan.type === 'given';

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header Card */}
            <LinearGradient
                colors={isGiven ? [COLORS.success, '#20C997'] : [COLORS.danger, COLORS.accent]}
                style={styles.headerCard}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.headerName}>{loan.borrower_name}</Text>
                        <Text style={styles.headerType}>{isGiven ? '📤 Money Given' : '📥 Money Taken'}</Text>
                        {loan.borrower_contact && <Text style={styles.headerContact}>{loan.borrower_contact}</Text>}
                    </View>
                    <StatusBadge status={loan.status} />
                </View>

                <Text style={styles.principalLabel}>Principal Amount</Text>
                <Text style={styles.principalAmount}>{fmtAmt(loan.principal_amount)}</Text>
                {interestAmount > 0 && (
                    <View style={styles.interestRow}>
                        <View style={styles.interestItem}>
                            <Text style={styles.interestLabel}>Interest ({loan.interest_rate}% p.a.)</Text>
                            <Text style={styles.interestValue}>+ {fmtAmt(interestAmount)}</Text>
                        </View>
                        <View style={styles.interestItem}>
                            <Text style={styles.interestLabel}>Total Due</Text>
                            <Text style={styles.interestValue}>{fmtAmt(totalDue)}</Text>
                        </View>
                    </View>
                )}

                {/* Progress */}
                <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressText}>Paid {progress.toFixed(0)}%  •  {fmtAmt(loan.paid_amount)}</Text>
                    <Text style={styles.progressText}>Remaining {fmtAmt(remaining)}</Text>
                </View>
            </LinearGradient>

            {/* Details */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Loan Details</Text>
                <InfoRow label="Interest Rate" value={`${loan.interest_rate || 0}% p.a.`} />
                {interestAmount > 0 && <InfoRow label="Interest Amount" value={fmtAmt(interestAmount)} valueColor={COLORS.warning} />}
                {interestAmount > 0 && <InfoRow label="Total Due (P + I)" value={fmtAmt(totalDue)} valueColor={COLORS.primary} />}
                <InfoRow label="Start Date" value={fmtDate(loan.start_date)} />
                <InfoRow label="Due Date" value={fmtDate(loan.due_date)} valueColor={loan.status === 'overdue' ? COLORS.danger : undefined} />
                {loan.notes && <InfoRow label="Notes" value={loan.notes} />}
            </View>

            {/* Actions */}
            {loan.status !== 'settled' && (
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: COLORS.primaryLight }]}
                        onPress={() => navigation.navigate('AddPayment', { loanId: loan.id, remaining })}
                    >
                        <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
                        <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Record Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: COLORS.successLight }]}
                        onPress={handleMarkSettled}
                    >
                        <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.success} />
                        <Text style={[styles.actionBtnText, { color: COLORS.success }]}>Mark Settled</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Payment History */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Payment History ({payments.length})</Text>
                {payments.length === 0 ? (
                    <Text style={styles.emptyHistory}>No payments recorded yet.</Text>
                ) : (
                    payments.map((p, idx) => (
                        <View key={p.id} style={[styles.paymentItem, idx < payments.length - 1 && styles.paymentBorder]}>
                            <View style={styles.paymentIconWrap}>
                                <Ionicons name="checkmark" size={14} color={COLORS.success} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.paymentAmount}>{fmtAmt(p.amount)}</Text>
                                {p.note ? <Text style={styles.paymentNote}>{p.note}</Text> : null}
                            </View>
                            <Text style={styles.paymentDate}>{fmtDate(p.payment_date)}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerCard: { margin: 16, borderRadius: 20, padding: 20 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    headerName: { fontSize: 22, fontWeight: '800', color: '#fff' },
    headerType: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
    headerContact: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
    principalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 2 },
    principalAmount: { fontSize: 30, fontWeight: '900', color: '#fff', marginBottom: 16 },
    progressBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    progressText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    card: {
        backgroundColor: COLORS.surface, borderRadius: 16, marginHorizontal: 16, marginBottom: 12,
        padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    infoLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    infoValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
    actionsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: 12, borderRadius: 12,
    },
    actionBtnText: { fontSize: 13, fontWeight: '700' },
    emptyHistory: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 16 },
    paymentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
    paymentBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
    paymentIconWrap: {
        width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.successLight,
        alignItems: 'center', justifyContent: 'center',
    },
    paymentAmount: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    paymentNote: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
    paymentDate: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
    interestRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, marginBottom: 12 },
    interestItem: { alignItems: 'center' },
    interestLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 2 },
    interestValue: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
