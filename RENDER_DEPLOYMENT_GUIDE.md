# MPC HRMS Backend Deployment to Render.com

## Steps to Deploy:

### 1. Push Backend to GitHub

```bash
cd /home/manideep/mpc_2026/backend
git add .
git commit -m "Initial backend setup for Render deployment"
git branch -M main
git remote add origin https://github.com/yourusername/mpc-hrms-backend.git
git push -u origin main
```

### 2. Create Render Account
- Visit: https://render.com
- Sign up with GitHub
- Connect your GitHub account

### 3. Create New Web Service on Render
1. Go to Dashboard → New → Web Service
2. Select your backend repository
3. Fill in the details:
   - **Name**: mpc-hrms-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

4. Add Environment Variables:
   - `DB_HOST`: your-database-host
   - `DB_USER`: root
   - `DB_PASSWORD`: Password@1
   - `DB_NAME`: mpc
   - `JWT_SECRET`: mpc_hrms_super_secret_key_2026
   - `JWT_EXPIRES_IN`: 7d
   - `PORT`: 5000

5. Click "Create Web Service"

### 4. Get Your Render URL
After deployment, Render will give you a URL like:
`https://mpc-hrms-backend.onrender.com`

### 5. Update Mobile App Config
Update `/src/constants/config.js`:
```javascript
export const API_BASE_URL = 'https://mpc-hrms-backend.onrender.com/api';
```

### 6. Rebuild APK
```bash
cd /home/manideep/mpc_2026/android
./gradlew assembleRelease
```

## Important Notes:
- Render free tier has limited resources
- Database must be externally hosted or on a separate service
- For production, consider upgrading to paid plan

## Database Connection:
Your backend uses MySQL. Make sure your database is:
1. Externally accessible (not localhost)
2. Has proper firewall rules to allow Render servers

## Support:
Render Documentation: https://render.com/docs
