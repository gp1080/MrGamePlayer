# 🌐 Custom Domain Setup for mrgameplayer.com

## Step 1: Add Domain in Railway

### For Frontend Service (`web`):
1. Go to Railway Dashboard → Your Project → `web` service
2. Click **Settings** → **Networking**
3. Click **"Add Domain"** or **"Custom Domain"**
4. Enter: `mrgameplayer.com`
5. Railway will provide DNS records (CNAME or A record)

### For WebSocket Service (`ws`):
**Option A: Use Subdomain (Recommended)**
- Add domain: `ws.mrgameplayer.com`
- This keeps WebSocket separate from frontend

**Option B: Use Same Domain**
- Railway can handle both HTTP and WebSocket on the same domain
- Use: `mrgameplayer.com` (same as frontend)

## Step 2: Configure DNS Records

In your DNS provider (where you bought mrgameplayer.com):

### For Frontend (mrgameplayer.com):
- **Type**: CNAME
- **Name**: `@` (or leave blank for root domain)
- **Value**: Railway-provided CNAME target (e.g., `your-app.up.railway.app`)

### For www (optional):
- **Type**: CNAME  
- **Name**: `www`
- **Value**: Same Railway CNAME target

### For WebSocket (if using subdomain):
- **Type**: CNAME
- **Name**: `ws`
- **Value**: Railway-provided CNAME target for ws service

**Note**: Some DNS providers require A records instead of CNAME for root domain. Railway will tell you which to use.

## Step 3: Update Environment Variables

### In Railway → `web` service → Variables:

```
NODE_ENV=production
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
REACT_APP_WS_URL=wss://ws.mrgameplayer.com
```

**OR** if using same domain:
```
REACT_APP_WS_URL=wss://mrgameplayer.com
```

### In Railway → `ws` service → Variables:
```
NODE_ENV=production
```

## Step 4: Wait for DNS Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually takes 10-30 minutes
- Check with: `nslookup mrgameplayer.com` or `dig mrgameplayer.com`

## Step 5: Verify SSL Certificate

Railway automatically provisions SSL certificates via Let's Encrypt:
- Wait for Railway to show "Certificate Active" or "SSL Ready"
- This usually happens automatically after DNS propagates

## Step 6: Redeploy Services

After DNS propagates and SSL is active:
1. Redeploy `web` service (to pick up new REACT_APP_WS_URL)
2. Verify `ws` service is running

## Step 7: Test Your Domain

1. Visit: `https://mrgameplayer.com`
2. Open browser console (F12)
3. Check for WebSocket connection:
   - Should see: "WebSocket Connected" or similar
   - No CORS errors
   - No connection refused errors

## Troubleshooting

### Domain Not Working?
- Check DNS propagation: https://www.whatsmydns.net/
- Verify DNS records match Railway's instructions exactly
- Wait longer (can take up to 48 hours)

### SSL Certificate Issues?
- Railway handles SSL automatically
- Wait 10-30 minutes after DNS propagates
- Check Railway dashboard for certificate status

### WebSocket Not Connecting?
- Verify `REACT_APP_WS_URL` is set correctly
- Check that `ws` service is running
- Ensure WebSocket URL uses `wss://` (secure) not `ws://`
- Check browser console for connection errors

### Both Services on Same Domain?
If Railway supports it, you can use:
- Frontend: `https://mrgameplayer.com`
- WebSocket: `wss://mrgameplayer.com` (same domain)

Railway will route based on the protocol (HTTP vs WebSocket).

---

**Need Help?** Check Railway logs or contact Railway support!

