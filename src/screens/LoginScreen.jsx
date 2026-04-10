import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAuth } from '../store/authStore';

const LoginScreen = () => {
    const navigation = useNavigation();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async () => {
        if (!email.trim()) { Alert.alert('Missing Field', 'Please enter your email address.'); return; }
        if (!password.trim()) { Alert.alert('Missing Field', 'Please enter your password.'); return; }
        setSubmitting(true);
        const result = await login(email.trim().toLowerCase(), password);
        setSubmitting(false);
        if (!result.success) {
            Alert.alert('Login Failed', result.message);
        }
    };

    const fillDemo = (role) => {
        if (role === 'admin') {
            setEmail('admin@mpc.com');
            setPassword('Admin@123');
        } else {
            setEmail('employee@mpc.com');
            setPassword('Emp@123');
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                {/* ── Gradient Header with logo ── */}
                <LinearGradient
                    colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />
                    <View style={styles.logoBg}>
                        <Ionicons name="cash" size={52} color={COLORS.primary} />
                    </View>
                    <Text style={styles.appName}>LoanTracker</Text>
                    <Text style={styles.tagline}>Personal Loan Management</Text>
                </LinearGradient>

                {/* ── Login Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Welcome Back 👋</Text>
                    <Text style={styles.cardSub}>Sign in to manage your loans</Text>

                    {/* Email */}
                    <View style={styles.fieldLabel}>
                        <Ionicons name="mail-outline" size={15} color={COLORS.textMuted} />
                        <Text style={styles.fieldLabelText}>Email Address</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="yourname@mpc.com"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {/* Password */}
                    <View style={styles.fieldLabel}>
                        <Ionicons name="lock-closed-outline" size={15} color={COLORS.textMuted} />
                        <Text style={styles.fieldLabelText}>Password</Text>
                    </View>
                    <View style={styles.passRow}>
                        <TextInput
                            style={[styles.input, { flex: 1, marginBottom: 0 }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor={COLORS.textMuted}
                            secureTextEntry={!showPass}
                        />
                        <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                            <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <LinearGradient
                        colors={[COLORS.primary, COLORS.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.btnGradient}
                    >
                        <TouchableOpacity style={styles.signInBtn} onPress={handleLogin} disabled={submitting} activeOpacity={0.85}>
                            {submitting
                                ? <ActivityIndicator color={COLORS.white} size="small" />
                                : <><Ionicons name="log-in-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} /><Text style={styles.btnText}>Sign In</Text></>
                            }
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Quick Login Shortcuts */}
                    <Text style={styles.demoTip}>Quick demo login:</Text>
                    <View style={styles.demoRow}>
                        <TouchableOpacity style={styles.demoChip} onPress={() => fillDemo('admin')} activeOpacity={0.8}>
                            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.demoChipText}>Admin Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.demoChip, styles.demoChipEmp]} onPress={() => fillDemo('employee')} activeOpacity={0.8}>
                            <Ionicons name="person-outline" size={14} color={COLORS.accent} />
                            <Text style={[styles.demoChipText, { color: COLORS.accent }]}>Employee Login</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Credentials info */}
                    <View style={styles.credBox}>
                        <View style={styles.credRow}>
                            <View style={styles.credDot} />
                            <Text style={styles.credText}><Text style={styles.credBold}>Admin:</Text> admin@mpc.com / Admin@123</Text>
                        </View>
                        <View style={styles.credRow}>
                            <View style={[styles.credDot, { backgroundColor: COLORS.accent }]} />
                            <Text style={styles.credText}><Text style={styles.credBold}>Employee:</Text> employee@mpc.com / Emp@123</Text>
                        </View>
                    </View>

                    {/* Signup Link */}
                    <TouchableOpacity
                        style={styles.signupLink}
                        onPress={() => navigation.navigate('Signup')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.signupText}>
                            Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerDot} />
                    <Text style={styles.footerText}>MODERN · PERSONALIZED · CONNECTED</Text>
                    <View style={styles.footerDot} />
                </View>
                <Text style={styles.copyright}>© 2026 LoanTracker · All rights reserved</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scroll: { flexGrow: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 60, paddingBottom: 52, alignItems: 'center', overflow: 'hidden', position: 'relative' },
    circle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -50 },
    circle2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -40 },
    logoBg: { backgroundColor: COLORS.primaryLight, borderRadius: 24, padding: 18, marginBottom: 14, alignItems: 'center', justifyContent: 'center' },
    appName: { fontSize: 28, fontWeight: '900', color: COLORS.white, letterSpacing: 0.5 },
    tagline: { color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: 0.5, fontWeight: '600', marginTop: 4 },

    card: { marginHorizontal: 18, marginTop: -30, backgroundColor: COLORS.white, borderRadius: 24, padding: 24, shadowColor: COLORS.primaryDark, shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
    cardTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
    cardSub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 24 },

    fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    fieldLabelText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
    input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: COLORS.textPrimary, backgroundColor: COLORS.background, marginBottom: 18 },
    passRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
    eyeBtn: { padding: 10, backgroundColor: COLORS.background, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border },

    btnGradient: { borderRadius: 14, marginBottom: 20 },
    signInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
    btnText: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

    demoTip: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginBottom: 10 },
    demoRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    demoChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    demoChipEmp: { borderColor: COLORS.accent, backgroundColor: COLORS.accentLight },
    demoChipText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

    credBox: { backgroundColor: COLORS.background, borderRadius: 12, padding: 12, gap: 6 },
    credRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    credDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    credText: { fontSize: 12, color: COLORS.textSecondary, flexShrink: 1 },
    credBold: { fontWeight: '700', color: COLORS.textPrimary },

    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, gap: 8 },
    footerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.accent },
    footerText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 1.5 },
    copyright: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: 6, marginBottom: 24 },
    signupLink: { marginTop: 20, paddingVertical: 10, alignItems: 'center' },
    signupText: { fontSize: 14, color: COLORS.textSecondary },
    signupTextBold: { color: COLORS.primary, fontWeight: '700' },
});

export default LoginScreen;
