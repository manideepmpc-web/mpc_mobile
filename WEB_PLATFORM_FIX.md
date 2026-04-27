# Web Platform Fix for Offline Mode

## Issue
The `expo-sqlite` package doesn't work on web platform because it requires WebAssembly files that aren't included in the web bundle.

## Solution
Implemented platform-specific database handling:

### 1. Mock Database for Web (`src/db/webDatabase.js`)
- Provides in-memory mock storage for web platform
- Implements same interface as SQLite database
- Includes demo data for testing
- Handles basic CRUD operations

### 2. Platform Detection (`src/db/database.js`)
- Automatically detects web platform
- Routes database calls to appropriate implementation
- Maintains same API for all platforms

### 3. App Initialization (`src/hooks/useAppInitialization.js`)
- Skips SQLite initialization on web platform
- Shows appropriate console messages
- Still initializes session management

## How It Works

### On Mobile Platforms (iOS/Android)
```javascript
// Uses real SQLite database
import * as SQLite from 'expo-sqlite';
db = await SQLite.openDatabaseAsync('mpc_offline.db');
```

### On Web Platform
```javascript
// Uses mock database
import webDatabase from './webDatabase';
return await webDatabase.executeQuery(query, params);
```

## Features Available on Web

### ✅ Authentication
- Login with demo credentials
- Session persistence in AsyncStorage
- User registration (mock)

### ✅ Employee Management
- View demo employees
- Basic CRUD operations (in-memory)

### ✅ Other Services
- Attendance, Leave, Loan services work with mock data
- All API calls return mock responses
- UI functions normally

## Limitations on Web

### ⚠️ Data Persistence
- Data is stored in memory only
- Refreshing the page clears all data
- No permanent storage

### ⚠️ SQLite Features
- No real database functionality
- Mock query parsing (basic only)
- No complex queries or transactions

### ⚠️ File Operations
- No file uploads
- No profile photo storage
- Limited offline capabilities

## Testing on Web

1. Start the app in web mode:
   ```bash
   npm run web
   ```

2. Set app mode to offline:
   ```javascript
   // src/config/appMode.js
   export const APP_MODE = 'offline';
   ```

3. Test functionality:
   - Login with demo credentials
   - View employee list
   - Test other features

## Console Messages

You'll see these messages on web platform:
```
🚀 App Mode: OFFLINE
🌐 Web platform detected, skipping SQLite initialization (not supported)
🌐 Web: Using mock database
🌐 Web: Mock query execution: SELECT * FROM employees
```

## Development Notes

### Adding New Queries
When adding new database queries, update `webDatabase.js`:
```javascript
if (query.includes('SELECT') && query.includes('new_table')) {
  return mockData.newTable;
}
```

### Production Considerations
- For production web app, consider using:
  - IndexedDB for real offline storage
  - Service Workers for caching
  - PWA capabilities

### Alternative Solutions
1. **Use IndexedDB**: More robust browser storage
2. **Use Dexie.js**: Simplified IndexedDB wrapper
3. **Use PouchDB**: Sync-enabled NoSQL database

## File Structure
```
src/db/
├── database.js        # Main database with platform detection
├── webDatabase.js     # Mock database for web platform
└── schema.js          # Database schema (shared)
```

## Troubleshooting

### Common Issues

1. **"expo-sqlite not found" on web**
   - Fixed: Uses mock database instead
   - Check console for platform detection messages

2. **Data not persisting on web**
   - Expected: Mock database uses in-memory storage
   - Solution: Use IndexedDB for persistence

3. **Queries not working on web**
   - Check if query is implemented in webDatabase.js
   - Add mock implementation for new queries

### Debug Mode
Enable verbose logging:
```javascript
console.log('🌐 Web: Mock query execution:', query, params);
```

This ensures your app works seamlessly across all platforms while maintaining full functionality on mobile devices.
