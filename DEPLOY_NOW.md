# 🚀 Deploy MaintainIQ - Complete Guide

## ✅ Prerequisites Done:
- ✅ GitHub repository created: https://github.com/trueusman/hackaton
- ✅ All code pushed with clean commit history
- ✅ Modern UI updated with gradients and animations
- ✅ Vercel configuration files added

---

## 📦 Step 1: Deploy Frontend on Vercel (5 minutes)

### Method A: Quick Deploy Button (Easiest)

1. **Click this button to deploy:**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/trueusman/hackaton&project-name=maintainiq&root-directory=client&env=VITE_API_URL)

2. **Login to your Vercel account**: https://vercel.com/usman-pros-projects

3. **Configure the deployment:**
   - Repository: `trueusman/hackaton` (auto-filled)
   - Project Name: `maintainiq` or any name you like
   - Framework: `Vite` (auto-detected)
   - Root Directory: `client` ⚠️ **IMPORTANT!**
   - Environment Variable:
     ```
     VITE_API_URL = https://2026-hacaton.onrender.com/api
     ```

4. **Click Deploy** and wait 2-3 minutes

5. **Your app will be live at**: `https://maintainiq-xyz.vercel.app`

### Method B: Manual Dashboard Import

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Search: `trueusman/hackaton`
4. Click "Import"
5. Settings:
   - **Root Directory**: `client` ⚠️
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   ```
   VITE_API_URL = https://2026-hacaton.onrender.com/api
   ```
7. Click "Deploy"

---

## 🖥️ Step 2: Deploy Backend on Render (10 minutes)

### Option A: Quick Deploy Button

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/trueusman/hackaton)

### Option B: Manual Setup

1. **Go to Render**: https://render.com
2. **Sign up/Login** with GitHub
3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect repository: `trueusman/hackaton`
   - Click "Connect"

4. **Configure Service**:
   ```
   Name: maintainiq-backend
   Root Directory: server
   Environment: Node
   Region: Singapore (or closest to you)
   Branch: main
   Build Command: npm install
   Start Command: node src/server.js
   ```

5. **Add Environment Variables**:
   Click "Advanced" → "Add Environment Variable"
   
   ```env
   NODE_ENV=production
   PORT=5000
   
   # MongoDB (Get from MongoDB Atlas)
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/maintainiq?retryWrites=true&w=majority
   
   # JWT Secrets (Generate strong random strings)
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   JWT_REFRESH_SECRET=your-refresh-token-secret-key-also-32-chars
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Cloudinary (Get from cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Google Gemini AI (Get from ai.google.dev)
   GEMINI_API_KEY=your-gemini-api-key
   
   # URLs (Update after Vercel deployment)
   CLIENT_URL=https://maintainiq-xyz.vercel.app
   PUBLIC_APP_URL=https://maintainiq-xyz.vercel.app
   ```

6. **Click "Create Web Service"**
7. Wait 5-10 minutes for deployment
8. Your backend URL: `https://maintainiq-backend.onrender.com`

---

## 🗄️ Step 3: Setup MongoDB Atlas (5 minutes)

1. **Go to**: https://cloud.mongodb.com
2. **Sign up/Login**
3. **Create Free Cluster**:
   - Click "Build a Database"
   - Choose "FREE" (M0 Sandbox)
   - Region: Choose closest to your Render region
   - Cluster Name: `maintainiq`
   - Click "Create"

4. **Create Database User**:
   - Security → Database Access
   - Click "Add New Database User"
   - Username: `admin`
   - Password: Generate secure password (save it!)
   - User Privileges: "Atlas Admin"
   - Click "Add User"

5. **Allow Network Access**:
   - Security → Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `maintainiq`
   - Example: `mongodb+srv://admin:YourPassword123@maintainiq.abc123.mongodb.net/maintainiq?retryWrites=true&w=majority`

7. **Add to Render**:
   - Go back to Render dashboard
   - Your web service → Environment
   - Update `MONGO_URI` with this connection string

---

## 🔑 Step 4: Get API Keys

### Cloudinary (Image/Video Storage):
1. Go to: https://cloudinary.com/users/register/free
2. Sign up for free account
3. Dashboard → Account Details:
   - Copy `Cloud Name`
   - Copy `API Key`
   - Copy `API Secret`
4. Add to Render environment variables

### Google Gemini AI:
1. Go to: https://ai.google.dev/
2. Click "Get API Key"
3. Create new project
4. Copy API key
5. Add to Render environment variables

---

## 🔗 Step 5: Connect Frontend & Backend

### Update Vercel Environment:
1. Go to Vercel project settings
2. Settings → Environment Variables
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL = https://your-render-backend.onrender.com/api
   ```
4. Redeploy: Deployments → Latest → ... → Redeploy

### Update Render Environment:
1. Go to Render service settings
2. Environment → Edit
3. Update URLs:
   ```
   CLIENT_URL = https://your-vercel-app.vercel.app
   PUBLIC_APP_URL = https://your-vercel-app.vercel.app
   ```
4. Save changes (auto-redeploys)

---

## 🎯 Step 6: Initialize Database (2 minutes)

1. **SSH into Render service**:
   - Render Dashboard → Your service → Shell tab
   
2. **Run seed command**:
   ```bash
   node src/database/seed.js
   ```

3. **Verify** demo users are created

---

## ✅ Step 7: Test Your Deployment

1. **Visit your Vercel URL**: `https://your-app.vercel.app`

2. **Test Login** with demo credentials:
   ```
   Email: admin@maintainiq.dev
   Password: Admin@12345
   ```

3. **Check Features**:
   - ✅ Dashboard loads
   - ✅ Assets page shows data
   - ✅ Can create new asset
   - ✅ QR code generates
   - ✅ Public asset page works
   - ✅ Issue reporting works
   - ✅ AI triage works (if Gemini key added)

---

## 🐛 Troubleshooting

### Frontend not loading:
- Check Vercel logs: Deployments → Latest deployment → View Function Logs
- Verify `client` is set as root directory
- Check `VITE_API_URL` environment variable

### Backend errors:
- Check Render logs: Dashboard → Your service → Logs
- Verify all environment variables are set
- Check MongoDB connection string is correct

### API connection fails:
- Verify backend URL in Vercel env vars
- Check CORS settings in backend
- Ensure `CLIENT_URL` in Render matches Vercel URL

### Database connection fails:
- Verify MongoDB IP whitelist (0.0.0.0/0)
- Check username/password in connection string
- Ensure database user has proper permissions

---

## 📱 Your Live URLs

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **API Docs**: `https://your-backend.onrender.com/api`
- **GitHub**: https://github.com/trueusman/hackaton

---

## 🎨 Features Deployed

✅ Modern UI with gradients and animations
✅ QR code asset tracking
✅ AI-powered issue triage
✅ Role-based access control
✅ Real-time dashboard
✅ Dark mode support
✅ Mobile responsive design
✅ Image/video upload
✅ Maintenance workflow
✅ Issue tracking system

---

## 💡 Pro Tips

1. **Custom Domain**: Add your own domain in Vercel settings
2. **SSL**: Both Vercel and Render provide free SSL
3. **Monitoring**: Enable Vercel Analytics for traffic insights
4. **Logs**: Check Render logs for backend debugging
5. **Scaling**: Render free tier sleeps after inactivity (upgrade for production)

---

## 🆘 Need Help?

- Check deployment logs on both platforms
- Verify all environment variables match
- Test API endpoints directly via Postman
- Review MongoDB Atlas activity logs

---

**Happy Deploying! 🚀**
