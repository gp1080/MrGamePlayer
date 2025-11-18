const hre = require("hardhat");

async function main() {
  // Contract address from your deployment
  const CONTRACT_ADDRESS = "0x3348eBC528b8054d0c76d3a62Bb307E1472aC023";
  
  // Get the contract
  const RaceToken = await hre.ethers.getContractFactory("RaceToken");
  const raceToken = RaceToken.attach(CONTRACT_ADDRESS);

  // Get signers (accounts)
  const [owner, addr1] = await hre.ethers.getSigners();

  console.log("Testing RaceToken contract...");
  console.log("Owner address:", owner.address);

  try {
    // Purchase tokens
    console.log("\nPurchasing tokens...");
    const purchaseTx = await raceToken.purchaseTokens({
      value: hre.ethers.parseEther("0.01")
    });
    await purchaseTx.wait();
    console.log("Tokens purchased!");

    // Check balance
    const balance = await raceToken.balanceOf(owner.address);
    console.log("\nCurrent balance:", hre.ethers.formatEther(balance), "RACE");

    // Transfer tokens
    if (addr1) {
      console.log("\nTransferring tokens...");
      const transferTx = await raceToken.transfer(
        addr1.address,
        hre.ethers.parseEther("1")
      );
      await transferTx.wait();
      console.log("Transferred 1 RACE to:", addr1.address);

      // Check balances after transfer
      const ownerBalance = await raceToken.balanceOf(owner.address);
      const addr1Balance = await raceToken.balanceOf(addr1.address);
      console.log("\nOwner balance:", hre.ethers.formatEther(ownerBalance), "RACE");
      console.log("Recipient balance:", hre.ethers.formatEther(addr1Balance), "RACE");
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 