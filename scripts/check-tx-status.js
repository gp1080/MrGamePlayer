const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const address = '0xB7365DC18a2386ce68724cc76c0c22731455B509';
  
  const latestNonce = await provider.getTransactionCount(address, 'latest');
  const pendingNonce = await provider.getTransactionCount(address, 'pending');
  
  console.log('Checking pending transactions...\n');
  
  for (let nonce = latestNonce; nonce < pendingNonce; nonce++) {
    // Try to find the transaction by nonce
    const blockNumber = await provider.getBlockNumber();
    console.log(`Checking nonce ${nonce}...`);
    
    // We can't directly query by nonce, but we can check recent blocks
    // For now, just show the nonce range
  }
  
  console.log(`\nPending nonces: ${latestNonce} to ${pendingNonce - 1}`);
  console.log('\nView your wallet on Polygonscan:');
  console.log(`https://amoy.polygonscan.com/address/${address}`);
  console.log('\nCheck the "Internal Txns" and "Transactions" tabs for pending transactions.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

