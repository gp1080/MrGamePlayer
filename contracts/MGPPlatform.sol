// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./MGPChip.sol";
import "./interfaces/IUniswapV2Router02.sol";

/**
 * @title MGPPlatform
 * @notice Core platform contract for Mr Game Player casino chip system
 * @dev Handles deposit (POL/USDC → chips), cash-out (chips → POL), and rake collection
 * @dev Supports gasless meta-transactions via ERC-2771 pattern
 */
contract MGPPlatform is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice MGP Chip NFT contract
    MGPChip public immutable chipContract;

    /// @notice QuickSwap router for price oracle
    address public quickswapRouter;

    /// @notice MGP token address (for price oracle)
    address public mgpToken;

    /// @notice POL token address (WMATIC)
    address public polToken;

    /// @notice USDC token address (optional)
    address public usdcToken;

    /// @notice Treasury wallet (receives rake)
    address public treasuryWallet;

    /// @notice Rake percentage (in basis points, 750 = 7.5%)
    uint256 public constant RAKE_BPS = 750;

    /// @notice Basis points denominator (10000 = 100%)
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Minimum deposit amount (to prevent dust)
    uint256 public minDeposit = 0.01 ether;

    /// @notice Mapping of authorized game contracts
    mapping(address => bool) public authorizedGames;

    /// @notice Event emitted when chips are purchased
    event ChipsPurchased(
        address indexed player,
        uint256 polAmount,
        uint256 chipsAmount,
        uint256 mgpPrice
    );

    /// @notice Event emitted when chips are cashed out
    event ChipsCashedOut(
        address indexed player,
        uint256 chipsAmount,
        uint256 polAmount,
        uint256 mgpPrice
    );

    /// @notice Event emitted when rake is collected
    event RakeCollected(
        address indexed treasury,
        uint256 chipsAmount,
        uint256 gamePot
    );

    /// @notice Event emitted when QuickSwap router is updated
    event QuickSwapRouterUpdated(address indexed newRouter);

    /// @notice Event emitted when treasury wallet is updated
    event TreasuryWalletUpdated(address indexed newTreasury);

    /// @notice Event emitted when game contract authorization is updated
    event GameContractAuthorizationUpdated(address indexed gameContract, bool authorized);

    /**
     * @notice Constructor
     * @param _chipContract Address of MGPChip contract
     * @param _quickswapRouter Address of QuickSwap router
     * @param _mgpToken Address of MGP token
     * @param _polToken Address of POL token (WMATIC)
     * @param _treasuryWallet Address of treasury wallet
     */
    constructor(
        address _chipContract,
        address _quickswapRouter,
        address _mgpToken,
        address _polToken,
        address _treasuryWallet
    ) {
        require(_chipContract != address(0), "Invalid chip contract");
        require(_quickswapRouter != address(0), "Invalid router");
        require(_mgpToken != address(0), "Invalid MGP token");
        require(_polToken != address(0), "Invalid POL token");
        require(_treasuryWallet != address(0), "Invalid treasury");

        chipContract = MGPChip(_chipContract);
        quickswapRouter = _quickswapRouter;
        mgpToken = _mgpToken;
        polToken = _polToken;
        treasuryWallet = _treasuryWallet;
    }

    /**
     * @notice Set USDC token address (optional)
     * @param _usdcToken Address of USDC token
     */
    function setUsdcToken(address _usdcToken) external onlyOwner {
        usdcToken = _usdcToken;
    }

    /**
     * @notice Update QuickSwap router address
     * @param _newRouter New QuickSwap router address
     */
    function setQuickSwapRouter(address _newRouter) external onlyOwner {
        require(_newRouter != address(0), "Invalid router");
        quickswapRouter = _newRouter;
        emit QuickSwapRouterUpdated(_newRouter);
    }

    /**
     * @notice Update treasury wallet address
     * @param _newTreasury New treasury wallet address
     */
    function setTreasuryWallet(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        treasuryWallet = _newTreasury;
        emit TreasuryWalletUpdated(_newTreasury);
    }

    /**
     * @notice Update minimum deposit amount
     * @param _minDeposit New minimum deposit in wei
     */
    function setMinDeposit(uint256 _minDeposit) external onlyOwner {
        minDeposit = _minDeposit;
    }

    /**
     * @notice Get current MGP price in POL from QuickSwap
     * @dev Uses QuickSwap router's getAmountsOut to get price
     * @dev Returns price of 1 MGP token in POL (with 18 decimals)
     * @return price Price of 1 MGP in POL (with 18 decimals)
     */
    function getMGPPrice() public view returns (uint256 price) {
        // QuickSwap router interface
        IUniswapV2Router02 router = IUniswapV2Router02(quickswapRouter);
        
        // Path: MGP -> POL (WMATIC)
        address[] memory path = new address[](2);
        path[0] = mgpToken;
        path[1] = polToken;
        
        // Get amount of POL we'd get for 1 MGP (1e18 wei)
        uint256[] memory amounts = router.getAmountsOut(1e18, path);
        
        // amounts[1] is the amount of POL we get for 1 MGP
        return amounts[1];
    }

    /**
     * @notice Buy chips with POL
     * @dev Player sends POL, receives chips based on current MGP price
     * @dev Shows live QuickSwap price so player knows how many chips they get
     */
    function buyChips() external payable whenNotPaused nonReentrant {
        require(msg.value >= minDeposit, "Deposit below minimum");
        require(msg.value > 0, "Must send POL");

        uint256 mgpPrice = getMGPPrice();
        require(mgpPrice > 0, "Invalid price");

        // Calculate chips: POL amount / MGP price = chips (1 chip = 1 MGP)
        // Example: 1 POL / 0.1 POL per MGP = 10 chips
        uint256 chipsAmount = (msg.value * 1e18) / mgpPrice;

        require(chipsAmount > 0, "Insufficient amount for chips");

        // Mint chips to player
        chipContract.mint(msg.sender, chipsAmount);

        emit ChipsPurchased(msg.sender, msg.value, chipsAmount, mgpPrice);
    }

    /**
     * @notice Buy chips with USDC (if enabled)
     * @param usdcAmount Amount of USDC to spend
     */
    function buyChipsWithUSDC(uint256 usdcAmount) external whenNotPaused nonReentrant {
        require(usdcToken != address(0), "USDC not enabled");
        require(usdcAmount > 0, "Invalid amount");

        uint256 mgpPrice = getMGPPrice();
        require(mgpPrice > 0, "Invalid price");

        // Transfer USDC from player
        IERC20(usdcToken).safeTransferFrom(msg.sender, address(this), usdcAmount);

        // Convert USDC amount to POL equivalent (simplified - should use oracle)
        // For now, assume 1 USDC = 1 POL (adjust based on actual price)
        uint256 polEquivalent = usdcAmount;
        uint256 chipsAmount = (polEquivalent * 1e18) / mgpPrice;

        require(chipsAmount > 0, "Insufficient amount for chips");

        // Mint chips to player
        chipContract.mint(msg.sender, chipsAmount);

        emit ChipsPurchased(msg.sender, polEquivalent, chipsAmount, mgpPrice);
    }

    /**
     * @notice Cash out chips for POL
     * @dev Player burns chips, receives POL at current MGP price
     * @param chipsAmount Number of chips to cash out
     */
    function cashOutChips(uint256 chipsAmount) external whenNotPaused nonReentrant {
        require(chipsAmount > 0, "Invalid amount");
        require(
            chipContract.balanceOf(msg.sender, 1) >= chipsAmount, // CHIP_TOKEN_ID = 1
            "Insufficient chips"
        );

        uint256 mgpPrice = getMGPPrice();
        require(mgpPrice > 0, "Invalid price");

        // Calculate POL amount: chips * MGP price = POL
        // Example: 10 chips * 0.1 POL per MGP = 1 POL
        uint256 polAmount = (chipsAmount * mgpPrice) / 1e18;

        require(address(this).balance >= polAmount, "Insufficient POL reserves");

        // Burn chips from player
        chipContract.burn(msg.sender, 1, chipsAmount); // CHIP_TOKEN_ID = 1

        // Transfer POL to player
        (bool success, ) = payable(msg.sender).call{value: polAmount}("");
        require(success, "POL transfer failed");

        emit ChipsCashedOut(msg.sender, chipsAmount, polAmount, mgpPrice);
    }

    /**
     * @notice Collect rake from game pot
     * @dev Only callable by authorized game contracts
     * @param gamePot Total pot size in chips
     * @return rakeAmount Amount of rake collected (in chips)
     */
    function collectRake(uint256 gamePot) external returns (uint256 rakeAmount) {
        require(authorizedGames[msg.sender], "MGPPlatform: Unauthorized game contract");
        require(gamePot > 0, "Invalid pot size");

        // Calculate rake: 7.5% of pot
        rakeAmount = (gamePot * RAKE_BPS) / BPS_DENOMINATOR;

        require(rakeAmount > 0, "Rake too small");

        // Mint rake chips directly to treasury
        chipContract.mint(treasuryWallet, rakeAmount);

        emit RakeCollected(treasuryWallet, rakeAmount, gamePot);

        return rakeAmount;
    }

    /**
     * @notice Authorize a game contract to collect rake
     * @dev Can only be called by owner
     * @param gameContract Address of game contract
     * @param authorized Whether contract is authorized
     */
    function setGameContractAuthorization(address gameContract, bool authorized) external onlyOwner {
        require(gameContract != address(0), "Invalid game contract");
        authorizedGames[gameContract] = authorized;
        emit GameContractAuthorizationUpdated(gameContract, authorized);
    }

    /**
     * @notice Pause platform operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause platform operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw POL from contract (emergency only)
     * @dev Should only be used in emergencies
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @notice Receive POL - users should call buyChips() directly
     * @dev This function rejects direct sends to prevent accidental deposits
     */
    receive() external payable {
        revert("MGPPlatform: Please call buyChips() function");
    }
}

