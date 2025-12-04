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
  
  // Detect network
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  
  let QUICKSWAP_ROUTER;
  let POL_TOKEN;
  
  if (chainId === 137) {
    // Polygon Mainnet
    QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5C5"; // QuickSwap Router V2
    POL_TOKEN = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC on Polygon Mainnet
  } else if (chainId === 80002) {
    // Polygon Amoy Testnet
    QUICKSWAP_ROUTER = "0x..."; // QuickSwap not available on testnet
    POL_TOKEN = "0x9c3c9283d3e44854697cd22d3faa240cfb032889"; // WMATIC on Amoy
    throw new Error("QuickSwap liquidity not available on testnet");
  } else {
    throw new Error(`Unsupported network: Chain ID ${chainId}`);
  }

  // Liquidity parameters
  const MGP_AMOUNT = ethers.parseEther("20000000"); // 20M MGP
  const TARGET_PRICE = ethers.parseEther("0.11"); // 0.11 POL per MGP
  const POL_AMOUNT = (MGP_AMOUNT * TARGET_PRICE) / ethers.parseEther("1"); // POL amount for target price

  console.log("\nLiquidity Parameters:");
  console.log("MGP Amount:", ethers.formatEther(MGP_AMOUNT), "MGP");
  console.log("POL Amount:", ethers.formatEther(POL_AMOUNT), "POL");
  console.log("Target Price:", ethers.formatEther(TARGET_PRICE), "POL per MGP");

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
  console.log("MGP Balance:", ethers.formatEther(mgpBalance));
  console.log("POL Balance:", ethers.formatEther(polBalance));

  if (mgpBalance < MGP_AMOUNT) {
    throw new Error(`Insufficient MGP balance. Need ${ethers.formatEther(MGP_AMOUNT)} MGP, have ${ethers.formatEther(mgpBalance)} MGP`);
  }
  if (polBalance < POL_AMOUNT) {
    throw new Error(`Insufficient POL balance. Need ${ethers.formatEther(POL_AMOUNT)} POL, have ${ethers.formatEther(polBalance)} POL`);
  }

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
  const amountAMin = (MGP_AMOUNT * BigInt(10000 - slippageTolerance)) / BigInt(10000);
  const amountBMin = (POL_AMOUNT * BigInt(10000 - slippageTolerance)) / BigInt(10000);

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
  console.log("Initial price set to ~", ethers.formatEther(TARGET_PRICE), "POL per MGP");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

