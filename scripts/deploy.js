const { ethers } = require("hardhat");

/**
 * @notice Deploy MGP Token, Chip NFT, and Platform contracts
 * @dev Deploys all contracts in correct order with proper initialization
 */
async function main() {
  // Use the same deployer address as previous deployments
  // Previous deployer: 0xB7365DC18a2386ce68724cc76c0c22731455B509
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString(), "wei");
  
  // Verify we're using the correct deployer
  const EXPECTED_DEPLOYER = "0xB7365DC18a2386ce68724cc76c0c22731455B509";
  if (deployer.address.toLowerCase() !== EXPECTED_DEPLOYER.toLowerCase()) {
    console.warn(`⚠️  Warning: Deployer address (${deployer.address}) does not match expected (${EXPECTED_DEPLOYER})`);
    console.warn("Make sure you're using the correct private key in .env");
  }

  // ============================================
  // 1. Deploy MGP Token
  // ============================================
  console.log("\n1. Deploying MGPToken...");
  const MGPToken = await ethers.getContractFactory("MGPToken");
  const mgpToken = await MGPToken.deploy();
  await mgpToken.waitForDeployment();
  const mgpTokenAddress = await mgpToken.getAddress();
  console.log("MGPToken deployed to:", mgpTokenAddress);
  console.log("Total supply:", (await mgpToken.totalSupply()).toString());

  // ============================================
  // 2. Deploy MGP Chip NFT
  // ============================================
  console.log("\n2. Deploying MGPChip...");
  const chipUri = "https://api.mrgameplayer.com/chip/metadata.json";
  const MGPChip = await ethers.getContractFactory("MGPChip");
  const chipContract = await MGPChip.deploy(chipUri);
  await chipContract.waitForDeployment();
  const chipContractAddress = await chipContract.getAddress();
  console.log("MGPChip deployed to:", chipContractAddress);

  // ============================================
  // 3. Deploy Platform Contract
  // ============================================
  console.log("\n3. Deploying MGPPlatform...");
  
  // QuickSwap router address (testnet - update for mainnet)
  // For Polygon Amoy testnet, use a mock or test router
  const QUICKSWAP_ROUTER = "0x0000000000000000000000000000000000000000"; // TODO: Update with actual testnet router
  const POL_TOKEN = "0x0000000000000000000000000000000000000000"; // TODO: Update with testnet WMATIC address
  
  // Treasury wallet (using deployer address - should be replaced with multi-sig in production)
  const TREASURY_WALLET = deployer.address; // Same as deployer for now

  const MGPPlatform = await ethers.getContractFactory("MGPPlatform");
  const platform = await MGPPlatform.deploy(
    chipContractAddress,
    QUICKSWAP_ROUTER,
    mgpTokenAddress,
    POL_TOKEN,
    TREASURY_WALLET
  );
  await platform.waitForDeployment();
  const platformAddress = await platform.getAddress();
  console.log("MGPPlatform deployed to:", platformAddress);

  // ============================================
  // 4. Configure Chip Contract
  // ============================================
  console.log("\n4. Configuring MGPChip...");
  const setPlatformTx = await chipContract.setPlatformContract(platformAddress);
  await setPlatformTx.wait();
  console.log("MGPChip platform contract set");

  // ============================================
  // 5. Set MGP Token Allocation
  // ============================================
  console.log("\n5. Setting MGP Token allocation...");
  
  // Allocation wallets (using deployer address for now - replace with multi-sig in production)
  // Previous contract: 0x1d5ae4ED53F0787EadD30eDF266E233f5274A8E8
  const TEAM_WALLET = deployer.address; // TODO: Replace with multi-sig
  const TREASURY_WALLET_MGP = deployer.address; // TODO: Replace with multi-sig
  const LIQUIDITY_WALLET = deployer.address; // TODO: Replace with multi-sig
  const COMMUNITY_WALLET = deployer.address; // TODO: Replace with multi-sig
  const PARTNERS_WALLET = deployer.address; // TODO: Replace with multi-sig
  
  console.log("\n⚠️  Using deployer address for all allocations.");
  console.log("⚠️  IMPORTANT: Replace with multi-sig wallets before mainnet deployment!");

  const setAllocationTx = await mgpToken.setAllocationWallets(
    TEAM_WALLET,
    TREASURY_WALLET_MGP,
    LIQUIDITY_WALLET,
    COMMUNITY_WALLET,
    PARTNERS_WALLET
  );
  await setAllocationTx.wait();
  console.log("MGP Token allocation set");

  // ============================================
  // 6. Summary
  // ============================================
  console.log("\n=== Deployment Summary ===");
  console.log("MGPToken:", mgpTokenAddress);
  console.log("MGPChip:", chipContractAddress);
  console.log("MGPPlatform:", platformAddress);
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Polygonscan");
  console.log("2. Add liquidity to QuickSwap (see add-liquidity.js)");
  console.log("3. Update frontend with contract addresses");
  console.log("4. Renounce MGPToken ownership after allocation");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
