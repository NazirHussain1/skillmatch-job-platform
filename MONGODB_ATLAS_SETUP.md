# MongoDB Atlas Setup Guide

## Steps to Configure MongoDB Atlas

### 1. Create MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for a free account

### 2. Create a Cluster
- Click "Build a Database"
- Choose "FREE" tier (M0)
- Select your preferred cloud provider and region
- Click "Create Cluster"

### 3. Create Database User
- Go to "Database Access" in the left sidebar
- Click "Add New Database User"
- Choose "Password" authentication
- Set username and password (save these!)
- Set privileges to "Read and write to any database"
- Click "Add User"

### 4. Configure Network Access
- Go to "Network Access" in the left sidebar
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (0.0.0.0/0) for development
- Click "Confirm"

### 5. Get Connection String
- Go to "Database" in the left sidebar
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- It will look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 6. Update .env File
Replace the placeholders in `server/.env`:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/skillmatch?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` with your database username
- `YOUR_PASSWORD` with your database password
- `cluster0.xxxxx` with your actual cluster address
- Added `/skillmatch` before the `?` to specify the database name

### 7. Update JWT Secret
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in `server/.env`:
```
JWT_SECRET=your_generated_secret_here
```

## File Changes Made
✅ All `.js` files renamed to `.jsx`
✅ MongoDB Atlas connection string configured
✅ server/package.json updated to use server.jsx

## Ready to Run!
