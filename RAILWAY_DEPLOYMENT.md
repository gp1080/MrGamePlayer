# Railway Deployment Guide

## 🚀 Quick Start

1. **Connect your GitHub repository to Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment Variables**
   Add these in Railway dashboard → Variables tab:

   ```
   PORT=3000
   REACT_APP_WS_URL=wss://your-app-name.railway.app
   REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
   REACT_APP_BETTING_CONTRACT_ADDRESS=your_betting_contract_address
   NODE_ENV=production
   ```

3. **Set up WebSocket Service**
   Railway will automatically detect the `Procfile` and run both services:
   - **Web service**: Serves the React app
   - **WebSocket service**: Handles multiplayer connections

## 📋 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port for web server | `3000` |
| `REACT_APP_WS_URL` | WebSocket server URL | `wss://your-app.railway.app` |
| `REACT_APP_TOKEN_CONTRACT_ADDRESS` | MGP Token contract | `0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_BETTING_CONTRACT_ADDRESS` | Betting contract address | (none) |
| `WS_PORT` | WebSocket server port | `8080` |

## 🔧 Railway Configuration

### Option 1: Single Service (Recommended for Start)

Railway can run both services in one container using the Procfile:

```procfile
web: npm run start:production
ws: node server/websocket-server.js
```

### Option 2: Two Separate Services (Better for Scaling)

1. **Frontend Service**
   - Build Command: `npm run build`
   - Start Command: `npm run serve:build`
   - Port: `3000`

2. **WebSocket Service**
   - Start Command: `node server/websocket-server.js`
   - Port: `8080` (or use Railway's assigned port)

## 🌐 Domain Configuration

1. **Generate Domain**
   - Railway automatically provides: `your-app.railway.app`
   - Or add custom domain in Settings → Networking

2. **Update WebSocket URL**
   - Set `REACT_APP_WS_URL` to your Railway domain
   - Use `wss://` for HTTPS or `ws://` for HTTP

## 📦 Build Process

Railway will:
1. Install dependencies (`npm install`)
2. Build React app (`npm run build`)
3. Start services according to Procfile

## 🔍 Troubleshooting

### WebSocket Connection Issues

1. **Check WebSocket URL**
   ```javascript
   // In browser console
   console.log(process.env.REACT_APP_WS_URL);
   ```

2. **Verify Port Configuration**
   - WebSocket server uses `process.env.PORT || 8080`
   - Make sure Railway exposes the correct port

3. **Check CORS Settings**
   - Railway handles CORS automatically
   - If issues persist, check WebSocket server logs

### Build Failures

1. **Check Build Logs**
   - Railway dashboard → Deployments → View logs

2. **Common Issues**
   - Missing environment variables
   - Node version mismatch (use Node 18+)
   - Memory limits (upgrade Railway plan if needed)

### Port Issues

Railway assigns ports dynamically. The WebSocket server should use:
```javascript
const PORT = process.env.PORT || process.env.WS_PORT || 8080;
```

## 📊 Monitoring

- **Logs**: Railway dashboard → View logs
- **Metrics**: Railway dashboard → Metrics tab
- **Health Checks**: Railway automatically monitors service health

## 🔄 Deployment Updates

Railway automatically deploys on:
- Push to main branch (if connected to GitHub)
- Manual deployment trigger

## 🎯 Next Steps After Deployment

1. ✅ Test WebSocket connection
2. ✅ Test wallet connection
3. ✅ Test token purchase
4. ✅ Test multiplayer games
5. ✅ Monitor logs for errors
6. ✅ Set up custom domain (optional)

## 📝 Notes

- Railway provides HTTPS automatically
- WebSocket connections use WSS (secure WebSocket)
- Environment variables are encrypted
- Railway handles SSL certificates automatically

