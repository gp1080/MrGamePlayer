const { ethers } = require("hardhat");

/**
 * @notice Add initial liquidity to QuickSwap for MGP/POL pair
 * @dev Adds 20M MGP + desired POL amount to create initial liquidity
 * @dev Starting price should be ~0.10-0.12 POL per MGP
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Adding liquidity with account:", deployer.address);

  // Contract addresses (from deployment)
  const MGP_TOKEN_ADDRESS = process.env.MGP_TOKEN_ADDRESS || ""; // Set after deployment
  const QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5C5"; // TODO: Update with actual address
  const POL_TOKEN = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC on Polygon

  // Liquidity parameters
  const MGP_AMOUNT = ethers.utils.parseEther("20000000"); // 20M MGP
  const TARGET_PRICE = ethers.utils.parseEther("0.11"); // 0.11 POL per MGP
  const POL_AMOUNT = MGP_AMOUNT.mul(TARGET_PRICE).div(ethers.utils.parseEther("1")); // POL amount for target price

  console.log("\nLiquidity Parameters:");
  console.log("MGP Amount:", ethers.utils.formatEther(MGP_AMOUNT), "MGP");
  console.log("POL Amount:", ethers.utils.formatEther(POL_AMOUNT), "POL");
  console.log("Target Price:", ethers.utils.formatEther(TARGET_PRICE), "POL per MGP");

  // Get contracts
  const mgpToken = await ethers.getContractAt("MGPToken", MGP_TOKEN_ADDRESS);
  const polToken = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", POL_TOKEN);
  const router = await ethers.getContractAt(
    [
      "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
      "function WETH() external pure returns (address)"
    ],
    QUICKSWAP_ROUTER
  );

  // Check balances
  const mgpBalance = await mgpToken.balanceOf(deployer.address);
  const polBalance = await polToken.balanceOf(deployer.address);

  console.log("\nCurrent Balances:");
  console.log("MGP Balance:", ethers.utils.formatEther(mgpBalance));
  console.log("POL Balance:", ethers.utils.formatEther(polBalance));

  require(mgpBalance.gte(MGP_AMOUNT), "Insufficient MGP balance");
  require(polBalance.gte(POL_AMOUNT), "Insufficient POL balance");

  // Approve tokens
  console.log("\nApproving tokens...");
  const approveMGPTx = await mgpToken.approve(QUICKSWAP_ROUTER, MGP_AMOUNT);
  await approveMGPTx.wait();
  console.log("MGP approved");

  const approvePOLTx = await polToken.approve(QUICKSWAP_ROUTER, POL_AMOUNT);
  await approvePOLTx.wait();
  console.log("POL approved");

  // Add liquidity
  console.log("\nAdding liquidity to QuickSwap...");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
  const slippageTolerance = 500; // 5% slippage tolerance
  const amountAMin = MGP_AMOUNT.mul(10000 - slippageTolerance).div(10000);
  const amountBMin = POL_AMOUNT.mul(10000 - slippageTolerance).div(10000);

  const addLiquidityTx = await router.addLiquidity(
    MGP_TOKEN_ADDRESS,
    POL_TOKEN,
    MGP_AMOUNT,
    POL_AMOUNT,
    amountAMin,
    amountBMin,
    deployer.address, // LP tokens go to deployer
    deadline
  );

  const receipt = await addLiquidityTx.wait();
  console.log("Liquidity added! Transaction hash:", receipt.transactionHash);

  // Get pair address (if needed)
  // const factory = await ethers.getContractAt("IUniswapV2Factory", FACTORY_ADDRESS);
  // const pairAddress = await factory.getPair(MGP_TOKEN_ADDRESS, POL_TOKEN);
  // console.log("Pair address:", pairAddress);

  console.log("\n=== Liquidity Added Successfully ===");
  console.log("Initial price set to ~", ethers.utils.formatEther(TARGET_PRICE), "POL per MGP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

