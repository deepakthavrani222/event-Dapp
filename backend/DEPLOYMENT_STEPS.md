# 🚀 Smart Contract Deployment - Step by Step

## Your Wallet Information

**⚠️ IMPORTANT: This is a TEST wallet - Only use for Mumbai testnet!**

```
Address: 0xE5bcfDE82376DF5F566Aa9fE349285B462Ab62b0
Private Key: 0xe6459391a8112dbc779d54602ffde05d07d60eb44a1db84c134ef48005d202ec
```

**✅ Already configured in your .env file!**

---

## Step 1: Get Mumbai MATIC (Test Tokens)

### Option A: Polygon Faucet (Recommended)
1. Visit: https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Paste your address: `0xE5bcfDE82376DF5F566Aa9fE349285B462Ab62b0`
4. Click "Submit"
5. Wait 1-2 minutes for tokens

### Option B: Alchemy Faucet
1. Visit: https://mumbaifaucet.com/
2. Paste your address
3. Click "Send Me MATIC"

### Option C: QuickNode Faucet
1. Visit: https://faucet.quicknode.com/polygon/mumbai
2. Paste your address
3. Complete captcha
4. Receive 0.1 MATIC

**You need at least 0.01 MATIC to deploy (~$0.01 USD)**

---

## Step 2: Check Your Balance

```powershell
cd backend
node -e "const ethers = require('ethers'); const provider = new ethers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com'); provider.getBalance('0xE5bcfDE82376DF5F566Aa9fE349285B462Ab62b0').then(b => console.log('Balance:', ethers.formatEther(b), 'MATIC'));"
```

**Wait until you see at least 0.01 MATIC**

---

## Step 3: Deploy the Contract

```powershell
cd backend
npm run contract:deploy:mumbai
```

**Expected Output:**
```
🚀 Deploying TicketNFT contract...

Deploying with account: 0xE5bcfDE82376DF5F566Aa9fE349285B462Ab62b0
Account balance: 0.1 MATIC

Deploying TicketNFT with base URI: https://api.ticketchain.com/metadata/

✅ TicketNFT deployed to: 0x...
Transaction hash: 0x...

⏳ Waiting for confirmations...
✅ Confirmed!

Granting MINTER_ROLE to backend wallet: 0xE5bcfDE82376DF5F566Aa9fE349285B462Ab62b0
✅ MINTER_ROLE granted

📝 Deployment Info saved to deployment-info.json

🎉 Deployment complete!
```

---

## Step 4: Save Contract Address

After deployment, copy the contract address from the output and update your `.env`:

```
TICKET_NFT_CONTRACT_ADDRESS="0x..." # Paste the deployed address here
```

---

## Step 5: Verify on PolygonScan (Optional)

1. Get API key from https://polygonscan.com/apis
2. Update `.env`:
   ```
   POLYGONSCAN_API_KEY="your_api_key_here"
   ```
3. Run verification:
   ```powershell
   npm run contract:verify -- <CONTRACT_ADDRESS> "https://api.ticketchain.com/metadata/"
   ```

---

## Troubleshooting

### "Insufficient funds"
- Get more MATIC from faucet
- Wait a few minutes for tokens to arrive
- Check balance with Step 2 command

### "Nonce too low"
- Wait a few minutes
- Try again

### "Network error"
- Check internet connection
- Try different RPC: https://polygon-mumbai.g.alchemy.com/v2/demo

### "Module not found"
- Run: `npm install`
- Try again

---

## Quick Commands

```powershell
# Check balance
node -e "const ethers = require('ethers'); const provider = new ethers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com'); provider.getBalance('0xE5bcfDE82376DF5F566Aa9fE349285B462Ab62b0').then(b => console.log('Balance:', ethers.formatEther(b), 'MATIC'));"

# Deploy contract
npm run contract:deploy:mumbai

# Run tests
npm run contract:test

# Compile contract
npm run contract:compile
```

---

## After Deployment

1. ✅ Contract deployed to Mumbai
2. ✅ Update `.env` with contract address
3. ✅ Test minting from backend
4. ✅ View on PolygonScan: https://mumbai.polygonscan.com/address/YOUR_ADDRESS

---

## Security Notes

⚠️ **This is a TEST wallet for Mumbai testnet only!**
- Never use this private key on mainnet
- Never send real MATIC to this address
- Create a new wallet for production
- Use hardware wallet for mainnet

---

## Need Help?

Check these files:
- `SMART_CONTRACT_DEPLOYMENT.md` - Full deployment guide
- `SMART_CONTRACT_COMPLETE.md` - Contract documentation
- `hardhat.config.js` - Network configuration

---

**Ready to deploy? Follow the steps above!** 🚀
