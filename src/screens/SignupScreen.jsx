import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { COLORS } from '../constants/colors';
import { authService } from '../services';

const SignupScreen = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [address, setAddress] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePickContact = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === 'granted') {
                const contact = await Contacts.presentContactPickerAsync();
                if (contact) {
                    if (contact.name && !name) {
                        setName(contact.name);
                    }
                    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
                        // Extract only numeric characters, handling formatting like +91 98xx
                        const rawPhone = contact.phoneNumbers[0].number.replace(/[^0-9]/g, '');
                        // If it includes country code like 91 at start and is length 12, trim it. Just setting raw for now.
                        setPhone(rawPhone.slice(-10)); // Take last 10 digits as simple formatting
                    }
                }
            } else {
                Alert.alert('Permission required', 'Please allow contacts access to pick a contact.');
            }
        } catch (error) {
            console.log('Error picking contact:', error);
            Alert.alert('Error', 'Could not open contacts.');
        }
    };

    const handleRegister = async () => {
        if (!name.trim()) return Alert.alert('Missing Field', 'Please enter your full name.');
        if (!email.trim()) return Alert.alert('Missing Field', 'Please enter your email.');
        if (!password.trim() || password.length < 6)
            return Alert.alert('Validation', 'Password must be at least 6 characters.');
        if (password !== confirmPass)
            return Alert.alert('Validation', 'Passwords do not match.');

        setLoading(true);
        try {
            const formData = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone: phone.trim() || '',
                designation: 'Employee',
                role: 'employee',
                date_of_joining: new Date().toISOString().split('T')[0],
                gender: gender || 'male',
                date_of_birth: dateOfBirth || '1995-01-01',
                address: address.trim() || 'Not provided',
            };

            // Call backend register (sends email OTP)
            await authService.register(formData);

            // Navigate to OTP verification with email and password
            navigation.navigate('OTPVerification', {
                email: email.trim().toLowerCase(),
                password: password
            });
            Alert.alert('Success', 'OTP sent to your email!');
        } catch (err) {
            console.error('Registration error:', err);
            const msg = err.response?.data?.message
                || err.friendlyMessage
                || 'Registration failed. Please try again.';
            Alert.alert('Registration Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

                {/* Header */}
                <LinearGradient
                    colors={[COLORS.primaryDark, COLORS.primary, COLORS.accent]}
                    style={styles.header}
                >
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />
                    <View style={styles.iconWrap}>
                        <Ionicons name="cash" size={48} color={COLORS.white} />
                    </View>
                    <Text style={styles.appName}>Money Tracker</Text>
                    <Text style={styles.tagline}>Track Your Money</Text>
                </LinearGradient>

                {/* Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Create Account</Text>
                    <Text style={styles.cardSub}>Sign up to start tracking your money</Text>

                    {/* Full Name */}
                    <Field icon="person-outline" label="Full Name">
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Rahul Kumar"
                            placeholderTextColor={COLORS.textMuted}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </Field>

                    {/* Email */}
                    <Field icon="mail-outline" label="Email Address">
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </Field>

                    {/* Phone — Optional */}
                    <Field icon="call-outline" label="Mobile Number (Optional)">
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.inputFlex}
                                placeholder="98xxxxxxxx"
                                placeholderTextColor={COLORS.textMuted}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                            <TouchableOpacity style={styles.iconButton} onPress={handlePickContact} activeOpacity={0.7}>
                                <Ionicons name="book" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </Field>

                    {/* Password */}
                    <Field icon="lock-closed-outline" label="Password">
                        <View style={styles.passRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Min. 6 characters"
                                placeholderTextColor={COLORS.textMuted}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPass}
                            />
                            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </Field>

                    {/* Confirm Password */}
                    <Field icon="lock-closed-outline" label="Confirm Password">
                        <TextInput
                            style={styles.input}
                            placeholder="Re-enter password"
                            placeholderTextColor={COLORS.textMuted}
                            value={confirmPass}
                            onChangeText={setConfirmPass}
                            secureTextEntry={!showPass}
                        />
                    </Field>

                    {/* Gender */}
                    <Field icon="person-outline" label="Gender">
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]}
                                onPress={() => setGender('male')}
                            >
                                <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>Male</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]}
                                onPress={() => setGender('female')}
                            >
                                <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>Female</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'other' && styles.genderOptionSelected]}
                                onPress={() => setGender('other')}
                            >
                                <Text style={[styles.genderText, gender === 'other' && styles.genderTextSelected]}>Other</Text>
                            </TouchableOpacity>
                        </View>
                    </Field>

                    {/* Date of Birth */}
                    <Field icon="calendar-outline" label="Date of Birth">
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={COLORS.textMuted}
                            value={dateOfBirth}
                            onChangeText={setDateOfBirth}
                            maxLength={10}
                        />
                    </Field>

                    {/* Address */}
                    <Field icon="home-outline" label="Address">
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Enter your address"
                            placeholderTextColor={COLORS.textMuted}
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            numberOfLines={3}
                        />
                    </Field>

                    {/* OTP Notice */}
                    <View style={styles.otpNotice}>
                        <Ionicons name="mail-outline" size={15} color={COLORS.primary} />
                        <Text style={styles.otpNoticeText}>
                            A 6-digit OTP will be sent to your email address to verify your identity.
                        </Text>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
                        <LinearGradient colors={[COLORS.primary, COLORS.accent]} style={styles.btnGradient}>
                            {loading
                                ? <ActivityIndicator color={COLORS.white} />
                                : <>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
                                    <Text style={styles.btnText}>Send OTP & Continue</Text>
                                </>
                            }
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginBold}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const Field = ({ icon, label, children }) => (
    <View style={{ marginBottom: 6 }}>
        <View style={fStyles.fieldLabel}>
            <Ionicons name={icon} size={14} color={COLORS.textMuted} />
            <Text style={fStyles.labelText}>{label}</Text>
        </View>
        {children}
    </View>
);

