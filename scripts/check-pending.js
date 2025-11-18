const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const address = '0xB7365DC18a2386ce68724cc76c0c22731455B509';
  
  const latestNonce = await provider.getTransactionCount(address, 'latest');
  const pendingNonce = await provider.getTransactionCount(address, 'pending');
  const balance = await provider.getBalance(address);
  
  console.log('Wallet address:', address);
  console.log('Balance:', ethers.formatEther(balance), 'MATIC');
  console.log('Latest confirmed nonce:', latestNonce);
  console.log('Pending nonce:', pendingNonce);
  console.log('Pending transactions:', pendingNonce - latestNonce);
  
  if (pendingNonce > latestNonce) {
    console.log('\n⚠️  You have', pendingNonce - latestNonce, 'pending transaction(s)');
    console.log('These need to be confirmed before deploying.');
    console.log('\nSolutions:');
    console.log('1. Wait for pending transactions to confirm');
    console.log('2. Get more MATIC from the faucet: https://faucet.polygon.technology/');
    console.log('3. Check your wallet on Polygonscan: https://amoy.polygonscan.com/address/' + address);
  } else {
    console.log('\n✅ No pending transactions. Ready to deploy!');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

