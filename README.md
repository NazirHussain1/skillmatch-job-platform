# SkillMatch AI

> Modern skill-based hiring platform built with React, Redux Toolkit, Node.js, Express, and MongoDB.

## 🚀 Features

- **Job Listings** - Browse and search for jobs
- **Applications** - Apply to jobs and track application status
- **User Profiles** - Manage skills and experience
- **Role-Based Access** - Job Seekers and Employers
- **Responsive Design** - Mobile-first with Tailwind CSS
- **State Management** - Redux Toolkit for predictable state

## 🛠️ Tech Stack

### Frontend
- React 18
- Redux Toolkit
- React Router v6
- Tailwind CSS
- Vite
- Axios
- Framer Motion
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs
- CORS & Helmet

## 📁 Project Structure

```
skillmatch-ai/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── job.controller.js
│   │   └── application.controller.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Job.model.js
│   │   └── Application.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── job.routes.js
│   │   ├── application.routes.js
│   │   └── user.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   └── store.js
    │   ├── features/
    │   │   ├── auth/
    │   │   ├── jobs/
    │   │   └── applications/
    │   ├── components/
    │   ├── pages/
    │   ├── layouts/
    │   ├── services/
    │   ├── hooks/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## 🔧 Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Quick Install (Recommended)

Use the installation script for your platform:

**Windows:**
```bash
install.bat
```

**Mac/Linux:**
```bash
chmod +x install.sh
./install.sh
```

The script will:
- Install all dependencies for backend and frontend
- Create .env files from templates
- Verify Node.js installation

### Manual Installation

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

## ⚙️ Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillmatch_db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)

### Applications
- `GET /api/applications` - Get user applications (protected)
- `POST /api/applications` - Create application (job seeker only)
- `PUT /api/applications/:id` - Update status (employer only)
- `DELETE /api/applications/:id` - Delete application (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)

## 🎨 Design System

### Colors
- Primary: Blue (#0284c7)
- Secondary: Purple
- Success: Green
- Error: Red

### Components
- Cards: `bg-white rounded-2xl shadow-sm p-6`
- Buttons: `px-5 py-2.5 rounded-xl font-medium`
- Inputs: `px-4 py-3 rounded-xl border`

### Spacing
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

## 🔐 Authentication

The app uses JWT-based authentication:
- Tokens stored in localStorage
- Protected routes require valid token
- Role-based access control (Job Seeker, Employer, Admin)

## 🚦 Available Scripts

### Backend
```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm test        # Run tests
```

### Frontend
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## 📝 Usage

1. **Register** as a Job Seeker or Employer
2. **Job Seekers** can:
   - Browse jobs
   - Apply to jobs
   - Track applications
   - Update profile and skills
3. **Employers** can:
   - Post jobs
   - View applications
   - Update job listings
   - Manage company profile

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- React team
- Redux Toolkit
- Tailwind CSS
- MongoDB
- Express.js

---

**Built with ❤️ using React, Redux Toolkit, Node.js, and MongoDB**
