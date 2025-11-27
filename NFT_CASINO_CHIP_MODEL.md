# 🎰 NFT Casino-Chip Model - Player Flow

## Overview

The Mr Game Player platform uses a revolutionary **NFT Casino-Chip** model where:
- **MGP Token (ERC-20)**: Fixed 100M supply, used for liquidity and price discovery
- **MGP Chip NFT (ERC-1155)**: Transferable casino chips, 1 Chip = 1 MGP betting power
- **Platform Contract**: Handles deposits, cash-outs, and rake collection

---

## 🎯 Player Flow

### 1. **Buy Chips** (Deposit)

**Step-by-step:**
1. Player connects wallet (MetaMask, WalletConnect, etc.)
2. Player clicks "Buy Chips" button
3. Frontend shows:
   - Current MGP price from QuickSwap (live updates)
   - Input field for POL amount
   - Preview of chips they'll receive
4. Player enters POL amount (or clicks MAX)
5. Player clicks "Buy Chips"
6. Transaction sent to `MGPPlatform.buyChips()`
7. Platform contract:
   - Receives POL
   - Calculates chips: `POL amount / MGP price = chips`
   - Mints chips to player's wallet
8. Player receives chips instantly (ERC-1155 NFTs)

**Example:**
- Player sends: 1 POL
- Current MGP price: 0.1 POL per MGP
- Player receives: **10 Chips** (1 Chip = 1 MGP betting power)

---

### 2. **Play Games** (Use Chips)

**Step-by-step:**
1. Player navigates to a game (Pong, Tower Building, etc.)
2. Player selects bet amount (in chips)
3. Game contract checks player's chip balance
4. Player plays the game
5. If player wins:
   - Winner receives chips from pot
   - Platform collects 7.5% rake (minted as chips to treasury)
6. If player loses:
   - Chips are burned/transferred to pot

**Rake Collection:**
- Every game pot: 7.5% rake
- Rake is minted as chips directly to treasury wallet
- Founder keeps 100% of rake

---

### 3. **Cash Out Chips** (Withdraw)

**Step-by-step:**
1. Player clicks "Cash Out Chips" button
2. Frontend shows:
   - Current chip balance
   - Current MGP price from QuickSwap
   - Input field for chip amount
   - Preview of POL they'll receive
3. Player enters chip amount (or clicks MAX)
4. Player clicks "Cash Out"
5. Transaction sent to `MGPPlatform.cashOutChips(chipsAmount)`
6. Platform contract:
   - Burns chips from player's wallet
   - Calculates POL: `chips * MGP price = POL`
   - Transfers POL to player
7. Player receives POL instantly

**Example:**
- Player cashes out: 10 Chips
- Current MGP price: 0.1 POL per MGP
- Player receives: **1 POL**

---

## 🎁 Key Features

### **Transferable Chips**
- Players can send chips to friends
- Just like real casino chips!
- Use standard ERC-1155 transfer functions

### **Live Price Updates**
- MGP price fetched from QuickSwap
- Updates in real-time
- Players always know current rate

### **Gasless Ready**
- ERC-2771 meta-transactions support
- Players can buy/cash out without gas (future feature)

### **Transparent Rake**
- 7.5% rake on every game
- Minted directly to treasury
- Fully on-chain and verifiable

---

## 📊 Contract Architecture

### **MGPToken.sol**
- Fixed 100M supply (no minting after deployment)
- Allocation:
  - 30% Team & Founder
  - 30% Treasury
  - 20% Liquidity
  - 10% Community
  - 10% Partners

### **MGPChip.sol**
- ERC-1155 NFT
- Token ID #1 = "MGP Chip"
- Only platform can mint/burn
- Transferable by players

### **MGPPlatform.sol**
- Handles deposits (POL → Chips)
- Handles cash-outs (Chips → POL)
- Collects rake from games
- Integrates with QuickSwap for pricing

---

## 🚀 Quick Start

### **For Players:**

1. **Connect Wallet**
   - Click "Connect Wallet"
   - Approve connection

2. **Buy Chips**
   - Click "Buy Chips"
   - Enter POL amount
   - Confirm transaction
   - Receive chips instantly

3. **Play Games**
   - Select a game
   - Place bets with chips
   - Win chips or lose chips

4. **Cash Out**
   - Click "Cash Out Chips"
   - Enter chip amount
   - Confirm transaction
   - Receive POL instantly

---

## 💡 Technical Details

### **Price Oracle**
- Uses QuickSwap router for MGP/POL price
- Updates live on frontend
- Ensures fair exchange rates

### **Security**
- Reentrancy guards on all functions
- Checks-effects-interactions pattern
- Pausable for emergencies
- Ownable for admin controls

### **Gas Optimization**
- Batch operations supported
- Efficient ERC-1155 transfers
- Minimal storage writes

---

## 📝 Contract Addresses

After deployment, update these in your frontend:

```typescript
const MGP_TOKEN_ADDRESS = "0x..."; // MGP Token
const MGP_CHIP_ADDRESS = "0x...";  // Chip NFT
const MGP_PLATFORM_ADDRESS = "0x..."; // Platform
const QUICKSWAP_ROUTER = "0x..."; // QuickSwap Router
```

---

## 🎮 Example User Journey

1. **Alice** connects wallet
2. **Alice** buys 100 chips for 10 POL (price: 0.1 POL/MGP)
3. **Alice** plays Pong and bets 10 chips
4. **Alice** wins! Receives 90 chips (10% commission)
5. **Alice** sends 20 chips to friend **Bob**
6. **Alice** cashes out remaining 70 chips for 7 POL
7. **Bob** receives 20 chips and can use them or cash out

---

## 🔒 Security Notes

- Always verify contract addresses on Polygonscan
- Check MGP price before buying/cashing out
- Chips are NFTs - store them safely
- Only platform contract can mint/burn chips
- Rake is transparent and on-chain

---

**Ready to play? Connect your wallet and buy your first chips!** 🎰

