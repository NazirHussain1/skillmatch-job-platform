# SkillMatch - Professional Job Portal Platform

A full-stack MERN job portal application similar to Indeed and LinkedIn Jobs, featuring role-based access control, real-time messaging, and comprehensive job management capabilities.

## 🚀 Live Demo

[Add your deployed link here]

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

SkillMatch is a modern job portal platform that connects job seekers with employers. The platform provides a seamless experience for posting jobs, applying to positions, managing applications, and communicating between employers and candidates.

### Key Highlights

- **Three User Roles**: Job Seekers, Employers, and Administrators
- **Real-time Communication**: Socket.IO powered chat system
- **Secure Authentication**: JWT-based authentication with email verification
- **File Management**: Cloudinary integration for resumes and images
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Production Ready**: Optimized for deployment with proper error handling

## ✨ Features

### For Job Seekers

- ✅ User registration and profile management
- ✅ Resume upload (PDF, DOC, DOCX)
- ✅ Profile picture upload
- ✅ Advanced job search with filters (keyword, location, salary)
- ✅ Save jobs for later viewing
- ✅ One-click job applications
- ✅ Application tracking with status updates
- ✅ Real-time chat with employers
- ✅ Email notifications

### For Employers

- ✅ Company profile management (logo, description, website)
- ✅ Post and manage job listings
- ✅ View and filter job applicants
- ✅ Accept/reject applications
- ✅ Real-time chat with candidates
- ✅ Dashboard with job statistics
- ✅ Application management system

### For Administrators

- ✅ User management (view, delete, change roles)
- ✅ Job management (view, delete all jobs)
- ✅ Platform analytics dashboard
- ✅ System-wide statistics and insights

### General Features

- ✅ JWT-based authentication
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Role-based access control
- ✅ Pagination for large datasets
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time notifications
- ✅ Secure file uploads
- ✅ Input validation and sanitization

## 🛠 Tech Stack

### Frontend

- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool and dev server

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File upload middleware
- **Cloudinary** - Cloud storage for files
- **Socket.IO** - Real-time bidirectional communication
- **Express Validator** - Input validation

### DevOps & Tools

- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Media management
- **Git** - Version control
- **npm** - Package manager

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   React SPA (Vite)                                    │  │
│  │   - Redux Store (State Management)                    │  │
│  │   - React Router (Navigation)                         │  │
│  │   - Socket.IO Client (Real-time)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Express.js Server                                   │  │
│  │   - REST API Endpoints                                │  │
│  │   - Socket.IO Server                                  │  │
│  │   - Authentication Middleware                         │  │
│  │   - Validation Middleware                             │  │
│  │   - Error Handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │  MongoDB Atlas   │         │   Cloudinary             │ │
│  │  - Users         │         │   - Profile Pictures     │ │
│  │  - Jobs          │         │   - Company Logos        │ │
│  │  - Applications  │         │   - Resumes              │ │
│  │  - Messages      │         │                          │ │
│  │  - Conversations │         │                          │ │
│  └──────────────────┘         └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
skillmatch/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js      # Cloudinary configuration
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── application.controller.js
│   │   ├── auth.controller.js
│   │   ├── chat.controller.js
│   │   ├── company.controller.js
│   │   ├── job.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── error.middleware.js     # Error handling
│   │   ├── upload.middleware.js    # File upload
│   │   └── validate.middleware.js  # Input validation
│   ├── models/
│   │   ├── Application.model.js
│   │   ├── Conversation.model.js
│   │   ├── Job.model.js
│   │   ├── Message.model.js
│   │   └── User.model.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── application.routes.js
│   │   ├── auth.routes.js
│   │   ├── chat.routes.js
│   │   ├── company.routes.js
│   │   ├── job.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   ├── validators/
│   │   ├── application.validator.js
│   │   ├── auth.validator.js
│   │   ├── job.validator.js
│   │   └── user.validator.js
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js             # Redux store
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── JobForm.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicRoute.jsx
│   │   │   └── RoleBasedRoute.jsx
│   │   ├── context/
│   │   │   └── SocketContext.jsx
│   │   ├── features/
│   │   │   ├── admin/
│   │   │   ├── applications/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── jobs/
│   │   │   └── user/
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useAuthPersist.js
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminJobs.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── Applications.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── JobApplicants.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyJobs.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── RegistrationSuccess.jsx
│   │   │   ├── ResendVerification.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── SavedJobs.jsx
│   │   │   └── VerifyEmail.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── applicationService.js
│   │   │   ├── authService.js
│   │   │   ├── chatService.js
│   │   │   ├── companyService.js
│   │   │   ├── jobService.js
│   │   │   └── userService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account
- Gmail account (for email service)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/skillmatch.git
cd skillmatch
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Set up environment variables**

