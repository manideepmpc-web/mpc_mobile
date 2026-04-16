# ✅ MPC HRMS - Pre-Demo Checklist

## Before Client Demo:

### Backend Setup:
- [ ] Backend running: `cd backend && npm start`
- [ ] Server starts on port 5000
- [ ] API responding: `curl http://localhost:5000/`
- [ ] Database connected (check console output)

### Mobile App:
- [ ] APK installed on test phone
- [ ] Network configured correctly
- [ ] Location: Settings > Network > API_BASE_URL

### Demo Credentials:
- [ ] Email: mpc_hyd@moneytracker.com
- [ ] Password: mpc_hyd@1
- [ ] Tested login locally

### Network:
- [ ] Phone on same WiFi as laptop (if local testing)
- [ ] OR using Render deployed version
- [ ] No firewall blocking port 5000

### Final Testing:
- [ ] Login works
- [ ] Dashboard loads
- [ ] Navigation works
- [ ] No crashes

---

## Quick Pre-Demo Setup (5 minutes):

```bash
# Terminal 1: Start Backend
cd /home/manideep/mpc_2026/backend
npm start

# Wait for: "✅ MySQL connected to database: mpc"

# Terminal 2: Keep ready
# (Optional) if using localtunnel:
# lt --port 5000

# Terminal 3: Monitor logs
# cd /home/manideep/mpc_2026/backend
# tail -f /var/log/app.log
```

---

## Demo Flow:

1. **Welcome Screen**: Show app opening
2. **Login Screen**: Show dummy credentials
   ```
   Email: mpc_hyd@moneytracker.com
   Password: mpc_hyd@1
   ```
3. **Tap Login**: Authenticate
4. **Dashboard**: Show main interface
5. **Navigation**: Walk through features
6. **Data**: Explain backend integration

---

## If Issue During Demo:

### Login Fails:
- Check backend console for errors
- Verify network: `ping 10.220.86.246`
- Restart backend and app

### App Crashes:
- Check error logs
- Restart phone app
- Clear app cache

### Network Error:
- Verify WiFi connection
- Check IP configuration
- Restart devices

---

## Post-Demo Actions:

- [ ] Collect feedback
- [ ] Note requested features
- [ ] Plan next phase
- [ ] Schedule follow-up

---

## Client Follow-up:

**If they want to continue:**
1. Show QUICK_RENDER_GUIDE.md
2. Explain cloud deployment
3. Set up technical meeting
4. Plan database setup

---

## Files to Show Client:

- `/home/manideep/mpc_2026/` - Main project
- `/android/app/build/outputs/apk/release/app-release.apk` - APK file
- `QUICK_RENDER_GUIDE.md` - Deployment documentation
- `backend/` - Backend code

---

✨ **YOU'RE READY TO DEMO!** ✨

Good luck with your client presentation! 🚀
