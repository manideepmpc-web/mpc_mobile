// App Mode Configuration
// Switch between 'online' and 'offline' modes
// 
// ONLINE MODE: Uses Railway backend APIs + PostgreSQL
// OFFLINE MODE: Uses local SQLite + AsyncStorage

export const APP_MODE = 'online'; // Change to 'offline' for offline mode

// Alternative: Use boolean flag
// export const USE_OFFLINE_MODE = false;

// Helper functions to check current mode
export const isOnlineMode = () => APP_MODE === 'online';
export const isOfflineMode = () => APP_MODE === 'offline';

console.log('🚀 App Mode:', APP_MODE.toUpperCase());