Create `.env.local` files in both backend and frontend directories (see [Environment Variables](#environment-variables) section)

5. **Start the development servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

6. **Access the application**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Environment Variables

### Backend (.env.local)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# Frontend URL
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password/:token` | Reset password | No |
| GET | `/api/auth/verify-email/:token` | Verify email | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |

### Job Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/jobs` | Get all jobs (with filters) | Yes |
| GET | `/api/jobs/:id` | Get single job | Yes |
| POST | `/api/jobs` | Create job | Yes (Employer) |
| PUT | `/api/jobs/:id` | Update job | Yes (Employer) |
| DELETE | `/api/jobs/:id` | Delete job | Yes (Employer) |
| PATCH | `/api/jobs/:id/status` | Update job status | Yes (Employer) |
| GET | `/api/jobs/stats` | Get job statistics | Yes (Employer) |

### Application Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/applications/my` | Get user's applications | Yes (Job Seeker) |
| POST | `/api/applications/:jobId` | Apply to job | Yes (Job Seeker) |
| GET | `/api/applications/job/:jobId` | Get job applications | Yes (Employer) |
| PUT | `/api/applications/:id` | Update application status | Yes (Employer) |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| POST | `/api/users/profile/picture` | Upload profile picture | Yes |
| POST | `/api/users/profile/company-logo` | Upload company logo | Yes (Employer) |
| POST | `/api/users/profile/resume` | Upload resume | Yes (Job Seeker) |
| POST | `/api/users/saved-jobs/:jobId` | Save job | Yes (Job Seeker) |
| DELETE | `/api/users/saved-jobs/:jobId` | Unsave job | Yes (Job Seeker) |
| GET | `/api/users/saved-jobs` | Get saved jobs | Yes (Job Seeker) |

### Chat Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/chat/conversations` | Get user conversations | Yes |
| GET | `/api/chat/conversations/:id` | Get conversation by ID | Yes |
| POST | `/api/chat/conversations` | Create conversation | Yes |
| GET | `/api/chat/messages/:conversationId` | Get messages | Yes |
| POST | `/api/chat/messages` | Send message | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats` | Get platform statistics | Yes (Admin) |
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| DELETE | `/api/admin/users/:id` | Delete user | Yes (Admin) |
| PUT | `/api/admin/users/:id/role` | Change user role | Yes (Admin) |
| GET | `/api/admin/jobs` | Get all jobs | Yes (Admin) |
| DELETE | `/api/admin/jobs/:id` | Delete job | Yes (Admin) |

## 🗄 Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['jobseeker', 'employer', 'admin']),
  profilePicture: String,
  resume: String,
  savedJobs: [ObjectId],
  companyName: String,
  companyWebsite: String,
  companyDescription: String,
  companyLogo: String,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  timestamps: true
}
```

### Job Model

```javascript
{
  title: String (required),
  company: String (required),
  description: String (required),
  location: String (required),
  salary: Number (required),
  status: String (enum: ['active', 'closed', 'draft']),
  employer: ObjectId (ref: 'User'),
  applicationCount: Virtual,
  timestamps: true
}
```

### Application Model

```javascript
{
  job: ObjectId (ref: 'Job'),
  jobseeker: ObjectId (ref: 'User'),
  status: String (enum: ['pending', 'accepted', 'rejected']),
  timestamps: true
}
```

### Conversation Model

```javascript
{
  participants: [ObjectId] (ref: 'User'),
  job: ObjectId (ref: 'Job'),
  application: ObjectId (ref: 'Application'),
  lastMessage: ObjectId (ref: 'Message'),
  timestamps: true
}
```

### Message Model

```javascript
{
  conversation: ObjectId (ref: 'Conversation'),
  sender: ObjectId (ref: 'User'),
  content: String (required),
  isRead: Boolean,
  timestamps: true
}
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Email Verification**: Required before login
- **Password Reset**: Secure token-based reset flow
- **Role-Based Access Control**: Three distinct user roles

### Data Protection

- **Input Validation**: Express Validator for all inputs
- **SQL Injection Prevention**: Mongoose ODM
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Restricted origins
- **Environment Variables**: Sensitive data protection
- **Secure File Uploads**: Type and size validation

### API Security

- **Rate Limiting**: Prevent abuse (recommended for production)
- **Helmet.js**: HTTP headers security (recommended for production)
- **HTTPS**: SSL/TLS encryption (production)
- **Authentication Middleware**: Protected routes
- **Error Handling**: No sensitive data exposure

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables in hosting platform
2. Ensure MongoDB Atlas is accessible
3. Configure CORS for production frontend URL
4. Set NODE_ENV to 'production'
5. Deploy using Git or CLI

### Frontend Deployment (Vercel/Netlify)

1. Build the production bundle: `npm run build`
2. Set VITE_API_URL to production backend URL
3. Deploy the `dist` folder
4. Configure redirects for SPA routing

### Database (MongoDB Atlas)

1. Whitelist deployment server IPs
2. Use strong database credentials
3. Enable backup and monitoring
4. Configure connection pooling

### File Storage (Cloudinary)

1. Verify upload presets
2. Configure folder structure
3. Set up transformation rules
4. Monitor storage usage

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- React and Redux teams for excellent documentation
- MongoDB for the powerful database
- Cloudinary for seamless file management
- Socket.IO for real-time capabilities
- Tailwind CSS for the utility-first approach

---

**Note**: This is a portfolio/educational project. For production use, ensure proper security audits, testing, and compliance with data protection regulations.
