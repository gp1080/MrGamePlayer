# 🔧 Solución Rápida: WebSocket y Video

## Problema 1: WebSocket Error 1006

El WebSocket está intentando conectarse a `wss://mrgameplayer.com` pero el servicio `ws` no tiene un dominio público configurado.

### Solución: Generar Dominio Público para el Servicio WebSocket

**Pasos en Railway:**

1. **Ve a Railway Dashboard** → Tu proyecto → Servicio **`ws`**

2. **Haz clic en "Settings"** o busca la sección **"Networking"**

3. **Busca "Public Networking"** o **"Public Domain"**

4. **Haz clic en "Generate Domain"** o **"Add Public Domain"**
   - Railway generará algo como: `your-project-ws-production.up.railway.app`
   - **Copia esta URL completa**

5. **Ve al servicio `web` (frontend)** → **"Variables"**

6. **Agrega o edita la variable:**
   - **Name**: `REACT_APP_WS_URL`
   - **Value**: `wss://tu-url-websocket-generada.railway.app`
   - Ejemplo: `wss://your-project-ws-production.up.railway.app`
   - ⚠️ **IMPORTANTE**: Usa `wss://` (no `ws://`)

7. **Railway redeployará automáticamente** el servicio `web`

8. **Espera 2-5 minutos** para que termine el deploy

9. **Verifica en la consola del navegador:**
   - Deberías ver: `Using configured REACT_APP_WS_URL: wss://...`
   - Y luego: `WebSocket Connected`

### Si No Puedes Generar Dominio Público

**Opción A: Usar Subdominio en Cloudflare**

1. En Railway → servicio `ws` → Networking → Agrega dominio: `ws.mrgameplayer.com`
2. En Cloudflare → DNS → Agrega CNAME:
   - **Name**: `ws`
   - **Target**: La URL interna de Railway (si está disponible)
   - **Proxy**: 🟠 Proxied
3. En Railway → servicio `web` → Variables:
   ```
   REACT_APP_WS_URL=wss://ws.mrgameplayer.com
   ```

**Opción B: Verificar que el Servicio WS Esté Corriendo**

1. Ve al servicio `ws` → **"Deployments"** o **"Logs"**
2. Deberías ver: `WebSocket server is running on port...`
3. Si no está corriendo, haz clic en **"Deploy"** o **"Redeploy"**

---

## Problema 2: Video No Se Muestra

El video `generated_video.mp4` no se está cargando en producción.

### Solución: Verificar que el Video Esté en el Build

**Pasos:**

1. **Verifica que el archivo existe:**
   - Debe estar en: `public/generated_video.mp4`
   - ✅ Ya existe según el código

2. **Verifica que esté en Git:**
   ```bash
   git ls-files | grep generated_video.mp4
   ```
   - Debería mostrar: `public/generated_video.mp4`

3. **Si no está en Git, agrégalo:**
   ```bash
   git add public/generated_video.mp4
   git commit -m "Add video file"
   git push origin main
   ```

4. **Verifica en Railway:**
   - Railway debería incluir el archivo en el build
   - El video debería estar accesible en: `https://mrgameplayer.com/generated_video.mp4`

5. **Prueba la URL directamente:**
   - Abre: `https://mrgameplayer.com/generated_video.mp4`
   - Si se descarga o reproduce, el archivo está bien
   - Si da 404, el archivo no está en el build

### Si el Video Sigue Sin Funcionar

**Verifica el Build de Railway:**

1. Ve al servicio `web` → **"Deployments"** → Último deploy → **"View Logs"**
2. Busca: `Creating an optimized production build...`
3. Verifica que no haya errores relacionados con el video

**Verifica Cloudflare:**

1. Cloudflare puede estar bloqueando archivos grandes
2. Ve a Cloudflare → **"Caching"** → **"Configuration"**
3. Asegúrate de que los archivos `.mp4` no estén siendo bloqueados

---

## Checklist Rápido

- [ ] Servicio `ws` tiene dominio público generado en Railway
- [ ] Variable `REACT_APP_WS_URL` está configurada en servicio `web`
- [ ] Servicio `ws` está corriendo (revisa logs)
- [ ] Servicio `web` se redeployó después de agregar `REACT_APP_WS_URL`
- [ ] Video `public/generated_video.mp4` está en Git
- [ ] Video es accesible en `https://mrgameplayer.com/generated_video.mp4`
- [ ] Cloudflare tiene WebSockets habilitados (Network → WebSockets → ON)
- [ ] Cloudflare SSL/TLS está en modo "Full"

---

## Verificación Final

Después de completar los pasos:

1. **Abre:** `https://mrgameplayer.com`
2. **Abre la consola (F12)**
3. **Deberías ver:**
   ```
   Using configured REACT_APP_WS_URL: wss://tu-url-real.railway.app
   WebSocket Connected
   Video loaded successfully
   ```

Si aún hay problemas, comparte:
- La URL del dominio público del servicio `ws` en Railway
- Los logs del servicio `ws` en Railway
- Los logs del servicio `web` en Railway

