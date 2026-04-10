import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const Button = ({ title, onPress, loading, style, variant = 'primary', disabled }) => {
    if (variant === 'outline') {
        return (
            <TouchableOpacity
                style={[styles.outlineBtn, style, disabled && styles.disabled]}
                onPress={onPress}
                disabled={loading || disabled}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Text style={styles.outlineText}>{title}</Text>
                )}
            </TouchableOpacity>
        );
    }

    return (
        <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, style, (disabled || loading) && styles.disabled]}
        >
            <TouchableOpacity
                style={styles.inner}
                onPress={onPress}
                disabled={loading || disabled}
                activeOpacity={0.85}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                    <Text style={styles.text}>{title}</Text>
                )}
            </TouchableOpacity>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { borderRadius: 14 },
    inner: { paddingVertical: 15, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
    text: { color: COLORS.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
    outlineBtn: {
        borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary,
        paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center',
    },
    outlineText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
    disabled: { opacity: 0.55 },
});

export default Button;
