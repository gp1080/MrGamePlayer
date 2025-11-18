const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  console.log("Network:", hre.network.name);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance for deployment!");
  }

  console.log("\nDeploying MGPToken contract...");
  const MGPToken = await hre.ethers.getContractFactory("MGPToken");
  
  console.log("Sending deployment transaction...");
  const mgpToken = await MGPToken.deploy();
  
  console.log("Transaction sent! Contract address:", mgpToken.target);
  
  const deploymentTx = mgpToken.deploymentTransaction();
  if (deploymentTx) {
    console.log("Transaction hash:", deploymentTx.hash);
    console.log("Waiting for transaction confirmation...");
    
    // Wait for transaction with explicit confirmations
    const receipt = await deploymentTx.wait(2);
    console.log("Transaction confirmed! Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
  }
  
  // Wait for deployment to complete
  console.log("Waiting for contract deployment...");
  await mgpToken.waitForDeployment();
  
  const deployedAddress = await mgpToken.getAddress();
  console.log("\n✅ MGPToken deployed successfully!");
  console.log("Contract address:", deployedAddress);
  console.log("");
  console.log("To verify the contract manually, run:");
  console.log(`npx hardhat verify --network amoy ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 