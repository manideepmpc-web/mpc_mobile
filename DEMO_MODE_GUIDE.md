# 🎯 Demo Mode - Client Testing Without Backend

## Overview

Demo Mode allows you to test and demo the app **WITHOUT running the backend server**. Perfect for client presentations, testing, and showcasing features.

---

## How It Works

### **Demo Mode Enabled (Default for APK)**
- ✅ No backend server needed
- ✅ Login works with hardcoded credentials
- ✅ App functions like it's connected to backend
- ✅ Perfect for client demos

### **Real Mode (For Development)**
- 🔧 Requires backend running
- 🔧 Uses real API calls
- 🔧 Uses real database
- 🔧 For actual deployment

---

## Quick Start

### **Test Credentials (Demo Mode)**

```
Email: test@mpc.com
Password: mpc@123
```

OR

```
Email: mpc_hyd@moneytracker.com
Password: mpc_hyd@1
```

Just enter these credentials and the app logs you in **instantly** without any backend!

---

## Configuration

### **Enable Demo Mode** (for testing APK)

Edit: `/src/config/demoMode.js`

```javascript
export const DEMO_MODE = true; // ✅ Demo mode ON
```

### **Disable Demo Mode** (for production/real backend)

```javascript
export const DEMO_MODE = false; // 🔧 Use real backend
```

---

## File Structure

### **New Files Created:**

```
src/
├── config/
│   └── demoMode.js              # Demo mode toggle & config
├── services/
│   └── mockAuthService.js       # Mock authentication (no backend)
├── components/
│   └── DemoModeBanner.jsx       # Shows when demo mode is active
└── store/
    └── authStore.js             # Updated to use mock auth
```

---

## How to Use

### **For Client Demo:**

1. Build APK with Demo Mode enabled:
   ```bash
   cd /home/manideep/mpc_2026/android
   ./gradlew assembleRelease
   ```

2. Install APK on device or emulator:
   ```bash
   adb install app-release.apk
   ```

3. Open app and login with:
   - Email: `test@mpc.com`
   - Password: `mpc@123`

4. App logs in instantly ✅ **No backend needed!**

### **For Development (Real Backend):**

1. Disable demo mode in `/src/config/demoMode.js`:
   ```javascript
   export const DEMO_MODE = false;
   ```

2. Start backend:
   ```bash
   cd /home/manideep/mpc_2026/backend
   npm start
   ```

3. Build APK:
   ```bash
   cd android && ./gradlew assembleRelease
   ```

4. Login with real backend API

---

## What's Mocked

### **Implemented Mock Services:**

✅ **Login** - Works with demo credentials  
✅ **Register** - Accepts any input  
✅ **OTP Verification** - Auto-verifies  
✅ **Get Profile** - Returns demo user data  

### **Mock Data Included:**

```javascript
{
    id: 1,
    employee_id: 'TEST001',
    name: 'Test User',
    email: 'test@mpc.com',
    phone: '9999999999',
    department_id: 1,
    designation: 'Test Admin',
    role: 'admin',
    date_of_joining: '2026-04-16',
    gender: 'male',
    is_active: 1
}
```

---

## Visual Indicator

When Demo Mode is **ON**, a yellow banner appears at the top:

```
📌 DEMO MODE - No Backend Required
```

This tells users/clients that the app is running in demo mode.

---

## Testing Scenarios

### **Scenario 1: Client Demo**
1. Disable backend (don't run npm start)
2. Enable demo mode (DEMO_MODE = true)
3. Build APK
4. Client installs and tests
5. ✅ Everything works without backend!

### **Scenario 2: Local Development**
1. Enable backend (npm start)
2. Disable demo mode (DEMO_MODE = false)
3. Build APK
4. Test real API integration
5. ✅ Backend handles actual requests

### **Scenario 3: Emergency Fallback**
If backend crashes during presentation:
1. Switch DEMO_MODE = true
2. Rebuild quickly
3. Demo continues without interruption
4. ✅ Professional demo experience

---

## Adding More Mock Credentials

Edit `/src/services/mockAuthService.js`:

```javascript
const DEMO_CREDENTIALS = {
    'test@mpc.com': 'mpc@123',
    'mpc_hyd@moneytracker.com': 'mpc_hyd@1',
    'newuser@mpc.com': 'newpass123', // Add new credentials
};

const DEMO_USERS = {
    'test@mpc.com': { /* existing data */ },
    'newuser@mpc.com': {
        // Add new user data
        id: 2,
        name: 'New User',
        // ... other fields
    },
};
```

---

## Important Notes

⚠️ **Demo Mode is for testing/demo only**
- Don't deploy to production with DEMO_MODE = true
- Real data won't be saved
- No actual backend integration

✅ **Before Production:**
- Set `DEMO_MODE = false`
- Ensure backend is deployed
- Test real API calls
- Remove demo credentials

---

## Switching Between Modes

### Quick Commands:

**Enable Demo Mode:**
```bash
sed -i "s/export const DEMO_MODE = false/export const DEMO_MODE = true/" src/config/demoMode.js
```

**Disable Demo Mode:**
```bash
sed -i "s/export const DEMO_MODE = true/export const DEMO_MODE = false/" src/config/demoMode.js
```

**Check Current Mode:**
```bash
grep "DEMO_MODE =" src/config/demoMode.js
```

---

## Troubleshooting

### **Q: Why is login instant in demo mode?**
A: Because it's hardcoded, no network call is made.

### **Q: Can I use real credentials in demo mode?**
A: Only the hardcoded ones work. Add more in mockAuthService.js

### **Q: Does demo mode affect real backend?**
A: No. When DEMO_MODE = false, it uses real API again.

### **Q: How do I show client this is a demo?**
A: The yellow banner appears automatically when DEMO_MODE = true

---

## Summary

| Feature | Demo Mode | Real Mode |
|---------|-----------|-----------|
| Backend needed | ❌ No | ✅ Yes |
| Login time | ⚡ Instant | 📡 Network delay |
| Data saved | ❌ No | ✅ Yes |
| Client demo | ✅ Perfect | ❌ Need backend |
| Development | ❌ Limited | ✅ Full features |
| Credentials | 🔐 Hardcoded | 💾 Database |

---

**Status: ✅ Demo Mode Ready**

Your app can now be tested and demoed WITHOUT running the backend! 🚀
