# 🚀 DEPLOY TO RENDER - COPY & PASTE THESE COMMANDS

## STEP 1: Push Code to GitHub (Run in PowerShell)
```powershell
cd c:\Users\Admin\joanfarm\nabis
git add .
git commit -m "Add PostgreSQL support for Render deployment"
git push origin main
```

## STEP 2: Login to Render
1. Open browser → https://render.com
2. Sign in with GitHub
3. Go to Dashboard

## STEP 3: Watch Auto-Deploy (Wait 5-10 minutes)
Render will automatically:
- ✅ Create PostgreSQL database (nabis-db)
- ✅ Deploy backend API (nabis-api)  
- ✅ Deploy frontend (nabis-front)

## STEP 4: Add Email Secrets
1. In Render dashboard, click **nabis-api**
2. Click **Environment** tab on left
3. Click **Add Environment Variable**
4. Add these TWO variables:
   - Key: `EMAIL_USER` → Value: `itarumberti183@gmail.com`
   - Key: `EMAIL_PASS` → Value: `sxld ffeb tkmb nnpx`
5. Click **Save Changes**
6. Service will auto-restart

## STEP 5: Get Database Connection String
1. In Render dashboard, click **nabis-db**
2. Scroll down to **Connections**
3. Click **External Database URL**
4. Copy the entire string (starts with `postgres://`)
5. Keep it safe - you'll need it next!

## STEP 6: Migrate Your Data (Run in PowerShell)
```powershell
cd c:\Users\Admin\joanfarm\nabis

# Set the database URL (paste YOUR connection string)
$env:DATABASE_URL = "paste-your-postgres-connection-string-here"
$env:NODE_ENV = "production"

# Run migration
node migrate-to-postgres.cjs
```

## STEP 7: Get Your Live URLs
1. In Render dashboard, click **nabis-front**
2. Look for **Your service is live** at top
3. Copy the URL (e.g., https://nabis-front.onrender.com)
4. Click it to open your live site!

## STEP 8: Test Everything
Visit your site and test:
- ✅ Homepage loads with products
- ✅ Product images show
- ✅ Search works
- ✅ Login/Register works
- ✅ Add to cart works
- ✅ Admin panel works (admin@nabis.com / admin123)

---

## 🎉 YOU'RE LIVE!

Your site is now on the internet at:
- **Frontend**: https://nabis-front.onrender.com (Render will give you this)
- **Backend**: https://nabis-api.onrender.com (Render will give you this)

## 💰 Monthly Costs
- Frontend: **FREE**
- Backend: **$7/month**
- Database: **FREE** (first 1GB)
**Total: $7/month**

## 🔧 Maintenance
- **Nothing to do!** Render handles everything
- Auto-restarts if it crashes
- SSL certificate auto-renews
- Just push to GitHub to update

## ⚠️ Important Notes
- First request after inactivity takes 30 seconds (free tier sleeps)
- Upgrade to paid ($7/month) to keep it awake 24/7
- Database backups: Download from Render dashboard weekly

---

## 🆘 If Something Goes Wrong

**Products not loading?**
```powershell
# Check backend logs in Render dashboard
# nabis-api → Logs tab
```

**Images not showing?**
- Images are stored in database
- Make sure migration completed successfully

**Need to re-deploy?**
```powershell
git add .
git commit -m "Fix"
git push origin main
```

---

## 📱 NEXT: Add Custom Domain (Optional)

1. Buy domain at namecheap.com ($12/year)
2. In Render: nabis-front → Settings → Custom Domain
3. Add your domain (e.g., nabisfarmaci.com)
4. Add CNAME record at domain provider:
   - Name: `www`
   - Value: `nabis-front.onrender.com`
5. Done! SSL auto-configured

---

**START HERE** → Run Step 1 commands in PowerShell now!
