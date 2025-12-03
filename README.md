# 🎮 MrGamePlayer

Gaming infrastructure and multiplayer gaming platform built on Polygon blockchain where players can compete, earn MGP tokens, and enjoy classic games with modern twists.

## 🚀 Features

- **10 Multiplayer Games**: Multi-Pong, Chess, Tetris, Tower Building, Endless Runner, and more
- **MGP Token**: ERC20 gaming infrastructure token (fixed 100M supply)
- **MGP Chips**: ERC-1155 NFT gaming chips (1 Chip = 1 MGP gaming power)
- **Real-time Multiplayer**: WebSocket-based game synchronization
- **Wallet Integration**: MetaMask and Web3 wallet support
- **4-Player Support**: Some games support up to 4 players
- **Mobile Friendly**: Responsive design with touch controls

## 🎯 Games

### 4-Player Games
- **Multi-Pong**: Circular arena pong with 4 players
- **Battle Snake**: Classic snake game battle royale
- **Platform Jump**: Jump and survive on disappearing platforms
- **Clumsy Bird**: Flappy bird with multiplayer
- **Tower Building**: Stack blocks and build the tallest tower

### 2-Player Games
- **Chess**: Full chess implementation with check/checkmate
- **Tetris**: Competitive Tetris battles
- **Tic Tac Toe**: Multi-round with increasing difficulty
- **Endless Runner**: 1v1 obstacle course racing
- **Rock Paper Scissors**: Classic skill-based competition

## 💰 Tokenomics & Gaming Infrastructure

- **Token Name**: Mr Game Player Token (MGP)
- **Symbol**: MGP
- **Total Supply**: 100,000,000 MGP (fixed, no minting after deployment)
- **Token Standard**: ERC-20 on Polygon
- **Chip Standard**: ERC-1155 NFT (MGP Chips)
- **Chip Value**: 1 MGP Chip = 1 MGP gaming power
- **Price Discovery**: QuickSwap DEX oracle
- **Infrastructure Fee**: 7.5% per game (minted as chips to treasury)
- **No Minimum Bet**: Play with any amount of gaming chips

## 🏗️ Tech Stack

- **Frontend**: React, Phaser 3, Ethers.js
- **Backend**: Node.js, WebSocket
- **Blockchain**: Polygon (Amoy testnet)
- **Smart Contracts**: Solidity, OpenZeppelin
- **Deployment**: Railway

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Environment Variables

Create a `.env` file:

```env
REACT_APP_TOKEN_CONTRACT_ADDRESS=0xEAd93e3039c84E51B9A9B254c2366184bA15d51E
REACT_APP_PLATFORM_ADDRESS=your_platform_contract
REACT_APP_CHIP_ADDRESS=your_chip_contract
REACT_APP_WS_URL=ws://localhost:8080
```

## 🚂 Deployment

See `RAILWAY_DEPLOYMENT.md` for Railway deployment instructions.

## 📄 Smart Contracts

- **MGPToken**: ERC-20 gaming infrastructure token (fixed 100M supply)
- **MGPChip**: ERC-1155 NFT gaming chips contract
- **MGPPlatform**: Platform contract for buying/redeeming chips and collecting rake
- **Network**: Polygon Amoy testnet (Chain ID: 80002)

See deployment scripts in `scripts/` directory for contract details.

## 🎮 How to Play

1. Connect your Web3 wallet (MetaMask)
2. Acquire MGP Chips by converting POL (or USDC) into gaming chips
3. Create or join a game room
4. Use gaming chips to participate in skill-based competitions
5. Play and compete!
6. Win gaming chips from prize pools and climb the leaderboard
7. Redeem chips back to POL or transfer chips to other players

## 📚 Documentation

- `RAILWAY_DEPLOYMENT.md` - Deployment guide
- `RAILWAY_QUICK_START.md` - Quick deployment steps
- `DEPLOYMENT_INFO.md` - Smart contract deployment info
- `MGP_TOKENOMICS_ANALYSIS.md` - Token economics analysis
- `GITHUB_SETUP.md` - GitHub repository setup

## 🔒 Security

- Reentrancy protection (ReentrancyGuard)
- Pausable functionality for emergency stops
- Access control (Ownable)
- Checks-Effects-Interactions pattern
- OpenZeppelin audited contracts
- ERC-2771 meta-transactions support (gasless ready)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 📧 Contact

- Discord: [Join our server](https://discord.gg/sNxT6X7t)
- Twitter: [@MrGamePlayer10](https://x.com/MrGamePlayer10)

---

**Built with ❤️ for the gaming community**
