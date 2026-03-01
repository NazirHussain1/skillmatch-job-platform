# SkillMatch AI

> AI-powered skill-based hiring platform connecting job seekers with opportunities through intelligent matching algorithms.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

## 🚀 Features

### For Job Seekers
- **AI-Powered Matching** - Get matched with jobs based on your skills and experience
- **Smart Recommendations** - Receive personalized job suggestions in real-time
- **Application Tracking** - Monitor your application status and progress
- **Skill Analysis** - Identify skill gaps and upskilling opportunities
- **Profile Management** - Showcase your skills and experience

### For Employers
- **Intelligent Candidate Matching** - Find the best candidates using AI algorithms
- **Job Posting Management** - Create and manage job listings
- **Application Analytics** - Track application metrics and insights
- **Candidate Filtering** - Advanced search and filtering capabilities
- **Real-time Notifications** - Get instant updates on new applications

### Platform Features
- **Real-time Updates** - WebSocket-based live notifications
- **Responsive Design** - Mobile-first, works on all devices
- **Secure Authentication** - JWT-based auth with role-based access control
- **Modern UI/UX** - Clean, professional interface with smooth animations
- **Performance Optimized** - Code splitting, lazy loading, and compression

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library (LazyMotion optimized)
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - WebSocket server
- **Redis** - Caching (optional)
- **Cloudinary** - File uploads
- **Winston** - Logging
- **Jest** - Testing (78.5% coverage)

### DevOps & Tools
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/skillmatch-ai.git
cd skillmatch-ai
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables in .env.local
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables in .env
# See Configuration section below

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

## ⚙️ Configuration

### Frontend Environment Variables (.env.local)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend Environment Variables (server/.env)

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillmatch_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Contexts │  │ Services │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │   REST API    │
                    │   WebSocket   │
                    └───────┬───────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │Controller│  │ Services │  │Repository│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │Middleware│  │  Models  │  │  Utils   │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────┴──────┐  ┌────┴─────┐
            │   MongoDB    │  │  Redis   │
            │    Atlas     │  │ (Cache)  │
            └──────────────┘  └──────────┘
```

### Backend Architecture Pattern

**Clean Architecture with MVC + Service + Repository Layers:**

- **Routes** - API endpoint definitions
- **Controllers** - Request/response handling
- **Services** - Business logic
- **Repositories** - Data access layer
- **Models** - Database schemas
- **Middlewares** - Auth, validation, error handling
- **Utils** - Helper functions

## 📁 Project Structure

```
skillmatch-ai/
├── components/          # React components
│   ├── AppLayout.jsx
│   ├── JobCard.jsx
│   ├── EmptyState.jsx
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   └── SocketContext.jsx
├── pages/              # Page components
│   ├── Dashboard.jsx
│   ├── Jobs.jsx
│   ├── Login.jsx
│   └── ...
├── services/           # API services
│   ├── apiService.js
│   └── authService.js
├── server/             # Backend application
│   ├── src/
│   │   ├── config/     # Configuration files
│   │   ├── middlewares/# Express middlewares
│   │   ├── modules/    # Feature modules
│   │   │   ├── auth/
│   │   │   ├── jobs/
│   │   │   ├── users/
│   │   │   └── ...
│   │   ├── utils/      # Utility functions
│   │   ├── app.js      # Express app setup
│   │   └── server.js   # Server entry point
│   ├── tests/          # Test files
│   └── package.json
├── App.jsx             # Main app component
├── index.jsx           # App entry point
├── index.css           # Global styles
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Frontend dependencies
```

## 🚦 Available Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:analyze # Build with bundle analysis
npm run preview      # Preview production build
```

### Backend

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🔐 Authentication

The platform uses JWT-based authentication with the following features:

- **Secure password hashing** using bcrypt
- **Token-based authentication** with JWT
- **Role-based access control** (Job Seeker, Employer, Admin)
- **Protected routes** on both frontend and backend
- **Session persistence** with localStorage
- **Automatic token refresh**

### Demo Accounts

**Job Seeker:**
- Email: `demo@jobseeker.com`
- Password: `demo123`

**Employer:**
- Email: `demo@employer.com`
- Password: `demo123`

## 🧪 Testing

Backend includes comprehensive test coverage:

```bash
cd server
npm test                # Run all tests
npm run test:coverage   # Generate coverage report
```

**Current Coverage: 78.5%**

## 🎨 UI/UX Features

- **Mobile-first responsive design** (320px to 4K)
- **Dark mode ready** (class-based strategy)
- **Smooth animations** with Framer Motion
- **Loading skeletons** for better perceived performance
- **Toast notifications** for user feedback
- **Empty states** with helpful messages
- **Accessible** with ARIA labels and keyboard navigation
- **Professional SaaS design** with gradients and modern aesthetics

## 🚀 Performance Optimizations

- **Code splitting** - Lazy loading for all routes
- **Vendor chunking** - Separate chunks for React, UI libraries, charts
- **LazyMotion** - Reduced Framer Motion bundle by 50%
- **Gzip/Brotli compression** - 60-75% size reduction
- **Tree shaking** - Removes unused code
- **Minification** - Terser for production builds
- **Image optimization** - Lazy loading and WebP support
- **Bundle analysis** - Visual reports with rollup-plugin-visualizer

**Expected Lighthouse Score: 90-95/100**

## 🔒 Security Features

- **JWT authentication** with secure token storage
- **Password hashing** with bcrypt (10 rounds)
- **Input validation** with express-validator
- **SQL injection prevention** with Mongoose
- **XSS protection** with helmet
- **CORS configuration** for API security
- **Rate limiting** to prevent abuse
- **Environment variables** for sensitive data
- **HTTPS ready** for production

## 🐛 Known Issues

1. **TypeScript Syntax in JSX Files** - Some `.jsx` files contain TypeScript syntax. Rename to `.tsx` or remove type annotations.
2. **Redis Optional** - Redis is configured but not required. Disable if not using caching.
3. **Build Warnings** - Some peer dependency warnings can be safely ignored.

## 📝 API Documentation

API documentation is available via Swagger UI when running the backend:

```
http://localhost:5000/api-docs
```

### Main Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job (Employer only)
- `GET /api/applications` - Get user applications
- `POST /api/applications` - Apply to job
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database
- All open-source contributors

## 📞 Support

For support, email support@skillmatch.ai or join our Slack channel.

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Video interview integration
- [ ] Resume parsing with AI
- [ ] Skill assessment tests
- [ ] Company profiles
- [ ] Referral system
- [ ] Mobile app (React Native)

---

**Built with ❤️ using React, Node.js, and MongoDB**
