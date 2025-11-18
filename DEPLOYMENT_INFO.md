# MGPTokenFixed Deployment Information

## Contract Details
- **Contract Name**: MGPTokenFixed
- **Network**: Polygon Amoy Testnet
- **Contract Address**: `0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8`
- **Deployment Transaction**: `0x37af75fd13769f0240b6f162d19e256cba96a5b48d704becd307cf0ee4b21bb7`
- **Block Number**: 29186722
- **Deployer**: `0xB7365DC18a2386ce68724cc76c0c22731455B509`
- **Deployment Date**: November 18, 2025

## Token Specifications
- **Name**: Mr Game Player Token
- **Symbol**: MGP
- **Initial Supply**: 10,000,000 MGP (minted to deployer)
- **Max Supply**: 100,000,000 MGP
- **Token Price**: 0.1 MATIC per token
- **Decimals**: 18

## Features
- ✅ Reentrancy protection (ReentrancyGuard)
- ✅ MATIC reserve management for sell functionality
- ✅ Minimum staking period enforcement (7 days)
- ✅ Minimum purchase/sell amounts
- ✅ Pausable functionality
- ✅ Staking with 5% APR rewards

## Security Improvements
1. **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
2. **MATIC Reserves**: Tracks MATIC reserves needed for token sales
3. **Minimum Amounts**: 
   - Minimum purchase: 0.1 MATIC
   - Minimum sell: 1 MGP token
4. **Staking Security**: Enforces minimum staking period before unstaking/claiming

## Frontend Configuration
Update your `.env` file or environment variables:
```
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
```

## Verification
To verify the contract on Polygonscan:
```bash
npx hardhat verify --network amoy 0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
```

## Contract Explorer Links
- **Polygonscan Amoy**: https://amoy.polygonscan.com/address/0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8

## Notes
- The contract is deployed on Polygon Amoy testnet
- All initial supply (10M tokens) is minted to the deployer address
- The contract includes all security fixes from the audit
- Frontend has been updated to use the new contract address and ABI

