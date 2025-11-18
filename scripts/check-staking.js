const hre = require("hardhat");
const { ethers } = require("ethers");
require('dotenv').config();

async function main() {
    const MGP_TOKEN_ADDRESS = "0x9305Cd8c1be35395BA0205126b136B65aF13a133";
    const DEPLOYER_ADDRESS = "0xB7365DC18a2386ce68724cc76c0c22731455B509";
    
    // Allow custom address via command line
    const addressToCheck = process.argv[2] || DEPLOYER_ADDRESS;
    
    console.log("MGP Token Staking Status");
    console.log("========================\n");
    console.log("Contract Address:", MGP_TOKEN_ADDRESS);
    console.log("Checking Address:", addressToCheck);
    
    // Use amoy network provider
    const networkName = hre.network.name === 'hardhat' ? 'amoy' : hre.network.name;
    const rpcUrl = networkName === 'amoy' 
        ? "https://rpc-amoy.polygon.technology"
        : hre.config.networks[networkName]?.url || "http://localhost:8545";
    
    console.log("Network:", networkName);
    console.log("");

    // Get provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Get contract instance
    const mgpTokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function stakingBalance(address owner) view returns (uint256)",
        "function stakingTimestamp(address owner) view returns (uint256)",
        "function calculateReward(address user) view returns (uint256)",
        "function decimals() view returns (uint8)"
    ];
    
    const contract = new ethers.Contract(MGP_TOKEN_ADDRESS, mgpTokenABI, provider);
    
    try {
        // Get balances and staking info
        const walletBalance = await contract.balanceOf(addressToCheck);
        const stakedBalance = await contract.stakingBalance(addressToCheck);
        const stakeTimestamp = await contract.stakingTimestamp(addressToCheck);
        const currentRewards = await contract.calculateReward(addressToCheck);
        const decimals = await contract.decimals();
        
        const walletBalanceFormatted = ethers.formatUnits(walletBalance, decimals);
        const stakedBalanceFormatted = ethers.formatUnits(stakedBalance, decimals);
        const rewardsFormatted = ethers.formatUnits(currentRewards, decimals);
        
        console.log("💰 Wallet Balance:", walletBalanceFormatted, "MGP");
        console.log("🏦 Staked Balance:", stakedBalanceFormatted, "MGP");
        console.log("🎁 Current Rewards:", rewardsFormatted, "MGP");
        console.log("");
        
        if (stakedBalance > 0n) {
            // Calculate staking duration
            const currentTime = Math.floor(Date.now() / 1000);
            const stakedSince = Number(stakeTimestamp);
            const secondsStaked = currentTime - stakedSince;
            const daysStaked = secondsStaked / 86400;
            const hoursStaked = secondsStaked / 3600;
            
            console.log("📅 Staking Duration:");
            console.log("   Days:", daysStaked.toFixed(2));
            console.log("   Hours:", hoursStaked.toFixed(2));
            console.log("");
            
            // Calculate APR and projected rewards
            const apr = 5; // 5% APR
            const dailyRewardRate = apr / 365 / 100;
            const stakedAmount = parseFloat(stakedBalanceFormatted);
            const dailyReward = stakedAmount * dailyRewardRate;
            const yearlyReward = stakedAmount * (apr / 100);
            
            console.log("📈 Reward Projections:");
            console.log("   Daily Reward:", dailyReward.toFixed(4), "MGP");
            console.log("   Monthly Reward:", (dailyReward * 30).toFixed(2), "MGP");
            console.log("   Yearly Reward:", yearlyReward.toFixed(2), "MGP");
            console.log("");
            
            // Calculate time to next milestone
            const rewardsPer1000 = 1000 * dailyRewardRate;
            const daysTo10MGP = rewardsPer1000 > 0 ? 10 / rewardsPer1000 : 0;
            
            console.log("⏰ Time Estimates:");
            if (daysTo10MGP > 0 && daysTo10MGP < 365) {
                console.log("   Days until 10 MGP reward:", daysTo10MGP.toFixed(1));
            }
        } else {
            console.log("ℹ️  No tokens currently staked.");
            console.log("💡 To stake tokens, use the frontend or call stake() function.");
        }
        
    } catch (error) {
        console.error("❌ Error checking staking status:", error.message);
        if (error.reason) {
            console.error("Reason:", error.reason);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

