import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { attendanceService } from '../services';
import { formatDate, formatTime, formatDuration } from '../utils/helpers';

const AttendanceScreen = () => {
    const [todayAtt, setTodayAtt] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [todayRes, histRes] = await Promise.all([
                attendanceService.getTodayStatus(),
                attendanceService.getHistory(),
            ]);
            setTodayAtt(todayRes.data.data);
            setHistory(histRes.data.data || []);
        } catch (e) { console.log('Attendance fetch error:', e.message); }
        finally { setLoading(false); setRefreshing(false); }
    };

    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Denied', 'Location is required.'); return null; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        return `${loc.coords.latitude.toFixed(6)},${loc.coords.longitude.toFixed(6)}`;
    };

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            const loc = await getLocation();
            await attendanceService.checkIn(loc);
            Alert.alert('✅ Checked In!', `You're now checked in.\n${formatTime(new Date())}`);
            fetchData();
        } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Check-in failed.'); }
        finally { setActionLoading(false); }
    };

    const handleCheckOut = async () => {
        setActionLoading(true);
        try {
            const loc = await getLocation();
            await attendanceService.checkOut(loc);
            Alert.alert('✅ Checked Out!', 'Have a great rest of your day!');
            fetchData();
        } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Check-out failed.'); }
        finally { setActionLoading(false); }
    };

    const getStatusColor = (status) => ({
        present: COLORS.success, absent: COLORS.danger,
        half_day: COLORS.warning, leave: COLORS.primary,
    }[status] || COLORS.textMuted);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

    const canCheckIn = !todayAtt?.check_in;
    const canCheckOut = todayAtt?.check_in && !todayAtt?.check_out;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}>

            {/* Today Card */}
            <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.todayCard}>
                <View style={styles.circleDecor} />
                <Text style={styles.todayLabel}>TODAY — {formatDate(new Date()).toUpperCase()}</Text>
                <View style={styles.timesRow}>
                    <View style={styles.timeBlock}>
                        <Ionicons name="log-in-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.timeVal}>{todayAtt?.check_in ? formatTime(todayAtt.check_in) : '—'}</Text>
                        <Text style={styles.timeLabel}>Check In</Text>
                    </View>
                    <View style={styles.timeDivider} />
                    <View style={styles.timeBlock}>
                        <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.timeVal}>
                            {todayAtt?.check_in && todayAtt?.check_out
                                ? formatDuration(todayAtt.check_in, todayAtt.check_out)
                                : todayAtt?.check_in ? '●●:●●' : '—'}
                        </Text>
                        <Text style={styles.timeLabel}>Duration</Text>
                    </View>
                    <View style={styles.timeDivider} />
                    <View style={styles.timeBlock}>
                        <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.timeVal}>{todayAtt?.check_out ? formatTime(todayAtt.check_out) : '—'}</Text>
                        <Text style={styles.timeLabel}>Check Out</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
                {canCheckIn && (
                    <LinearGradient colors={[COLORS.success, '#2ECC71']} style={styles.actionGrad}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleCheckIn} disabled={actionLoading} activeOpacity={0.85}>
                            {actionLoading ? <ActivityIndicator color={COLORS.white} /> : (
                                <>
                                    <Ionicons name="log-in-outline" size={22} color={COLORS.white} />
                                    <Text style={styles.actionText}>Check In</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </LinearGradient>
                )}
                {canCheckOut && (
                    <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.actionGrad}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleCheckOut} disabled={actionLoading} activeOpacity={0.85}>
                            {actionLoading ? <ActivityIndicator color={COLORS.white} /> : (
                                <>
                                    <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
                                    <Text style={styles.actionText}>Check Out</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </LinearGradient>
                )}
                {!canCheckIn && !canCheckOut && (
                    <View style={styles.doneBox}>
                        <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                        <Text style={styles.doneText}>Attendance marked for today!</Text>
                    </View>
                )}
            </View>

            {/* History */}
            <Text style={styles.sectionTitle}>Recent History</Text>
            {history.length === 0 ? (
                <View style={styles.emptyBox}>
                    <Ionicons name="calendar-outline" size={40} color={COLORS.border} />
                    <Text style={styles.emptyText}>No attendance records yet</Text>
                </View>
            ) : (
                history.slice(0, 10).map((item, idx) => (
                    <View key={idx} style={styles.historyRow}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.histDate}>{formatDate(item.date)}</Text>
                            <Text style={styles.histSub}>
                                {item.check_in ? `In: ${formatTime(item.check_in)}` : 'Not checked in'}
                                {item.check_out ? `  ·  Out: ${formatTime(item.check_out)}` : ''}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}18` }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status?.replace('_', ' ')}</Text>
                        </View>
                    </View>
                ))
            )}
            <View style={{ height: 32 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    todayCard: { margin: 16, borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden' },
    circleDecor: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30 },
    todayLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 16 },
    timesRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    timeBlock: { alignItems: 'center', gap: 4 },
    timeVal: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
    timeLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
    timeDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
    actionRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 20 },
    actionGrad: { flex: 1, borderRadius: 14 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    actionText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
    doneBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.successLight, borderRadius: 14, padding: 14, justifyContent: 'center' },
    doneText: { color: COLORS.success, fontWeight: '700', fontSize: 14 },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginHorizontal: 16, marginBottom: 10 },
    emptyBox: { alignItems: 'center', padding: 40, gap: 12 },
    emptyText: { color: COLORS.textMuted, fontSize: 14 },
    historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    histDate: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
    histSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
});

export default AttendanceScreen;
