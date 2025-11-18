const hre = require("hardhat");
const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
    const MGP_TOKEN_ADDRESS = "0x9305Cd8c1be35395BA0205126b136B65aF13a133";
    const DEPLOYER_ADDRESS = "0xB7365DC18a2386ce68724cc76c0c22731455B509";
    
    // Get command line arguments
    const recipientAddress = process.argv[2];
    const amountInMGP = process.argv[3]; // Amount in MGP (not wei)
    
    if (!recipientAddress || !amountInMGP) {
        console.log("Usage: node scripts/transfer-mgp-tokens.js <recipient_address> <amount_in_mgp>");
        console.log("Example: node scripts/transfer-mgp-tokens.js 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000");
        process.exit(1);
    }
    
    console.log("MGP Token Transfer");
    console.log("==================\n");
    console.log("Contract Address:", MGP_TOKEN_ADDRESS);
    console.log("From:", DEPLOYER_ADDRESS);
    console.log("To:", recipientAddress);
    console.log("Amount:", amountInMGP, "MGP");
    console.log("Network:", hre.network.name);
    console.log("");

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log("Signer:", signer.address);
    
    if (signer.address.toLowerCase() !== DEPLOYER_ADDRESS.toLowerCase()) {
        console.log("⚠️  Warning: Signer address doesn't match deployer address!");
        console.log("Proceeding anyway...\n");
    }
    
    // Get contract instance
    const mgpToken = await hre.ethers.getContractAt("MGPToken", MGP_TOKEN_ADDRESS, signer);
    
    try {
        // Check balance first
        const balance = await mgpToken.balanceOf(signer.address);
        const decimals = 18; // ERC20 tokens typically use 18 decimals
        const balanceFormatted = ethers.formatUnits(balance, decimals);
        
        console.log("Current Balance:", balanceFormatted, "MGP\n");
        
        // Convert amount to wei
        const amountWei = ethers.parseUnits(amountInMGP, decimals);
        
        if (balance < amountWei) {
            throw new Error(`Insufficient balance. You have ${balanceFormatted} MGP, but trying to transfer ${amountInMGP} MGP`);
        }
        
        console.log("Sending transaction...");
        
        // Transfer tokens
        const tx = await mgpToken.transfer(recipientAddress, amountWei);
        console.log("Transaction hash:", tx.hash);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait(2);
        console.log("✅ Transaction confirmed!");
        console.log("Block number:", receipt.blockNumber);
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Verify transfer
        const newBalance = await mgpToken.balanceOf(signer.address);
        const recipientBalance = await mgpToken.balanceOf(recipientAddress);
        
        console.log("\n📊 New Balances:");
        console.log("Your balance:", ethers.formatUnits(newBalance, decimals), "MGP");
        console.log("Recipient balance:", ethers.formatUnits(recipientBalance, decimals), "MGP");
        
        console.log("\n✅ Transfer successful!");
        
    } catch (error) {
        console.error("❌ Error transferring tokens:", error.message);
        if (error.reason) {
            console.error("Reason:", error.reason);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

