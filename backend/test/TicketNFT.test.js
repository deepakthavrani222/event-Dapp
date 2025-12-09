const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('TicketNFT', function () {
  let ticketNFT;
  let owner;
  let minter;
  let buyer;
  let addrs;

  const TOKEN_ID_1 = 1001;
  const TOKEN_ID_2 = 1002;
  const MAX_SUPPLY = 1000;
  const TOKEN_URI = 'ipfs://QmTest123/';

  beforeEach(async function () {
    [owner, minter, buyer, ...addrs] = await ethers.getSigners();

    const TicketNFT = await ethers.getContractFactory('TicketNFT');
    ticketNFT = await TicketNFT.deploy('https://api.ticketchain.com/metadata/');
    await ticketNFT.waitForDeployment();

    // Grant MINTER_ROLE to minter account
    const MINTER_ROLE = await ticketNFT.MINTER_ROLE();
    await ticketNFT.grantRole(MINTER_ROLE, minter.address);
  });

  describe('Deployment', function () {
    it('Should set the correct name and symbol', async function () {
      expect(await ticketNFT.name()).to.equal('TicketChain NFT');
      expect(await ticketNFT.symbol()).to.equal('TICKET');
    });

    it('Should grant DEFAULT_ADMIN_ROLE to deployer', async function () {
      const DEFAULT_ADMIN_ROLE = await ticketNFT.DEFAULT_ADMIN_ROLE();
      expect(await ticketNFT.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });
  });

  describe('Token Creation', function () {
    it('Should create a new token type', async function () {
      await expect(
        ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI)
      )
        .to.emit(ticketNFT, 'TokenCreated')
        .withArgs(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI);

      expect(await ticketNFT.maxSupply(TOKEN_ID_1)).to.equal(MAX_SUPPLY);
    });

    it('Should not allow duplicate token IDs', async function () {
      await ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI);

      await expect(
        ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI)
      ).to.be.revertedWith('Token already exists');
    });

    it('Should not allow zero max supply', async function () {
      await expect(
        ticketNFT.connect(minter).createToken(TOKEN_ID_1, 0, TOKEN_URI)
      ).to.be.revertedWith('Max supply must be greater than 0');
    });
  });

  describe('Minting', function () {
    beforeEach(async function () {
      await ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI);
    });

    it('Should mint tickets to an address', async function () {
      const amount = 5;

      await expect(
        ticketNFT.connect(minter).mint(buyer.address, TOKEN_ID_1, amount)
      )
        .to.emit(ticketNFT, 'TicketMinted')
        .withArgs(buyer.address, TOKEN_ID_1, amount);

      expect(await ticketNFT.balanceOf(buyer.address, TOKEN_ID_1)).to.equal(amount);
      expect(await ticketNFT['totalSupply(uint256)'](TOKEN_ID_1)).to.equal(amount);
    });

    it('Should not exceed max supply', async function () {
      await expect(
        ticketNFT.connect(minter).mint(buyer.address, TOKEN_ID_1, MAX_SUPPLY + 1)
      ).to.be.revertedWith('Exceeds max supply');
    });

    it('Should not mint non-existent token', async function () {
      await expect(
        ticketNFT.connect(minter).mint(buyer.address, 9999, 1)
      ).to.be.revertedWith('Token does not exist');
    });

    it('Should mint batch of tickets', async function () {
      await ticketNFT.connect(minter).createToken(TOKEN_ID_2, MAX_SUPPLY, TOKEN_URI);

      const tokenIds = [TOKEN_ID_1, TOKEN_ID_2];
      const amounts = [10, 20];

      await ticketNFT.connect(minter).mintBatch(buyer.address, tokenIds, amounts);

      expect(await ticketNFT.balanceOf(buyer.address, TOKEN_ID_1)).to.equal(10);
      expect(await ticketNFT.balanceOf(buyer.address, TOKEN_ID_2)).to.equal(20);
    });
  });

  describe('Burning', function () {
    beforeEach(async function () {
      await ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI);
      await ticketNFT.connect(minter).mint(buyer.address, TOKEN_ID_1, 10);
    });

    it('Should burn tickets', async function () {
      await expect(
        ticketNFT.connect(buyer).burn(buyer.address, TOKEN_ID_1, 5)
      )
        .to.emit(ticketNFT, 'TicketBurned')
        .withArgs(buyer.address, TOKEN_ID_1, 5);

      expect(await ticketNFT.balanceOf(buyer.address, TOKEN_ID_1)).to.equal(5);
      expect(await ticketNFT['totalSupply(uint256)'](TOKEN_ID_1)).to.equal(5);
    });

    it('Should not burn more than owned', async function () {
      await expect(
        ticketNFT.connect(buyer).burn(buyer.address, TOKEN_ID_1, 11)
      ).to.be.reverted;
    });
  });

  describe('Royalties', function () {
    beforeEach(async function () {
      await ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI);
    });

    it('Should set royalty info', async function () {
      const royaltyReceiver = addrs[0].address;
      const royaltyFraction = 1000; // 10%

      await expect(
        ticketNFT.setRoyalty(TOKEN_ID_1, royaltyReceiver, royaltyFraction)
      )
        .to.emit(ticketNFT, 'RoyaltySet')
        .withArgs(TOKEN_ID_1, royaltyReceiver, royaltyFraction);
    });

    it('Should calculate royalty correctly', async function () {
      const royaltyReceiver = addrs[0].address;
      const royaltyFraction = 1000; // 10%
      const salePrice = ethers.parseEther('1'); // 1 MATIC

      await ticketNFT.setRoyalty(TOKEN_ID_1, royaltyReceiver, royaltyFraction);

      const [receiver, amount] = await ticketNFT.royaltyInfo(TOKEN_ID_1, salePrice);

      expect(receiver).to.equal(royaltyReceiver);
      expect(amount).to.equal((salePrice * BigInt(royaltyFraction)) / BigInt(10000));
    });

    it('Should not allow royalty > 100%', async function () {
      await expect(
        ticketNFT.setRoyalty(TOKEN_ID_1, addrs[0].address, 10001)
      ).to.be.revertedWith('Royalty too high');
    });
  });

  describe('Pause', function () {
    beforeEach(async function () {
      await ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI);
      await ticketNFT.connect(minter).mint(buyer.address, TOKEN_ID_1, 10);
    });

    it('Should pause and unpause', async function () {
      await ticketNFT.pause();
      expect(await ticketNFT.paused()).to.be.true;

      await ticketNFT.unpause();
      expect(await ticketNFT.paused()).to.be.false;
    });

    it('Should not allow transfers when paused', async function () {
      await ticketNFT.pause();

      await expect(
        ticketNFT.connect(buyer).safeTransferFrom(
          buyer.address,
          addrs[0].address,
          TOKEN_ID_1,
          1,
          '0x'
        )
      ).to.be.revertedWithCustomError(ticketNFT, 'EnforcedPause');
    });

    it('Should not allow minting when paused', async function () {
      await ticketNFT.pause();

      await expect(
        ticketNFT.connect(minter).mint(buyer.address, TOKEN_ID_1, 1)
      ).to.be.revertedWithCustomError(ticketNFT, 'EnforcedPause');
    });
  });

  describe('Supply Tracking', function () {
    beforeEach(async function () {
      await ticketNFT.connect(minter).createToken(TOKEN_ID_1, MAX_SUPPLY, TOKEN_URI);
    });

    it('Should track available supply', async function () {
      expect(await ticketNFT.availableSupply(TOKEN_ID_1)).to.equal(MAX_SUPPLY);

      await ticketNFT.connect(minter).mint(buyer.address, TOKEN_ID_1, 100);
      expect(await ticketNFT.availableSupply(TOKEN_ID_1)).to.equal(MAX_SUPPLY - 100);
    });

    it('Should update supply after burning', async function () {
      await ticketNFT.connect(minter).mint(buyer.address, TOKEN_ID_1, 100);
      await ticketNFT.connect(buyer).burn(buyer.address, TOKEN_ID_1, 50);

      expect(await ticketNFT['totalSupply(uint256)'](TOKEN_ID_1)).to.equal(50);
      expect(await ticketNFT.availableSupply(TOKEN_ID_1)).to.equal(MAX_SUPPLY - 50);
    });
  });
});
