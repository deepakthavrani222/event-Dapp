# Smart Contract Deployment Guide

## Overview
The TicketNFT smart contract is an ERC-1155 multi-token contract with:
- Multiple ticket types per event
- Supply management
- ERC-2981 royalty support
- Access control (MINTER_ROLE, PAUSER_ROLE)
- Pausable transfers
- Batch minting

---

## Prerequisites

### 1. Install Dependencies
```bash
cd backend
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

### 2. Get Polygon Mumbai Testnet MATIC
- Visit [Mumbai Faucet](https://faucet.polygon.technology/)
- Enter your wallet address
- Receive test MATIC

### 3. Get PolygonScan API Key
- Visit [PolygonScan](https://polygonscan.com/apis)
- Sign up and create API key
- Used for contract verification

---

## Configuration

### 1. Update .env File
```bash
# Deployer wallet private key (DO NOT COMMIT!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Backend wallet address (will receive MINTER_ROLE)
BACKEND_WALLET_ADDRESS=0x...

# RPC URLs
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC=https://polygon-rpc.com

# PolygonScan API key for verification
POLYGONSCAN_API_KEY=your_api_key_here

# NFT metadata base URI
NFT_BASE_URI=https://api.ticketchain.com/metadata/

# Contract address (after deployment)
TICKET_NFT_CONTRACT_ADDRESS=
```

### 2. Security Notes
⚠️ **IMPORTANT:**
- Never commit private keys to git
- Use environment variables
- Keep `.env` in `.gitignore`
- Use separate wallets for testnet/mainnet

---

## Deployment Steps

### 1. Compile Contract
```bash
cd backend
npx hardhat compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 2. Run Tests
```bash
npx hardhat test
```

Expected output:
```
  TicketNFT
    Deployment
      ✓ Should set the correct name and symbol
      ✓ Should grant DEFAULT_ADMIN_ROLE to deployer
    Token Creation
      ✓ Should create a new token type
      ✓ Should not allow duplicate token IDs
      ✓ Should not allow zero max supply
    Minting
      ✓ Should mint tickets to an address
      ✓ Should not exceed max supply
      ✓ Should not mint non-existent token
      ✓ Should mint batch of tickets
    Burning
      ✓ Should burn tickets
      ✓ Should not burn more than owned
    Royalties
      ✓ Should set royalty info
      ✓ Should calculate royalty correctly
      ✓ Should not allow royalty > 100%
    Pause
      ✓ Should pause and unpause
      ✓ Should not allow transfers when paused
      ✓ Should not allow minting when paused
    Supply Tracking
      ✓ Should track available supply
      ✓ Should update supply after burning

  18 passing
```

### 3. Deploy to Mumbai Testnet
```bash
npx hardhat run contracts/deploy.js --network mumbai
```

Expected output:
```
🚀 Deploying TicketNFT contract...

Deploying with account: 0x...
Account balance: 1.5 MATIC

Deploying TicketNFT with base URI: https://api.ticketchain.com/metadata/

✅ TicketNFT deployed to: 0x...
Transaction hash: 0x...

⏳ Waiting for confirmations...
✅ Confirmed!

Granting MINTER_ROLE to backend wallet: 0x...
✅ MINTER_ROLE granted

📝 Deployment Info:
{
  "network": "mumbai",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "baseURI": "https://api.ticketchain.com/metadata/",
  "deployedAt": "2025-12-09T...",
  "transactionHash": "0x..."
}

✅ Deployment info saved to deployment-info.json

📋 To verify on PolygonScan:
npx hardhat verify --network mumbai 0x... "https://api.ticketchain.com/metadata/"

🎉 Deployment complete!
```

### 4. Verify Contract on PolygonScan
```bash
npx hardhat verify --network mumbai <CONTRACT_ADDRESS> "https://api.ticketchain.com/metadata/"
```

---

## Post-Deployment

### 1. Update Backend Configuration
```bash
# Update .env with deployed contract address
TICKET_NFT_CONTRACT_ADDRESS=0x...
```

### 2. Update Backend Code
Replace mock blockchain functions with real contract calls:

```typescript
// backend/lib/blockchain/ticket-nft.ts
import { ethers } from 'ethers';
import TicketNFTABI from '../contracts/TicketNFT.json';

const provider = new ethers.providers.JsonRpcProvider(
  process.env.POLYGON_MUMBAI_RPC
);

const wallet = new ethers.Wallet(
  process.env.BACKEND_PRIVATE_KEY!,
  provider
);

const contract = new ethers.Contract(
  process.env.TICKET_NFT_CONTRACT_ADDRESS!,
  TicketNFTABI.abi,
  wallet
);

export async function mintTickets(
  toAddress: string,
  tokenId: string,
  amount: number
) {
  try {
    const tx = await contract.mint(toAddress, tokenId, amount);
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error('Mint error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
```

### 3. Test Integration
```bash
# Test minting from backend
curl -X POST http://localhost:3001/api/buyer/purchase \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "ticketTypeId": "...",
    "quantity": 1,
    "paymentMethod": "UPI"
  }'
```

---

## Contract Functions

### Admin Functions

#### Create Token Type
```javascript
await contract.createToken(
  tokenId,      // uint256: Unique token ID
  maxSupply,    // uint256: Maximum supply
  tokenURI      // string: Metadata URI
);
```

#### Set Royalty
```javascript
await contract.setRoyalty(
  tokenId,          // uint256: Token ID
  receiverAddress,  // address: Royalty receiver
  royaltyFraction   // uint96: Basis points (1000 = 10%)
);
```

