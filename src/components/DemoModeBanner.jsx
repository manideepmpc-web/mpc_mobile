// src/components/DemoModeBanner.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DEMO_MODE from '../config/demoMode';
import { COLORS } from '../constants/colors';

export const DemoModeBanner = () => {
    if (!DEMO_MODE) return null;

    return (
        <View style={styles.banner}>
            <Text style={styles.text}>📌 DEMO MODE - No Backend Required</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#FFD700',
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#FFC700',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        letterSpacing: 0.5,
    },
});

export default DemoModeBanner;
