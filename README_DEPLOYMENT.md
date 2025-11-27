# 🚀 MGP NFT Casino-Chip Model - Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify hardhat
npm install @openzeppelin/contracts dotenv
```

### 2. Configure Environment
Create `.env` file:
```env
PRIVATE_KEY=your_deployer_private_key_here
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 3. Update Contract Addresses
Edit `scripts/deploy.js`:
- QuickSwap Router: `0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5` (verify on Polygon)
- POL Token (WMATIC): `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`
- Allocation wallet addresses (multi-sig recommended)

### 4. Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network polygon
```

### 5. Verify Contracts
```bash
export MGP_TOKEN_ADDRESS=0x...
export MGP_CHIP_ADDRESS=0x...
export MGP_PLATFORM_ADDRESS=0x...
npx hardhat run scripts/verify-contracts.js --network polygon
```

### 6. Add Liquidity
```bash
export MGP_TOKEN_ADDRESS=0x...
npx hardhat run scripts/add-liquidity.js --network polygon
```

---

## Contract Addresses Reference

### Polygon Mainnet
- **QuickSwap Router**: `0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5`
- **QuickSwap Factory**: `0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32`
- **WMATIC (POL)**: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`
- **USDC**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

### Polygon Amoy (Testnet)
- **QuickSwap Router**: Check QuickSwap docs for testnet address
- **WMATIC**: Check Polygon docs for testnet address

---

## Deployment Order

1. **MGPToken** - Deploy first (no dependencies)
2. **MGPChip** - Deploy second (no dependencies)
3. **MGPPlatform** - Deploy third (depends on Chip and Token)
4. **Configure Chip** - Set platform contract address
5. **Set Allocation** - Distribute tokens to wallets
6. **Add Liquidity** - Create QuickSwap pair

---

## Post-Deployment

### Update Frontend
1. Copy `src/config/contracts.example.ts` to `src/config/contracts.ts`
2. Fill in deployed contract addresses
3. Update `BuyChips.tsx` and `CashOutChips.tsx` with addresses

### Authorize Game Contracts
For each game contract:
```bash
export MGP_PLATFORM_ADDRESS=0x...
export GAME_CONTRACT_ADDRESS=0x...
npx hardhat run scripts/setup-game-contract.js --network polygon
```

### Verify Everything Works
- [ ] Buy chips with POL
- [ ] Cash out chips for POL
- [ ] Transfer chips between wallets
- [ ] Test rake collection from games
- [ ] Verify price oracle works

---

## Security Checklist

- [ ] All contracts verified on Polygonscan
- [ ] Multi-sig wallets set up for allocations
- [ ] Platform contract paused initially (optional)
- [ ] Test all functions on testnet first
- [ ] Review all contract permissions
- [ ] Verify chip contract can only mint/burn via platform
- [ ] Verify game contracts are authorized before use

---

## Troubleshooting

### "Insufficient funds"
- Ensure deployer wallet has POL for gas
- Check token balances for liquidity script

### "Contract verification failed"
- Check constructor arguments match deployment
- Verify contract source code matches deployed bytecode

### "Price oracle returns 0"
- Verify QuickSwap pair exists
- Check MGP/POL liquidity is added
- Verify router address is correct

### "Unauthorized game contract"
- Run `setup-game-contract.js` script
- Verify game contract address is correct

---

## Support

For issues or questions:
1. Check contract verification on Polygonscan
2. Review transaction logs
3. Verify all addresses are correct
4. Test on testnet first

---

**Network:** Polygon Mainnet  
**Solidity:** 0.8.24  
**Last Updated:** November 2024

