// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MGPToken
 * @notice Fixed supply ERC20 token for Mr Game Player platform
 * @dev Total supply: 100,000,000 MGP (fixed forever, no minting after deployment)
 * @dev Allocation:
 *      - 30% Team & Founder (30M)
 *      - 30% Treasury / Company (30M)
 *      - 20% Liquidity & circulating (20M)
 *      - 10% Community rewards (10M)
 *      - 10% Strategic partners (10M)
 */
contract MGPToken is ERC20, Ownable {
    /// @notice Total supply cap: 100,000,000 MGP
    uint256 public constant TOTAL_SUPPLY = 100_000_000 * 10**18;

    /// @notice Allocation percentages (in basis points, 10000 = 100%)
    uint256 public constant TEAM_ALLOCATION = 30_000_000 * 10**18; // 30%
    uint256 public constant TREASURY_ALLOCATION = 30_000_000 * 10**18; // 30%
    uint256 public constant LIQUIDITY_ALLOCATION = 20_000_000 * 10**18; // 20%
    uint256 public constant COMMUNITY_ALLOCATION = 10_000_000 * 10**18; // 10%
    uint256 public constant PARTNERS_ALLOCATION = 10_000_000 * 10**18; // 10%

    /// @notice Addresses for allocation (set after deployment)
    address public teamWallet;
    address public treasuryWallet;
    address public liquidityWallet;
    address public communityWallet;
    address public partnersWallet;

    /// @notice Flag to track if allocation has been set
    bool public allocationSet;

    /// @notice Event emitted when allocation addresses are set
    event AllocationSet(
        address indexed teamWallet,
        address indexed treasuryWallet,
        address indexed liquidityWallet,
        address communityWallet,
        address partnersWallet
    );

    /**
     * @notice Constructor mints total supply to deployer
     * @dev Deployer must transfer tokens to allocation wallets after deployment
     */
    constructor() ERC20("Mr Game Player Token", "MGP") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    /**
     * @notice Set allocation wallet addresses
     * @dev Can only be called once by owner
     * @param _teamWallet Team & Founder wallet address
     * @param _treasuryWallet Treasury / Company wallet address
     * @param _liquidityWallet Liquidity wallet address
     * @param _communityWallet Community rewards wallet address
     * @param _partnersWallet Strategic partners wallet address
     */
    function setAllocationWallets(
        address _teamWallet,
        address _treasuryWallet,
        address _liquidityWallet,
        address _communityWallet,
        address _partnersWallet
    ) external onlyOwner {
        require(!allocationSet, "Allocation already set");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        require(_liquidityWallet != address(0), "Invalid liquidity wallet");
        require(_communityWallet != address(0), "Invalid community wallet");
        require(_partnersWallet != address(0), "Invalid partners wallet");

        teamWallet = _teamWallet;
        treasuryWallet = _treasuryWallet;
        liquidityWallet = _liquidityWallet;
        communityWallet = _communityWallet;
        partnersWallet = _partnersWallet;
        allocationSet = true;

        // Transfer allocations
        _transfer(msg.sender, _teamWallet, TEAM_ALLOCATION);
        _transfer(msg.sender, _treasuryWallet, TREASURY_ALLOCATION);
        _transfer(msg.sender, _liquidityWallet, LIQUIDITY_ALLOCATION);
        _transfer(msg.sender, _communityWallet, COMMUNITY_ALLOCATION);
        _transfer(msg.sender, _partnersWallet, PARTNERS_ALLOCATION);

        emit AllocationSet(
            _teamWallet,
            _treasuryWallet,
            _liquidityWallet,
            _communityWallet,
            _partnersWallet
        );
    }

    /**
     * @notice Renounce ownership after setup is complete
     * @dev Can only be called after allocation is set
     */
    function renounceOwnership() public override onlyOwner {
        require(allocationSet, "Allocation must be set first");
        super.renounceOwnership();
    }

    /**
     * @notice Override to prevent any minting after deployment
     * @dev Allows minting only in constructor (when totalSupply is 0), then disables forever
     */
    function _mint(address to, uint256 amount) internal override {
        require(totalSupply() == 0, "MGP: No minting allowed after deployment");
        super._mint(to, amount);
    }
}
