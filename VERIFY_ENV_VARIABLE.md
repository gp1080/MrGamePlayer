# 🔍 Verificar Variable de Entorno REACT_APP_WS_URL

## Problema
La variable `REACT_APP_WS_URL` no se está leyendo correctamente en producción.

## Causa
Las variables `REACT_APP_*` en React deben estar disponibles en **tiempo de BUILD**, no en tiempo de ejecución. Si agregas la variable después del build, necesitas hacer un **nuevo build**.

## Solución Paso a Paso

### Paso 1: Verificar que la Variable Esté Configurada

1. **Ve a Railway Dashboard** → Tu proyecto → Servicio **`web`** (frontend)
2. **Haz clic en "Variables"**
3. **Busca `REACT_APP_WS_URL`**
4. **Verifica que tenga el valor correcto:**
   - ✅ Debe ser: `wss://ws-production-daf9.up.railway.app`
   - ❌ NO debe ser: `wss://your-ws-service.railway.app` (placeholder)
   - ❌ NO debe tener espacios al inicio o final

### Paso 2: Forzar un Nuevo Build

**IMPORTANTE**: Después de agregar o cambiar `REACT_APP_WS_URL`, Railway debería hacer un nuevo build automáticamente, pero a veces no lo hace.

**Para forzar un nuevo build:**

1. **Opción A: Redeploy Manual**
   - Railway Dashboard → Servicio `web` → **"Deployments"**
   - Haz clic en **"Redeploy"** o **"Deploy"**
   - Esto forzará un nuevo build con las variables actualizadas

2. **Opción B: Hacer un Cambio Menor**
   - Haz un pequeño cambio en cualquier archivo (ej: agregar un espacio)
   - Haz commit y push a GitHub
   - Railway detectará el cambio y hará un nuevo build

3. **Opción C: Eliminar y Re-agregar la Variable**
   - Elimina `REACT_APP_WS_URL` de las variables
   - Guarda
   - Vuelve a agregarla con el valor correcto
   - Guarda
   - Railway debería hacer un nuevo build

### Paso 3: Verificar en los Logs del Build

1. **Ve a Railway Dashboard** → Servicio `web` → **"Deployments"**
2. **Haz clic en el último deploy** → **"View Logs"**
3. **Busca en los logs:**
   ```
   Creating an optimized production build...
   ```
4. **Verifica que no haya errores** relacionados con variables de entorno

### Paso 4: Verificar en la Consola del Navegador

Después del deploy:

1. **Abre**: `https://mrgameplayer.com`
2. **Abre la consola (F12)**
3. **Busca estos mensajes:**
   ```
   REACT_APP_WS_URL value: wss://ws-production-daf9.up.railway.app
   ✅ Using configured REACT_APP_WS_URL: wss://ws-production-daf9.up.railway.app
   WebSocket Connected
   ```

4. **Si ves:**
   ```
   REACT_APP_WS_URL value: undefined
   ⚠️ REACT_APP_WS_URL not configured!
   ```
   → La variable no está disponible en tiempo de build. Necesitas hacer un nuevo build.

## Troubleshooting

### La Variable Está Configurada pero No Funciona

1. **Verifica que no tenga espacios:**
   - ❌ `wss://ws-production-daf9.up.railway.app ` (espacio al final)
   - ✅ `wss://ws-production-daf9.up.railway.app`

2. **Verifica que use `wss://` (no `ws://`):**
   - ❌ `ws://ws-production-daf9.up.railway.app`
   - ✅ `wss://ws-production-daf9.up.railway.app`

3. **Verifica que el servicio `ws` esté corriendo:**
   - Railway → Servicio `ws` → Logs
   - Deberías ver: `WebSocket server is running on port...`

### Railway No Hace Build Automático

Si Railway no detecta cambios y no hace build automático:

1. **Verifica que el servicio esté conectado a GitHub:**
   - Railway → Servicio `web` → Settings → Source
   - Debe estar conectado a tu repositorio

2. **Haz un commit y push:**
   ```bash
   git commit --allow-empty -m "Trigger Railway rebuild"
   git push origin main
   ```

3. **O haz un cambio pequeño:**
   - Agrega un comentario en cualquier archivo
   - Commit y push

## Checklist

- [ ] Variable `REACT_APP_WS_URL` está configurada en Railway
- [ ] Valor correcto: `wss://ws-production-daf9.up.railway.app`
- [ ] Sin espacios al inicio o final
- [ ] Usa `wss://` (no `ws://`)
- [ ] Se hizo un nuevo build después de agregar la variable
- [ ] Logs del build no muestran errores
- [ ] Consola del navegador muestra: `✅ Using configured REACT_APP_WS_URL`
- [ ] WebSocket se conecta exitosamente

## Comando Rápido para Verificar

En la consola del navegador, ejecuta:
```javascript
console.log('REACT_APP_WS_URL:', process.env.REACT_APP_WS_URL);
```

Si muestra `undefined`, la variable no está disponible en tiempo de build y necesitas hacer un nuevo build.

