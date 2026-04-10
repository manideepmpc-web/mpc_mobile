import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ScrollView, Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS } from '../constants/colors';
import { locationService } from '../services';
import { formatDateTime } from '../utils/helpers';

const LocationScreen = () => {
    const [tracking, setTracking] = useState(false);
    const [currentLoc, setCurrentLoc] = useState(null);
    const [lastSent, setLastSent] = useState(null);
    const [savedLoc, setSavedLoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchSavedLocation();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const fetchSavedLocation = async () => {
        try { const res = await locationService.getMe(); setSavedLoc(res.data.data); }
        catch (e) { console.log('Fetch location error:', e.message); }
    };

    const getCurrentPosition = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Denied', 'Location permission is required.'); return null; }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        return loc.coords;
    };

    const sendLocation = async () => {
        const coords = await getCurrentPosition();
        if (!coords) return;
        setCurrentLoc(coords);
        await locationService.update(coords.latitude, coords.longitude, coords.accuracy);
        setLastSent(new Date());
    };

    const toggleTracking = async () => {
        if (tracking) {
            clearInterval(intervalRef.current); intervalRef.current = null; setTracking(false);
        } else {
            setLoading(true);
            await sendLocation();
            setLoading(false); setTracking(true);
            intervalRef.current = setInterval(sendLocation, 60000);
        }
    };

    const manualUpdate = async () => {
        setLoading(true);
        await sendLocation();
        setLoading(false);
        fetchSavedLocation();
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Status Card */}
            <LinearGradient
                colors={tracking ? [COLORS.primaryDark, COLORS.primary, COLORS.accent] : [COLORS.background, COLORS.background]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.statusCard, !tracking && styles.statusCardOff]}
            >
                <View style={styles.statusLeft}>
                    <View style={[styles.statusIcon, { backgroundColor: tracking ? 'rgba(255,255,255,0.2)' : COLORS.white }]}>
                        <Ionicons name={tracking ? 'radio-button-on' : 'radio-button-off'} size={28} color={tracking ? COLORS.white : COLORS.textMuted} />
                    </View>
                    <View>
                        <Text style={[styles.statusTitle, !tracking && styles.statusTitleOff]}>
                            {tracking ? '🟢 Live Tracking ON' : '⚫ Tracking Disabled'}
                        </Text>
                        <Text style={[styles.statusSub, !tracking && styles.statusSubOff]}>
                            {tracking ? 'Updating every 60 seconds' : 'Enable to share your location'}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={tracking}
                    onValueChange={toggleTracking}
                    trackColor={{ false: COLORS.border, true: 'rgba(255,255,255,0.4)' }}
                    thumbColor={tracking ? COLORS.white : COLORS.white}
                />
            </LinearGradient>

            {/* Current Coordinates */}
            {currentLoc && (
                <View style={styles.coordCard}>
                    <Text style={styles.coordTitle}>📍 Current Position</Text>
                    <View style={styles.coordRow}>
                        {[
                            { label: 'Latitude', val: currentLoc.latitude.toFixed(6) },
                            { label: 'Longitude', val: currentLoc.longitude.toFixed(6) },
                            { label: 'Accuracy', val: currentLoc.accuracy ? `${Math.round(currentLoc.accuracy)}m` : '—' },
                        ].map((c, i) => (
                            <View key={i} style={styles.coordItem}>
                                <Text style={styles.coordLabel}>{c.label}</Text>
                                <Text style={styles.coordVal}>{c.val}</Text>
                                {i < 2 && <View style={styles.coordDivider} />}
                            </View>
                        ))}
                    </View>
                    {lastSent && <Text style={styles.lastSent}>Last sent: {formatDateTime(lastSent)}</Text>}
                </View>
            )}

            {/* Last Saved */}
            {savedLoc && (
                <LinearGradient colors={[COLORS.primaryLight, COLORS.accentLight]} style={styles.savedCard}>
                    <Ionicons name="location" size={20} color={COLORS.primary} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.savedTitle}>Last Recorded Location</Text>
                        <Text style={styles.savedCoord}>
                            {parseFloat(savedLoc.latitude).toFixed(6)}, {parseFloat(savedLoc.longitude).toFixed(6)}
                        </Text>
                        <Text style={styles.savedTime}>{formatDateTime(savedLoc.recorded_at)}</Text>
                    </View>
                </LinearGradient>
            )}

            {/* Manual Update */}
            <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.manualGrad}>
                <TouchableOpacity style={styles.manualBtn} onPress={manualUpdate} disabled={loading} activeOpacity={0.85}>
                    {loading
                        ? <ActivityIndicator color={COLORS.white} size="small" />
                        : <><Ionicons name="refresh-outline" size={20} color={COLORS.white} /><Text style={styles.manualText}>Update Location Now</Text></>}
                </TouchableOpacity>
            </LinearGradient>

            {/* Info */}
            <View style={styles.infoBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                    Your location is only shared during work hours and requires your explicit consent. Toggle the switch above to start or stop tracking.
                </Text>
            </View>
            <View style={{ height: 32 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
    statusCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, marginBottom: 16, justifyContent: 'space-between' },
    statusCardOff: { borderWidth: 1.5, borderColor: COLORS.border },
    statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
    statusIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    statusTitle: { fontSize: 15, fontWeight: '800', color: COLORS.white },
    statusTitleOff: { color: COLORS.textPrimary },
    statusSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    statusSubOff: { color: COLORS.textMuted },
    coordCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 14, shadowColor: COLORS.primaryDark, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
    coordTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 14 },
    coordRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    coordItem: { alignItems: 'center', flex: 1, gap: 4, position: 'relative' },
    coordLabel: { fontSize: 10, color: COLORS.textMuted },
    coordVal: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary },
    coordDivider: { position: 'absolute', right: 0, top: '10%', width: 1, height: '80%', backgroundColor: COLORS.border },
    lastSent: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 12 },
    savedCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, padding: 14, marginBottom: 16 },
    savedTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primaryDark },
    savedCoord: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600', marginTop: 2 },
    savedTime: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
    manualGrad: { borderRadius: 14, marginBottom: 14 },
    manualBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    manualText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
    infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.primaryLight, borderRadius: 14, padding: 14 },
    infoText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },
});

export default LocationScreen;
