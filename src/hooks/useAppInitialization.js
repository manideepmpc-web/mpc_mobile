import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { initDatabase } from '../db/database';
import { sessionManager } from '../utils/sessionManager';
import { isOfflineMode } from '../config/appMode';

export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // Initialize database if in offline mode and not on web platform
      if (isOfflineMode() && Platform.OS !== 'web') {
        console.log('📱 Offline mode detected, initializing local database...');
        await initDatabase();
        console.log('✅ Local database initialized');
      } else if (isOfflineMode() && Platform.OS === 'web') {
        console.log('🌐 Web platform detected, skipping SQLite initialization (not supported)');
      } else {
        console.log('🌐 Online mode detected, skipping local database initialization');
      }

      // Restore session
      console.log('🔄 Restoring user session...');
      const restoredSession = await sessionManager.restoreSession();
      
      if (restoredSession) {
        console.log('✅ Session restored successfully');
        setSession(restoredSession);
      } else {
        console.log('ℹ️ No active session found');
      }

      setIsInitialized(true);
      console.log('✅ App initialization completed');
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      setInitializationError(error);
      setIsInitialized(true); // Still mark as initialized to allow app to show error screen
    }
  };

  const retryInitialization = async () => {
    setIsInitialized(false);
    setInitializationError(null);
    setSession(null);
    await initializeApp();
  };

  return {
    isInitialized,
    initializationError,
    session,
    retryInitialization,
  };
};