#### Grant Minter Role
```javascript
const MINTER_ROLE = await contract.MINTER_ROLE();
await contract.grantRole(MINTER_ROLE, minterAddress);
```

### Minter Functions

#### Mint Tickets
```javascript
await contract.mint(
  toAddress,  // address: Recipient
  tokenId,    // uint256: Token ID
  amount      // uint256: Quantity
);
```

#### Mint Batch
```javascript
await contract.mintBatch(
  toAddress,   // address: Recipient
  [tokenId1, tokenId2],  // uint256[]: Token IDs
  [amount1, amount2]     // uint256[]: Amounts
);
```

### User Functions

#### Transfer Ticket
```javascript
await contract.safeTransferFrom(
  fromAddress,  // address: Sender
  toAddress,    // address: Recipient
  tokenId,      // uint256: Token ID
  amount,       // uint256: Quantity
  '0x'          // bytes: Data
);
```

#### Burn Ticket
```javascript
await contract.burn(
  fromAddress,  // address: Owner
  tokenId,      // uint256: Token ID
  amount        // uint256: Quantity
);
```

### View Functions

#### Get Balance
```javascript
const balance = await contract.balanceOf(ownerAddress, tokenId);
```

#### Get Total Supply
```javascript
const supply = await contract.totalSupply(tokenId);
```

#### Get Available Supply
```javascript
const available = await contract.availableSupply(tokenId);
```

#### Get Royalty Info
```javascript
const [receiver, amount] = await contract.royaltyInfo(tokenId, salePrice);
```

---

## Gas Optimization

### Estimated Gas Costs (Mumbai)

| Function | Gas Used | Cost (MATIC) |
|----------|----------|--------------|
| Deploy | ~3,500,000 | ~0.0035 |
| Create Token | ~100,000 | ~0.0001 |
| Mint Single | ~80,000 | ~0.00008 |
| Mint Batch (5) | ~200,000 | ~0.0002 |
| Transfer | ~50,000 | ~0.00005 |
| Burn | ~40,000 | ~0.00004 |

### Optimization Tips
1. Use batch minting for multiple tickets
2. Set royalties during token creation
3. Cache contract instances
4. Use multicall for read operations

---

## Mainnet Deployment

### Checklist
- [ ] All tests passing
- [ ] Contract audited (recommended)
- [ ] Sufficient MATIC for deployment (~$10)
- [ ] Backup private keys securely
- [ ] Update RPC to mainnet
- [ ] Update contract address in backend
- [ ] Test on testnet first

### Deploy to Polygon Mainnet
```bash
npx hardhat run contracts/deploy.js --network polygon
```

---

## Troubleshooting

### Insufficient Funds
```
Error: insufficient funds for intrinsic transaction cost
```
**Solution:** Get more MATIC from faucet or exchange

### Nonce Too Low
```
Error: nonce has already been used
```
**Solution:** Reset account nonce or wait for pending tx

### Contract Already Deployed
```
Error: contract already deployed at address
```
**Solution:** Use existing address or deploy to different network

### Verification Failed
```
Error: contract verification failed
```
**Solution:** 
- Check constructor arguments match
- Ensure contract is deployed
- Wait a few minutes and retry

---

## Security Best Practices

### Access Control
- ✅ Only MINTER_ROLE can mint
- ✅ Only ADMIN can set royalties
- ✅ Only PAUSER can pause
- ✅ Use multi-sig for admin role (production)

### Supply Management
- ✅ Max supply enforced
- ✅ Cannot mint beyond max
- ✅ Supply tracked accurately
- ✅ Burning reduces supply

### Reentrancy Protection
- ✅ ReentrancyGuard on mint functions
- ✅ Checks-Effects-Interactions pattern
- ✅ No external calls in critical sections

### Pausability
- ✅ Emergency pause function
- ✅ Prevents transfers when paused
- ✅ Admin can unpause

---

## Monitoring

### Track Contract Activity
- **PolygonScan:** https://mumbai.polygonscan.com/address/<CONTRACT_ADDRESS>
- **Events:** Monitor TokenCreated, TicketMinted, TicketBurned
- **Supply:** Track totalSupply and availableSupply
- **Royalties:** Monitor royalty payments

### Alerts
Set up alerts for:
- Large mints (potential abuse)
- Supply approaching max
- Unusual transfer patterns
- Failed transactions

---

## Support

### Resources
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/
- **Hardhat Docs:** https://hardhat.org/docs
- **Polygon Docs:** https://docs.polygon.technology/
- **ERC-1155 Standard:** https://eips.ethereum.org/EIPS/eip-1155
- **ERC-2981 Royalties:** https://eips.ethereum.org/EIPS/eip-2981

### Community
- **Polygon Discord:** https://discord.gg/polygon
- **OpenZeppelin Forum:** https://forum.openzeppelin.com/
- **Hardhat Discord:** https://discord.gg/hardhat

---

## Next Steps

1. ✅ Deploy to Mumbai testnet
2. ✅ Verify contract on PolygonScan
3. ✅ Test all functions
4. ✅ Integrate with backend
5. ✅ Test end-to-end flow
6. ⏳ Security audit (recommended)
7. ⏳ Deploy to mainnet
8. ⏳ Monitor and maintain

---

**Status:** Ready for deployment  
**Network:** Polygon Mumbai (Testnet)  
**Standard:** ERC-1155 + ERC-2981  
**Security:** Access Control + Pausable + ReentrancyGuard
