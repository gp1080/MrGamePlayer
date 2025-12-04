# 🚀 Mainnet Deployment Checklist

## ✅ Estado Actual (Testnet)

Los contratos están desplegados y funcionando en **Polygon Amoy Testnet**:
- ✅ MGPToken: `0xEAd93e3039c84E51B9A9B254c2366184bA15d51E`
- ✅ MGPChip: `0xCA48fB24467FFf81f3CCB7C70c840843aa41A99c`
- ✅ MGPPlatform: `0x74e3BC98a89332115Da302c269cF462b538cEe9c`

## ⚠️ Requisitos ANTES de Mainnet

### 1. 🔐 Seguridad y Multi-Sig Wallets

**CRÍTICO**: Actualmente todas las asignaciones usan la dirección del deployer. Para mainnet necesitas:

#### Multi-Sig Wallets Requeridos:
- **Team Wallet** (30M MGP) - Multi-sig 2/3 o 3/5
- **Treasury Wallet** (30M MGP) - Multi-sig 2/3 o 3/5  
- **Liquidity Wallet** (20M MGP) - Multi-sig 2/3 o 3/5
- **Community Wallet** (10M MGP) - Multi-sig 2/3 o 3/5
- **Partners Wallet** (10M MGP) - Multi-sig 2/3 o 3/5
- **Platform Treasury** (para rake) - Multi-sig 2/3 o 3/5

**Opciones de Multi-Sig:**
- Gnosis Safe (recomendado): https://gnosis-safe.io/
- Polygon Safe: https://safe.polygon.technology/

### 2. 📊 Auditoría de Seguridad

**RECOMENDADO**: Antes de mainnet, considera:
- ✅ Auditoría profesional de los contratos
- ✅ Bug bounty program (opcional pero recomendado)
- ✅ Testing exhaustivo en testnet

**Contratos a auditar:**
- `MGPToken.sol`
- `MGPChip.sol`
- `MGPPlatform.sol`

### 3. 💧 Liquidez en QuickSwap

**REQUERIDO**: Para que el precio oracle funcione correctamente:

- **Mínimo recomendado**: 20M MGP + POL equivalente
- **Par objetivo**: MGP/POL en QuickSwap
- **Precio inicial sugerido**: ~0.10-0.12 POL/MGP

**Script disponible**: `scripts/add-liquidity.js`

### 4. ⚙️ Configuración Técnica

#### A. Actualizar Hardhat Config

Agregar red de Polygon Mainnet:

```javascript
polygon: {
  url: "https://polygon-rpc.com",
  chainId: 137,
  accounts: [process.env.PRIVATE_KEY].filter(Boolean),
  timeout: 120000
}
```

#### B. Direcciones de QuickSwap en Mainnet

- **QuickSwap Router V2**: `0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5C5` (verificar en docs oficiales)
- **POL Token (WMATIC)**: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`
- **USDC (opcional)**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

#### C. Actualizar Script de Deploy

Modificar `scripts/deploy.js` para usar multi-sig wallets en lugar del deployer.

### 5. 📝 Verificación de Contratos

Después del despliegue:
- Verificar todos los contratos en Polygonscan
- Verificar que las asignaciones se hayan hecho correctamente
- Verificar que el MGPChip esté configurado con MGPPlatform

### 6. 🔄 Post-Deployment

#### Pasos Inmediatos:
1. ✅ Configurar MGPChip con dirección de MGPPlatform
2. ✅ Configurar asignaciones de tokens a multi-sig wallets
3. ✅ Agregar liquidez a QuickSwap (MGP/POL pair)
4. ✅ Verificar contratos en Polygonscan
5. ✅ Renunciar ownership de MGPToken (después de asignaciones)
6. ✅ Transferir ownership de MGPPlatform a multi-sig (opcional pero recomendado)

#### Configuración de MGPPlatform:
```javascript
// Después del deploy, ejecutar:
await platform.setQuickSwapRouter("0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5C5"); // QuickSwap Router V2
await platform.setTreasuryWallet("0x..."); // Multi-sig treasury wallet
```

### 7. 💰 Costos Estimados

**Gas fees estimados (Polygon Mainnet):**
- Deploy MGPToken: ~2-3 MATIC
- Deploy MGPChip: ~1-2 MATIC
- Deploy MGPPlatform: ~3-4 MATIC
- Configurar asignaciones: ~0.5 MATIC por transacción
- Agregar liquidez: ~0.5-1 MATIC
- **Total estimado**: ~10-15 MATIC

**Liquidez inicial requerida:**
- 20M MGP tokens
- POL equivalente (~2M-2.4M POL para precio 0.10-0.12 POL/MGP)

### 8. 🧪 Testing en Testnet

**Antes de mainnet, asegúrate de probar:**
- ✅ Compra de chips con POL
- ✅ Cash-out de chips a POL
- ✅ Transferencia de chips entre usuarios
- ✅ Colección de rake desde juegos
- ✅ Precio oracle de QuickSwap
- ✅ Pausar/reanudar contratos
- ✅ Actualización de treasury wallet

## 📋 Checklist Pre-Mainnet

- [ ] Crear multi-sig wallets para todas las asignaciones
- [ ] Obtener MATIC suficiente para gas fees (~15-20 MATIC)
- [ ] Preparar 20M MGP + POL para liquidez inicial
- [ ] Actualizar `hardhat.config.js` con red de Polygon Mainnet
- [ ] Actualizar `scripts/deploy.js` con direcciones de multi-sig
- [ ] Verificar direcciones de QuickSwap en mainnet
- [ ] Probar despliegue completo en testnet una vez más
- [ ] Preparar script de verificación de contratos
- [ ] Preparar script de agregar liquidez
- [ ] Documentar todas las direcciones de contratos
- [ ] Configurar monitoreo de contratos (opcional pero recomendado)

## 🚨 Consideraciones de Seguridad

1. **NUNCA** uses la misma clave privada del deployer para mainnet que usaste en testnet
2. **SIEMPRE** usa multi-sig wallets para asignaciones importantes
3. **VERIFICA** todas las direcciones antes de ejecutar transacciones
4. **PRUEBA** todo en testnet primero
5. **CONSIDERA** una auditoría profesional antes de mainnet
6. **RENUNCIA** al ownership de MGPToken después de configurar asignaciones
7. **TRANSFIERE** ownership de MGPPlatform a multi-sig si es posible

## 📚 Recursos

- **Polygon Mainnet RPC**: https://polygon-rpc.com
- **QuickSwap Docs**: https://docs.quickswap.exchange/
- **Gnosis Safe**: https://gnosis-safe.io/
- **Polygonscan**: https://polygonscan.com/

## ⚡ Comando de Deploy para Mainnet

```bash
# 1. Asegúrate de tener las variables de entorno configuradas
# 2. Verifica que tienes MATIC suficiente
# 3. Ejecuta el deploy:

npx hardhat run scripts/deploy.js --network polygon

# O crea una nueva red "mainnet" en hardhat.config.js:
npx hardhat run scripts/deploy.js --network mainnet
```

## 🎯 Resumen

**¿Estamos listos para mainnet?**

✅ **Técnicamente SÍ** - Los contratos están listos
⚠️ **Operacionalmente NO** - Faltan:
- Multi-sig wallets
- Liquidez inicial
- Auditoría (recomendada)
- Testing exhaustivo

**Tiempo estimado para preparar mainnet**: 1-2 semanas (dependiendo de auditoría y creación de multi-sigs)

