import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const Avatar = ({ name, size = 48, fontSize = 18, imageUri }) => {
    const initials = name
        ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '?';

    if (imageUri) {
        return (
            <Image
                source={{ uri: imageUri }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
            />
        );
    }

    return (
        <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        >
            <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    avatar: { alignItems: 'center', justifyContent: 'center' },
    initials: { color: COLORS.white, fontWeight: '800' },
});

export default Avatar;
