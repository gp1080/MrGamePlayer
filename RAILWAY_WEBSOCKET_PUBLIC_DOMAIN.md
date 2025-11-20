# 🌐 Configurar Dominio Público para WebSocket en Railway

## Problema
El servicio WebSocket solo tiene red privada (`ws.railway.internal`), pero necesitas un dominio **público** para que el navegador se conecte.

## Solución: Generar Dominio Público

### Paso 1: Generar Dominio Público en Railway

1. Ve a Railway Dashboard → Tu proyecto → Servicio **`ws`**
2. Haz clic en la pestaña **"Networking"** o **"Settings" → "Networking"**
3. Busca la sección **"Public Networking"** o **"Public Domain"**
4. Haz clic en **"Generate Domain"** o **"Add Public Domain"**
5. Railway generará una URL como: `your-project-ws-production.up.railway.app`
6. **Copia esta URL completa** - la necesitarás en el siguiente paso

### Paso 2: Configurar Variable de Entorno en el Servicio Frontend

1. Ve al servicio **`web`** (frontend) en Railway
2. Haz clic en la pestaña **"Variables"**
3. Busca `REACT_APP_WS_URL` o haz clic en **"New Variable"**
4. Configura:
   - **Name**: `REACT_APP_WS_URL`
   - **Value**: `wss://tu-url-websocket.railway.app`
   - **Ejemplo**: `wss://your-project-ws-production.up.railway.app`
   - ⚠️ **IMPORTANTE**: Usa `wss://` (no `ws://`) para conexiones seguras

### Paso 3: Verificar que el Servicio WebSocket Esté Corriendo

1. Ve al servicio **`ws`** → **"Deployments"** o **"Logs"**
2. Deberías ver: `WebSocket server is running on port...`
3. Si no está corriendo, haz clic en **"Deploy"** o **"Redeploy"**

### Paso 4: Redeploy el Servicio Frontend

Después de agregar `REACT_APP_WS_URL`:
1. Railway debería redeployar automáticamente
2. O haz clic en **"Redeploy"** manualmente en el servicio `web`
3. Espera a que termine el deploy (puede tomar 2-5 minutos)

### Paso 5: Verificar la Conexión

1. Abre tu aplicación: `https://mrgameplayer.com`
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   Connecting to WebSocket: wss://tu-url-real.railway.app
   WebSocket Connected
   ```

## Si No Puedes Generar Dominio Público

Si Railway no te permite generar un dominio público para el servicio `ws`, puedes:

### Opción A: Usar el Mismo Dominio del Frontend

1. En el servicio `ws` → Networking
2. Agrega el mismo dominio que usa el frontend: `mrgameplayer.com`
3. En el servicio `web` → Variables:
   ```
   REACT_APP_WS_URL=wss://mrgameplayer.com
   ```

### Opción B: Usar Subdominio en Cloudflare

1. En Cloudflare Dashboard → DNS
2. Agrega registro CNAME:
   - **Name**: `ws`
   - **Target**: La URL interna de Railway (si está disponible)
   - **Proxy**: 🟠 Proxied (naranja)
3. En Railway → servicio `ws` → Networking → Agrega dominio: `ws.mrgameplayer.com`
4. En Railway → servicio `web` → Variables:
   ```
   REACT_APP_WS_URL=wss://ws.mrgameplayer.com
   ```

## Troubleshooting

### "Generate Domain" no aparece
- Verifica que el servicio `ws` esté desplegado correctamente
- Asegúrate de que el servicio esté en estado "Active"
- Intenta hacer "Redeploy" del servicio `ws`

### El dominio público no funciona
- Verifica que el servicio `ws` esté corriendo (revisa los logs)
- Asegúrate de usar `wss://` (no `ws://`)
- Verifica que no haya errores en los logs del servicio `ws`

### WebSocket se conecta pero se desconecta inmediatamente
- Verifica que Cloudflare tenga WebSockets habilitados
- Verifica que SSL/TLS esté en modo "Full" en Cloudflare
- Revisa los logs del servicio `ws` en Railway

## Resumen Rápido

1. ✅ Servicio `ws` → Networking → Generate Domain
2. ✅ Copia la URL generada
3. ✅ Servicio `web` → Variables → `REACT_APP_WS_URL=wss://url-generada`
4. ✅ Redeploy servicio `web`
5. ✅ Verificar en consola del navegador

