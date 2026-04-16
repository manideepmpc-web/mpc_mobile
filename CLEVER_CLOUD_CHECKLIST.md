# ✅ Clever Cloud Deployment Checklist

## Pre-Deployment Requirements

- [ ] **Clever Cloud Account** - Sign up at https://console.clever-cloud.com/
- [ ] **GitHub Account** - Code pushed to https://github.com/manideepmpc-web/mpc_mobile
- [ ] **MySQL Database Ready** - Either:
  - [ ] Clever Cloud MySQL add-on, OR
  - [ ] External MySQL (AWS RDS, DigitalOcean, ClearDB)
  - [ ] Database connection details available

## Code Preparation (✅ Already Done)

- [x] `Procfile` exists with `web: node index.js`
- [x] `package.json` has `start` script
- [x] `.gitignore` excludes `node_modules` and `.env`
- [x] Code pushed to GitHub

## Deployment Steps

1. **Create Clever Cloud App**
   - [ ] Login to console.clever-cloud.com
   - [ ] Click "Create an app"
   - [ ] Select Node.js runtime
   - [ ] Choose GitHub as source
   - [ ] Select `mpc_mobile` repository
   - [ ] Set root path to `/backend`
   - [ ] Create app

2. **Add MySQL Database**
   - [ ] Add MySQL add-on (if using Clever Cloud)
   - OR
   - [ ] Get external MySQL credentials ready

3. **Set Environment Variables**
   ```
   DB_HOST=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=mpc
   JWT_SECRET=mpc_hrms_super_secret_key_2026
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```
   - [ ] All variables set in Clever Cloud dashboard

4. **Deploy**
   - [ ] Push code: `git push origin main`
   - [ ] OR click Deploy button in dashboard
   - [ ] Monitor logs in dashboard

5. **Verify Deployment**
   - [ ] Check logs for errors
   - [ ] Get app URL (https://app-xxxxx.cleverapps.io)
   - [ ] Test endpoint: `curl https://app-xxxxx.cleverapps.io/api`
   - [ ] Test login: `curl -X POST https://app-xxxxx.cleverapps.io/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@mpc.com","password":"mpc@123"}'`

6. **Update Mobile App**
   - [ ] Update `src/constants/config.js` with Clever Cloud URL
   - [ ] Rebuild APK: `cd android && ./gradlew assembleRelease`
   - [ ] Test login with credentials: test@mpc.com / mpc@123

## Important Notes

⚠️ **Database Migration**: You may need to run migrations on the cloud database:
```bash
npm run migrate
```
OR manually import your database schema.

⚠️ **Firewall Rules**: Ensure MySQL allows connections from Clever Cloud.

⚠️ **File Uploads**: If you use file uploads, configure persistent storage in Clever Cloud.

⚠️ **CORS**: Verify CORS settings allow requests from your mobile app domain.

## Support

- Clever Cloud Docs: https://www.clever-cloud.com/doc/
- Node.js on Clever Cloud: https://www.clever-cloud.com/doc/nodejs/nodejs/
- MySQL Add-on: https://www.clever-cloud.com/doc/addons/mysql/

---

**Status: Ready for Deployment ✅**

Your backend is fully configured for cloud deployment. Once you complete the steps above, your app will be live! 🚀
