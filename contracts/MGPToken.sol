// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract MGPToken is ERC20, Ownable, Pausable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 million tokens
    uint256 public constant TOKEN_PRICE = 0.1 ether; // 0.1 MATIC per token
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18; // 10 million tokens
    
    // Staking variables
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public constant STAKING_PERIOD = 7 days;
    uint256 public constant STAKING_REWARD_RATE = 5; // 5% APR

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensSold(address indexed seller, uint256 amount, uint256 maticReceived);
    event TokensBurned(address indexed from, uint256 amount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor() ERC20("Mr Game Player Token", "MGP") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function purchaseTokens() public payable whenNotPaused {
        require(msg.value > 0, "Must send MATIC to purchase tokens");
        
        uint256 tokenAmount = (msg.value * 10**18) / TOKEN_PRICE;
        require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    function sellTokens(uint256 amount) public whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        uint256 maticAmount = (amount * TOKEN_PRICE) / 10**18;
        require(address(this).balance >= maticAmount, "Insufficient MATIC reserves in contract");
        
        _burn(msg.sender, amount);
        
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

    function withdrawMatic() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No MATIC to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {
        purchaseTokens();
    }

    // Staking functions
    function stake(uint256 amount) public whenNotPaused {
        require(amount > 0, "Cannot stake 0 tokens");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _transfer(msg.sender, address(this), amount);
        
        if (stakingBalance[msg.sender] > 0) {
            claimReward();
        }
        
        stakingBalance[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }

    function calculateReward(address user) public view returns (uint256) {
        uint256 timeStaked = block.timestamp - stakingTimestamp[user];
        return (stakingBalance[user] * STAKING_REWARD_RATE * timeStaked) / (365 days * 100);
    }

    function unstake() public whenNotPaused {
        require(stakingBalance[msg.sender] > 0, "No tokens staked");
        
        uint256 reward = calculateReward(msg.sender);
        uint256 amount = stakingBalance[msg.sender];
        
        require(totalSupply() + reward <= MAX_SUPPLY, "Would exceed max supply");
        
        stakingBalance[msg.sender] = 0;
        _mint(msg.sender, reward);
        _transfer(address(this), msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, reward);
    }

    function claimReward() public whenNotPaused {
        require(stakingBalance[msg.sender] > 0, "No tokens staked");
        
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards to claim");
        require(totalSupply() + reward <= MAX_SUPPLY, "Would exceed max supply");
        
        stakingTimestamp[msg.sender] = block.timestamp;
        _mint(msg.sender, reward);
    }
}
