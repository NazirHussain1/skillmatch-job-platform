# SkillMatch - Quick Start Guide

Get SkillMatch running locally in under 10 minutes!

## Prerequisites

- Node.js 14+ installed
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Gmail account

---

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/skillmatch.git
cd skillmatch
```

---

## 2. Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment Variables

Create `backend/.env.local`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillmatch-db
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Start Backend Server

```bash
npm run dev
```

✅ Backend running on http://localhost:5000

---

## 3. Frontend Setup

### Install Dependencies

```bash
cd ../frontend
npm install
```

### Configure Environment Variables

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Start Frontend Server

```bash
npm run dev
```

✅ Frontend running on http://localhost:3000

---

## 4. Create Admin User

### Option 1: Register and Update in Database

1. Register a new user at http://localhost:3000/register
2. Open MongoDB Atlas → Collections
3. Find your user in `users` collection
4. Edit document:
   ```json
   {
     "role": "admin",
     "isEmailVerified": true
   }
   ```

### Option 2: Use MongoDB Compass

1. Connect to your MongoDB Atlas cluster
2. Navigate to `skillmatch-db` → `users`
3. Find your user document
4. Update `role` to `"admin"`
5. Update `isEmailVerified` to `true`

---

## 5. Test the Application

### Test User Roles

**Job Seeker Account**
- Register with role: "jobseeker"
- Test: Browse jobs, apply, save jobs, upload resume

**Employer Account**
- Register with role: "employer"
- Test: Post jobs, view applicants, manage applications

**Admin Account**
- Use the admin account created in Step 4
- Test: View analytics, manage users, manage jobs

---

## 6. Common Issues & Solutions

### Issue: MongoDB Connection Failed
```
Error: MongoServerError: bad auth
```
**Solution**: Check your MongoDB connection string and credentials

### Issue: Email Not Sending
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution**: 
1. Enable 2-Step Verification in Google Account
2. Generate App Password (not your regular password)
3. Use the 16-character app password in EMAIL_PASSWORD

### Issue: CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**: Verify CORS_ORIGIN in backend matches frontend URL exactly

### Issue: File Upload Fails
```
Error: Invalid Cloudinary credentials
```
**Solution**: Double-check Cloudinary credentials in .env.local

---

## 7. Development Workflow

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon (auto-restart)
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server (HMR enabled)
```

### View Logs

**Backend**: Check terminal where `npm run dev` is running
**Frontend**: Check browser console (F12)

---

## 8. Project Structure Overview

```
skillmatch/
├── backend/
│   ├── config/          # Database and service configs
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── features/    # Redux slices
│   │   ├── services/    # API calls
│   │   └── App.jsx      # Root component
│   └── package.json
└── README.md
```

---

## 9. Available Scripts

### Backend

```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 10. Testing Features

### Authentication Flow
1. Register → Check email → Verify → Login

### Job Seeker Flow
1. Login → Browse Jobs → Apply → Track Applications

### Employer Flow
1. Login → Post Job → View Applicants → Accept/Reject

### Admin Flow
1. Login → View Analytics → Manage Users → Manage Jobs

### Real-time Chat
1. Employer and Job Seeker both logged in
2. Job Seeker applies to job
3. Both can chat in real-time

---

## 11. API Testing (Optional)

### Using Postman/Thunder Client

**Register User**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "jobseeker"
}
```

**Login**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Jobs (Protected)**
```http
GET http://localhost:5000/api/jobs
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 12. Environment Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Cloudinary account created
- [ ] Gmail App Password generated
- [ ] Backend .env.local configured
- [ ] Frontend .env.local configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Admin user created

---

## 13. Next Steps

1. **Explore the Code**
   - Read through controllers to understand API logic
   - Check Redux slices for state management
   - Review components for UI patterns

2. **Customize**
   - Update branding and colors
   - Add new features
   - Modify existing functionality

3. **Deploy**
   - Follow DEPLOYMENT_GUIDE.md
   - Deploy to production
   - Share with users

---

## 14. Getting Help

### Documentation
- **README.md**: Complete project documentation
- **PROJECT_SUMMARY.md**: Executive summary
- **DEPLOYMENT_GUIDE.md**: Deployment instructions

### Resources
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Cloudinary Docs: https://cloudinary.com/documentation
- React Docs: https://react.dev
- Express Docs: https://expressjs.com

### Support
- GitHub Issues: Report bugs
- Stack Overflow: Ask questions (tag: mern-stack)

---

## 15. Pro Tips

💡 **Use MongoDB Compass** for easier database management
💡 **Install Redux DevTools** for debugging state
💡 **Use React Developer Tools** for component inspection
💡 **Keep .env.local files secure** - never commit them
💡 **Test email verification** with a real email account
💡 **Use Postman** for API testing during development

---

**You're all set! Happy coding! 🚀**

For detailed documentation, see README.md
For deployment instructions, see DEPLOYMENT_GUIDE.md
