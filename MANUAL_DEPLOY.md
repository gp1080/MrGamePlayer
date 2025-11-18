# 🚀 Manual Railway Deployment Guide

## Option 1: Railway Dashboard (Easiest)

### Steps:
1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Sign in to your account

2. **Select Your Project**
   - Click on your project: `MrGamePlayer`

3. **Select Service**
   - Click on the service you want to deploy (e.g., `frontend` or `websocket`)

4. **Trigger Manual Deployment**
   - Click on the **"Deployments"** tab
   - Click the **"Redeploy"** button (or **"Deploy"** if no deployments exist)
   - Railway will start building from the latest commit

5. **Monitor Build**
   - Watch the build logs in real-time
   - Wait for deployment to complete (green checkmark)

### For Both Services:
Repeat steps 3-5 for each service:
- **Frontend service**: Deploys your React app
- **WebSocket service**: Deploys your WebSocket server

---

## Option 2: Railway CLI

### Install Railway CLI (if not installed):
```bash
npm install -g @railway/cli
```

### Login:
```bash
railway login
```

### Deploy:
```bash
# Navigate to your project directory
cd C:\Users\guill\Desktop\MrGamePlayer

# Link to your Railway project (first time only)
railway link

# Deploy
railway up
```

### Deploy Specific Service:
```bash
# Deploy frontend service
railway up --service frontend

# Deploy websocket service
railway up --service websocket
```

---

## Option 3: Force Redeploy via GitHub

If auto-deploy is enabled but not working:

1. **Make a small change** to trigger deployment:
   ```bash
   # Add a comment or whitespace change
   echo "" >> README.md
   git add README.md
   git commit -m "Trigger Railway deployment"
   git push origin main
   ```

2. **Railway should detect the push** and auto-deploy

---

## Troubleshooting Manual Deployment

### Build Failing?
1. Check **Deployments** tab → **View Logs**
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Build timeout
   - Memory limits

### Service Not Starting?
1. Check **Logs** tab for runtime errors
2. Verify environment variables are set
3. Check port configuration

### WebSocket Not Connecting?
1. Verify `REACT_APP_WS_URL` is set correctly
2. Check WebSocket service is running
3. Verify domain/URL matches

---

## Quick Check Commands

### Check Railway Status:
```bash
railway status
```

### View Logs:
```bash
railway logs
```

### List Services:
```bash
railway service list
```

---

## Enable Auto-Deploy (If Disabled)

1. Go to Railway Dashboard
2. Select your service
3. Go to **Settings** → **Service Source**
4. Ensure **"Auto Deploy"** is enabled
5. Branch should be set to `main`

---

## Manual Deployment Checklist

- [ ] Railway project created
- [ ] Services configured (frontend + websocket)
- [ ] Environment variables set
- [ ] Domains generated
- [ ] Manual deployment triggered
- [ ] Build completed successfully
- [ ] Services running
- [ ] Frontend accessible
- [ ] WebSocket connecting
- [ ] All features tested

---

**Need Help?** Check Railway logs or contact Railway support!

