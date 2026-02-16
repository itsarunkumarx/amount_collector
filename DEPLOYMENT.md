# Deployment Guide

This guide will help you deploy the Royal Amount Collector application to production.

## Prerequisites
- GitHub account
- Render account (for backend)
- Vercel account (for frontend)
- MongoDB Atlas account (for database)

## Backend Deployment (Render)

### 1. Environment Variables
Set these in Render's dashboard:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl=true
DATABASE_NAME=royal_amount_collector
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
BACKEND_CORS_ORIGINS=https://your-frontend.vercel.app
```

### 2. Deploy to Render
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `amount-collector-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
6. Add environment variables from above
7. Click "Create Web Service"

## Frontend Deployment (Vercel)

### 1. Environment Variables
Set this in Vercel's dashboard:

```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### 2. Deploy to Vercel
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variable: `VITE_API_URL`
7. Click "Deploy"

## Post-Deployment

### Update CORS
After deploying the frontend, update the `BACKEND_CORS_ORIGINS` in Render to include your Vercel URL.

### Create Admin User
SSH into your Render service or use a database client to create an admin user, or use the signup endpoint.

## Keep-Alive
The backend includes a self-pinging mechanism that runs every 14 minutes to prevent Render's free tier from sleeping.

## Troubleshooting
- Check Render logs for backend issues
- Check Vercel logs for frontend issues
- Ensure environment variables are set correctly
- Verify MongoDB connection string is correct
