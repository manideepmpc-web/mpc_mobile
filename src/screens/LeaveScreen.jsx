import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    ScrollView, RefreshControl, Modal, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../constants/colors';
import { leaveService } from '../services';
import { LEAVE_TYPES } from '../constants/config';
import { formatDate } from '../utils/helpers';
import Input from '../components/Input';
import Button from '../components/Button';

const statusConfig = {
    pending: { color: COLORS.warning, bg: COLORS.warningLight, icon: 'time-outline' },
    approved: { color: COLORS.success, bg: COLORS.successLight, icon: 'checkmark-circle-outline' },
    rejected: { color: COLORS.danger, bg: COLORS.dangerLight, icon: 'close-circle-outline' },
    cancelled: { color: COLORS.textMuted, bg: COLORS.background, icon: 'ban-outline' },
};

const LeaveScreen = () => {
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ leave_type: 'casual', from_date: '', to_date: '', reason: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [listRes, balRes] = await Promise.all([leaveService.getMyLeaves(), leaveService.getBalance()]);
            setLeaves(listRes.data.data || []);
            setBalance(balRes.data.data || {});
        } catch (e) { console.log(e.message); }
        finally { setLoading(false); setRefreshing(false); }
    };

    const handleApply = async () => {
        if (!form.from_date || !form.to_date || !form.reason) {
            Alert.alert('Missing Fields', 'Please fill in all fields.'); return;
        }
        setSubmitting(true);
        try {
            await leaveService.apply(form);
            setShowModal(false);
            setForm({ leave_type: 'casual', from_date: '', to_date: '', reason: '' });
            Alert.alert('✅ Applied!', 'Your leave request has been submitted.');
            fetchData();
        } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed to apply.'); }
        finally { setSubmitting(false); }
    };

    const handleCancel = (id) => {
        Alert.alert('Cancel Leave', 'Are you sure you want to cancel this request?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
                    try { await leaveService.cancel(id); fetchData(); } catch (e) { Alert.alert('Error', 'Failed to cancel.'); }
                }
            },
        ]);
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}>

                {/* Balance cards */}
                <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balHeader}>
                    <View style={styles.balCircle} />
                    <Text style={styles.balTitle}>Leave Balance</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.balScroll}>
                        {['casual', 'sick', 'earned'].map((type) => (
                            <View key={type} style={styles.balCard}>
                                <Text style={styles.balNum}>{balance[type] ?? '—'}</Text>
                                <Text style={styles.balType}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </LinearGradient>

                {/* Apply Button */}
                <View style={styles.applyRow}>
                    <Text style={styles.sectionTitle}>My Requests</Text>
                    <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.applyBtnGrad}>
                        <TouchableOpacity style={styles.applyBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
                            <Ionicons name="add-outline" size={18} color={COLORS.white} />
                            <Text style={styles.applyBtnText}>Apply Leave</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Leave List */}
                {leaves.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Ionicons name="calendar-outline" size={48} color={COLORS.border} />
                        <Text style={styles.emptyText}>No leave requests yet</Text>
                    </View>
                ) : (
                    leaves.map((item) => {
                        const cfg = statusConfig[item.status] || statusConfig.pending;
                        return (
                            <View key={item.id} style={styles.leaveCard}>
                                <View style={[styles.leaveIconBox, { backgroundColor: cfg.bg }]}>
                                    <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.leaveType}>{LEAVE_TYPES.find(t => t.value === item.leave_type)?.label || item.leave_type}</Text>
                                    <Text style={styles.leaveDates}>{formatDate(item.from_date)} → {formatDate(item.to_date)}</Text>
                                    <Text style={styles.leaveDays}>{item.total_days} day{item.total_days !== 1 ? 's' : ''}</Text>
                                </View>
                                <View style={styles.leaveRight}>
                                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                                        <Text style={[styles.statusText, { color: cfg.color }]}>{item.status}</Text>
                                    </View>
                                    {item.status === 'pending' && (
                                        <TouchableOpacity onPress={() => handleCancel(item.id)} style={styles.cancelBtn}>
                                            <Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 32 }} />
            </ScrollView>

            {/* Apply Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Apply for Leave</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.pickerLabel}>Leave Type</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker selectedValue={form.leave_type} onValueChange={(v) => setForm({ ...form, leave_type: v })} style={styles.picker}>
                                    {LEAVE_TYPES.map((t) => <Picker.Item key={t.value} label={t.label} value={t.value} />)}
                                </Picker>
                            </View>
                            <Input label="From Date" value={form.from_date} onChangeText={(v) => setForm({ ...form, from_date: v })} placeholder="YYYY-MM-DD" icon="calendar-outline" />
                            <Input label="To Date" value={form.to_date} onChangeText={(v) => setForm({ ...form, to_date: v })} placeholder="YYYY-MM-DD" icon="calendar-outline" />
                            <Input label="Reason" value={form.reason} onChangeText={(v) => setForm({ ...form, reason: v })} placeholder="Reason for leave..." multiline icon="document-text-outline" />
                            <Button title="Submit Application" onPress={handleApply} loading={submitting} style={{ marginTop: 8 }} />
                            <Button title="Cancel" onPress={() => setShowModal(false)} variant="outline" style={{ marginTop: 10 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    balHeader: { padding: 20, position: 'relative', overflow: 'hidden' },
    balCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.07)', top: -30, right: -30 },
    balTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 14 },
    balScroll: { flexGrow: 0 },
    balCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, marginRight: 12, alignItems: 'center', minWidth: 80 },
    balNum: { color: COLORS.white, fontSize: 28, fontWeight: '900' },
    balType: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', marginTop: 2 },
    applyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 16, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
    applyBtnGrad: { borderRadius: 10 },
    applyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8 },
    applyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
    emptyBox: { alignItems: 'center', padding: 48, gap: 12 },
    emptyText: { color: COLORS.textMuted, fontSize: 14 },
    leaveCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    leaveIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    leaveType: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    leaveDates: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    leaveDays: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
    leaveRight: { alignItems: 'flex-end', gap: 6 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    cancelBtn: { padding: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
    pickerLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
    pickerWrapper: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, marginBottom: 14, overflow: 'hidden', backgroundColor: COLORS.background },
    picker: { height: 50 },
});

export default LeaveScreen;
