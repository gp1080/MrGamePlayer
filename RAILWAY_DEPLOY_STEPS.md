# 🚂 Railway Deployment - Step by Step

## Prerequisites
✅ GitHub repository pushed: https://github.com/gp1080/MrGamePlayer
✅ Railway account (sign up at https://railway.app)

---

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select repository: **`gp1080/MrGamePlayer`**
6. Railway will start building automatically

---

## Step 2: Set Up Frontend Service

Railway should auto-detect your project. Configure it:

1. **Service Name**: `frontend` (or keep default)
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run serve:build`
4. **Port**: Railway will assign automatically (use `$PORT`)

### Environment Variables for Frontend:
Add these in Railway → Variables tab:

```
NODE_ENV=production
PORT=3000
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
```

**⚠️ Important**: We'll add `REACT_APP_WS_URL` after creating the WebSocket service!

---

## Step 3: Create WebSocket Service

1. In your Railway project, click **"+ New"** → **"Empty Service"**
2. Name it: `websocket`
3. Click **"Settings"** → **"Source"**
4. Connect to the same GitHub repo: `gp1080/MrGamePlayer`
5. Set **Root Directory**: `/` (default)
6. Set **Start Command**: `node server/websocket-server.js`
7. **No build command needed** (it's just Node.js)

### Environment Variables for WebSocket:
Add these in Railway → Variables tab (for websocket service):

```
NODE_ENV=production
PORT=8080
WS_PORT=8080
```

---

## Step 4: Get Your Railway Domains

1. **Frontend Domain**:
   - Go to `frontend` service → **Settings** → **Networking**
   - Railway provides: `your-project-name.railway.app`
   - Or generate a custom domain

2. **WebSocket Domain**:
   - Go to `websocket` service → **Settings** → **Networking**
   - Generate a public domain (e.g., `your-project-ws.railway.app`)
   - **Copy this URL!**

---

## Step 5: Update Frontend Environment Variables

Go back to `frontend` service → **Variables** tab:

1. Add/Update `REACT_APP_WS_URL`:
   ```
   REACT_APP_WS_URL=wss://your-websocket-domain.railway.app
   ```
   **Replace `your-websocket-domain` with your actual WebSocket service domain!**

2. Use `wss://` (secure WebSocket) for HTTPS, or `ws://` for HTTP

---

## Step 6: Redeploy Services

After adding environment variables:

1. **Frontend**: Railway will auto-redeploy, or click **"Redeploy"**
2. **WebSocket**: Railway will auto-redeploy, or click **"Redeploy"**

Wait for both deployments to complete (green checkmarks).

---

## Step 7: Test Your Deployment

1. **Visit your frontend URL**: `https://your-project-name.railway.app`
2. **Open browser console** (F12)
3. **Check for errors**:
   - WebSocket connection should show "Connected"
   - No CORS errors
   - No environment variable errors

4. **Test features**:
   - ✅ Wallet connection
   - ✅ Token purchase
   - ✅ Multiplayer games
   - ✅ WebSocket chat

---

## Step 8: Configure Auto-Deploy (Optional)

Railway auto-deploys on push to `main` branch by default.

To verify:
1. Go to **Settings** → **Service Source**
2. Ensure **"Auto Deploy"** is enabled
3. Branch should be `main`

---

## 🔧 Troubleshooting

### WebSocket Not Connecting?

1. **Check `REACT_APP_WS_URL`**:
   - Must match your WebSocket service domain exactly
   - Use `wss://` for HTTPS
   - Check browser console for connection errors

2. **Check WebSocket logs**:
   - Railway dashboard → `websocket` service → **Logs**
   - Look for "WebSocket server is running on port..."

3. **Verify ports**:
   - WebSocket service should use Railway's assigned `PORT`
   - Check logs for actual port number

### Frontend Not Loading?

1. **Check build logs**:
   - Railway dashboard → `frontend` service → **Deployments** → **View logs**
   - Look for build errors

2. **Check environment variables**:
   - All required variables must be set
   - No typos in variable names

3. **Check Node version**:
   - Railway uses Node 18+ by default
   - Can specify in `package.json` or Railway settings

### Build Failing?

1. **Memory limits**:
   - Free tier has memory limits
   - Upgrade plan if needed

2. **Missing dependencies**:
   - Check `package.json` is correct
   - Check build logs for missing packages

---

## 📊 Monitoring

- **Logs**: Railway dashboard → Service → **Logs** tab
- **Metrics**: Railway dashboard → Service → **Metrics** tab
- **Deployments**: Railway dashboard → Service → **Deployments** tab

---

## 🎯 Quick Reference

### Frontend Service
- **Build**: `npm install && npm run build`
- **Start**: `npm run serve:build`
- **Port**: `$PORT` (Railway assigns)

### WebSocket Service
- **Start**: `node server/websocket-server.js`
- **Port**: `$PORT` or `$WS_PORT` (Railway assigns)

### Required Environment Variables

**Frontend**:
```
NODE_ENV=production
PORT=3000
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
REACT_APP_WS_URL=wss://your-websocket-domain.railway.app
```

**WebSocket**:
```
NODE_ENV=production
PORT=8080
WS_PORT=8080
```

---

## ✅ Deployment Checklist

- [ ] Railway project created
- [ ] Frontend service configured
- [ ] WebSocket service created
- [ ] Frontend domain generated
- [ ] WebSocket domain generated
- [ ] `REACT_APP_WS_URL` set correctly
- [ ] All environment variables added
- [ ] Both services deployed successfully
- [ ] Frontend loads correctly
- [ ] WebSocket connects successfully
- [ ] Wallet connection works
- [ ] Token purchase works
- [ ] Multiplayer games work

---

**Need help?** Check Railway logs or the troubleshooting section above!

