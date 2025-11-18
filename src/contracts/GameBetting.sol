// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameBetting is ReentrancyGuard, Ownable {
    IERC20 public mgpToken;
    
    uint256 public constant HOUSE_FEE = 75; // 7.5% house fee (75 = 7.5%, divide by 1000)
    
    struct Race {
        uint256 totalPot;
        mapping(address => uint256) playerBets;
        bool isActive;
        bool isFinished;
    }
    
    mapping(uint256 => Race) public races;
    uint256 public currentRaceId;

    event BetPlaced(uint256 indexed raceId, address indexed player, uint256 amount);
    event RewardsDistributed(uint256 indexed raceId, address[] winners, uint256[] amounts);

    constructor(address _mgpTokenAddress) {
        mgpToken = IERC20(_mgpTokenAddress);
        currentRaceId = 1;
    }

    function placeBet(uint256 amount) external nonReentrant {
        require(amount >= 60 * 1e18, "Minimum bet is 60 MGP"); // Minimum bet: 60 MGP
        require(races[currentRaceId].isActive, "No active race");
        
        mgpToken.transferFrom(msg.sender, address(this), amount);
        
        races[currentRaceId].playerBets[msg.sender] = amount;
        races[currentRaceId].totalPot += amount;
        
        emit BetPlaced(currentRaceId, msg.sender, amount);
    }

    function distributeRewards(
        address[] calldata winners,
        uint256[] calldata percentages
    ) external onlyOwner nonReentrant {
        require(winners.length == percentages.length, "Arrays length mismatch");
        require(races[currentRaceId].isActive, "No active race");
        
        uint256 totalPot = races[currentRaceId].totalPot;
        uint256 houseFeeAmount = (totalPot * HOUSE_FEE) / 1000; // 7.5% = 75/1000
        uint256 remainingPot = totalPot - houseFeeAmount;
        
        for (uint256 i = 0; i < winners.length; i++) {
            uint256 reward = (remainingPot * percentages[i]) / 100;
            mgpToken.transfer(winners[i], reward);
        }
        
        races[currentRaceId].isActive = false;
        races[currentRaceId].isFinished = true;
        currentRaceId++;
        races[currentRaceId].isActive = true;
        
        emit RewardsDistributed(currentRaceId - 1, winners, percentages);
    }

    function startNewRace() external onlyOwner {
        require(!races[currentRaceId].isActive, "Current race still active");
        currentRaceId++;
        races[currentRaceId].isActive = true;
    }

    function withdrawHouseFees() external onlyOwner {
        uint256 balance = mgpToken.balanceOf(address(this));
        mgpToken.transfer(owner(), balance);
    }
} 