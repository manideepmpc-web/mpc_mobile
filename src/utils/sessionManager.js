import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services';
import { isOfflineMode } from '../config/appMode';

// Storage keys
const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';
const SESSION_EXPIRY_KEY = '@session_expiry';

// Session management utility
export const sessionManager = {
  // Save session data
  saveSession: async (token, userData) => {
    try {
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [USER_DATA_KEY, JSON.stringify(userData)],
        [SESSION_EXPIRY_KEY, expiryTime.toString()],
      ]);
      
      console.log('✅ Session saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save session:', error);
      return false;
    }
  },

  // Get session data
  getSession: async () => {
    try {
      const [token, userData, expiry] = await AsyncStorage.multiGet([
        AUTH_TOKEN_KEY,
        USER_DATA_KEY,
        SESSION_EXPIRY_KEY,
      ]);

      const sessionToken = token[1];
      const sessionUserData = userData[1];
      const sessionExpiry = expiry[1];

      // Check if session has expired
      if (sessionExpiry && Date.now() > parseInt(sessionExpiry)) {
        console.log('⏰ Session expired, clearing...');
        await this.clearSession();
        return null;
      }

      if (sessionToken && sessionUserData) {
        return {
          token: sessionToken,
          user: JSON.parse(sessionUserData),
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      return null;
    }
  },

  // Clear session data
  clearSession: async () => {
    try {
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        USER_DATA_KEY,
        SESSION_EXPIRY_KEY,
      ]);
      
      console.log('✅ Session cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
      return false;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const session = await this.getSession();
      return !!session;
    } catch (error) {
      console.error('❌ Failed to check login status:', error);
      return false;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const session = await this.getSession();
      return session ? session.user : null;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  },

  // Get auth token
  getToken: async () => {
    try {
      const session = await this.getSession();
      return session ? session.token : null;
    } catch (error) {
      console.error('❌ Failed to get token:', error);
      return null;
    }
  },

  // Restore session on app start
  restoreSession: async () => {
    try {
      console.log('🔄 Restoring session...');
      
      const session = await this.getSession();
      
      if (session) {
        console.log('✅ Session restored successfully');
        
        // In offline mode, we don't need to validate with backend
        if (isOfflineMode()) {
          return session;
        }
        
        // In online mode, validate token with backend
        try {
          const response = await authService.getMe();
          if (response.data.success) {
            // Update user data with latest from backend
            await this.saveSession(session.token, response.data.data);
            return session;
          } else {
            // Token invalid, clear session
            await this.clearSession();
            return null;
          }
        } catch (error) {
          console.warn('⚠️ Failed to validate session with backend, keeping offline session');
          return session;
        }
      } else {
        console.log('ℹ️ No active session found');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to restore session:', error);
      return null;
    }
  },

  // Refresh session (extend expiry)
  refreshSession: async () => {
    try {
      const session = await this.getSession();
      
      if (session) {
        await this.saveSession(session.token, session.user);
        console.log('✅ Session refreshed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to refresh session:', error);
      return false;
    }
  },

  // Update user data in session
  updateUserData: async (userData) => {
    try {
      const session = await this.getSession();
      
      if (session) {
        const updatedUser = { ...session.user, ...userData };
        await this.saveSession(session.token, updatedUser);
        console.log('✅ User data updated in session');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to update user data:', error);
      return false;
    }
  },

  // Get session info (for debugging)
  getSessionInfo: async () => {
    try {
      const [token, userData, expiry] = await AsyncStorage.multiGet([
        AUTH_TOKEN_KEY,
        USER_DATA_KEY,
        SESSION_EXPIRY_KEY,
      ]);

      return {
        hasToken: !!token[1],
        hasUserData: !!userData[1],
        hasExpiry: !!expiry[1],
        expiryTime: expiry[1] ? new Date(parseInt(expiry[1])).toLocaleString() : null,
        isExpired: expiry[1] ? Date.now() > parseInt(expiry[1]) : null,
        tokenLength: token[1] ? token[1].length : 0,
      };
    } catch (error) {
      console.error('❌ Failed to get session info:', error);
      return null;
    }
  },
};

export default sessionManager;
