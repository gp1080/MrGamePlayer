const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MGPChip", function () {
  let chipContract;
  let platformContract;
  let owner;
  let player1;
  let player2;

  beforeEach(async function () {
    [owner, platformContract, player1, player2] = await ethers.getSigners();

    const MGPChip = await ethers.getContractFactory("MGPChip");
    chipContract = await MGPChip.deploy("https://api.mrgameplayer.com/chip/metadata.json");
    await chipContract.deployed();

    // Set platform contract
    await chipContract.setPlatformContract(platformContract.address);
  });

  describe("Deployment", function () {
    it("Should have correct token ID", async function () {
      expect(await chipContract.CHIP_TOKEN_ID()).to.equal(1);
    });

    it("Should set platform contract correctly", async function () {
      expect(await chipContract.platformContract()).to.equal(platformContract.address);
    });
  });

  describe("Minting", function () {
    it("Should allow platform to mint chips", async function () {
      await chipContract.connect(platformContract).mint(player1.address, ethers.utils.parseEther("100"));
      
      const balance = await chipContract.balanceOfChips(player1.address);
      expect(balance).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should not allow non-platform to mint", async function () {
      await expect(
        chipContract.connect(player1).mint(player2.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("MGPChip: Only platform can mint");
    });

    it("Should not allow minting to zero address", async function () {
      await expect(
        chipContract.connect(platformContract).mint(ethers.constants.AddressZero, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("MGPChip: Cannot mint to zero address");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await chipContract.connect(platformContract).mint(player1.address, ethers.utils.parseEther("100"));
    });

    it("Should allow platform to burn chips", async function () {
      await chipContract.connect(platformContract).burn(player1.address, 1, ethers.utils.parseEther("50"));
      
      const balance = await chipContract.balanceOfChips(player1.address);
      expect(balance).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should allow player to burn their own chips", async function () {
      await chipContract.connect(player1).burn(player1.address, 1, ethers.utils.parseEther("25"));
      
      const balance = await chipContract.balanceOfChips(player1.address);
      expect(balance).to.equal(ethers.utils.parseEther("75"));
    });

    it("Should not allow burning invalid token ID", async function () {
      await expect(
        chipContract.connect(platformContract).burn(player1.address, 2, ethers.utils.parseEther("10"))
      ).to.be.revertedWith("MGPChip: Invalid token ID");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await chipContract.connect(platformContract).mint(player1.address, ethers.utils.parseEther("100"));
    });

    it("Should allow transferring chips between players", async function () {
      await chipContract.connect(player1).safeTransferFrom(
        player1.address,
        player2.address,
        1,
        ethers.utils.parseEther("50"),
        "0x"
      );

      expect(await chipContract.balanceOfChips(player1.address)).to.equal(ethers.utils.parseEther("50"));
      expect(await chipContract.balanceOfChips(player2.address)).to.equal(ethers.utils.parseEther("50"));
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause", async function () {
      await chipContract.pause();
      expect(await chipContract.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      await chipContract.connect(platformContract).mint(player1.address, ethers.utils.parseEther("100"));
      await chipContract.pause();

      await expect(
        chipContract.connect(player1).safeTransferFrom(
          player1.address,
          player2.address,
          1,
          ethers.utils.parseEther("50"),
          "0x"
        )
      ).to.be.revertedWith("Pausable: paused");
    });
  });
});

