# SkillMatch Deployment Guide - Fly.io + Vercel

## 🚀 STEP 1: Fly.io CLI Install

Windows PowerShell mein run karein:
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Terminal restart karein aur verify karein:
```bash
fly version
```

---

## 🔐 STEP 2: Fly.io Login

```bash
fly auth login
```
(Browser khulega, GitHub se login karein)

---

## 📦 STEP 3: Backend Deploy (Fly.io)

```bash
cd backend
fly launch --no-deploy
```

**Questions ka jawab:**
- App name: `skillmatch-backend` (ya koi unique name)
- Region: `sin` (Singapore - closest to Pakistan) ya `iad` (US East)
- PostgreSQL: `NO`
- Redis: `NO`

---

## 🔑 STEP 4: Environment Variables Set karein

Ye sab commands ek ek karke run karein:

```bash
fly secrets set MONGODB_URI="mongodb+srv://nh534392_db_user:Nn2ybVWCIuFtEb2t@skillmatch-dev.tzycp3u.mongodb.net/skillmatch-db?retryWrites=true&w=majority&appName=skillmatch-dev"

fly secrets set JWT_SECRET="4e78e30c44e7ca41308a19421545ac658d593d16acd2240818e6d1e59ef4b4fe"

fly secrets set JWT_EXPIRES_IN="7d"

fly secrets set CLOUDINARY_CLOUD_NAME="dhvurrrgz"

fly secrets set CLOUDINARY_API_KEY="351329627238456"

fly secrets set CLOUDINARY_API_SECRET="iJPQoD0ft2uMFHQzKmMHa4489go"

fly secrets set EMAIL_HOST="smtp.gmail.com"

fly secrets set EMAIL_PORT="587"

fly secrets set EMAIL_USER="nh534392@gmail.com"

fly secrets set EMAIL_PASS="jhpy mvtb plpk wxsu"

fly secrets set EMAIL_FROM="noreply@skillmatch.com"

fly secrets set EMAIL_FROM_NAME="SkillMatch"

fly secrets set ADMIN_NAME="NAZIR HUSSAIN"

fly secrets set ADMIN_EMAIL="admin@skillmatch.com"

fly secrets set ADMIN_PASSWORD="Admin123!"

fly secrets set ENABLE_RATE_LIMIT="true"

fly secrets set CORS_ORIGIN="http://localhost:3000"

fly secrets set FRONTEND_URL="http://localhost:3000"
```

---

## 🚢 STEP 5: Deploy karein

```bash
fly deploy
```

Wait karein... 2-3 minutes lagenge.

Deploy hone ke baad aapko URL milega:
```
https://skillmatch-backend.fly.dev
```

Test karein:
```
https://skillmatch-backend.fly.dev/api/health
```

---

## 🎨 STEP 6: Frontend Deploy (Vercel)

### Option A: Browser se (EASY)

1. https://vercel.com pe jaayein
2. GitHub se login karein
3. "Add New" → "Project" click karein
4. Repository select karein: `skillmatch-job-platform`
5. Configure karein:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detect hoga)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Environment Variables** add karein:
   - Key: `VITE_API_URL`
   - Value: `https://skillmatch-backend.fly.dev/api`
7. "Deploy" button click karein

### Option B: CLI se

```bash
cd ../frontend
npm i -g vercel
vercel
```

Questions:
- Set up and deploy: `Y`
- Which scope: (apna account select karein)
- Link to existing project: `N`
- Project name: `skillmatch`
- Directory: `./`
- Override settings: `N`

Environment variable add karein:
```bash
vercel env add VITE_API_URL
```
Value: `https://skillmatch-backend.fly.dev/api`

Phir deploy karein:
```bash
vercel --prod
```

---

## 🔄 STEP 7: CORS Update (IMPORTANT!)

Vercel se URL milne ke baad (e.g., `https://skillmatch.vercel.app`):

```bash
cd backend

fly secrets set CORS_ORIGIN="https://skillmatch.vercel.app"

fly secrets set FRONTEND_URL="https://skillmatch.vercel.app"
```

---

## ✅ STEP 8: Testing

1. **Backend Health Check:**
   ```
   https://skillmatch-backend.fly.dev/api/health
   ```

2. **Frontend Open karein:**
   ```
   https://skillmatch.vercel.app
   ```

3. **Admin Login:**
   - Email: `admin@skillmatch.com`
   - Password: `Admin123!`

---

## 🛠️ Useful Commands

```bash
# Logs dekhein
fly logs

# App status
fly status

# App restart
fly apps restart skillmatch-backend

# Secrets list
fly secrets list
```

---

## 🎯 Summary

✅ Backend: Fly.io (Free - 3 VMs, 160GB bandwidth)
✅ Frontend: Vercel (Free - Unlimited)
✅ Database: MongoDB Atlas (Free - 512MB)
✅ Admin: admin@skillmatch.com / Admin123!

---

## ⚠️ Important Notes

1. Fly.io free tier mein app auto-sleep hota hai inactivity ke baad
2. First request slow ho sakti hai (cold start)
3. Vercel pe unlimited bandwidth hai
4. MongoDB Atlas free tier 512MB storage deta hai

---

## 🆘 Troubleshooting

**Agar deployment fail ho:**
```bash
fly logs
```

**Agar CORS error aaye:**
- Vercel URL ko backend CORS_ORIGIN mein add karein
- Browser cache clear karein

**Agar admin login na ho:**
- Backend logs check karein: `fly logs`
- Admin bootstrap successful hona chahiye

---

Deployment shuru karein! 🚀