const fStyles = StyleSheet.create({
    fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
    labelText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
});

const styles = StyleSheet.create({
    scroll: { flexGrow: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 60, paddingBottom: 44, alignItems: 'center', overflow: 'hidden', position: 'relative' },
    circle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -50 },
    circle2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -40 },
    iconWrap: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, padding: 16, marginBottom: 12 },
    appName: { fontSize: 26, fontWeight: '900', color: COLORS.white, letterSpacing: 0.5 },
    tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
    card: {
        marginHorizontal: 18, marginTop: -28, backgroundColor: COLORS.white,
        borderRadius: 24, padding: 24, shadowColor: COLORS.primaryDark,
        shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 8, marginBottom: 30,
    },
    cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
    cardSub: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20 },
    input: {
        borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
        paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
        color: COLORS.textPrimary, backgroundColor: COLORS.background, marginBottom: 14,
    },
    inputWithIcon: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
        borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: 14,
    },
    inputFlex: {
        flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary,
    },
    iconButton: {
        padding: 12, justifyContent: 'center', alignItems: 'center',
    },
    passRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
    eyeBtn: { padding: 10, backgroundColor: COLORS.background, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border },
    otpNotice: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: '#FFF0F6', borderRadius: 10, padding: 12, marginBottom: 16,
        borderWidth: 1, borderColor: '#FFD6E7',
    },
    otpNoticeText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
    btnGradient: { borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 4 },
    btnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
    loginLink: { marginTop: 18, paddingVertical: 10, alignItems: 'center' },
    loginText: { fontSize: 14, color: COLORS.textSecondary },
    loginBold: { color: COLORS.primary, fontWeight: '700' },
    genderContainer: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    genderOption: {
        flex: 1, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12,
        borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.background,
        alignItems: 'center',
    },
    genderOptionSelected: {
        borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15',
    },
    genderText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
    genderTextSelected: { color: COLORS.primary, fontWeight: '700' },
});

export default SignupScreen;
