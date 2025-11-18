// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title MGPTokenFixed
 * @notice Fixed version of MGP Token with security improvements
 * @dev Addresses critical reentrancy and reserve management issues
 */
contract MGPTokenFixed is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant INITIAL_SUPPLY = 10_000_000 * 10**18; // 10 million tokens
    uint256 public constant TOKEN_PRICE = 0.1 ether; // 0.1 MATIC per token
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 million tokens
    
    // Minimum amounts
    uint256 public constant MIN_PURCHASE = 0.1 ether; // Minimum 0.1 MATIC
    uint256 public constant MIN_SELL = 1 * 10**18; // Minimum 1 MGP token
    
    // Staking variables
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public constant STAKING_PERIOD = 7 days;
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% APR
    
    // Track MATIC reserves needed for sell functionality
    uint256 public maticReserves;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensSold(address indexed seller, uint256 amount, uint256 maticReceived);
    event TokensBurned(address indexed from, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);

    constructor() ERC20("Mr Game Player Token", "MGP") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Purchase MGP tokens with MATIC
     * @dev Minimum purchase: 0.1 MATIC
     */
    function purchaseTokens() public payable whenNotPaused {
        require(msg.value >= MIN_PURCHASE, "Amount below minimum purchase");
        
        uint256 tokenAmount = (msg.value * 10**18) / TOKEN_PRICE;
        require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        // Increase MATIC reserves for sell functionality
        maticReserves += msg.value;
        
        _mint(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    /**
     * @notice Sell MGP tokens back to contract for MATIC
     * @dev Protected against reentrancy attacks
     * @param amount Amount of tokens to sell (minimum 1 MGP)
     */
    function sellTokens(uint256 amount) public whenNotPaused nonReentrant {
        require(amount >= MIN_SELL, "Amount below minimum sell");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        uint256 maticAmount = (amount * TOKEN_PRICE) / 10**18;
        require(address(this).balance >= maticAmount, "Insufficient MATIC reserves in contract");
        require(maticReserves >= maticAmount, "Insufficient reserved MATIC");
        
        // Decrease reserves BEFORE external call
        maticReserves -= maticAmount;
        
        // Burn tokens
        _burn(msg.sender, amount);
        
        // Safe transfer (state already changed)
        (bool success, ) = payable(msg.sender).call{value: maticAmount}("");
        require(success, "MATIC transfer failed");
        
        emit TokensSold(msg.sender, amount, maticAmount);
    }

    function burnTokens(uint256 amount) public whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @notice Withdraw MATIC from contract (only non-reserved MATIC)
     * @dev Cannot withdraw MATIC reserved for sell functionality
     */
    function withdrawMatic() public onlyOwner {
        uint256 availableBalance = address(this).balance - maticReserves;
        require(availableBalance > 0, "No MATIC available to withdraw");
        
        (bool success, ) = payable(owner()).call{value: availableBalance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Emergency withdrawal of all MATIC (including reserves)
     * @dev Use only in emergency situations - will break sell functionality
     */
    function emergencyWithdrawMatic() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No MATIC to withdraw");
        
        maticReserves = 0; // Reset reserves
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Get available MATIC for withdrawal (excluding reserves)
     */
    function getAvailableMatic() public view returns (uint256) {
        return address(this).balance - maticReserves;
    }

    receive() external payable {
        purchaseTokens();
    }

    // Staking functions
    /**
     * @notice Stake MGP tokens for rewards
     * @dev Automatically claims existing rewards before adding new stake
     * @param amount Amount of tokens to stake
     */
    function stake(uint256 amount) public whenNotPaused {
        require(amount > 0, "Cannot stake 0 tokens");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, address(this), amount);
        
        // Claim existing rewards if any (don't fail if none or can't claim)
        if (stakingBalance[msg.sender] > 0) {
            uint256 reward = calculateReward(msg.sender);
            if (reward > 0 && totalSupply() + reward <= MAX_SUPPLY) {
                stakingTimestamp[msg.sender] = block.timestamp; // Reset timestamp
                _mint(msg.sender, reward);
                emit RewardClaimed(msg.sender, reward);
            }
        } else {
            // Only set timestamp if first time staking
            stakingTimestamp[msg.sender] = block.timestamp;
        }
        
        stakingBalance[msg.sender] += amount;
        
        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Calculate staking rewards for a user
     * @param user Address to calculate rewards for
     * @return Reward amount in tokens
     */
    function calculateReward(address user) public view returns (uint256) {
        if (stakingBalance[user] == 0) return 0;
        uint256 timeStaked = block.timestamp - stakingTimestamp[user];
        return (stakingBalance[user] * STAKING_REWARD_RATE * timeStaked) / (365 days * 100);
    }

    /**
     * @notice Unstake tokens and claim rewards
     * @dev Requires minimum staking period to be met
     */
    function unstake() public whenNotPaused {
        uint256 staked = stakingBalance[msg.sender];
        require(staked > 0, "No tokens staked");
        require(
            block.timestamp >= stakingTimestamp[msg.sender] + STAKING_PERIOD,
            "Minimum staking period not met"
        );
        
        uint256 reward = calculateReward(msg.sender);
        
        require(totalSupply() + reward <= MAX_SUPPLY, "Would exceed max supply");
        
        stakingBalance[msg.sender] = 0;
        _mint(msg.sender, reward);
        _transfer(address(this), msg.sender, staked);
        
        emit Unstaked(msg.sender, staked, reward);
    }

    /**
     * @notice Claim staking rewards without unstaking
     * @dev Resets staking timestamp to current time
     */
    function claimReward() public whenNotPaused {
        require(stakingBalance[msg.sender] > 0, "No tokens staked");
        
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards to claim");
        require(totalSupply() + reward <= MAX_SUPPLY, "Would exceed max supply");
        
        stakingTimestamp[msg.sender] = block.timestamp;
        _mint(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
}

