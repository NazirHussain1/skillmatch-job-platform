# SkillMatch

> Modern job matching platform built with MERN stack (MongoDB, Express, React, Node.js)

## 🚀 Features

- **Authentication** - JWT-based auth with role-based access control
- **Job Management** - Create, read, update, delete job postings (Employers)
- **Applications** - Apply to jobs and track application status (Job Seekers)
- **Protected Routes** - Role-based route protection with auto-logout
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **State Management** - Redux Toolkit for predictable state

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Axios
- React Hot Toast
- Lucide Icons

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- express-validator
- Helmet & CORS

## 📁 Project Structure

```
skillmatch/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & error middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validation
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── app/         # Redux store
    │   ├── features/    # Redux slices
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── layouts/     # Layout components
    │   ├── services/    # API services
    │   ├── hooks/       # Custom hooks
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## 🔧 Installation

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## ⚙️ Environment Variables

### Backend (.env.local)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

**IMPORTANT**: Never commit `.env.local` files to Git. Use `.env.example` for reference only.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get single job (public)
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer, owner only)
- `DELETE /api/jobs/:id` - Delete job (employer, owner only)

### Applications
- `POST /api/applications/:jobId` - Apply for job (jobseeker only)
- `GET /api/applications/my` - Get my applications (protected)
- `GET /api/applications/job/:jobId` - Get job applications (employer, owner only)
- `PUT /api/applications/:id` - Update application status (employer, owner only)

## 🔐 User Roles

- **jobseeker** - Can browse jobs, apply, track applications
- **employer** - Can post jobs, view applications, manage postings
- **admin** - Full access (future implementation)

## 🚦 Available Scripts

### Backend
```bash
npm start       # Production server
npm run dev     # Development server with nodemon
```

### Frontend
```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview production build
```

## 📝 Usage

1. Register as a Job Seeker or Employer
2. **Job Seekers**: Browse jobs, apply, track applications
3. **Employers**: Post jobs, view applications, manage listings

## 📄 License

MIT

---

**Built with React, Redux Toolkit, Node.js, Express, and MongoDB**
