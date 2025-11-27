const { run } = require("hardhat");

/**
 * @notice Verify deployed contracts on Polygonscan
 * @dev Run after deployment to verify source code
 */
async function main() {
  const MGP_TOKEN_ADDRESS = process.env.MGP_TOKEN_ADDRESS || "";
  const MGP_CHIP_ADDRESS = process.env.MGP_CHIP_ADDRESS || "";
  const MGP_PLATFORM_ADDRESS = process.env.MGP_PLATFORM_ADDRESS || "";

  if (!MGP_TOKEN_ADDRESS || !MGP_CHIP_ADDRESS || !MGP_PLATFORM_ADDRESS) {
    console.error("Please set contract addresses in environment variables");
    process.exit(1);
  }

  console.log("Verifying contracts on Polygonscan...\n");

  // Verify MGP Token
  try {
    console.log("Verifying MGPToken...");
    await run("verify:verify", {
      address: MGP_TOKEN_ADDRESS,
      constructorArguments: [],
    });
    console.log("✅ MGPToken verified\n");
  } catch (error) {
    console.error("❌ MGPToken verification failed:", error.message);
  }

  // Verify MGP Chip
  try {
    const CHIP_URI = "https://api.mrgameplayer.com/chip/metadata.json";
    console.log("Verifying MGPChip...");
    await run("verify:verify", {
      address: MGP_CHIP_ADDRESS,
      constructorArguments: [CHIP_URI],
    });
    console.log("✅ MGPChip verified\n");
  } catch (error) {
    console.error("❌ MGPChip verification failed:", error.message);
  }

  // Verify MGP Platform
  try {
    const QUICKSWAP_ROUTER = process.env.QUICKSWAP_ROUTER || "";
    const POL_TOKEN = process.env.POL_TOKEN || "";
    const TREASURY_WALLET = process.env.TREASURY_WALLET || "";

    if (!QUICKSWAP_ROUTER || !POL_TOKEN || !TREASURY_WALLET) {
      throw new Error("Missing constructor arguments");
    }

    console.log("Verifying MGPPlatform...");
    await run("verify:verify", {
      address: MGP_PLATFORM_ADDRESS,
      constructorArguments: [
        MGP_CHIP_ADDRESS,
        QUICKSWAP_ROUTER,
        MGP_TOKEN_ADDRESS,
        POL_TOKEN,
        TREASURY_WALLET,
      ],
    });
    console.log("✅ MGPPlatform verified\n");
  } catch (error) {
    console.error("❌ MGPPlatform verification failed:", error.message);
  }

  console.log("=== Verification Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

