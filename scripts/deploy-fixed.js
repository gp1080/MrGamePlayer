const hre = require("hardhat");

async function main() {
  console.log("Deploying MGPTokenFixed contract...");
  console.log("Network:", hre.network.name);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (balance === 0n) {
    throw new Error("Insufficient balance for deployment!");
  }

  console.log("\nDeploying MGPTokenFixed contract...");
  const MGPTokenFixed = await hre.ethers.getContractFactory("MGPTokenFixed");
  
  console.log("Sending deployment transaction...");
  const mgpToken = await MGPTokenFixed.deploy();
  
  console.log("Transaction sent! Contract address:", mgpToken.target);
  
  const deploymentTx = mgpToken.deploymentTransaction();
  if (deploymentTx) {
    console.log("Transaction hash:", deploymentTx.hash);
    console.log("Waiting for transaction confirmation...");
    
    const receipt = await deploymentTx.wait(2);
    console.log("Transaction confirmed! Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
  }
  
  await mgpToken.waitForDeployment();
  const deployedAddress = await mgpToken.getAddress();
  
  console.log("\n✅ MGPTokenFixed deployed successfully!");
  console.log("Contract address:", deployedAddress);
  console.log("\nContract Details:");
  console.log("- Name: Mr Game Player Token");
  console.log("- Symbol: MGP");
  console.log("- Initial Supply: 10,000,000 MGP");
  console.log("- Max Supply: 100,000,000 MGP");
  console.log("- Token Price: 0.1 MATIC per token");
  console.log("- Staking APR: 5%");
  console.log("- Minimum Staking Period: 7 days");
  console.log("\nSecurity Features:");
  console.log("✅ Reentrancy protection");
  console.log("✅ MATIC reserve management");
  console.log("✅ Minimum staking period enforcement");
  console.log("✅ Minimum purchase/sell amounts");
  
  console.log("\nTo verify the contract, run:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${deployedAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: deployedAddress,
    deployer: deployer.address,
    deploymentTx: deploymentTx?.hash,
    timestamp: new Date().toISOString(),
    contractName: "MGPTokenFixed",
    features: [
      "Reentrancy protection",
      "MATIC reserve management",
      "Minimum staking period enforcement",
      "Minimum purchase/sell amounts"
    ]
  };
  
  console.log("\n📄 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return deployedAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

