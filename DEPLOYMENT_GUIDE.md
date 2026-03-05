# SkillMatch Deployment Guide

## Quick Deployment Checklist

### Prerequisites
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] Gmail account with App Password
- [ ] GitHub repository created
- [ ] Hosting accounts (Vercel/Netlify for frontend, Heroku/Railway/Render for backend)

---

## Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your users
   - Name your cluster (e.g., "skillmatch-cluster")

3. **Configure Database Access**
   - Create database user with username and strong password
   - Save credentials securely

4. **Configure Network Access**
   - Add IP address: `0.0.0.0/0` (allow from anywhere)
   - Or add specific deployment server IPs

5. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `skillmatch-db`

---

## Step 2: Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Sign up for free account

2. **Get API Credentials**
   - Go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

3. **Create Upload Presets** (Optional)
   - Go to Settings → Upload
   - Create presets for: profiles, company-logos, resumes

---

## Step 3: Email Service Setup (Gmail)

1. **Enable 2-Step Verification**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "SkillMatch"
   - Copy the 16-character password

---

## Step 4: Backend Deployment

### Option A: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create skillmatch-api
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI="your_mongodb_connection_string"
   heroku config:set JWT_SECRET="your_jwt_secret_min_32_chars"
   heroku config:set FRONTEND_URL="https://your-frontend-url.vercel.app"
   heroku config:set CORS_ORIGIN="https://your-frontend-url.vercel.app"
   heroku config:set EMAIL_HOST="smtp.gmail.com"
   heroku config:set EMAIL_PORT=587
   heroku config:set EMAIL_USER="your-email@gmail.com"
   heroku config:set EMAIL_PASSWORD="your_app_password"
   heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name"
   heroku config:set CLOUDINARY_API_KEY="your_api_key"
   heroku config:set CLOUDINARY_API_SECRET="your_api_secret"
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Verify Deployment**
   ```bash
   heroku logs --tail
   heroku open
   ```

### Option B: Railway

1. **Go to Railway.app**
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select backend folder

3. **Add Environment Variables**
   - Go to Variables tab
   - Add all environment variables from Step 4 above

4. **Deploy**
   - Railway automatically deploys
   - Copy the deployment URL

### Option C: Render

1. **Go to Render.com**
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select backend folder

3. **Configure Service**
   - Name: skillmatch-api
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

4. **Add Environment Variables**
   - Add all variables from Step 4 above

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

---

## Step 5: Frontend Deployment

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

4. **Set Environment Variable**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.herokuapp.com/api`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option B: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variable**
   - Go to Netlify Dashboard → Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.herokuapp.com/api`

5. **Configure Redirects**
   - Create `frontend/public/_redirects` file:
   ```
   /*    /index.html   200
   ```

---

## Step 6: Post-Deployment Configuration

### Update Backend CORS

1. **Update CORS_ORIGIN**
   - Set to your deployed frontend URL
   - Example: `https://skillmatch.vercel.app`

2. **Update FRONTEND_URL**
   - Set to your deployed frontend URL
   - Used for email links

### Update Frontend API URL

1. **Update VITE_API_URL**
   - Set to your deployed backend URL
   - Example: `https://skillmatch-api.herokuapp.com/api`

### Test Email Verification

1. Register a new user
2. Check email for verification link
3. Verify link works with deployed URLs

---

## Step 7: Create Admin User

### Method 1: MongoDB Atlas

1. Go to MongoDB Atlas → Collections
2. Find `users` collection
3. Find your user document
4. Edit document:
   ```json
   {
     "role": "admin",
     "isEmailVerified": true
   }
   ```

### Method 2: MongoDB Compass

1. Connect to MongoDB Atlas using Compass
2. Navigate to `skillmatch-db` → `users`
3. Find your user
4. Update role to "admin"

### Method 3: API (if you have access)

```bash
# Update user role via API
curl -X PUT https://your-backend-url/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

---

## Step 8: Verification Testing

### Test Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Job posting works
- [ ] File uploads work (profile, resume, logo)
- [ ] Job search works
- [ ] Applications work
- [ ] Real-time chat works
- [ ] Admin dashboard accessible
- [ ] All routes protected correctly

### Test URLs

- Frontend: `https://your-frontend-url.vercel.app`
- Backend API: `https://your-backend-url.herokuapp.com/api`
- Health Check: `https://your-backend-url.herokuapp.com/`

