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
import { authService } from '../services';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 60;
const DUMMY_OTP = '8888'; // 🎯 Dummy OTP for testing
// Calculate box size to fit within the card (padding: 24*2, margin: 18*2, gap: 8*3)
const BOX_SIZE = Math.min(48, (width - 120) / 4);

const OTPVerificationScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { login } = useAuth();

    // Get email and password from route params
    const { email, password } = route.params || {};

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef([]);

    // Redirect if email is missing
    useEffect(() => {
        if (!email) {
            Alert.alert('Session Expired', 'Please restart the signup process.');
            navigation.navigate('Signup');
        }
    }, [email]);

    // Auto-fill dummy OTP for testing
    useEffect(() => {
        // 🎯 Auto-fill dummy OTP "8888" for testing
        const dummyOtpArray = DUMMY_OTP.split('');
        setOtp(dummyOtpArray);
    }, []);

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
            return Alert.alert('Incomplete OTP', 'Please enter all 4 digits.');
        }

        setLoading(true);
        try {
            // Verify OTP with backend
            await authService.verifyOTP(email, otpCode);

            // Auto-login after successful OTP verification
            const loginResult = await login(email, password);
            if (!loginResult.success) {
                Alert.alert('Login Failed', loginResult.message);
                return;
            }

            // Success - navigation handled by authStore
        } catch (error) {
            console.error('OTP verify error:', error);
            const msg = error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
            Alert.alert('Verification Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            // Call register again to resend OTP
            await authService.register({ email });
            setOtp(Array(OTP_LENGTH).fill(''));
            setTimer(RESEND_COOLDOWN);
            setCanResend(false);
            Alert.alert('Success', 'New OTP sent to your email!');
        } catch (err) {
            console.error('Resend error:', err);
            Alert.alert('Failed', 'Could not resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '***';

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
                    <Text style={styles.headerSub}>Verify your email address</Text>
                </LinearGradient>

                {/* Card Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Enter 4-Digit Code</Text>
                    <Text style={styles.cardSub}>Code sent to {maskedEmail}</Text>
                    
                    {/* 🎯 Dummy OTP Indicator */}
                    <View style={styles.dummyOtpIndicator}>
                        <Text style={styles.dummyOtpText}>🔓 Testing Mode: OTP auto-filled as {DUMMY_OTP}</Text>
                    </View>

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
                        <Text style={styles.changePhoneText}>Wrong email? Change it</Text>
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
    cardSub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 12 },
    
    dummyOtpIndicator: {
        backgroundColor: '#e8f5e8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    dummyOtpText: { 
        fontSize: 12, 
        color: '#2e7d32', 
        textAlign: 'center',
        fontWeight: '600',
    },

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
