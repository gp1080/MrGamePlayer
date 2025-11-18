const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("Account:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC");
  console.log("\nRequired for deployment: ~0.15 MATIC");
  
  if (balance < hre.ethers.parseEther("0.15")) {
    console.log("\n⚠️  Insufficient balance!");
    console.log("Get testnet MATIC from: https://faucet.polygon.technology/");
    console.log("Select network: Amoy");
    console.log("Enter address:", deployer.address);
  } else {
    console.log("\n✅ Sufficient balance for deployment!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

