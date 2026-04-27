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
import { validateEmail, validatePhone, validateDate } from '../utils/helpers';
import { APP_MODE } from '../config/appMode';
import { runNetworkDiagnostics } from '../utils/networkDebug';

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
    const [designation, setDesignation] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation Added - Error states for each field
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPass: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        designation: ''
    });

    // Validation Added - Clear specific field error
    const clearError = (field) => {
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // Validation Added - Validate individual field
    const validateField = (field, value) => {
        let error = '';
        
        switch (field) {
            case 'name':
                if (!value.trim()) error = 'Name is required';
                else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
                break;
            case 'email':
                if (!value.trim()) error = 'Email is required';
                else if (!validateEmail(value.trim())) error = 'Please enter a valid email address';
                break;
            case 'phone':
                if (value.trim() && !validatePhone(value.replace(/[^0-9]/g, ''))) {
                    error = 'Phone number must be 10 digits';
                }
                break;
            case 'password':
                if (!value.trim()) error = 'Password is required';
                else if (value.length < 8) error = 'Password must be at least 8 characters';
                break;
            case 'confirmPass':
                if (!value.trim()) error = 'Please confirm your password';
                else if (value !== password) error = 'Passwords do not match';
                break;
            case 'gender':
                if (!value) error = 'Please select your gender';
                break;
            case 'dateOfBirth':
                if (!value.trim()) error = 'Date of birth is required';
                else if (!validateDate(value.trim())) error = 'Please enter a valid date of birth (YYYY-MM-DD)';
                break;
            case 'address':
                if (!value.trim()) error = 'Address is required';
                break;
            case 'designation':
                if (!value.trim()) error = 'Designation is required';
                break;
        }
        
        return error;
    };

    // Validation Added - Validate all fields
    const validateAllFields = () => {
        const newErrors = {
            name: validateField('name', name),
            email: validateField('email', email),
            phone: validateField('phone', phone),
            password: validateField('password', password),
            confirmPass: validateField('confirmPass', confirmPass),
            gender: validateField('gender', gender),
            dateOfBirth: validateField('dateOfBirth', dateOfBirth),
            address: validateField('address', address),
            designation: validateField('designation', designation)
        };
        
        setErrors(newErrors);
        
        // Check if any errors exist
        return !Object.values(newErrors).some(error => error !== '');
    };

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
        // Validation Added - Validate all fields before API call
        if (!validateAllFields()) {
            return; // Stop execution if validation fails
        }

        setLoading(true);
        try {
            const formData = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
                phone: phone.trim() || '',
                designation: designation.trim() || 'Employee',
                role: 'employee',
                date_of_joining: new Date().toISOString().split('T')[0],
                gender: gender || 'male',
                date_of_birth: dateOfBirth || '1995-01-01',
                address: address.trim() || 'Not provided',
            };

            // Enhanced logging for debugging
            console.log('📝 Registration Data:', {
                mode: APP_MODE,
                formData: { ...formData, password: '***' } // Hide password in logs
            });

            // Call backend register (sends email OTP)
            const response = await authService.register(formData);
            
            console.log('✅ Registration Response:', response);

            // Navigate to OTP verification with email and password
            navigation.navigate('OTPVerification', {
                email: email.trim().toLowerCase(),
                password: password
            });
            Alert.alert('Success', 'OTP sent to your email!');
        } catch (err) {
            console.error('❌ Registration Error Details:', {
                message: err.message,
                code: err.code,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                config: err.config,
                isNetworkError: !err.response,
                isTimeout: err.code === 'ECONNABORTED',
                isServerError: err.response?.status >= 500,
                isClientError: err.response?.status >= 400 && err.response?.status < 500
            });

            // Build detailed error message
            let errorMessage = 'Registration failed. Please try again.';
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.errors?.length > 0) {
                errorMessage = err.response.data.errors.join(', ');
            } else if (err.friendlyMessage) {
                errorMessage = err.friendlyMessage;
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Server may be waking up. Please try again.';
            } else if (!err.response) {
                errorMessage = 'Network error. Please check your internet connection.';
            } else if (err.response?.status === 422) {
                errorMessage = 'Validation error. Please check your input data.';
            } else if (err.response?.status === 409) {
                errorMessage = 'Email already registered. Please use a different email.';
            } else if (err.response?.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            }

            // Show detailed error to user
            Alert.alert(
                'Registration Failed', 
                errorMessage,
                [
                    { text: 'OK', style: 'default' },
                    { 
                        text: 'Retry', 
                        style: 'default',
                        onPress: () => handleRegister()
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    // Debug function to test network connectivity
    const handleNetworkDebug = async () => {
        console.log('🔧 Running Network Debug...');
        Alert.alert('Debug', 'Running network diagnostics. Check console for details.');
        
        try {
            const results = await runNetworkDiagnostics();
            
            const message = `
App Mode: ${results.networkInfo.appMode}
API URL: ${results.networkInfo.apiBaseUrl}
Connectivity: ${results.connectivityTest.success ? '✅ Pass' : '❌ Fail'}
Registration: ${results.registrationTest.success ? '✅ Pass' : '❌ Fail'}

Check console for detailed results.
            `.trim();

            Alert.alert(
                'Network Diagnostics', 
                message,
                [{ text: 'OK', style: 'default' }]
            );
        } catch (error) {
            console.error('Debug failed:', error);
            Alert.alert('Debug Failed', error.message);
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
                            onChangeText={(text) => {
                                setName(text);
                                clearError('name');
                            }}
                            onBlur={() => {
                                const error = validateField('name', name);
                                setErrors(prev => ({ ...prev, name: error }));
                            }}
                            autoCapitalize="words"
                        />
                        {/* Validation Added - Error message for name */}
                        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                    </Field>

                    {/* Email */}
                    <Field icon="mail-outline" label="Email Address">
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                clearError('email');
                            }}
                            onBlur={() => {
                                const error = validateField('email', email);
                                setErrors(prev => ({ ...prev, email: error }));
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {/* Validation Added - Error message for email */}
                        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </Field>

                    {/* Phone — Optional */}
                    <Field icon="call-outline" label="Mobile Number (Optional)">
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.inputFlex}
                                placeholder="98xxxxxxxx"
                                placeholderTextColor={COLORS.textMuted}
                                value={phone}
                                onChangeText={(text) => {
                                    setPhone(text);
                                    clearError('phone');
                                }}
                                onBlur={() => {
                                    const error = validateField('phone', phone);
                                    setErrors(prev => ({ ...prev, phone: error }));
                                }}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                            <TouchableOpacity style={styles.iconButton} onPress={handlePickContact} activeOpacity={0.7}>
                                <Ionicons name="book" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        {/* Validation Added - Error message for phone */}
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                    </Field>

                    {/* Designation */}
                    <Field icon="briefcase-outline" label="Designation">
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Software Developer, Manager"
                            placeholderTextColor={COLORS.textMuted}
                            value={designation}
                            onChangeText={(text) => {
                                setDesignation(text);
                                clearError('designation');
                            }}
                            onBlur={() => {
                                const error = validateField('designation', designation);
                                setErrors(prev => ({ ...prev, designation: error }));
                            }}
                            autoCapitalize="words"
                        />
                        {/* Validation Added - Error message for designation */}
                        {errors.designation ? <Text style={styles.errorText}>{errors.designation}</Text> : null}
                    </Field>

                    {/* Password */}
                    <Field icon="lock-closed-outline" label="Password">
                        <View style={styles.passRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Min. 8 characters"
                                placeholderTextColor={COLORS.textMuted}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    clearError('password');
                                }}
                                onBlur={() => {
                                    const error = validateField('password', password);
                                    setErrors(prev => ({ ...prev, password: error }));
                                }}
                                secureTextEntry={!showPass}
                            />
                            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                                <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                        {/* Validation Added - Error message for password */}
                        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </Field>

                    {/* Confirm Password */}
                    <Field icon="lock-closed-outline" label="Confirm Password">
                        <TextInput
                            style={styles.input}
                            placeholder="Re-enter password"
                            placeholderTextColor={COLORS.textMuted}
                            value={confirmPass}
                            onChangeText={(text) => {
                                setConfirmPass(text);
                                clearError('confirmPass');
                            }}
                            onBlur={() => {
                                const error = validateField('confirmPass', confirmPass);
                                setErrors(prev => ({ ...prev, confirmPass: error }));
                            }}
                            secureTextEntry={!showPass}
                        />
                        {/* Validation Added - Error message for confirm password */}
                        {errors.confirmPass ? <Text style={styles.errorText}>{errors.confirmPass}</Text> : null}
                    </Field>

                    {/* Gender */}
                    <Field icon="person-outline" label="Gender">
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]}
                                onPress={() => {
                                    setGender('male');
                                    clearError('gender');
                                }}
                            >
                                <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>Male</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]}
                                onPress={() => {
                                    setGender('female');
                                    clearError('gender');
                                }}
                            >
                                <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>Female</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'other' && styles.genderOptionSelected]}
                                onPress={() => {
                                    setGender('other');
                                    clearError('gender');
                                }}
                            >
                                <Text style={[styles.genderText, gender === 'other' && styles.genderTextSelected]}>Other</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Validation Added - Error message for gender */}
                        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
                    </Field>

                    {/* Date of Birth */}
                    <Field icon="calendar-outline" label="Date of Birth">
                        <TextInput
                            style={styles.input}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor={COLORS.textMuted}
                            value={dateOfBirth}
                            onChangeText={(text) => {
                                setDateOfBirth(text);
                                clearError('dateOfBirth');
                            }}
                            onBlur={() => {
                                const error = validateField('dateOfBirth', dateOfBirth);
                                setErrors(prev => ({ ...prev, dateOfBirth: error }));
                            }}
                            maxLength={10}
                        />
                        {/* Validation Added - Error message for date of birth */}
                        {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}
                    </Field>

                    {/* Address */}
                    <Field icon="home-outline" label="Address">
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Enter your address"
                            placeholderTextColor={COLORS.textMuted}
                            value={address}
                            onChangeText={(text) => {
                                setAddress(text);
                                clearError('address');
                            }}
                            onBlur={() => {
                                const error = validateField('address', address);
                                setErrors(prev => ({ ...prev, address: error }));
                            }}
                            multiline
                            numberOfLines={3}
                        />
                        {/* Validation Added - Error message for address */}
                        {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
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

                    {/* Debug Button - Only show in development */}
                    {__DEV__ && (
                        <TouchableOpacity
                            style={styles.debugButton}
                            onPress={handleNetworkDebug}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="bug-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.debugButtonText}>Test Network</Text>
                        </TouchableOpacity>
                    )}

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
    // Validation Added - Error text style
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        marginTop: -8,
        marginBottom: 6,
        marginLeft: 4,
    },
    // Debug button styles
    debugButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginTop: 8,
        marginBottom: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    debugButtonText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 4,
        fontWeight: '500',
    },
});

export default SignupScreen;
