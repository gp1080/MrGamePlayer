# 🚀 Deployment Checklist - NFT Casino-Chip Model

## Pre-Deployment

### 1. Environment Setup
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file with:
  ```
  PRIVATE_KEY=your_deployer_private_key
  POLYGON_RPC_URL=https://polygon-rpc.com
  POLYGONSCAN_API_KEY=your_polygonscan_api_key
  ```
- [ ] Verify Hardhat config (`hardhat.config.js`)

### 2. Prepare Wallet Addresses
- [ ] Team & Founder wallet (multi-sig recommended)
- [ ] Treasury wallet (multi-sig recommended)
- [ ] Liquidity wallet
- [ ] Community rewards wallet
- [ ] Strategic partners wallet
- [ ] Treasury wallet for rake collection

### 3. Update Contract Addresses
- [ ] Update `scripts/deploy.js` with:
  - QuickSwap Router address (Polygon: `0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5`)
  - POL token address (WMATIC: `0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270`)
  - All allocation wallet addresses

---

## Deployment Steps

### Step 1: Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network polygon
```

**Expected Output:**
- MGPToken address
- MGPChip address
- MGPPlatform address

**Save these addresses!**

### Step 2: Verify Contracts
```bash
export MGP_TOKEN_ADDRESS=0x...
export MGP_CHIP_ADDRESS=0x...
export MGP_PLATFORM_ADDRESS=0x...
export QUICKSWAP_ROUTER=0x...
export POL_TOKEN=0x...
export TREASURY_WALLET=0x...

npx hardhat run scripts/verify-contracts.js --network polygon
```

### Step 3: Configure Chip Contract
The deploy script automatically sets the platform contract on the chip contract. Verify:
```bash
npx hardhat verify --network polygon <CHIP_ADDRESS> <CHIP_URI>
```

### Step 4: Set Token Allocation
The deploy script automatically sets allocation. Verify balances:
- [ ] Team wallet: 30M MGP
- [ ] Treasury wallet: 30M MGP
- [ ] Liquidity wallet: 20M MGP
- [ ] Community wallet: 10M MGP
- [ ] Partners wallet: 10M MGP

### Step 5: Add Liquidity to QuickSwap
```bash
export MGP_TOKEN_ADDRESS=0x...
npx hardhat run scripts/add-liquidity.js --network polygon
```

**Parameters:**
- MGP Amount: 20,000,000 MGP
- Target Price: 0.11 POL per MGP
- POL Amount: 2,200,000 POL

### Step 6: Renounce Token Ownership (Optional)
After allocation is set and verified:
```bash
# Connect to MGPToken contract
# Call renounceOwnership()
```

---

## Post-Deployment

### 1. Update Frontend
- [ ] Update `src/config/contracts.js` with deployed addresses:
  ```javascript
  export const MGP_TOKEN_ADDRESS = "0x...";
  export const MGP_CHIP_ADDRESS = "0x...";
  export const MGP_PLATFORM_ADDRESS = "0x...";
  export const QUICKSWAP_ROUTER = "0x...";
  ```

### 2. Test Platform Functions
- [ ] Test `buyChips()` with small amount
- [ ] Test `cashOutChips()` with small amount
- [ ] Verify price oracle returns correct values
- [ ] Test chip transfers between wallets

### 3. Authorize Game Contracts
For each game contract:
```bash
export MGP_PLATFORM_ADDRESS=0x...
export GAME_CONTRACT_ADDRESS=0x...
npx hardhat run scripts/setup-game-contract.js --network polygon
```

### 4. Security Checks
- [ ] Verify all contracts on Polygonscan
- [ ] Check that chip contract can only mint/burn via platform
- [ ] Verify platform contract has correct permissions
- [ ] Test pause/unpause functionality
- [ ] Verify treasury wallet receives rake

### 5. Documentation
- [ ] Update `NFT_CASINO_CHIP_MODEL.md` with actual addresses
- [ ] Document any deviations from planned allocation
- [ ] Record transaction hashes for all deployments

---

## Testing Checklist

### Buy Chips Flow
- [ ] Connect wallet
- [ ] Enter POL amount
- [ ] Verify price display
- [ ] Verify chips preview
- [ ] Execute transaction
- [ ] Verify chips received in wallet
- [ ] Verify chips are ERC-1155 NFTs

### Cash Out Flow
- [ ] Connect wallet with chips
- [ ] Enter chip amount
- [ ] Verify POL preview
- [ ] Execute transaction
- [ ] Verify chips burned
- [ ] Verify POL received

### Game Integration
- [ ] Deploy test game contract
- [ ] Authorize game contract
- [ ] Test rake collection
- [ ] Verify treasury receives rake chips
- [ ] Test with multiple players

### Price Oracle
- [ ] Verify price updates from QuickSwap
- [ ] Test price calculation accuracy
- [ ] Verify price changes reflect in UI

---

## Emergency Procedures

### Pause Platform
```bash
# Connect to MGPPlatform contract
# Call pause()
```

### Unpause Platform
```bash
# Connect to MGPPlatform contract
# Call unpause()
```

### Emergency Withdraw
```bash
# Connect to MGPPlatform contract
# Call emergencyWithdraw()
# ⚠️ This will break cash-out functionality
```

---

## Monitoring

### Key Metrics to Track
- [ ] Total chips minted
- [ ] Total chips burned
- [ ] Rake collected (chips to treasury)
- [ ] Platform POL balance
- [ ] QuickSwap liquidity
- [ ] MGP token price

### Tools
- Polygonscan for contract monitoring
- QuickSwap analytics for liquidity
- Custom dashboard for platform metrics

---

## Support

If you encounter issues:
1. Check contract verification on Polygonscan
2. Verify all addresses are correct
3. Check transaction logs for errors
4. Verify wallet has sufficient POL for gas
5. Check that contracts are not paused

---

**Last Updated:** November 2024  
**Network:** Polygon Mainnet  
**Solidity Version:** 0.8.24

