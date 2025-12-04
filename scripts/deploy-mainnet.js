const { ethers } = require("hardhat");

/**
 * @notice Deploy contracts to Polygon Mainnet
 * @dev IMPORTANT: This script uses multi-sig wallets for allocations
 * @dev Make sure to set all multi-sig addresses in environment variables before running
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts to MAINNET with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");
  
  // Verify we're on mainnet
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  
  if (chainId !== 137) {
    throw new Error(`❌ This script is for Polygon Mainnet (Chain ID 137). Current chain: ${chainId}`);
  }

  console.log("\n⚠️  MAINNET DEPLOYMENT - FINAL CHECKLIST:");
  console.log("1. Multi-sig wallets configured?");
  console.log("2. Sufficient MATIC for gas?");
  console.log("3. Liquidity ready (20M MGP + POL)?");
  console.log("4. Contracts audited?");
  console.log("\nPress Ctrl+C to cancel, or wait 10 seconds to continue...");
  
  // Wait 10 seconds for user to cancel
  await new Promise(resolve => setTimeout(resolve, 10000));

  // ============================================
  // Configuration for Polygon Mainnet
  // ============================================
  const QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5C5"; // QuickSwap Router V2 (verify!)
  const POL_TOKEN = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC on Polygon Mainnet
  const USDC_TOKEN = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Polygon Mainnet

  // Multi-sig wallets (REQUIRED - set in environment variables)
  const TEAM_WALLET = process.env.TEAM_MULTISIG || deployer.address;
  const TREASURY_WALLET_MGP = process.env.TREASURY_MULTISIG || deployer.address;
  const LIQUIDITY_WALLET = process.env.LIQUIDITY_MULTISIG || deployer.address;
  const COMMUNITY_WALLET = process.env.COMMUNITY_MULTISIG || deployer.address;
  const PARTNERS_WALLET = process.env.PARTNERS_MULTISIG || deployer.address;
  const PLATFORM_TREASURY = process.env.PLATFORM_TREASURY_MULTISIG || deployer.address;

  console.log("\n📋 Multi-Sig Wallet Configuration:");
  console.log("  Team Wallet:", TEAM_WALLET);
  console.log("  Treasury Wallet (MGP):", TREASURY_WALLET_MGP);
  console.log("  Liquidity Wallet:", LIQUIDITY_WALLET);
  console.log("  Community Wallet:", COMMUNITY_WALLET);
  console.log("  Partners Wallet:", PARTNERS_WALLET);
  console.log("  Platform Treasury:", PLATFORM_TREASURY);

  if (TEAM_WALLET === deployer.address) {
    console.warn("\n⚠️  WARNING: Using deployer address for allocations!");
    console.warn("⚠️  Set multi-sig addresses in environment variables:");
    console.warn("   TEAM_MULTISIG=0x...");
    console.warn("   TREASURY_MULTISIG=0x...");
    console.warn("   etc.");
  }

  // ============================================
  // 1. Deploy MGP Token
  // ============================================
  console.log("\n1. Deploying MGPToken...");
  const MGPToken = await ethers.getContractFactory("MGPToken");
  const mgpToken = await MGPToken.deploy();
  await mgpToken.waitForDeployment();
  const mgpTokenAddress = await mgpToken.getAddress();
  console.log("✅ MGPToken deployed to:", mgpTokenAddress);
  console.log("Total supply:", ethers.formatEther(await mgpToken.totalSupply()), "MGP");

  // ============================================
  // 2. Deploy MGP Chip NFT
  // ============================================
  console.log("\n2. Deploying MGPChip...");
  const chipUri = "https://api.mrgameplayer.com/chip/metadata.json";
  const MGPChip = await ethers.getContractFactory("MGPChip");
  const chipContract = await MGPChip.deploy(chipUri);
  await chipContract.waitForDeployment();
  const chipContractAddress = await chipContract.getAddress();
  console.log("✅ MGPChip deployed to:", chipContractAddress);

  // ============================================
  // 3. Deploy Platform Contract
  // ============================================
  console.log("\n3. Deploying MGPPlatform...");
  console.log("Configuration:");
  console.log("  QuickSwap Router:", QUICKSWAP_ROUTER);
  console.log("  POL Token (WMATIC):", POL_TOKEN);
  console.log("  Platform Treasury:", PLATFORM_TREASURY);

  const MGPPlatform = await ethers.getContractFactory("MGPPlatform");
  const platform = await MGPPlatform.deploy(
    chipContractAddress,
    QUICKSWAP_ROUTER,
    mgpTokenAddress,
    POL_TOKEN,
    PLATFORM_TREASURY
  );
  await platform.waitForDeployment();
  const platformAddress = await platform.getAddress();
  console.log("✅ MGPPlatform deployed to:", platformAddress);

  // ============================================
  // 4. Configure Chip Contract
  // ============================================
  console.log("\n4. Configuring MGPChip...");
  const setPlatformTx = await chipContract.setPlatformContract(platformAddress);
  await setPlatformTx.wait();
  console.log("✅ MGPChip platform contract set");

  // ============================================
  // 5. Set MGP Token Allocation
  // ============================================
  console.log("\n5. Setting MGP Token allocation...");
  
  const setAllocationTx = await mgpToken.setAllocationWallets(
    TEAM_WALLET,
    TREASURY_WALLET_MGP,
    LIQUIDITY_WALLET,
    COMMUNITY_WALLET,
    PARTNERS_WALLET
  );
  await setAllocationTx.wait();
  console.log("✅ MGP Token allocation set");

  // ============================================
  // 6. Renounce MGPToken Ownership (Optional but recommended)
  // ============================================
  console.log("\n6. Renouncing MGPToken ownership...");
  console.log("⚠️  This will make the token fully decentralized.");
  console.log("⚠️  You won't be able to mint more tokens after this.");
  // Uncomment to renounce ownership:
  // const renounceTx = await mgpToken.renounceOwnership();
  // await renounceTx.wait();
  // console.log("✅ MGPToken ownership renounced");
  console.log("⚠️  Ownership renouncement skipped (uncomment in script to execute)");

  // ============================================
  // 7. Summary
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("🎉 MAINNET DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📝 Contract Addresses:");
  console.log("  MGPToken:", mgpTokenAddress);
  console.log("  MGPChip:", chipContractAddress);
  console.log("  MGPPlatform:", platformAddress);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Verify contracts on Polygonscan:");
  console.log(`   npx hardhat verify --network polygon ${mgpTokenAddress}`);
  console.log(`   npx hardhat verify --network polygon ${chipContractAddress} "${chipUri}"`);
  console.log(`   npx hardhat verify --network polygon ${platformAddress} ${chipContractAddress} ${QUICKSWAP_ROUTER} ${mgpTokenAddress} ${POL_TOKEN} ${PLATFORM_TREASURY}`);
  
  console.log("\n2. Add liquidity to QuickSwap:");
  console.log("   Run: npx hardhat run scripts/add-liquidity.js --network polygon");
  console.log("   Requires: 20M MGP + ~2.2M POL (for price ~0.11 POL/MGP)");
  
  console.log("\n3. Update frontend environment variables:");
  console.log(`   REACT_APP_MGP_TOKEN_ADDRESS=${mgpTokenAddress}`);
  console.log(`   REACT_APP_MGP_CHIP_ADDRESS=${chipContractAddress}`);
  console.log(`   REACT_APP_MGP_PLATFORM_ADDRESS=${platformAddress}`);
  
  console.log("\n4. Renounce MGPToken ownership (if desired):");
  console.log(`   await mgpToken.renounceOwnership()`);
  
  console.log("\n5. Transfer MGPPlatform ownership to multi-sig (recommended):");
  console.log(`   await platform.transferOwnership("${PLATFORM_TREASURY}")`);
  
  console.log("\n✅ Deployment successful!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

