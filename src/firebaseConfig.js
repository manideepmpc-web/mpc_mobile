// Firebase configuration and initialization
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import {
    initializeAuth,
    getReactNativePersistence,
    browserLocalPersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
    apiKey: "AIzaSyBuud9Uunj2Ad4helCZs2heZGGavdBlukQ",
    authDomain: "mpcmobile-d94cc.firebaseapp.com",
    projectId: "mpcmobile-d94cc",
    storageBucket: "mpcmobile-d94cc.firebasestorage.app",
    messagingSenderId: "88923688865",
    appId: "1:88923688865:android:43b6d2db4c42427e1845e0",
};

// Initialize Firebase App
export const firebaseApp = initializeApp(firebaseConfig);

// Use platform-appropriate persistence:
//  - Native (Android/iOS): AsyncStorage-based persistence
//  - Web (Expo Go / browser): browserLocalPersistence
export const auth = initializeAuth(firebaseApp, {
    persistence: Platform.OS === 'web'
        ? browserLocalPersistence
        : getReactNativePersistence(AsyncStorage),
});
