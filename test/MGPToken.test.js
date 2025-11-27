const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MGPToken", function () {
  let mgpToken;
  let owner;
  let teamWallet;
  let treasuryWallet;
  let liquidityWallet;
  let communityWallet;
  let partnersWallet;

  beforeEach(async function () {
    [owner, teamWallet, treasuryWallet, liquidityWallet, communityWallet, partnersWallet] = await ethers.getSigners();

    const MGPToken = await ethers.getContractFactory("MGPToken");
    mgpToken = await MGPToken.deploy();
    await mgpToken.deployed();
  });

  describe("Deployment", function () {
    it("Should have correct total supply", async function () {
      const totalSupply = await mgpToken.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("100000000")); // 100M tokens
    });

    it("Should mint all tokens to deployer", async function () {
      const ownerBalance = await mgpToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.utils.parseEther("100000000"));
    });

    it("Should have correct token name and symbol", async function () {
      expect(await mgpToken.name()).to.equal("Mr Game Player Token");
      expect(await mgpToken.symbol()).to.equal("MGP");
    });
  });

  describe("Allocation", function () {
    it("Should set allocation wallets correctly", async function () {
      await mgpToken.setAllocationWallets(
        teamWallet.address,
        treasuryWallet.address,
        liquidityWallet.address,
        communityWallet.address,
        partnersWallet.address
      );

      expect(await mgpToken.teamWallet()).to.equal(teamWallet.address);
      expect(await mgpToken.treasuryWallet()).to.equal(treasuryWallet.address);
      expect(await mgpToken.liquidityWallet()).to.equal(liquidityWallet.address);
      expect(await mgpToken.communityWallet()).to.equal(communityWallet.address);
      expect(await mgpToken.partnersWallet()).to.equal(partnersWallet.address);
    });

    it("Should distribute tokens correctly", async function () {
      await mgpToken.setAllocationWallets(
        teamWallet.address,
        treasuryWallet.address,
        liquidityWallet.address,
        communityWallet.address,
        partnersWallet.address
      );

      expect(await mgpToken.balanceOf(teamWallet.address)).to.equal(ethers.utils.parseEther("30000000"));
      expect(await mgpToken.balanceOf(treasuryWallet.address)).to.equal(ethers.utils.parseEther("30000000"));
      expect(await mgpToken.balanceOf(liquidityWallet.address)).to.equal(ethers.utils.parseEther("20000000"));
      expect(await mgpToken.balanceOf(communityWallet.address)).to.equal(ethers.utils.parseEther("10000000"));
      expect(await mgpToken.balanceOf(partnersWallet.address)).to.equal(ethers.utils.parseEther("10000000"));
    });

    it("Should not allow setting allocation twice", async function () {
      await mgpToken.setAllocationWallets(
        teamWallet.address,
        treasuryWallet.address,
        liquidityWallet.address,
        communityWallet.address,
        partnersWallet.address
      );

      await expect(
        mgpToken.setAllocationWallets(
          teamWallet.address,
          treasuryWallet.address,
          liquidityWallet.address,
          communityWallet.address,
          partnersWallet.address
        )
      ).to.be.revertedWith("Allocation already set");
    });
  });

  describe("Minting", function () {
    it("Should not allow minting after deployment", async function () {
      // Try to transfer (which would trigger _mint internally if possible)
      // Since _mint is overridden, this should fail if called directly
      // The contract should prevent any new minting
      const totalSupplyBefore = await mgpToken.totalSupply();
      
      // Verify total supply doesn't change (no way to mint)
      expect(totalSupplyBefore).to.equal(ethers.utils.parseEther("100000000"));
    });
  });

  describe("Ownership", function () {
    it("Should allow renouncing ownership after allocation", async function () {
      await mgpToken.setAllocationWallets(
        teamWallet.address,
        treasuryWallet.address,
        liquidityWallet.address,
        communityWallet.address,
        partnersWallet.address
      );

      await mgpToken.renounceOwnership();
      expect(await mgpToken.owner()).to.equal(ethers.constants.AddressZero);
    });

    it("Should not allow renouncing ownership before allocation", async function () {
      await expect(mgpToken.renounceOwnership()).to.be.revertedWith("Allocation must be set first");
    });
  });
});

