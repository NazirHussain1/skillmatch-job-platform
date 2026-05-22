# SkillMatch Deployment Guide

This project deploys as two services:

- Backend: Node/Express API with Socket.IO.
- Frontend: Vite/React static site.

## Required Production URLs

Use HTTPS URLs in production.

```text
FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com
VITE_API_URL=https://your-backend-domain.com/api
CORS_ORIGIN=https://your-frontend-domain.com
```

If you use multiple frontend domains, set `CORS_ORIGIN` as a comma-separated list:

```text
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

## Backend Environment Variables

Required:

```text
NODE_ENV=production
MONGODB_URI=...
JWT_SECRET=...
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_PASSWORD=...
```

Recommended:

```text
JWT_EXPIRES_IN=7d
ENABLE_RATE_LIMIT=true
ADMIN_NAME=Platform Admin
ADMIN_EMAIL=admin@your-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=SkillMatch
```

## Frontend Environment Variables

Required:

```text
VITE_API_URL=https://your-backend-domain.com/api
```

If `VITE_API_URL` is missing, the production frontend falls back to:

```text
https://skillmatch-backend.onrender.com/api
```

## Render

The root `render.yaml` defines:

- `skillmatch-backend`: Node web service from `backend/`.
- `skillmatch-frontend`: static site from `frontend/`.

After creating the Blueprint, set all `sync: false` variables in Render.

Backend:

```text
Root directory: backend
Build command: npm ci
Start command: npm start
Health check: /api/health
```

Frontend:

```text
Root directory: frontend
Build command: npm ci && npm run build
Publish directory: dist
```

## Railway

The root `railway.json` deploys the backend service.

Set the same backend environment variables listed above.

Frontend should be deployed separately on Vercel, Netlify, or Render Static Site.

## Fly.io

Two safe options are available:

1. Deploy from the repo root with root `fly.toml` and root `Dockerfile`.
2. Deploy from `backend/` with `backend/fly.toml` and `backend/Dockerfile`.

Required Fly secrets:

```bash
fly secrets set MONGODB_URI=...
fly secrets set JWT_SECRET=...
fly secrets set CORS_ORIGIN=https://your-frontend-domain.com
fly secrets set FRONTEND_URL=https://your-frontend-domain.com
fly secrets set CLOUDINARY_CLOUD_NAME=...
fly secrets set CLOUDINARY_API_KEY=...
fly secrets set CLOUDINARY_API_SECRET=...
fly secrets set ADMIN_PASSWORD=...
```

## Vercel

Deploy the frontend with project root set to `frontend`.

```text
Build command: npm run build
Output directory: dist
Environment: VITE_API_URL=https://your-backend-domain.com/api
```

`frontend/vercel.json` includes SPA rewrites so direct routes like `/jobs/:id` work.

## Netlify

Deploy the frontend with base directory `frontend`.

```text
Build command: npm run build
Publish directory: dist
Environment: VITE_API_URL=https://your-backend-domain.com/api
```

`frontend/public/_redirects` includes SPA fallback.

## Production Smoke Test

After deployment, verify these URLs and workflows:

Automated public checks:

```bash
npm run smoke -- --backend=https://your-backend-domain.com --frontend=https://your-frontend-domain.com
```

Backend-only check:

```bash
npm run smoke -- --backend=https://your-backend-domain.com
```

The smoke test checks:

```text
/api/health
/api/ready
/api/jobs?limit=1
/api/jobs/:id when at least one active job exists
Frontend SPA fallback routes when FRONTEND_URL is provided
```

Manual workflow checks:

```text
GET https://your-backend-domain.com/api/health
GET https://your-backend-domain.com/api/ready
Open https://your-frontend-domain.com
Open https://your-frontend-domain.com/jobs
Open a direct job details URL: /jobs/:id
Register/login as jobseeker
Register/login as employer
Employer creates job
Admin approves job
Jobseeker applies
Employer moves application through pipeline
Chat opens after application
Password reset email sends
Resume/company logo upload works
```

## Common Production Failures

- Frontend calls `localhost`: set `VITE_API_URL` correctly and redeploy frontend.
- CORS error: set `CORS_ORIGIN` to the exact frontend origin, without a trailing slash.
- Socket connection fails: `VITE_API_URL` must point to the same backend used by REST APIs.
- Uploads fail: verify all Cloudinary variables.
- Email fails: verify SMTP credentials and provider app-password settings.
- Direct page refresh gives 404: confirm Vercel rewrites or Netlify `_redirects` are active.
