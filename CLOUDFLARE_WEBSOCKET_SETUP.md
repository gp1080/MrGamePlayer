# ☁️ Configurar WebSocket con Cloudflare y GoDaddy

## Configuración Actual
- **DNS Provider**: GoDaddy
- **CDN/Proxy**: Cloudflare
- **Hosting**: Railway

## Paso 1: Habilitar WebSockets en Cloudflare

Cloudflare soporta WebSockets, pero necesitas asegurarte de que estén habilitados:

1. Ve a tu [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Selecciona el dominio `mrgameplayer.com`
3. Ve a **Network** (Red) en el menú lateral
4. Busca **"WebSockets"**
5. Asegúrate de que esté **habilitado** (toggle ON)

## Paso 2: Configurar DNS en GoDaddy para WebSocket

Tienes dos opciones:

### Opción A: Usar el mismo dominio (Recomendado si Cloudflare maneja ambos)

Si Cloudflare está manejando `mrgameplayer.com` y `www.mrgameplayer.com`:

1. En Railway, ambos servicios (`web` y `ws`) pueden usar el mismo dominio
2. Cloudflare enrutará automáticamente las conexiones WebSocket

**Configuración en Railway:**
- Servicio `web`: Dominio `mrgameplayer.com` y `www.mrgameplayer.com`
- Servicio `ws`: Dominio `mrgameplayer.com` (mismo dominio)

**Variable de entorno en servicio `web`:**
```
REACT_APP_WS_URL=wss://mrgameplayer.com
```

### Opción B: Usar subdominio separado (Más control)

Si prefieres separar el WebSocket en un subdominio:

1. En Cloudflare Dashboard → DNS
2. Agrega un nuevo registro:
   - **Type**: CNAME
   - **Name**: `ws` (o `socket`, `wss`, etc.)
   - **Target**: La URL de Railway del servicio WebSocket (ejemplo: `your-project-ws.up.railway.app`)
   - **Proxy status**: 🟠 Proxied (naranja) - **IMPORTANTE**: Debe estar proxied para que Cloudflare maneje WebSockets

3. En Railway:
   - Servicio `ws`: Agrega dominio `ws.mrgameplayer.com`

4. Variable de entorno en servicio `web`:
   ```
   REACT_APP_WS_URL=wss://ws.mrgameplayer.com
   ```

## Paso 3: Configurar Railway

### Para el Servicio WebSocket (`ws`):

1. Ve a Railway → Tu proyecto → Servicio `ws`
2. **Settings** → **Networking**
3. Si usas Opción A (mismo dominio):
   - Agrega dominio: `mrgameplayer.com`
4. Si usas Opción B (subdominio):
   - Agrega dominio: `ws.mrgameplayer.com`
   - O usa el dominio de Railway que Cloudflare apuntará

### Para el Servicio Frontend (`web`):

1. Ve a Railway → Tu proyecto → Servicio `web`
2. **Variables** → Agrega/Actualiza:
   ```
   REACT_APP_WS_URL=wss://mrgameplayer.com
   ```
   O si usas subdominio:
   ```
   REACT_APP_WS_URL=wss://ws.mrgameplayer.com
   ```

## Paso 4: Verificar Configuración de Cloudflare

### SSL/TLS Settings:
1. Cloudflare Dashboard → SSL/TLS
2. Modo recomendado: **Full** o **Full (strict)**
3. Esto asegura conexiones seguras WebSocket (wss://)

### Network Settings:
1. Cloudflare Dashboard → Network
2. **WebSockets**: ✅ Enabled
3. **HTTP/2**: ✅ Enabled (recomendado)
4. **HTTP/3 (QUIC)**: Opcional, pero recomendado

## Paso 5: Configurar GoDaddy DNS

### Si usas Cloudflare (Recomendado):
- **NO** configures DNS directamente en GoDaddy
- Cloudflare maneja todo el DNS
- Solo asegúrate de que los nameservers de GoDaddy apunten a Cloudflare

### Verificar Nameservers:
1. En GoDaddy → Tu dominio → DNS
2. Los nameservers deben ser de Cloudflare (ejemplo: `ns1.cloudflare.com`)
3. Si no lo son, cámbialos en GoDaddy para que apunten a Cloudflare

## Paso 6: Esperar Propagación DNS

- Cambios en Cloudflare: 5-15 minutos
- Cambios en GoDaddy nameservers: 24-48 horas (solo la primera vez)

## Paso 7: Verificar Conexión

1. Abre tu aplicación: `https://mrgameplayer.com`
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   Connecting to WebSocket: wss://mrgameplayer.com
   WebSocket Connected
   ```

## Troubleshooting Específico para Cloudflare

### WebSocket se conecta pero se desconecta inmediatamente

**Solución**: Verifica que en Cloudflare → Network → WebSockets esté habilitado

### Error: "WebSocket connection failed"

**Posibles causas**:
1. WebSockets no habilitados en Cloudflare
2. SSL/TLS en modo "Flexible" (debe ser "Full")
3. DNS no está proxied correctamente

**Solución**:
1. Cloudflare → Network → WebSockets: ✅ Enabled
2. Cloudflare → SSL/TLS → Mode: **Full** o **Full (strict)**
3. Cloudflare → DNS → El registro debe estar 🟠 Proxied (no ⚪ DNS only)

### El WebSocket funciona localmente pero no en producción

**Causa**: Cloudflare puede estar bloqueando o no configurado correctamente

**Solución**:
1. Verifica que el dominio en Railway coincida con el de Cloudflare
2. Asegúrate de que Cloudflare esté proxying el tráfico (🟠 Proxied)
3. Verifica que WebSockets estén habilitados en Cloudflare

## Configuración Recomendada Final

### Cloudflare Settings:
- ✅ WebSockets: Enabled
- ✅ SSL/TLS: Full (strict)
- ✅ HTTP/2: Enabled
- ✅ DNS Records: 🟠 Proxied (naranja)

### Railway Variables (servicio `web`):
```
NODE_ENV=production
PORT=3000
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
REACT_APP_WS_URL=wss://mrgameplayer.com
```

### Railway Variables (servicio `ws`):
```
NODE_ENV=production
PORT=8080
WS_PORT=8080
```

## Nota Importante sobre Cloudflare

⚠️ **Cloudflare requiere que el registro DNS esté "Proxied" (🟠 naranja) para manejar WebSockets correctamente.**

Si el registro está en modo "DNS only" (⚪ gris), Cloudflare no manejará las conexiones WebSocket y puede haber problemas.

