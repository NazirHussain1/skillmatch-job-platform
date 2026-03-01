# Quick Start Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## 1. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your details
# Required: MONGODB_URI, JWT_SECRET
nano .env  # or use your preferred editor

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

## 2. Frontend Setup (5 minutes)

```bash
# Navigate to frontend (from root)
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 3. Test the Application

1. Open `http://localhost:3000` in your browser
2. Register a new account (Job Seeker or Employer)
3. Login with your credentials
4. Explore the dashboard

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillmatch_db
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:5000/api
```

## Common Issues

### MongoDB Connection Error
- Check your MongoDB URI
- Ensure IP whitelist includes your IP
- Verify database user credentials

### Port Already in Use
- Backend: Change `PORT` in backend/.env
- Frontend: Change port in frontend/vite.config.js

### CORS Errors
- Ensure `CORS_ORIGIN` in backend/.env matches frontend URL
- Check that backend is running

## Project Structure

```
backend/     → Express API (Port 5000)
frontend/    → React App (Port 3000)
```

## Default Credentials

Create your own account - no demo accounts included.

## Next Steps

1. ✅ Backend running
2. ✅ Frontend running
3. ✅ MongoDB connected
4. → Create your first job posting (as Employer)
5. → Apply to jobs (as Job Seeker)
6. → Explore the dashboard

## Development Workflow

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Build for Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Need Help?

- Check README.md for detailed documentation
- Review API endpoints in backend/routes/
- Check Redux state in browser DevTools

---

**Ready to code!** 🚀
