const { ethers } = require("hardhat");

/**
 * @notice Authorize a game contract to collect rake
 * @dev Run this script after deploying a new game contract
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Setting up game contract authorization with account:", deployer.address);

  const MGP_PLATFORM_ADDRESS = process.env.MGP_PLATFORM_ADDRESS || "";
  const GAME_CONTRACT_ADDRESS = process.env.GAME_CONTRACT_ADDRESS || "";

  if (!MGP_PLATFORM_ADDRESS || !GAME_CONTRACT_ADDRESS) {
    console.error("Please set MGP_PLATFORM_ADDRESS and GAME_CONTRACT_ADDRESS");
    process.exit(1);
  }

  // Get platform contract
  const platform = await ethers.getContractAt("MGPPlatform", MGP_PLATFORM_ADDRESS);

  // Check current authorization
  const isAuthorized = await platform.authorizedGames(GAME_CONTRACT_ADDRESS);
  console.log(`Current authorization status: ${isAuthorized ? "Authorized" : "Not Authorized"}`);

  if (!isAuthorized) {
    console.log(`Authorizing game contract: ${GAME_CONTRACT_ADDRESS}`);
    const tx = await platform.setGameContractAuthorization(GAME_CONTRACT_ADDRESS, true);
    await tx.wait();
    console.log("✅ Game contract authorized!");
    console.log("Transaction hash:", tx.hash);
  } else {
    console.log("Game contract is already authorized");
  }

  // Verify authorization
  const newStatus = await platform.authorizedGames(GAME_CONTRACT_ADDRESS);
  console.log(`New authorization status: ${newStatus ? "Authorized" : "Not Authorized"}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

