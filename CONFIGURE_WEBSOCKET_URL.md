# ⚡ Configurar REACT_APP_WS_URL en Railway

## Dominio WebSocket Generado
✅ **Dominio Railway**: `ws-production-daf9.up.railway.app`
✅ **Dominio Personalizado**: `mrgameplayer.com` (también configurado)

## Pasos para Configurar

### Opción 1: Usar Dominio Railway (Recomendado - Más Simple)

1. **Ve a Railway Dashboard** → Tu proyecto → Servicio **`web`** (frontend)

2. **Haz clic en la pestaña "Variables"**

3. **Busca `REACT_APP_WS_URL`** o haz clic en **"New Variable"**

4. **Configura:**
   - **Name**: `REACT_APP_WS_URL`
   - **Value**: `wss://ws-production-daf9.up.railway.app`
   - ⚠️ **IMPORTANTE**: Usa `wss://` (no `ws://`)

5. **Guarda** - Railway redeployará automáticamente

6. **Espera 2-5 minutos** para que termine el deploy

### Opción 2: Usar Dominio Personalizado (Requiere Cloudflare)

Si prefieres usar `mrgameplayer.com` para el WebSocket:

1. **En Cloudflare Dashboard** → `mrgameplayer.com` → **DNS**
2. **Agrega registro CNAME:**
   - **Name**: `ws` (o deja vacío para usar el dominio raíz)
   - **Target**: `ws-production-daf9.up.railway.app`
   - **Proxy**: 🟠 **Proxied** (naranja) - IMPORTANTE para WebSockets
3. **Espera 5-10 minutos** para que se propague el DNS
4. **En Railway** → Servicio `web` → Variables:
   - **Name**: `REACT_APP_WS_URL`
   - **Value**: `wss://ws.mrgameplayer.com` (o `wss://mrgameplayer.com` si usaste el raíz)

## Verificación

Después de configurar y que Railway redeploye:

1. **Abre**: `https://mrgameplayer.com`
2. **Abre la consola (F12)**
3. **Deberías ver:**
   ```
   Using configured REACT_APP_WS_URL: wss://ws-production-daf9.up.railway.app
   WebSocket Connected
   ```

## Troubleshooting

### Si el WebSocket no se conecta:

1. **Verifica que el servicio `ws` esté corriendo:**
   - Railway → Servicio `ws` → Logs
   - Deberías ver: `WebSocket server is running on port...`

2. **Verifica Cloudflare (si usas dominio personalizado):**
   - Cloudflare → Network → WebSockets → **Enabled** (ON)
   - Cloudflare → SSL/TLS → Mode: **Full** o **Full (strict)**

3. **Verifica la variable de entorno:**
   - Railway → Servicio `web` → Variables
   - Asegúrate de que `REACT_APP_WS_URL` tenga el valor correcto
   - No debe tener espacios al inicio o final

4. **Verifica los logs del servicio `web`:**
   - Railway → Servicio `web` → Deployments → Último deploy → Logs
   - Busca errores relacionados con WebSocket

## Recomendación

**Usa la Opción 1** (`wss://ws-production-daf9.up.railway.app`) porque:
- ✅ Más simple y directo
- ✅ No requiere configuración adicional en Cloudflare
- ✅ Funciona inmediatamente después de configurar la variable
- ✅ Menos puntos de falla

