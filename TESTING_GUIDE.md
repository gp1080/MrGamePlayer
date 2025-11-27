# 🧪 Testing Guide - NFT Casino-Chip Model

## Pre-Testing Setup

### 1. Environment Configuration

Create/update `.env` file:
```env
# Deployer (use same as previous deployments)
PRIVATE_KEY=your_private_key_here
# Expected deployer: 0xB7365DC18a2386ce68724cc76c0c22731455B509

# Network Configuration
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# Polygonscan API (for verification)
POLYGONSCAN_API_KEY=your_api_key_here

# Frontend Environment Variables (after deployment)
REACT_APP_PLATFORM_ADDRESS=0x...
REACT_APP_CHIP_ADDRESS=0x...
REACT_APP_MGP_TOKEN_ADDRESS=0x...
```

### 2. Install Dependencies

```bash
# Hardhat dependencies
npm install --save-dev @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify hardhat
npm install @openzeppelin/contracts dotenv

# Frontend dependencies (if not already installed)
npm install wagmi viem @tanstack/react-query
```

---

## Testing on Polygon Amoy (Testnet)

### Step 1: Deploy Contracts

```bash
# Deploy to Polygon Amoy testnet
npx hardhat run scripts/deploy.js --network polygonAmoy
```

**Expected Output:**
```
Deploying contracts with account: 0xB7365DC18a2386ce68724cc76c0c22731455B509
Account balance: ...

1. Deploying MGPToken...
MGPToken deployed to: 0x...
Total supply: 100000000000000000000000000

2. Deploying MGPChip...
MGPChip deployed to: 0x...

3. Deploying MGPPlatform...
MGPPlatform deployed to: 0x...

4. Configuring MGPChip...
MGPChip platform contract set

5. Setting MGP Token allocation...
MGP Token allocation set

=== Deployment Summary ===
MGPToken: 0x...
MGPChip: 0x...
MGPPlatform: 0x...
```

### Step 2: Verify Contracts

```bash
export MGP_TOKEN_ADDRESS=0x...
export MGP_CHIP_ADDRESS=0x...
export MGP_PLATFORM_ADDRESS=0x...
export QUICKSWAP_ROUTER=0x... # Testnet router address
export POL_TOKEN=0x... # Testnet WMATIC address
export TREASURY_WALLET=0xB7365DC18a2386ce68724cc76c0c22731455B509

npx hardhat run scripts/verify-contracts.js --network polygonAmoy
```

### Step 3: Update Frontend Environment

Update `.env` or environment variables:
```env
REACT_APP_PLATFORM_ADDRESS=<MGP_PLATFORM_ADDRESS>
REACT_APP_CHIP_ADDRESS=<MGP_CHIP_ADDRESS>
REACT_APP_MGP_TOKEN_ADDRESS=<MGP_TOKEN_ADDRESS>
```

### Step 4: Test Frontend Components

1. **Start Development Server**
   ```bash
   npm start
   ```

2. **Test Buy Chips Flow**
   - Navigate to Token page
   - Connect wallet
   - Click "Buy Chips"
   - Enter POL amount
   - Verify chips received
   - Check chip balance updates

3. **Test Cash Out Flow**
   - With chips in wallet
   - Click "Cash Out Chips"
   - Enter chip amount
   - Verify POL received
   - Verify chips burned

4. **Test Chip Transfer**
   - Send chips to another address
   - Verify transfer successful
   - Check balances updated

---

## Unit Tests

### Run All Tests

```bash
npx hardhat test
```

### Run Specific Test Files

```bash
# Test MGP Token
npx hardhat test test/MGPToken.test.js

# Test MGP Chip
npx hardhat test test/MGPChip.test.js

# Test MGP Platform
npx hardhat test test/MGPPlatform.test.js
```

### Expected Test Results

All tests should pass:
- ✅ MGPToken deployment tests
- ✅ Allocation tests
- ✅ Minting prevention tests
- ✅ MGPChip minting/burning tests
- ✅ Transfer tests
- ✅ MGPPlatform buy/cash out tests
- ✅ Rake collection tests

---

## Integration Testing

### Test Complete Flow

1. **Buy Chips**
   ```javascript
   // In browser console or test script
   // Connect wallet
   // Call platform.buyChips({ value: ethers.utils.parseEther("1") })
   // Verify chips minted
   ```

2. **Play Game (Simulated)**
   ```javascript
   // Authorize game contract
   // Call platform.collectRake(gamePot)
   // Verify rake chips minted to treasury
   ```

3. **Cash Out**
   ```javascript
   // Call platform.cashOutChips(chipAmount)
   // Verify chips burned
   // Verify POL received
   ```

---

## Manual Testing Checklist

### Contract Functions

- [ ] `buyChips()` - Buy chips with POL
- [ ] `cashOutChips()` - Cash out chips for POL
- [ ] `getMGPPrice()` - Get price from QuickSwap
- [ ] `collectRake()` - Collect rake (authorized games only)
- [ ] `setGameContractAuthorization()` - Authorize game contracts
- [ ] `pause()` / `unpause()` - Emergency controls

### Frontend Components

- [ ] BuyChips component renders correctly
- [ ] CashOutChips component renders correctly
- [ ] ChipBalance displays correct balance
- [ ] Price updates live from QuickSwap
- [ ] Transactions execute successfully
- [ ] Error handling works correctly
- [ ] Loading states display properly

### Edge Cases

- [ ] Buy chips with insufficient POL
- [ ] Cash out more chips than owned
- [ ] Unauthorized game contract tries to collect rake
- [ ] Price oracle returns invalid data
- [ ] Contract paused during operations

---

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Ensure testnet wallet has test MATIC
   - Get testnet MATIC from faucet

2. **"Contract not verified"**
   - Run verification script
   - Check constructor arguments match

3. **"Price oracle returns 0"**
   - Verify QuickSwap pair exists
   - Check router address is correct
   - Ensure liquidity is added

4. **"Unauthorized game contract"**
   - Run `setup-game-contract.js` script
   - Verify game contract address

---

## Testnet Addresses

### Polygon Amoy
- **QuickSwap Router**: Check QuickSwap docs
- **WMATIC**: Check Polygon docs
- **Testnet Faucet**: https://faucet.polygon.technology/

### QuickSwap Testnet
- Verify router address on QuickSwap testnet
- May need to deploy test pair first

---

## Production Testing (Before Mainnet)

1. **Deploy to Polygon Mainnet**
2. **Verify all contracts**
3. **Add liquidity to QuickSwap**
4. **Test with small amounts first**
5. **Monitor for 24-48 hours**
6. **Gradually increase testing**

---

## Test Data

### Sample Test Scenarios

1. **Small Purchase**
   - Amount: 0.1 POL
   - Expected: ~1 chip (depending on price)

2. **Medium Purchase**
   - Amount: 1 POL
   - Expected: ~10 chips

3. **Large Purchase**
   - Amount: 10 POL
   - Expected: ~100 chips

4. **Game Pot**
   - Pot: 1000 chips
   - Rake: 75 chips (7.5%)
   - Winner: 925 chips

---

**Ready to test? Start with testnet deployment!** 🚀

