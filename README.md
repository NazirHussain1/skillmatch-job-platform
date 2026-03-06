# SkillMatch - Job Portal Platform

SkillMatch is a full-stack MERN job portal that connects job seekers and employers, with an admin moderation layer, real-time chat, and role-based access control.

## Project Purpose

SkillMatch helps:

- Job seekers discover jobs, apply, track applications, and chat with employers.
- Employers post jobs, manage listings, review applicants, and communicate with candidates.
- Admins moderate platform activity by managing users and job posting approvals.

## Key Features

### Authentication and Authorization

- JWT-based authentication.
- Role-based route protection (`jobseeker`, `employer`, `admin`).
- Password reset flow.
- Email verification endpoints (`verify` and `resend`) are implemented.

### Job Seeker Features

- Browse jobs with filters (keyword, location, salary, category, type).
- Apply to jobs.
- Track application statuses (`pending`, `accepted`, `rejected`).
- Save and unsave jobs.
- Upload resume.
- Chat with employers after applying.

### Employer Features

- Post, edit, and delete jobs.
- View employer dashboard stats.
- View applicants for each job.
- Accept or reject applications.
- Upload company logo and manage company profile.
- Chat with applicants.

### Admin Features

- Admin dashboard analytics.
- View all users and jobs with filters.
- Delete users and jobs.
- Change user roles.
- Approve or reject job postings.

### Platform Features

- Real-time messaging with Socket.IO.
- Notification center for application events.
- Cloudinary-based media/document storage.
- Input sanitization and request validation.

## Technology Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router v6
- Axios
- Socket.IO Client
- React Hot Toast
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- bcryptjs
- Socket.IO
- Multer + Cloudinary
- Nodemailer
- express-validator
- Helmet, CORS, Morgan

## Architecture Overview

- Frontend (React SPA) consumes REST APIs from Express.
- JWT is stored in local storage and injected into request headers by Axios interceptors.
- Backend controllers handle role-specific business logic.
- MongoDB stores users, jobs, applications, conversations, messages, and notifications.
- Socket.IO handles real-time chat events.
- Cloudinary stores profile images, company logos, and resumes.

## Main Modules

### Backend Modules

- `controllers/`: auth, users, jobs, applications, admin, chat, notifications, company
- `routes/`: API route definitions per domain
- `models/`: Mongoose schemas
- `middleware/`: auth, validation, sanitization, upload, error handling
- `validators/`: express-validator rules
- `config/`: database and Cloudinary configuration
- `utils/`: response format, async wrapper, token generation, email sender

### Frontend Modules

- `pages/`: role-based screens (auth, jobs, applications, admin, chat, profile)
- `components/`: shared UI primitives and route guards
- `features/`: Redux slices (auth, jobs, applications, user, chat)
- `services/`: API service layer
- `context/`: Socket provider
- `hooks/`: auth persistence behavior
- `layouts/`: application shell and navigation
- `utils/`: media URL optimization helpers

## Project Structure

```text
skill-match/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
    validators/
    server.js
  frontend/
    src/
      app/
      components/
      context/
      features/
      hooks/
      layouts/
      pages/
      services/
      utils/
      App.jsx
      main.jsx
  README.md
```

## Environment Variables

### Backend (`backend/.env.local`)

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@skillmatch.com
EMAIL_FROM_NAME=SkillMatch

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default dev server runs on `http://localhost:3000`.
Backend runs on `http://localhost:5000`.

## Production Build

### Frontend Build

```bash
cd frontend
npm run build
```

### Backend Runtime

```bash
cd backend
npm install
npm start
```

## Deployment Readiness Notes

### Backend (Render or Railway)

- Set all backend environment variables.
- Set `CORS_ORIGIN` and `FRONTEND_URL` to the deployed frontend domain.
- Use managed MongoDB and Cloudinary credentials.
- Start command: `npm start`.

### Frontend (Vercel or Netlify)

- Set `VITE_API_URL` to deployed backend URL with `/api` suffix.
- Build command: `npm run build`.
- Output directory: `dist`.
- Configure SPA fallback/rewrites to `index.html`.

## License

MIT
