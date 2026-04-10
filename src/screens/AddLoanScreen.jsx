import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert, Switch, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loanService } from '../services/loanService';
import { COLORS } from '../constants/colors';

const Field = ({ label, children, required }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}{required && <Text style={{ color: COLORS.danger }}> *</Text>}</Text>
        {children}
    </View>
);

export default function AddLoanScreen({ navigation }) {
    const [borrowerName, setBorrowerName] = useState('');
    const [borrowerContact, setBorrowerContact] = useState('');
    const [type, setType] = useState('given'); // 'given' | 'taken'
    const [principal, setPrincipal] = useState('');
    const [interestRate, setInterestRate] = useState('0');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!borrowerName.trim()) return Alert.alert('Validation', 'Borrower name is required.');
        if (!principal || isNaN(Number(principal)) || Number(principal) <= 0) return Alert.alert('Validation', 'Enter a valid principal amount.');
        if (!startDate) return Alert.alert('Validation', 'Start date is required.');

        setLoading(true);
        try {
            await loanService.createLoan({
                borrower_name: borrowerName.trim(),
                borrower_contact: borrowerContact.trim() || null,
                type,
                principal_amount: Number(principal),
                interest_rate: Number(interestRate) || 0,
                start_date: startDate,
                due_date: dueDate || null,
                notes: notes.trim() || null,
            });
            Alert.alert('Success', 'Loan added successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to create loan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            {/* Gradient Header */}
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Loan</Text>
                <Text style={styles.headerSub}>Enter the loan details below</Text>
            </LinearGradient>

            <View style={styles.formCard}>
                {/* Loan Type Toggle */}
                <Field label="Loan Type" required>
                    <View style={styles.toggleRow}>
                        {[
                            { key: 'given', label: '📤  Money Given', desc: 'I lent money to someone' },
                            { key: 'taken', label: '📥  Money Taken', desc: 'I borrowed money from someone' },
                        ].map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.toggleOption, type === opt.key && styles.toggleActive]}
                                onPress={() => setType(opt.key)}
                                activeOpacity={0.8}
                            >
                                {type === opt.key ? (
                                    <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.toggleGradientInner}>
                                        <Text style={styles.toggleLabelActive}>{opt.label}</Text>
                                        <Text style={styles.toggleDescActive}>{opt.desc}</Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={styles.toggleInner}>
                                        <Text style={styles.toggleLabel}>{opt.label}</Text>
                                        <Text style={styles.toggleDesc}>{opt.desc}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Field>

                <Field label="Borrower / Lender Name" required>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Rahul Sharma"
                        placeholderTextColor={COLORS.textMuted}
                        value={borrowerName}
                        onChangeText={setBorrowerName}
                    />
                </Field>

                <Field label="Contact (Phone / Email)">
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 98xxxxxxx0"
                        placeholderTextColor={COLORS.textMuted}
                        value={borrowerContact}
                        onChangeText={setBorrowerContact}
                        keyboardType="phone-pad"
                    />
                </Field>

                <Field label="Principal Amount (₹)" required>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5000"
                        placeholderTextColor={COLORS.textMuted}
                        value={principal}
                        onChangeText={setPrincipal}
                        keyboardType="numeric"
                    />
                </Field>

                <Field label="Interest Rate (% per annum)">
                    <TextInput
                        style={styles.input}
                        placeholder="0 for interest-free"
                        placeholderTextColor={COLORS.textMuted}
                        value={interestRate}
                        onChangeText={setInterestRate}
                        keyboardType="numeric"
                    />
                </Field>

                <View style={styles.dateRow}>
                    <View style={{ flex: 1 }}>
                        <Field label="Start Date" required>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={COLORS.textMuted}
                                value={startDate}
                                onChangeText={setStartDate}
                            />
                        </Field>
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                        <Field label="Due Date">
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={COLORS.textMuted}
                                value={dueDate}
                                onChangeText={setDueDate}
                            />
                        </Field>
                    </View>
                </View>

                <Field label="Notes">
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Any additional notes..."
                        placeholderTextColor={COLORS.textMuted}
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </Field>

                <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.submitBtn}>
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <>
                                <Ionicons name="save-outline" size={18} color="#fff" />
                                <Text style={styles.submitText}>Save Loan</Text>
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
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
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
    dateRow: { flexDirection: 'row' },
    toggleRow: { flexDirection: 'row', gap: 10 },
    toggleOption: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
    toggleActive: { borderColor: COLORS.primary, borderWidth: 1.5 },
    toggleGradientInner: { padding: 12, alignItems: 'center' },
    toggleInner: { padding: 12, alignItems: 'center' },
    toggleLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
    toggleDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },
    toggleLabelActive: { fontSize: 12, fontWeight: '700', color: '#fff', textAlign: 'center' },
    toggleDescActive: { fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2, textAlign: 'center' },
    submitBtn: {
        borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'center',
        flexDirection: 'row', gap: 8, marginTop: 8,
    },
    submitText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
