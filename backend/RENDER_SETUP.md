# Render.com Deployment Guide

## Current Challenge:
Your backend requires MySQL database connectivity. Your local database is on `localhost:3306` which won't be accessible from Render servers.

## Solution: Use MongoDB Atlas (Free Tier) + Render

### Step 1: Prepare Backend for Render

Your backend is ready! Just need to ensure the Procfile is correct:

```bash
cd /home/manideep/mpc_2026/backend
```

The `Procfile` is already created with:
```
web: node index.js
```

### Step 2: Push Backend to GitHub

```bash
cd /home/manideep/mpc_2026/backend
git add .
git commit -m "Backend ready for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mpc-hrms-backend.git
git push -u origin main
```

### Step 3: Create Render Account
1. Visit https://render.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Render

### Step 4: Deploy on Render

1. Click "New+" → "Web Service"
2. Select "Deploy an existing repository"
3. Choose your `mpc-hrms-backend` repository
4. Fill in details:
   - **Name**: `mpc-hrms-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

5. **Add Environment Variables**:
   ```
   DB_HOST=your-database-host
   DB_USER=root
   DB_PASSWORD=Password@1
   DB_NAME=mpc
   JWT_SECRET=mpc_hrms_super_secret_key_2026
   JWT_EXPIRES_IN=7d
   PORT=5000
   ```

6. Click "Create Web Service"

### Step 5: Wait for Deployment
Render will build and deploy your backend. You'll get a URL like:
```
https://mpc-hrms-backend.onrender.com
```

### Step 6: Update Mobile App

Update `/home/manideep/mpc_2026/src/constants/config.js`:

```javascript
export const API_BASE_URL = 'https://mpc-hrms-backend.onrender.com/api';
```

### Step 7: Rebuild APK

```bash
cd /home/manideep/mpc_2026/android
./gradlew assembleRelease
```

New APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Database Problem: IMPORTANT ⚠️

Your backend connects to MySQL on `localhost`. This won't work on Render because:
- Render servers can't access your local machine
- The database needs to be cloud-hosted

### Solution A: Use Cloud SQL (Google Cloud)
- Host MySQL on Google Cloud SQL
- Update DB_HOST with cloud instance IP

### Solution B: Keep Local + Use SSH Tunnel
- Might work but complex and not recommended

### Solution C: For Demo Purposes
If you just want to demo the app:
- Keep backend running locally
- Use ngrok/localtunnel tunnel (already set up)
- App works with mobile data through the tunnel

---

## Recommendations:

1. **For Quick Demo**: Use local backend + localtunnel/ngrok (current setup)
2. **For Production**: Move database to cloud (Google Cloud SQL, AWS RDS, or MongoDB Atlas)
3. **For Testing**: Deploy a separate backend instance with mock data

---

## Your Current Setup Status:

✅ Backend code ready
✅ Procfile configured
✅ Environment variables defined
✅ Node.js version compatible

❌ Database needs to be cloud-hosted for Render

**Action Items:**
1. Create GitHub account if not done
2. Push backend to GitHub
3. Create Render account
4. Deploy on Render
5. Configure database connectivity
6. Update mobile app config
7. Rebuild APK

---

## Need Help?
- Render Docs: https://render.com/docs
- GitHub: https://github.com
- Contact support for any issues
