# 🚀 Quick Render Deployment Guide (5 Minutes)

## What I've Done For You:
✅ Prepared backend for Render  
✅ Created Procfile  
✅ Set up environment configuration  
✅ Pushed to GitHub  

## Your Action Items:

### Step 1: Create GitHub Account (if needed)
Go to https://github.com and create an account

### Step 2: Push Backend Code to Your GitHub

```bash
cd /home/manideep/mpc_2026/backend
git add .
git commit -m "MPC HRMS Backend for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mpc-hrms-backend.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Go to Render.com
1. Visit https://render.com
2. Sign up with GitHub (authorize)
3. Go to Dashboard

### Step 4: Deploy Backend
1. Click **New** → **Web Service**
2. Select your `mpc-hrms-backend` repository
3. Fill in:
   - **Name**: `mpc-hrms-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

4. Add these Environment Variables:
   ```
   DB_HOST = your-mysql-host (or keep localhost if accessible)
   DB_USER = root
   DB_PASSWORD = Password@1
   DB_NAME = mpc
   JWT_SECRET = mpc_hrms_super_secret_key_2026
   JWT_EXPIRES_IN = 7d
   ```

5. Click **Create Web Service**

### Step 5: Wait & Get URL
After 2-5 minutes, Render will give you a URL like:
```
https://mpc-hrms-backend-xxxxx.onrender.com
```

### Step 6: Update Mobile App Config

Edit `/home/manideep/mpc_2026/src/constants/config.js`:

```javascript
export const API_BASE_URL = 'https://mpc-hrms-backend-xxxxx.onrender.com/api';
```

Replace `xxxxx` with your actual Render URL.

### Step 7: Rebuild APK

```bash
cd /home/manideep/mpc_2026/android
./gradlew assembleRelease
```

New APK: `android/app/build/outputs/apk/release/app-release.apk`

### Step 8: Test Login
Install new APK and try:
- Email: `mpc_hyd@moneytracker.com`
- Password: `mpc_hyd@1`

---

## ⚠️ IMPORTANT - Database Issue:

Your MySQL is on `localhost` which won't work on Render.

**Solutions:**
1. **Host MySQL externally** (Google Cloud SQL, AWS RDS, etc.)
2. **Keep using local backend** with ngrok/localtunnel (current working setup)
3. **Use SQLite instead** (easier to deploy, less data)

---

## If Deployment Fails:

Check Render logs for error. Common issues:
- Database not accessible
- Node.js version mismatch
- Missing environment variables

---

## For Now: Use Current Setup
Your local backend + localtunnel is already working! 
Just keep running:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
lt --port 5000
```

And update `config.js` with the localtunnel URL.

---

Questions? Let me know!
