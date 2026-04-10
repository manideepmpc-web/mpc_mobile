// src/screens/OTPVerificationScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
    Alert, KeyboardAvoidingView, Platform, StatusBar, TextInput,
    ScrollView, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAuth } from '../store/authStore';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { otpSession } from '../utils/otpSession';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;
// Calculate box size to fit within the card (padding: 24*2, margin: 18*2, gap: 8*5)
const BOX_SIZE = Math.min(48, (width - 120) / 6);

const OTPVerificationScreen = () => {
    const navigation = useNavigation();
    const { register } = useAuth();

    // Get non-serializable data from session store
    const confirmation = otpSession.getConfirmation();
    const formData = otpSession.getFormData();

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [currentConfirmation, setCurrentConfirmation] = useState(confirmation);

    const inputRefs = useRef([]);

    // Redirect if session is missing
    useEffect(() => {
        if (!currentConfirmation || !formData) {
            Alert.alert('Session Expired', 'Please restart the signup process.');
            navigation.navigate('Signup');
        }
    }, [currentConfirmation, formData]);

    // Countdown timer
    useEffect(() => {
        if (timer === 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        const newOtp = [...otp];
        // Handle input (only digits)
        const digit = value.replace(/\D/g, '').slice(-1);
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto focus next
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length < OTP_LENGTH) {
            return Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
        }

        setLoading(true);
        try {
            // 1. Verify with Firebase
            await currentConfirmation.confirm(otpCode);

            // 2. Register on Backend
            const result = await register(formData);
            if (!result.success) {
                Alert.alert('Registration Failed', result.message);
                return;
            }

            // Success! Navigtion handled by authStore/AppNavigator
            otpSession.clear();
        } catch (error) {
            console.error('OTP verify error:', error);
            const msg = error.code === 'auth/invalid-verification-code'
                ? 'Invalid OTP code. Please check and try again.'
                : error.message || 'Verification failed.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            const newConfirmation = await signInWithPhoneNumber(auth, formData.phone);
            setCurrentConfirmation(newConfirmation);
            otpSession.setConfirmation(newConfirmation);
            setOtp(Array(OTP_LENGTH).fill(''));
            setTimer(RESEND_COOLDOWN);
            setCanResend(false);
            Alert.alert('Success', 'New OTP sent!');
        } catch (err) {
            Alert.alert('Failed', 'Could not resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const maskedPhone = formData?.phone ? formData.phone.replace(/(\+\d{2})(\d{6})(\d{4})/, '$1 ****** $3') : '***';

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
            <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.background }}>

                {/* Header Section */}
                <LinearGradient colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]} style={styles.header}>
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />

                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    <View style={styles.iconWrap}>
                        <Ionicons name="shield-checkmark" size={48} color={COLORS.white} />
                    </View>
                    <Text style={styles.headerTitle}>OTP Verification</Text>
                    <Text style={styles.headerSub}>Verify your phone number</Text>
                </LinearGradient>

                {/* Card Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Enter 6-Digit Code</Text>
                    <Text style={styles.cardSub}>Code sent to {maskedPhone}</Text>

                    {/* OTP Inputs */}
                    <View style={styles.otpRow}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={[styles.otpBox, digit && styles.otpBoxFilled]}
                                value={digit}
                                onChangeText={(val) => handleOtpChange(val, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Timer / Resend */}
                    <View style={styles.timerRow}>
                        {canResend ? (
                            <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
                                <Text style={styles.resendText}>Resend Code</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.resendTimer}>Resend in <Text style={styles.bold}>{timer}s</Text></Text>
                        )}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity onPress={handleVerify} disabled={loading} activeOpacity={0.8}>
                        <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.btn}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Continue</Text>}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changePhone}>
                        <Text style={styles.changePhoneText}>Wrong number? Change it</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 60,
        paddingBottom: 60,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    circle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -60, right: -50 },
    circle2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -40 },
    backBtn: { position: 'absolute', left: 20, top: 50, padding: 8 },
    iconWrap: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 28, padding: 16, marginBottom: 12 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
    headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    card: {
        marginHorizontal: 18,
        marginTop: -30,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        alignItems: 'center',
    },
    cardTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 6 },
    cardSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30 },

    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    otpBox: {
        width: BOX_SIZE,
        height: BOX_SIZE * 1.2,
        borderWidth: 1.5,
        borderColor: '#ddd',
        borderRadius: 12,
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.primary,
        backgroundColor: '#f9f9f9',
    },
    otpBoxFilled: {
        borderColor: COLORS.primary,
        backgroundColor: '#fff',
    },

    timerRow: { marginBottom: 30 },
    resendTimer: { fontSize: 13, color: '#999' },
    bold: { fontWeight: '700', color: COLORS.primary },
    resendText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

    btn: {
        width: width - 84,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    changePhone: { marginTop: 20 },
    changePhoneText: { color: '#999', fontSize: 13, textDecorationLine: 'underline' },
});

export default OTPVerificationScreen;
