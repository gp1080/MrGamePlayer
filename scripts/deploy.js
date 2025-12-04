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
  // 1. Deploy MGP Token (or use existing)
  // ============================================
  console.log("\n1. Checking for existing MGPToken...");
  const EXISTING_MGP_TOKEN = "0xEAd93e3039c84E51B9A9B254c2366184bA15d51E"; // Already deployed
  
  let mgpToken;
  let mgpTokenAddress;
  
  try {
    // Try to connect to existing token
    const MGPTokenFactory = await ethers.getContractFactory("MGPToken");
    mgpToken = MGPTokenFactory.attach(EXISTING_MGP_TOKEN);
    const code = await ethers.provider.getCode(EXISTING_MGP_TOKEN);
    if (code === "0x") {
      throw new Error("Contract does not exist at this address");
    }
    mgpTokenAddress = EXISTING_MGP_TOKEN;
    console.log("✅ Using existing MGPToken at:", mgpTokenAddress);
    console.log("Total supply:", (await mgpToken.totalSupply()).toString());
  } catch (error) {
    console.log("⚠️  Existing token not found, deploying new MGPToken...");
    const MGPToken = await ethers.getContractFactory("MGPToken");
    mgpToken = await MGPToken.deploy();
    await mgpToken.waitForDeployment();
    mgpTokenAddress = await mgpToken.getAddress();
    console.log("MGPToken deployed to:", mgpTokenAddress);
    console.log("Total supply:", (await mgpToken.totalSupply()).toString());
  }

  // ============================================
  // 2. Deploy MGP Chip NFT (or use existing)
  // ============================================
  console.log("\n2. Checking for existing MGPChip...");
  const EXISTING_MGP_CHIP = "0xCA48fB24467FFf81f3CCB7C70c840843aa41A99c"; // Already deployed
  
  let chipContract;
  let chipContractAddress;
  
  try {
    // Try to connect to existing chip contract
    const MGPChipFactory = await ethers.getContractFactory("MGPChip");
    chipContract = MGPChipFactory.attach(EXISTING_MGP_CHIP);
    const code = await ethers.provider.getCode(EXISTING_MGP_CHIP);
    if (code === "0x") {
      throw new Error("Contract does not exist at this address");
    }
    chipContractAddress = EXISTING_MGP_CHIP;
    console.log("✅ Using existing MGPChip at:", chipContractAddress);
  } catch (error) {
    console.log("⚠️  Existing chip not found, deploying new MGPChip...");
    const chipUri = "https://api.mrgameplayer.com/chip/metadata.json";
    const MGPChip = await ethers.getContractFactory("MGPChip");
    chipContract = await MGPChip.deploy(chipUri);
    await chipContract.waitForDeployment();
    chipContractAddress = await chipContract.getAddress();
    console.log("MGPChip deployed to:", chipContractAddress);
  }

  // ============================================
  // 3. Deploy Platform Contract
  // ============================================
  console.log("\n3. Deploying MGPPlatform...");
  
  // QuickSwap router address - detect network automatically
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  
  let QUICKSWAP_ROUTER;
  let POL_TOKEN;
  
  if (chainId === 137) {
    // Polygon Mainnet
    QUICKSWAP_ROUTER = "0xa5E0829CaCEd8fF2e8Cb5C5C5C5C5C5C5C5C5C5C5"; // QuickSwap Router V2
    POL_TOKEN = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC on Polygon Mainnet
    console.log("🌐 Network: Polygon Mainnet");
    console.log("✅ QuickSwap Router configured for mainnet");
  } else if (chainId === 80002) {
    // Polygon Amoy Testnet - QuickSwap not available, use deployer address temporarily
    // This will be updated later via setQuickSwapRouter when price oracle is set up
    console.log("🧪 Network: Polygon Amoy Testnet");
    console.log("⚠️  QuickSwap not available on testnet");
    console.log("⚠️  Using deployer address as temporary router (will be updated later)");
    QUICKSWAP_ROUTER = deployer.address; // Temporary - contract requires non-zero address
    // WMATIC on Amoy testnet - correct checksum address
    POL_TOKEN = "0x9c3C9283D3E44854697Cd22D3Faa240Cfb032889".toLowerCase(); // WMATIC on Amoy testnet
    console.log("⚠️  IMPORTANT: Update router after deployment using setQuickSwapRouter()");
  } else {
    throw new Error(`Unsupported network: Chain ID ${chainId}`);
  }
  
  console.log("\nConfiguration:");
  console.log("  QuickSwap Router:", QUICKSWAP_ROUTER);
  console.log("  POL Token (WMATIC):", POL_TOKEN);
  
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
  console.log("Network:", chainId === 137 ? "Polygon Mainnet" : "Polygon Amoy Testnet");
  console.log("MGPToken:", mgpTokenAddress);
  console.log("MGPChip:", chipContractAddress);
  console.log("MGPPlatform:", platformAddress);
  console.log("\nNext steps:");
  console.log("1. Verify contracts on Polygonscan");
  if (chainId === 80002) {
    console.log("2. ⚠️  Update QuickSwap router using:");
    console.log(`   await platform.setQuickSwapRouter("0x..."); // When price oracle is ready`);
  }
  if (chainId === 137) {
    console.log("2. Add liquidity to QuickSwap (see add-liquidity.js)");
  }
  console.log("3. Update frontend with contract addresses");
  console.log("4. Renounce MGPToken ownership after allocation");
  console.log("\n📝 Contract addresses to save:");
  console.log(`   MGP_TOKEN=${mgpTokenAddress}`);
  console.log(`   MGP_CHIP=${chipContractAddress}`);
  console.log(`   MGP_PLATFORM=${platformAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
