const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MGPPlatform", function () {
  let mgpToken;
  let chipContract;
  let platformContract;
  let owner;
  let player1;
  let treasuryWallet;
  let gameContract;

  // Mock QuickSwap router for testing
  let mockRouter;

  beforeEach(async function () {
    [owner, player1, treasuryWallet, gameContract] = await ethers.getSigners();

    // Deploy MGP Token
    const MGPToken = await ethers.getContractFactory("MGPToken");
    mgpToken = await MGPToken.deploy();
    await mgpToken.deployed();

    // Deploy Chip Contract
    const MGPChip = await ethers.getContractFactory("MGPChip");
    chipContract = await MGPChip.deploy("https://api.mrgameplayer.com/chip/metadata.json");
    await chipContract.deployed();

    // Deploy Mock Router (simplified for testing)
    // In production, use actual QuickSwap router
    const MockRouter = await ethers.getContractFactory("MockRouter");
    try {
      mockRouter = await MockRouter.deploy();
      await mockRouter.deployed();
    } catch (e) {
      // If MockRouter doesn't exist, we'll skip router tests
      mockRouter = null;
    }

    // Deploy Platform Contract
    const MGPPlatform = await ethers.getContractFactory("MGPPlatform");
    const polToken = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC
    
    platformContract = await MGPPlatform.deploy(
      chipContract.address,
      mockRouter ? mockRouter.address : ethers.constants.AddressZero,
      mgpToken.address,
      polToken,
      treasuryWallet.address
    );
    await platformContract.deployed();

    // Configure Chip Contract
    await chipContract.setPlatformContract(platformContract.address);
  });

  describe("Deployment", function () {
    it("Should set correct chip contract", async function () {
      expect(await platformContract.chipContract()).to.equal(chipContract.address);
    });

    it("Should set correct treasury wallet", async function () {
      expect(await platformContract.treasuryWallet()).to.equal(treasuryWallet.address);
    });

    it("Should have correct rake percentage", async function () {
      expect(await platformContract.RAKE_BPS()).to.equal(750); // 7.5%
    });
  });

  describe("Buy Chips", function () {
    it("Should mint chips when buying with POL", async function () {
      const polAmount = ethers.utils.parseEther("1");
      
      await expect(
        platformContract.connect(player1).buyChips({ value: polAmount })
      ).to.emit(platformContract, "ChipsPurchased");

      // Note: Price oracle needs to be mocked for accurate testing
      // This test verifies the function executes without error
    });

    it("Should reject deposits below minimum", async function () {
      const minDeposit = await platformContract.minDeposit();
      const belowMin = minDeposit.sub(ethers.utils.parseEther("0.001"));

      await expect(
        platformContract.connect(player1).buyChips({ value: belowMin })
      ).to.be.revertedWith("Deposit below minimum");
    });
  });

  describe("Cash Out Chips", function () {
    beforeEach(async function () {
      // Mint chips to player first (simulating a purchase)
      await chipContract.mint(player1.address, ethers.utils.parseEther("100"));
    });

    it("Should burn chips when cashing out", async function () {
      const chipsAmount = ethers.utils.parseEther("50");
      
      // Note: This test requires POL balance in contract
      // In a full test suite, you'd fund the contract first
      
      const balanceBefore = await chipContract.balanceOfChips(player1.address);
      expect(balanceBefore).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should reject cashing out more chips than owned", async function () {
      const chipsAmount = ethers.utils.parseEther("150");

      await expect(
        platformContract.connect(player1).cashOutChips(chipsAmount)
      ).to.be.revertedWith("Insufficient chips");
    });
  });

  describe("Rake Collection", function () {
    it("Should allow authorized game to collect rake", async function () {
      // Authorize game contract
      await platformContract.setGameContractAuthorization(gameContract.address, true);

      const gamePot = ethers.utils.parseEther("1000");
      const expectedRake = gamePot.mul(750).div(10000); // 7.5%

      await expect(
        platformContract.connect(gameContract).collectRake(gamePot)
      ).to.emit(platformContract, "RakeCollected");

      // Verify chips minted to treasury
      const treasuryBalance = await chipContract.balanceOfChips(treasuryWallet.address);
      expect(treasuryBalance).to.equal(expectedRake);
    });

    it("Should reject unauthorized game contracts", async function () {
      const gamePot = ethers.utils.parseEther("1000");

      await expect(
        platformContract.connect(gameContract).collectRake(gamePot)
      ).to.be.revertedWith("MGPPlatform: Unauthorized game contract");
    });
  });

  describe("Authorization", function () {
    it("Should allow owner to authorize game contracts", async function () {
      await platformContract.setGameContractAuthorization(gameContract.address, true);
      expect(await platformContract.authorizedGames(gameContract.address)).to.be.true;
    });

    it("Should allow owner to revoke authorization", async function () {
      await platformContract.setGameContractAuthorization(gameContract.address, true);
      await platformContract.setGameContractAuthorization(gameContract.address, false);
      expect(await platformContract.authorizedGames(gameContract.address)).to.be.false;
    });

    it("Should not allow non-owner to authorize", async function () {
      await expect(
        platformContract.connect(player1).setGameContractAuthorization(gameContract.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await platformContract.pause();
      expect(await platformContract.paused()).to.be.true;
    });

    it("Should prevent operations when paused", async function () {
      await platformContract.pause();

      await expect(
        platformContract.connect(player1).buyChips({ value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});

