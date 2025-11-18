const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const address = wallet.address;
  const latestNonce = await provider.getTransactionCount(address, 'latest');
  const pendingNonce = await provider.getTransactionCount(address, 'pending');
  const balance = await provider.getBalance(address);
  
  console.log('Wallet:', address);
  console.log('Balance:', ethers.formatEther(balance), 'MATIC');
  console.log('Latest confirmed nonce:', latestNonce);
  console.log('Pending nonce:', pendingNonce);
  console.log('');
  
  const stuckCount = pendingNonce - latestNonce;
  
  if (stuckCount === 0) {
    console.log('✅ No stuck transactions! Ready to deploy.');
    return;
  }
  
  console.log(`⚠️  Found ${stuckCount} stuck transaction(s) at nonces ${latestNonce} to ${pendingNonce - 1}`);
  console.log('Attempting to replace them with higher gas price transactions...\n');
  
  // Get current gas price and multiply by 1.5 for replacement
  const feeData = await provider.getFeeData();
  const baseGasPrice = feeData.gasPrice || ethers.parseUnits('30', 'gwei');
  const replacementGasPrice = (baseGasPrice * 150n) / 100n; // 50% higher
  
  console.log('Current gas price:', ethers.formatUnits(baseGasPrice, 'gwei'), 'gwei');
  console.log('Using replacement gas price:', ethers.formatUnits(replacementGasPrice, 'gwei'), 'gwei');
  console.log('');
  
  // Send replacement transactions for each stuck nonce
  for (let i = 0; i < stuckCount; i++) {
    const nonce = latestNonce + i;
    console.log(`Sending replacement transaction for nonce ${nonce}...`);
    
    try {
      // Send a transaction to ourselves with 0 value (just to replace the stuck one)
      const tx = await wallet.sendTransaction({
        to: address, // Send to ourselves
        value: 0,
        nonce: nonce,
        gasPrice: replacementGasPrice,
        gasLimit: 21000, // Standard transfer gas limit
      });
      
      console.log(`  ✓ Transaction sent: ${tx.hash}`);
      console.log(`  Waiting for confirmation...`);
      
      // Wait for just 1 confirmation (we don't need to wait for all)
      const receipt = await tx.wait(1);
      console.log(`  ✓ Confirmed in block ${receipt.blockNumber}\n`);
    } catch (error) {
      console.log(`  ✗ Error replacing nonce ${nonce}:`, error.message);
      console.log(`  (This might mean the transaction already confirmed)\n`);
    }
  }
  
  console.log('Checking final status...');
  const finalLatest = await provider.getTransactionCount(address, 'latest');
  const finalPending = await provider.getTransactionCount(address, 'pending');
  const finalStuck = finalPending - finalLatest;
  
  if (finalStuck === 0) {
    console.log('✅ All stuck transactions cleared! Ready to deploy.');
    console.log('Run: npx hardhat run scripts/deploy.js --network amoy');
  } else {
    console.log(`⚠️  Still ${finalStuck} pending transaction(s).`);
    console.log('You may need to wait a bit longer or try again.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