---

## Step 9: Monitoring and Maintenance

### Set Up Monitoring

1. **Backend Monitoring**
   - Heroku: Use Heroku metrics
   - Railway: Built-in monitoring
   - Render: Built-in monitoring

2. **Database Monitoring**
   - MongoDB Atlas: Enable monitoring and alerts
   - Set up email alerts for issues

3. **Error Tracking** (Optional)
   - Sentry.io for error tracking
   - LogRocket for session replay

### Regular Maintenance

- [ ] Monitor database size
- [ ] Check Cloudinary storage usage
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Monitor API response times

---

## Troubleshooting

### Common Issues

**Issue: CORS Error**
- Solution: Verify CORS_ORIGIN matches frontend URL exactly
- Check for trailing slashes

**Issue: Database Connection Failed**
- Solution: Check MongoDB Atlas IP whitelist
- Verify connection string is correct
- Check database user permissions

**Issue: Email Not Sending**
- Solution: Verify Gmail App Password
- Check EMAIL_USER and EMAIL_PASSWORD
- Ensure 2-Step Verification is enabled

**Issue: File Upload Fails**
- Solution: Verify Cloudinary credentials
- Check file size limits
- Verify file type restrictions

**Issue: Real-time Chat Not Working**
- Solution: Ensure WebSocket connections allowed
- Check CORS configuration
- Verify Socket.IO client URL

**Issue: 404 on Frontend Routes**
- Solution: Configure SPA redirects
- Vercel: Add `vercel.json` with rewrites
- Netlify: Add `_redirects` file

---

## Security Checklist

- [ ] All environment variables set
- [ ] No sensitive data in code
- [ ] HTTPS enabled (automatic on Vercel/Netlify/Heroku)
- [ ] CORS properly configured
- [ ] Database user has minimal permissions
- [ ] JWT secret is strong (32+ characters)
- [ ] Email verification enabled
- [ ] File upload size limits set
- [ ] Rate limiting enabled (recommended)
- [ ] Helmet.js configured (recommended)

---

## Performance Optimization

### Backend
- [ ] Enable compression middleware
- [ ] Configure MongoDB indexes
- [ ] Enable connection pooling
- [ ] Set up caching (Redis - optional)

### Frontend
- [ ] Enable Vercel/Netlify CDN
- [ ] Configure Cloudinary transformations
- [ ] Enable lazy loading
- [ ] Optimize bundle size

---

## Backup Strategy

### Database Backup
- MongoDB Atlas: Enable automated backups
- Frequency: Daily
- Retention: 7 days minimum

### Code Backup
- GitHub: Primary repository
- Frequency: Every commit
- Branches: main, develop, feature branches

---

## Rollback Plan

### If Deployment Fails

1. **Heroku**
   ```bash
   heroku rollback
   ```

2. **Vercel**
   - Go to Deployments
   - Click on previous deployment
   - Click "Promote to Production"

3. **Railway/Render**
   - Redeploy previous commit from GitHub

---

## Cost Estimation

### Free Tier Limits

- **MongoDB Atlas**: 512 MB storage
- **Cloudinary**: 25 GB storage, 25 GB bandwidth
- **Heroku**: 550 dyno hours/month (sleeps after 30 min)
- **Vercel**: 100 GB bandwidth
- **Netlify**: 100 GB bandwidth

### Upgrade Recommendations

- MongoDB Atlas: $9/month for 2GB
- Cloudinary: $89/month for 100GB
- Heroku: $7/month for always-on dyno
- Consider upgrading when:
  - Users > 100
  - Storage > 80% of free tier
  - Bandwidth > 80% of free tier

---

## Support and Resources

### Documentation
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Cloudinary: https://cloudinary.com/documentation
- Heroku: https://devcenter.heroku.com
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com

### Community
- Stack Overflow: Tag questions with `mern-stack`
- GitHub Issues: Report bugs in repository
- Discord/Slack: Join MERN developer communities

---

**Deployment Complete! 🎉**

Your SkillMatch platform is now live and ready for users!
