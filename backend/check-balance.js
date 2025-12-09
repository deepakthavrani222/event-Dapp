const { ethers } = require('ethers');
require('dotenv').config();

async function checkBalance() {
  const address = process.env.BACKEND_WALLET_ADDRESS || '0x2688afa324cfee19eae07667ad62cf0418abe046';
  const networkName = 'Ethereum Sepolia';
  const currency = 'ETH';
  
  // Multiple RPC endpoints for reliability
  const rpcEndpoints = [
    'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc2.sepolia.org',
    'https://sepolia.gateway.tenderly.co',
    'https://rpc.sepolia.org',
  ];
  
  console.log(`🔍 Checking ${networkName} Testnet Balance...\n`);
  console.log('Address:', address);
  console.log('Network:', networkName, 'Testnet\n');
  
  let lastError;
  for (const rpc of rpcEndpoints) {
    try {
      console.log('Trying RPC:', rpc);
      const provider = new ethers.JsonRpcProvider(rpc, null, { timeout: 10000 });
      const balance = await provider.getBalance(address);
      const balanceInEther = ethers.formatEther(balance);
      
      console.log('💰 Balance:', balanceInEther, currency);
      
      if (parseFloat(balanceInEther) === 0) {
        console.log(`\n❌ No ${currency} found!`);
        console.log('\n📝 To get test ETH:');
        console.log('1. Visit: https://sepoliafaucet.com/');
        console.log('   OR: https://www.alchemy.com/faucets/ethereum-sepolia');
        console.log('   OR: https://faucet.quicknode.com/ethereum/sepolia');
        console.log('2. Paste address:', address);
        console.log('3. Complete captcha/login');
        console.log('4. Wait 1-2 minutes\n');
      } else if (parseFloat(balanceInEther) < 0.01) {
        console.log(`\n⚠️  Low balance! Get more ${currency} from faucet.`);
        console.log(`You need at least 0.01 ${currency} to deploy.\n`);
      } else {
        console.log('\n✅ Sufficient balance for deployment!');
        console.log('You can now run: npm run contract:deploy:sepolia\n');
      }
      return; // Success, exit
    } catch (error) {
      lastError = error;
      console.log('Failed, trying next RPC...\n');
    }
  }
  
  console.error('❌ All RPCs failed. Last error:', lastError?.message);
  console.log('\n💡 Try deploying directly - the deployment script has backup RPCs.');
}

checkBalance();
