# 🚂 Railway Quick Start Guide

## Step 1: Prepare Your Repository

✅ Files already created:
- `Procfile` - Tells Railway how to run your app
- `railway.json` - Railway configuration
- `.env.example` - Environment variable template
- `RAILWAY_DEPLOYMENT.md` - Full deployment guide

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect and start building

### Option B: Deploy with Railway CLI

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

## Step 3: Configure Environment Variables

In Railway dashboard → Your Project → Variables tab, add:

```
PORT=3000
REACT_APP_WS_URL=wss://your-app-name.railway.app
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
NODE_ENV=production
```

**Important**: Replace `your-app-name` with your actual Railway domain!

## Step 4: Set Up Two Services (Recommended)

Railway can run multiple services. Set up:

### Service 1: Frontend
- **Name**: `frontend`
- **Start Command**: `npm run serve:build`
- **Port**: `3000`

### Service 2: WebSocket Server
- **Name**: `websocket`
- **Start Command**: `node server/websocket-server.js`
- **Port**: `8080` (or use Railway's assigned port)

**Update `REACT_APP_WS_URL`** to point to your WebSocket service URL!

## Step 5: Get Your Domain

1. Railway provides: `your-project-name.railway.app`
2. Or add custom domain in Settings → Networking

## Step 6: Test Deployment

1. ✅ Visit your Railway URL
2. ✅ Check browser console for WebSocket connection
3. ✅ Test wallet connection
4. ✅ Test token purchase
5. ✅ Test multiplayer games

## 🔧 Troubleshooting

### WebSocket Not Connecting?

1. Check `REACT_APP_WS_URL` matches your WebSocket service URL
2. Use `wss://` for HTTPS, `ws://` for HTTP
3. Check Railway logs for WebSocket service

### Build Failing?

1. Check Railway logs
2. Ensure Node.js version is 18+
3. Check environment variables are set

### Port Issues?

- Railway assigns ports dynamically
- Use `process.env.PORT` in your code
- Railway handles port mapping automatically

## 📊 Monitoring

- **Logs**: Railway dashboard → View logs
- **Metrics**: Railway dashboard → Metrics
- **Health**: Railway monitors automatically

## 🎯 Next Steps

1. Test all features
2. Monitor logs for errors
3. Set up custom domain (optional)
4. Configure auto-deploy from GitHub
5. Set up monitoring/alerts

## 💡 Pro Tips

- Railway auto-deploys on git push (if connected)
- Use Railway's built-in PostgreSQL if needed
- Railway handles SSL automatically
- Free tier includes $5/month credit

---

**Ready to deploy?** Follow the steps above and you'll be live in minutes! 🚀

