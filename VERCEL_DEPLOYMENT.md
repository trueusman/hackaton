# Vercel Deployment Guide for MaintainIQ

## Quick Deploy Steps:

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Open: https://vercel.com/usman-pros-projects
   - Click "Add New" → "Project"

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Select: `trueusman/hackaton`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (IMPORTANT!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual backend URL when you deploy backend)

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (2-3 minutes)
   - You'll get a URL like: `https://hackaton-xyz.vercel.app`

### Option 2: Deploy via Vercel CLI (If network is stable)

```bash
# Navigate to client folder
cd "c:\Users\trueu\OneDrive\Desktop\smit-hackahton\2026-hacaton\client"

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Important Notes:

1. **Root Directory**: Make sure to set `client` as root directory
2. **Environment Variables**: Set `VITE_API_URL` to your backend API URL
3. **Backend Deployment**: Deploy backend on Render first to get the API URL
4. **Custom Domain**: You can add custom domain in Vercel project settings

## Backend on Render:

1. Go to: https://render.com
2. Create "New Web Service"
3. Connect your GitHub repo: `trueusman/hackaton`
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `node src/server.js`
7. Add environment variables from `server/.env.example`

## After Deployment:

1. Copy Vercel URL (e.g., `https://hackaton-xyz.vercel.app`)
2. Add this URL to Render backend environment variables:
   - `CLIENT_URL=https://hackaton-xyz.vercel.app`
   - `PUBLIC_APP_URL=https://hackaton-xyz.vercel.app`

3. Update Vercel environment variable:
   - `VITE_API_URL=https://your-render-backend.onrender.com/api`

## Project URLs:
- **GitHub**: https://github.com/trueusman/hackaton
- **Vercel**: https://vercel.com/usman-pros-projects
- **Frontend**: (Will be available after deployment)
- **Backend**: (Deploy on Render)

## Troubleshooting:

- **Build fails**: Check if `client` is set as root directory
- **API errors**: Verify `VITE_API_URL` environment variable
- **Blank page**: Check browser console and vercel.json configuration
