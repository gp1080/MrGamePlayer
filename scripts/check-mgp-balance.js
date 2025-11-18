const hre = require("hardhat");
const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
    const MGP_TOKEN_ADDRESS = "0x9305Cd8c1be35395BA0205126b136B65aF13a133";
    const DEPLOYER_ADDRESS = "0xB7365DC18a2386ce68724cc76c0c22731455B509";
    
    console.log("MGP Token Balance Check");
    console.log("=======================\n");
    console.log("Contract Address:", MGP_TOKEN_ADDRESS);
    console.log("Your Address:", DEPLOYER_ADDRESS);
    
    // Use amoy network provider
    const networkName = hre.network.name === 'hardhat' ? 'amoy' : hre.network.name;
    const rpcUrl = networkName === 'amoy' 
        ? "https://rpc-amoy.polygon.technology"
        : hre.config.networks[networkName]?.url || "http://localhost:8545";
    
    console.log("Network:", networkName);
    console.log("RPC URL:", rpcUrl);
    console.log("");

    // Get provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get contract instance
    const mgpTokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function totalSupply() view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function decimals() view returns (uint8)"
    ];
    
    const contract = new ethers.Contract(MGP_TOKEN_ADDRESS, mgpTokenABI, provider);
    
    try {
        // Get your balance
        const balance = await contract.balanceOf(DEPLOYER_ADDRESS);
        const decimals = await contract.decimals();
        const totalSupply = await contract.totalSupply();
        
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        const totalSupplyFormatted = ethers.formatUnits(totalSupply, decimals);
        
        console.log("✅ Your MGP Token Balance:", balanceFormatted, "MGP");
        console.log("📊 Total Supply:", totalSupplyFormatted, "MGP");
        console.log("");
        
        if (balance > 0n) {
            console.log("💰 You already have tokens in your wallet!");
            console.log("You can use them directly or transfer to other addresses.");
        } else {
            console.log("⚠️  No tokens found in your wallet.");
            console.log("This shouldn't happen - tokens should have been minted during deployment.");
        }
        
    } catch (error) {
        console.error("❌ Error checking balance:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

