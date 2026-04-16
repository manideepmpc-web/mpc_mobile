# 🚀 Clever Cloud Deployment Guide

## Prerequisites

Before deploying to Clever Cloud, you need:

1. **Clever Cloud Account** - Sign up at https://console.clever-cloud.com/
2. **GitHub Account** - Your repo must be on GitHub
3. **Git CLI** - Already have it
4. **Clever Cloud CLI** (optional but recommended)

---

## Step 1: Create Clever Cloud Account & Organization

1. Go to https://console.clever-cloud.com/
2. Sign up with email
3. Create an organization or use personal space
4. Verify email

---

## Step 2: Push Code to GitHub

Make sure your code is pushed to GitHub:

```bash
cd /home/manideep/mpc_2026
git add .
git commit -m "prep: prepare for Clever Cloud deployment"
git push origin main
```

---

## Step 3: Create Node.js App on Clever Cloud

### Option A: Using Web Dashboard (Easiest)

1. Login to https://console.clever-cloud.com/
2. Click **"Create an app"** or **"Create"** button
3. Select **"Node.js"** runtime
4. Choose **"GitHub"** as deployment source
5. Authorize and select your repository: `mpc_mobile`
6. Select **`main`** branch
7. Root path: `/backend` (IMPORTANT - your backend is in this folder)
8. Click **Create**

### Option B: Using CLI

```bash
npm install -g clever-cli
clever login
clever create -t node -n mpc-backend --region eu
clever link <app-id>
```

---

## Step 4: Configure Environment Variables

After creating the app:

1. Go to **App Settings** → **Environment Variables**
2. Add these variables (MUST-HAVE):

```
DB_HOST=your-mysql-host.com
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=mpc
JWT_SECRET=mpc_hrms_super_secret_key_2026
JWT_EXPIRES_IN=7d
PORT=8080
NODE_ENV=production
```

### For MySQL, you have options:

**Option 1: Clever Cloud MySQL Add-on (Recommended)**
- Easiest: Clever Cloud will create database automatically
- Go to Add-ons → MySQL
- Add it to your app
- Env vars auto-populate

**Option 2: External MySQL (e.g., AWS RDS, DigitalOcean)**
- Set DB_HOST to your cloud MySQL host
- Make sure security groups allow connection from Clever Cloud

**Option 3: ClearDB (Free option)**
- Sign up at cleardp.com
- Use provided connection string
- Extract credentials to fill DB_HOST, DB_USER, DB_PASSWORD

---

## Step 5: Configure Procfile (Already Done ✅)

Your `Procfile` should look like:

```
web: node index.js
```

This is already in your repo ✅

---

## Step 6: Verify package.json

Your `package.json` needs a start script:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

This is already correct ✅

---

## Step 7: Deploy

### Auto Deploy (Recommended)

Once configured:
1. Push code to GitHub: `git push origin main`
2. Clever Cloud automatically redeploys
3. Monitor in dashboard

### Manual Deploy with CLI

```bash
clever deploy
```

---

## Step 8: Verify Deployment

1. Go to your app in Clever Cloud dashboard
2. Check **Logs** for any errors
3. Get your app URL (looks like: `https://app-xxxxx.cleverapps.io`)
4. Test endpoint:

```bash
curl https://app-xxxxx.cleverapps.io/api
# Should return: {"message":"🚀 MPC HRMS API is running!","version":"1.0.0","timestamp":"..."}
```

---

## Step 9: Update Mobile App Config

After deployment, update your mobile app config:

Edit `/home/manideep/mpc_2026/src/constants/config.js`:

```javascript
// export const API_BASE_URL = 'http://localhost:5000/api'; // Local dev
export const API_BASE_URL = 'https://app-xxxxx.cleverapps.io/api'; // Clever Cloud
```

Then rebuild APK:

```bash
cd /home/manideep/mpc_2026/android
./gradlew assembleRelease
```

---

## Troubleshooting

### App won't start
- Check logs in dashboard
- Verify environment variables are set
- Check MySQL connection

### Database connection fails
- Verify DB_HOST, DB_USER, DB_PASSWORD
- Check MySQL firewall allows Clever Cloud IPs
- Test locally first with same credentials

### 502 Bad Gateway error
- Backend might be crashing
- Check logs for errors
- Verify all required env vars are set

### Logs show "cannot find module"
- Run `npm install` in backend folder
- Check `package.json` has all dependencies
- Commit `package-lock.json`

---

## Quick Reference

**Your App Details:**
- Backend folder: `/backend`
- Main file: `index.js`
- Runtime: Node.js
- Database: MySQL (external or Clever Cloud add-on)
- Port: 8080 (Clever Cloud default, handled by app)

**Clever Cloud Docs:**
- https://www.clever-cloud.com/doc/nodejs/nodejs/
- https://www.clever-cloud.com/doc/addons/mysql/

**Free Tier:**
- Small free dyno available
- MySQL add-on requires paid plan
- ClearDB free tier available

---

## Next Steps

1. Create Clever Cloud account
2. Create MySQL database (Clever Cloud MySQL or ClearDB)
3. Create Node.js app and link GitHub
4. Set environment variables
5. Deploy and test
6. Update mobile app config with production URL
7. Rebuild and test APK

Need help with any step? Let me know! 🚀
