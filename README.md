# 🎮 MrGamePlayer

A multiplayer gaming platform built on Polygon blockchain where players can compete, earn MGP tokens, and enjoy classic games with modern twists.

## 🚀 Features

- **10 Multiplayer Games**: Multi-Pong, Chess, Tetris, Tower Building, Endless Runner, and more
- **MGP Token**: ERC20 token for betting, staking, and rewards
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
- **Rock Paper Scissors**: Classic with betting

## 💰 Tokenomics

- **Token Name**: Mr Game Player Token (MGP)
- **Symbol**: MGP
- **Initial Supply**: 10,000,000 MGP
- **Max Supply**: 100,000,000 MGP
- **Price**: 0.1 MATIC per token
- **Staking APR**: 5%
- **Commission**: 7.5% on all games
- **Minimum Bet**: 60 MGP

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
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
REACT_APP_BETTING_CONTRACT_ADDRESS=your_betting_contract
REACT_APP_WS_URL=ws://localhost:8080
```

## 🚂 Deployment

See `RAILWAY_DEPLOYMENT.md` for Railway deployment instructions.

## 📄 Smart Contracts

- **MGPTokenFixed**: Deployed on Polygon Amoy testnet
- **Contract Address**: `0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8`
- **Network**: Polygon Amoy (Chain ID: 80002)

See `DEPLOYMENT_INFO.md` for contract details.

## 🎮 How to Play

1. Connect your Web3 wallet (MetaMask)
2. Purchase MGP tokens
3. Create or join a game room
4. Place bets (optional)
5. Play and compete!
6. Win tokens and climb the leaderboard

## 📚 Documentation

- `RAILWAY_DEPLOYMENT.md` - Deployment guide
- `RAILWAY_QUICK_START.md` - Quick deployment steps
- `DEPLOYMENT_INFO.md` - Smart contract deployment info
- `MGP_TOKENOMICS_ANALYSIS.md` - Token economics analysis
- `GITHUB_SETUP.md` - GitHub repository setup

## 🔒 Security

- Reentrancy protection
- MATIC reserve management
- Minimum staking period enforcement
- Access control and pausable functionality

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.

## 📧 Contact

- Discord: [Join our server](https://discord.gg/sNxT6X7t)
- Twitter: [@MrGamePlayer10](https://x.com/MrGamePlayer10)

---

**Built with ❤️ for the gaming community**
