const { ethers } = require('ethers');
require('dotenv').config();

async function checkStatus() {
  const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
  const address = '0xB7365DC18a2386ce68724cc76c0c22731455B509';
  
  const latestNonce = await provider.getTransactionCount(address, 'latest');
  const pendingNonce = await provider.getTransactionCount(address, 'pending');
  const balance = await provider.getBalance(address);
  
  const pendingCount = pendingNonce - latestNonce;
  
  console.log('═══════════════════════════════════════');
  console.log('  Deployment Status Check');
  console.log('═══════════════════════════════════════');
  console.log('Wallet:', address);
  console.log('Balance:', ethers.formatEther(balance), 'MATIC');
  console.log('Latest confirmed nonce:', latestNonce);
  console.log('Pending nonce:', pendingNonce);
  console.log('Pending transactions:', pendingCount);
  console.log('═══════════════════════════════════════\n');
  
  if (pendingCount === 0) {
    console.log('✅ READY TO DEPLOY!');
    console.log('Run: npx hardhat run scripts/deploy.js --network amoy\n');
    return true;
  } else {
    console.log('⏳ Still waiting for', pendingCount, 'transaction(s) to confirm...');
    console.log('Check Polygonscan: https://amoy.polygonscan.com/address/' + address + '\n');
    return false;
  }
}

async function main() {
  const ready = await checkStatus();
  
  if (!ready) {
    console.log('Tip: Run this script again in a few minutes to check status.');
    console.log('Command: node scripts/monitor-pending.js\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

