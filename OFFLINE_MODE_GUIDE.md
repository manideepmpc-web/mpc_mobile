# Offline Mode Implementation Guide

## Overview
Your React Native app now supports both **Online Mode** and **Offline Mode** with seamless switching between them.

## Architecture

### Online Mode (Default)
- React Native App → Railway Backend APIs → PostgreSQL
- Uses existing Axios services
- All current functionality preserved

### Offline Mode
- React Native App → Local SQLite + AsyncStorage
- Works without internet connection
- Complete CRUD operations locally

## How to Switch Modes

### Method 1: Change Configuration Flag
Edit `/src/config/appMode.js`:

```javascript
// For Online Mode (uses Railway backend)
export const APP_MODE = 'online';

// For Offline Mode (uses local SQLite)
export const APP_MODE = 'offline';
```

### Method 2: Comment/Uncomment
```javascript
// export const APP_MODE = 'online';
export const APP_MODE = 'offline';
```

## Features Available in Offline Mode

### ✅ Authentication
- Login with demo credentials
- Session persistence
- User registration
- Logout functionality

**Demo Credentials:**
- Email: `admin@mpc.com` / Password: `Admin@123`
- Email: `test@mpc.com` / Password: `mpc@123`

### ✅ Employee Management
- View all employees
- Get employee details
- Update employee information
- Create new employees
- Search employees

### ✅ Attendance System
- Check in/out with location
- View today's attendance
- Attendance history
- Monthly statistics
- Mark attendance manually

### ✅ Leave Management
- Apply for leave
- View leave balance
- Approve/reject leaves (admin)
- Leave history
- Cancel leave requests

### ✅ Loan Management
- Create loans (given/taken)
- Track payments
- View loan summary
- Update loan details
- Delete loans

### ✅ Dashboard
- Basic statistics from local data
- Employee counts
- Active loans summary

## Database Schema

### Local SQLite Tables
- `employees` - Employee information
- `departments` - Department data
- `attendance` - Attendance records
- `leaves` - Leave applications
- `loans` - Loan information
- `loan_payments` - Payment records
- `employee_location` - Location tracking

### Data Conversion
- PostgreSQL `SERIAL` → SQLite `INTEGER PRIMARY KEY AUTOINCREMENT`
- PostgreSQL `ENUM` → SQLite `TEXT`
- PostgreSQL `BOOLEAN` → SQLite `INTEGER`
- Timestamps preserved as `DATETIME`

## File Structure

```
src/
├── config/
│   └── appMode.js          # Mode configuration
├── db/
│   ├── database.js         # SQLite helper
│   └── schema.js           # Database schema
├── services/
│   ├── index.js            # Wrapper services (online/offline)
│   ├── api.js              # Axios API (online)
│   ├── offlineAuthService.js
│   ├── offlineEmployeeService.js
│   ├── offlineAttendanceService.js
│   ├── offlineLeaveService.js
│   └── offlineLoanService.js
├── utils/
│   └── sessionManager.js   # Session persistence
├── hooks/
│   └── useAppInitialization.js
└── components/
    └── AppInitializer.js   # App startup
```

## Session Management

### AsyncStorage Keys
- `@auth_token` - JWT token
- `@user_data` - User information
- `@session_expiry` - Session expiry time

### Session Features
- Automatic session restoration on app start
- 7-day session expiry
- Token validation (online mode)
- Session refresh capability

## Testing the Implementation

### 1. Test Online Mode
```javascript
// In src/config/appMode.js
export const APP_MODE = 'online';
```
- App should work exactly as before
- All API calls go to Railway backend
- Existing functionality preserved

### 2. Test Offline Mode
```javascript
// In src/config/appMode.js
export const APP_MODE = 'offline';
```
- App works without internet
- Data stored locally in SQLite
- All CRUD operations functional

### 3. Test Mode Switching
1. Start app in online mode
2. Use app normally
3. Change to offline mode
4. Restart app
5. Verify offline functionality

## Important Notes

### ⚠️ Data Synchronization
- **No automatic sync** between online and offline data
- Offline data is completely separate from online database
- Consider implementing sync logic if needed

### ⚠️ User Authentication
- Offline mode uses demo credentials
- Password validation is simplified for demo
- In production, implement proper offline auth

### ⚠️ Location Services
- Limited offline location functionality
- Consider implementing local location storage

### ⚠️ File Uploads
- Profile photos and file uploads work only in online mode
- Offline mode stores file paths as text

## Production Considerations

### Security
- Implement proper password hashing in offline mode
- Add encryption for sensitive local data
- Consider biometric authentication

### Data Migration
- Plan data migration strategy if switching modes
- Export/import functionality for data portability
- Backup mechanisms for offline data

### Performance
- SQLite database is optimized for mobile
- Consider database indexing for large datasets
- Implement data cleanup policies

## Troubleshooting

### Common Issues

1. **Database initialization fails**
   - Check expo-sqlite installation
   - Verify device permissions
   - Restart the app

2. **Session not persisting**
   - Check AsyncStorage availability
   - Verify sessionManager implementation
   - Clear app data and retry

3. **Mode switching not working**
   - Verify appMode.js configuration
   - Restart app after changing mode
   - Check console logs for mode status

4. **API calls in offline mode**
   - Services should automatically route to offline handlers
   - Check isOnlineMode() function calls
   - Verify service wrapper implementation

### Debug Logs
Enable console logging to see mode status:
- `🚀 App Mode: ONLINE` or `🚀 App Mode: OFFLINE`
- `📱 Offline mode detected, initializing local database...`
- `🌐 Online mode detected, skipping local database initialization`

## Next Steps

1. **Test thoroughly** in both modes
2. **Implement data sync** if needed
3. **Add offline indicators** in UI
4. **Enhance security** for offline storage
5. **Consider conflict resolution** for data sync

## Support

For issues or questions:
1. Check console logs for error messages
2. Verify mode configuration in appMode.js
3. Ensure all dependencies are properly installed
4. Test with fresh app installation
