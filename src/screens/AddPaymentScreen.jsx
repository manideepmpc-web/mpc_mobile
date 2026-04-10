import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loanService } from '../services/loanService';
import { COLORS } from '../constants/colors';

export default function AddPaymentScreen({ route, navigation }) {
    const { loanId, remaining } = route.params;
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePayFull = () => setAmount(String(remaining));

    const handleSubmit = async () => {
        const numAmount = Number(amount);
        if (!amount || isNaN(numAmount) || numAmount <= 0) return Alert.alert('Validation', 'Enter a valid payment amount.');
        if (numAmount > remaining) return Alert.alert('Validation', `Amount cannot exceed remaining balance of ₹${remaining.toLocaleString('en-IN')}.`);
        if (!paymentDate) return Alert.alert('Validation', 'Payment date is required.');

        setLoading(true);
        try {
            await loanService.addPayment(loanId, {
                amount: numAmount,
                payment_date: paymentDate,
                note: note.trim() || null,
            });
            Alert.alert('Success', 'Payment recorded!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to record payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Record Payment</Text>
                <Text style={styles.headerSub}>Remaining Balance</Text>
                <Text style={styles.remainingAmt}>₹{Number(remaining).toLocaleString('en-IN')}</Text>
            </LinearGradient>

            <View style={styles.formCard}>
                {/* Amount */}
                <View style={styles.field}>
                    <Text style={styles.label}>Payment Amount (₹) <Text style={{ color: COLORS.danger }}>*</Text></Text>
                    <View style={styles.amountRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="e.g. 1000"
                            placeholderTextColor={COLORS.textMuted}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.fullBtn} onPress={handlePayFull}>
                            <Text style={styles.fullBtnText}>Full</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date */}
                <View style={styles.field}>
                    <Text style={styles.label}>Payment Date <Text style={{ color: COLORS.danger }}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={COLORS.textMuted}
                        value={paymentDate}
                        onChangeText={setPaymentDate}
                    />
                </View>

                {/* Note */}
                <View style={styles.field}>
                    <Text style={styles.label}>Note (optional)</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="e.g. Bank transfer, UPI, etc."
                        placeholderTextColor={COLORS.textMuted}
                        value={note}
                        onChangeText={setNote}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Breakdown */}
                {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                    <View style={styles.breakdown}>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Remaining Balance</Text>
                            <Text style={styles.breakdownValue}>₹{Number(remaining).toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>This Payment</Text>
                            <Text style={[styles.breakdownValue, { color: COLORS.success }]}>- ₹{Number(amount).toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={[styles.breakdownRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, marginTop: 4 }]}>
                            <Text style={[styles.breakdownLabel, { fontWeight: '800', color: COLORS.textPrimary }]}>After Payment</Text>
                            <Text style={[styles.breakdownValue, { color: COLORS.primary, fontWeight: '800' }]}>
                                ₹{Math.max(0, remaining - Number(amount)).toLocaleString('en-IN')}
                            </Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.submitBtn}>
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                                <Text style={styles.submitText}>Record Payment</Text>
                            </>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20 },
    backBtn: { marginBottom: 10 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 8 },
    remainingAmt: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 4 },
    formCard: {
        backgroundColor: COLORS.surface, borderRadius: 24, marginHorizontal: 16, marginTop: -20,
        padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    },
    field: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
    input: {
        backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 14, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border,
    },
    textArea: { height: 80 },
    amountRow: { flexDirection: 'row', gap: 10 },
    fullBtn: {
        backgroundColor: COLORS.primaryLight, paddingHorizontal: 16, borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary,
    },
    fullBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
    breakdown: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, marginBottom: 16 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    breakdownLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
    breakdownValue: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '700' },
    submitBtn: {
        borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 8, marginTop: 4,
    },
    submitText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
