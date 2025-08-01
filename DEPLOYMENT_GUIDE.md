# 🚀 Render Deployment Guide

This guide will help you deploy the Portfolio Manager application on Render for free.

## 📋 Prerequisites

1. **GitHub Account**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Git Repository**: Your code should be in a GitHub repository

## 🎯 Deployment Steps

### Step 1: Prepare Your Repository

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Step 2: Deploy Backend (Node.js Service)

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Connect your GitHub account
   - Select your repository

3. **Configure Backend Service**
   - **Name**: `portfolio-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Environment Variables** (optional):
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

5. **Click "Create Web Service"**

6. **Wait for Deployment**
   - Render will build and deploy your backend
   - Note the URL (e.g., `https://portfolio-backend-xyz.onrender.com`)

### Step 3: Deploy Frontend (Static Site)

1. **Create Static Site**
   - Click "New +" → "Static Site"

2. **Configure Frontend**
   - **Name**: `portfolio-frontend`
   - **Repository**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `portfolio-app`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`

3. **Environment Variables**:
   - `VITE_API_URL`: Your backend URL from Step 2
   - Example: `https://portfolio-backend-xyz.onrender.com`

4. **Click "Create Static Site"**

5. **Wait for Deployment**
   - Render will build and deploy your frontend
   - Your app will be available at the provided URL

## 🔧 Configuration Files

The project includes these configuration files:

### `backend/render.yaml`
```yaml
services:
  - type: web
    name: portfolio-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### `portfolio-app/render.yaml`
```yaml
services:
  - type: web
    name: portfolio-frontend
    env: static
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: VITE_API_URL
        value: https://your-backend-url.onrender.com
```

## 🌐 Access Your Application

- **Frontend URL**: Your static site URL (e.g., `https://portfolio-frontend-xyz.onrender.com`)
- **Backend URL**: Your web service URL (e.g., `https://portfolio-backend-xyz.onrender.com`)

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Connection Issues**
   - Verify `VITE_API_URL` environment variable is set correctly
   - Check CORS settings in backend
   - Ensure backend is running and accessible

3. **File Storage Issues**
   - Remember: File-based storage resets on server restarts
   - Data will be lost when Render restarts the service
   - Consider upgrading to paid plan for persistent storage

### Debug Commands:

```bash
# Check backend logs
# Go to Render dashboard → Your backend service → Logs

# Check frontend build
# Go to Render dashboard → Your static site → Build Logs
```

## 💰 Free Tier Limitations

- **Backend**: 750 hours/month (31 days)
- **Frontend**: Unlimited static sites
- **File Storage**: Resets on restarts
- **Memory**: 512MB RAM
- **CPU**: Shared

## 🚀 Production Considerations

For production use, consider:

1. **Database**: Add MongoDB Atlas (free tier) or PostgreSQL
2. **Session Storage**: Use Redis or database sessions
3. **Environment Variables**: Move API keys to environment variables
4. **Monitoring**: Add logging and error tracking
5. **SSL**: Render provides free SSL certificates

## ✅ Success Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] API connection working
- [ ] Authentication working
- [ ] Portfolio features working
- [ ] TradingView charts loading
- [ ] Real-time data updating

## 🎉 You're Done!

Your Portfolio Manager is now live on Render for free! Share your frontend URL with users.

**Note**: The free tier has limitations, but it's perfect for demos and small-scale applications. 