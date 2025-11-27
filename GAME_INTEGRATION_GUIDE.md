# 🎮 Game Integration Guide - MGP Platform

## Overview

This guide explains how to integrate your game contracts with the MGP Platform to enable chip-based betting and automatic rake collection.

---

## Prerequisites

1. **Deployed Contracts**
   - MGP Token
   - MGP Chip NFT
   - MGP Platform

2. **Game Contract Requirements**
   - Must be authorized by platform owner
   - Must handle chip transfers/burns
   - Must call `collectRake()` after each game

---

## Integration Steps

### Step 1: Authorize Your Game Contract

```bash
export MGP_PLATFORM_ADDRESS=0x...
export GAME_CONTRACT_ADDRESS=0x...
npx hardhat run scripts/setup-game-contract.js --network polygon
```

Or programmatically:

```solidity
// In your deployment script
MGPPlatform platform = MGPPlatform(PLATFORM_ADDRESS);
platform.setGameContractAuthorization(gameContractAddress, true);
```

### Step 2: Import Required Interfaces

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "./MGPPlatform.sol";
import "./MGPChip.sol";

contract YourGame {
    MGPPlatform public platform;
    MGPChip public chipContract;
    
    constructor(address _platformAddress) {
        platform = MGPPlatform(_platformAddress);
        chipContract = MGPChip(platform.chipContract());
    }
}
```

### Step 3: Implement Betting Logic

```solidity
contract YourGame {
    // ... previous code ...
    
    struct Game {
        address[] players;
        uint256[] bets;
        uint256 pot;
        bool finished;
        address winner;
    }
    
    mapping(uint256 => Game) public games;
    uint256 public gameCounter;
    
    /**
     * @notice Players join game by betting chips
     * @param gameId Game ID
     * @param betAmount Amount of chips to bet
     */
    function joinGame(uint256 gameId, uint256 betAmount) external {
        Game storage game = games[gameId];
        require(!game.finished, "Game finished");
        require(betAmount > 0, "Invalid bet");
        
        // Transfer chips from player to contract
        chipContract.safeTransferFrom(
            msg.sender,
            address(this),
            MGPChip.CHIP_TOKEN_ID,
            betAmount,
            ""
        );
        
        game.players.push(msg.sender);
        game.bets.push(betAmount);
        game.pot += betAmount;
    }
    
    /**
     * @notice Finish game and distribute winnings
     * @param gameId Game ID
     * @param winnerIndex Index of winner in players array
     */
    function finishGame(uint256 gameId, uint256 winnerIndex) external {
        Game storage game = games[gameId];
        require(!game.finished, "Game finished");
        require(winnerIndex < game.players.length, "Invalid winner");
        
        game.finished = true;
        game.winner = game.players[winnerIndex];
        
        // Collect rake (7.5%)
        uint256 rake = platform.collectRake(game.pot);
        
        // Calculate winnings (pot - rake)
        uint256 winnings = game.pot - rake;
        
        // Transfer winnings to winner
        chipContract.safeTransferFrom(
            address(this),
            game.winner,
            MGPChip.CHIP_TOKEN_ID,
            winnings,
            ""
        );
        
        // Burn remaining chips (if any)
        uint256 remaining = chipContract.balanceOf(address(this), MGPChip.CHIP_TOKEN_ID);
        if (remaining > 0) {
            chipContract.burn(address(this), MGPChip.CHIP_TOKEN_ID, remaining);
        }
    }
}
```

---

## Rake Collection

### How It Works

1. **Game Pot**: Total chips bet by all players
2. **Rake Calculation**: 7.5% of pot (750 basis points)
3. **Rake Collection**: Chips minted directly to treasury wallet
4. **Winner Gets**: 92.5% of pot

### Example

```solidity
// Game pot: 1000 chips
uint256 pot = 1000 * 10**18;

// Collect rake (returns amount collected)
uint256 rake = platform.collectRake(pot);
// rake = 75 chips (7.5%)

// Winner receives: 925 chips (92.5%)
uint256 winnings = pot - rake;
```

### Important Notes

- **Only authorized contracts** can call `collectRake()`
- Rake is **minted** as chips (not transferred)
- Treasury wallet receives rake chips automatically
- Rake collection happens **before** distributing winnings

---

## Chip Management

### Checking Player Balance

```solidity
uint256 balance = chipContract.balanceOfChips(playerAddress);
```

### Transferring Chips

```solidity
// From player to contract (betting)
chipContract.safeTransferFrom(
    playerAddress,
    contractAddress,
    MGPChip.CHIP_TOKEN_ID,
    amount,
    ""
);

