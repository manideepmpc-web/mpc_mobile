import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const Input = ({
    label, value, onChangeText, placeholder, secureTextEntry,
    keyboardType, multiline, autoCapitalize, style, icon,
}) => {
    const [focused, setFocused] = useState(false);
    const [showSecure, setShowSecure] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>}
            <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
                {icon && (
                    <Ionicons name={icon} size={18} color={focused ? COLORS.primary : COLORS.textMuted} style={styles.icon} />
                )}
                <TextInput
                    style={[styles.input, multiline && styles.multiline]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={secureTextEntry && !showSecure}
                    keyboardType={keyboardType || 'default'}
                    multiline={multiline}
                    autoCapitalize={autoCapitalize || 'sentences'}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {secureTextEntry && (
                    <TouchableOpacity onPress={() => setShowSecure(!showSecure)} style={styles.eyeBtn}>
                        <Ionicons name={showSecure ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 14 },
    label: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 6 },
    labelFocused: { color: COLORS.primary },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderColor: COLORS.border,
        borderRadius: 12, backgroundColor: COLORS.background,
        paddingHorizontal: 12, minHeight: 50,
    },
    inputRowFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
    icon: { marginRight: 8 },
    input: { flex: 1, fontSize: 14, color: COLORS.textPrimary, paddingVertical: 12 },
    multiline: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
    eyeBtn: { padding: 4 },
});

export default Input;
