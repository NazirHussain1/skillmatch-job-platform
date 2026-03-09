# SkillMatch - Deployment Guide

## Quick Deployment Steps

### Backend Deployment (Render)

1. **Create Web Service on Render**
   - Connect your GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`

2. **Set Environment Variables in Render Dashboard**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secure-jwt-secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   ```

3. **Deploy**
   - Render will automatically deploy on push to main branch

### Frontend Deployment (Vercel)

1. **Import Project to Vercel**
   - Connect your GitHub repository
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Set Environment Variable in Vercel Dashboard**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy**
   - Vercel will automatically deploy on push to main branch

## Environment Variables Reference

### Backend Required Variables
- `NODE_ENV` - Set to "production"
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGIN` - Frontend URL for CORS
- `FRONTEND_URL` - Frontend URL for email links
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Frontend Required Variables
- `VITE_API_URL` - Backend API URL with /api suffix

## Post-Deployment Checklist

- [ ] Backend health check returns OK: `https://your-backend.onrender.com/api/health`
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] File uploads work (resume, avatar)
- [ ] Real-time chat works
- [ ] Notifications work
- [ ] No CORS errors in browser console

## Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` in backend matches frontend URL exactly
- Ensure frontend URL uses HTTPS in production

### API Connection Fails
- Check `VITE_API_URL` includes `/api` suffix
- Verify backend is running and accessible

### File Upload Fails
- Verify all Cloudinary environment variables are set correctly
- Check Cloudinary dashboard for API limits

## Support

For issues, check:
1. Render deployment logs (backend)
2. Vercel deployment logs (frontend)
3. Browser console for frontend errors
4. MongoDB Atlas connection status