// From contract to player (winnings)
chipContract.safeTransferFrom(
    contractAddress,
    playerAddress,
    MGPChip.CHIP_TOKEN_ID,
    amount,
    ""
);
```

### Burning Chips

```solidity
// Burn chips (e.g., for losing bets)
chipContract.burn(
    contractAddress,
    MGPChip.CHIP_TOKEN_ID,
    amount
);
```

---

## Complete Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MGPPlatform.sol";
import "./MGPChip.sol";

contract SimplePongGame is ReentrancyGuard {
    MGPPlatform public platform;
    MGPChip public chipContract;
    
    struct Game {
        address player1;
        address player2;
        uint256 bet;
        uint256 pot;
        bool finished;
        address winner;
    }
    
    mapping(uint256 => Game) public games;
    uint256 public gameCounter;
    
    event GameCreated(uint256 indexed gameId, address indexed player1, uint256 bet);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event GameFinished(uint256 indexed gameId, address indexed winner, uint256 winnings, uint256 rake);
    
    constructor(address _platformAddress) {
        platform = MGPPlatform(_platformAddress);
        chipContract = MGPChip(platform.chipContract());
    }
    
    /**
     * @notice Create a new game
     * @param betAmount Amount of chips to bet
     */
    function createGame(uint256 betAmount) external nonReentrant {
        require(betAmount > 0, "Invalid bet");
        
        // Transfer chips from player
        chipContract.safeTransferFrom(
            msg.sender,
            address(this),
            MGPChip.CHIP_TOKEN_ID,
            betAmount,
            ""
        );
        
        uint256 gameId = gameCounter++;
        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            bet: betAmount,
            pot: betAmount,
            finished: false,
            winner: address(0)
        });
        
        emit GameCreated(gameId, msg.sender, betAmount);
    }
    
    /**
     * @notice Join an existing game
     * @param gameId Game ID to join
     */
    function joinGame(uint256 gameId) external nonReentrant {
        Game storage game = games[gameId];
        require(game.player2 == address(0), "Game full");
        require(game.player1 != msg.sender, "Cannot join own game");
        require(!game.finished, "Game finished");
        
        // Transfer chips from player
        chipContract.safeTransferFrom(
            msg.sender,
            address(this),
            MGPChip.CHIP_TOKEN_ID,
            game.bet,
            ""
        );
        
        game.player2 = msg.sender;
        game.pot = game.bet * 2;
        
        emit GameJoined(gameId, msg.sender);
    }
    
    /**
     * @notice Finish game and distribute winnings
     * @param gameId Game ID
     * @param winner Address of winner (1 or 2)
     */
    function finishGame(uint256 gameId, uint256 winner) external nonReentrant {
        Game storage game = games[gameId];
        require(game.player2 != address(0), "Game not started");
        require(!game.finished, "Game finished");
        require(winner == 1 || winner == 2, "Invalid winner");
        
        game.finished = true;
        address winnerAddress = winner == 1 ? game.player1 : game.player2;
        game.winner = winnerAddress;
        
        // Collect rake (7.5%)
        uint256 rake = platform.collectRake(game.pot);
        
        // Calculate winnings
        uint256 winnings = game.pot - rake;
        
        // Transfer winnings to winner
        chipContract.safeTransferFrom(
            address(this),
            winnerAddress,
            MGPChip.CHIP_TOKEN_ID,
            winnings,
            ""
        );
        
        emit GameFinished(gameId, winnerAddress, winnings, rake);
    }
}
```

---

## Testing Your Integration

### 1. Deploy Game Contract

```bash
npx hardhat run scripts/deploy-game.js --network polygon
```

### 2. Authorize Game Contract

```bash
export GAME_CONTRACT_ADDRESS=0x...
npx hardhat run scripts/setup-game-contract.js --network polygon
```

### 3. Test Game Flow

1. Player 1 creates game with bet
2. Player 2 joins game
3. Game finishes, winner determined
4. Verify rake collected
5. Verify winner receives chips

---

## Security Considerations

1. **Reentrancy Protection**: Use `ReentrancyGuard` on all external functions
2. **Access Control**: Only authorized contracts can collect rake
3. **Chip Validation**: Always verify chip balances before transfers
4. **Game State**: Prevent actions on finished games
5. **Input Validation**: Validate all user inputs

---

## Best Practices

1. **Gas Optimization**: Batch operations where possible
2. **Error Handling**: Provide clear error messages
3. **Events**: Emit events for all important actions
4. **Testing**: Test thoroughly on testnet first
5. **Documentation**: Document your game logic clearly

---

## Support

For questions or issues:
1. Check contract authorization status
2. Verify chip contract address
3. Review transaction logs
4. Test on Polygon Amoy testnet first

---

**Ready to build? Deploy your game and start collecting rake!** 🎮💰

