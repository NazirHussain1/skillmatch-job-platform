# SkillMatch AI Backend Server

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup MongoDB
Make sure MongoDB is installed and running on your system:
- **macOS**: `brew services start mongodb-community`
- **Windows**: Start MongoDB service from Services
- **Linux**: `sudo systemctl start mongod`

Or use MongoDB Atlas (cloud):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

Update the following in `.env`:
- `JWT_SECRET`: Change to a secure random string
- `MONGODB_URI`: Update if using MongoDB Atlas

### 4. Start the Server
```bash
npm run dev
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `PUT /api/users/profile` - Update user profile (Protected)
- `GET /api/users/analytics` - Get user analytics (Protected)

### Jobs
- `GET /api/jobs` - Get all jobs (Public)
- `GET /api/jobs/:id` - Get single job (Public)
- `POST /api/jobs` - Create job (Employer only)
- `PUT /api/jobs/:id` - Update job (Employer only)
- `DELETE /api/jobs/:id` - Delete job (Employer only)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs (Employer only)

### Applications
- `GET /api/applications` - Get user's applications (Job Seeker)
- `GET /api/applications/employer` - Get applications for employer's jobs (Employer)
- `POST /api/applications` - Create application (Job Seeker only)
- `PUT /api/applications/:id` - Update application status (Employer only)
- `DELETE /api/applications/:id` - Delete application (Protected)

## Testing the API

Use the following credentials to test:
- Email: `demo@jobseeker.com` / Password: `password123`
- Email: `demo@employer.com` / Password: `password123`

Or create new accounts via the signup endpoint.
