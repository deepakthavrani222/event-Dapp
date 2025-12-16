/**
 * Deployment script for TicketNFT contract
 * Deploy to Sepolia testnet
 * 
 * Updated: Now includes platform wallet for ETH payment splitting
 */

const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 Deploying TicketNFT contract with ETH payment support...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH\n');

  // Check if we have enough balance
  if (balance < ethers.parseEther('0.01')) {
    console.error('❌ Insufficient balance! Need at least 0.01 ETH for deployment.');
    console.log('Get Sepolia ETH from: https://sepoliafaucet.com/');
    process.exit(1);
  }

  // Deploy contract
  const TicketNFT = await ethers.getContractFactory('TicketNFT');
  
  // Base URI for metadata (can be IPFS or your API)
  const baseURI = process.env.NFT_BASE_URI || 'https://api.ticketchain.com/metadata/';
  
  // Platform wallet - receives 5% of all ticket sales
  // Use deployer address as default platform wallet
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  
  console.log('Deploying TicketNFT with:');
  console.log('  Base URI:', baseURI);
  console.log('  Platform Wallet:', platformWallet);
  console.log('');

  const ticketNFT = await TicketNFT.deploy(baseURI, platformWallet);
  
  await ticketNFT.waitForDeployment();
  const contractAddress = await ticketNFT.getAddress();
  
  console.log('\n✅ TicketNFT deployed to:', contractAddress);
  console.log('Transaction hash:', ticketNFT.deploymentTransaction().hash);
  
  // Wait for confirmations
  console.log('\n⏳ Waiting for confirmations...');
  await ticketNFT.deploymentTransaction().wait(3);
  console.log('✅ Confirmed!\n');
  
  // Grant MINTER_ROLE to backend wallet (if different from deployer)
  const backendWallet = process.env.BACKEND_WALLET_ADDRESS;
  if (backendWallet && backendWallet !== deployer.address) {
    console.log('Granting MINTER_ROLE to backend wallet:', backendWallet);
    const MINTER_ROLE = await ticketNFT.MINTER_ROLE();
    const tx = await ticketNFT.grantRole(MINTER_ROLE, backendWallet);
    await tx.wait();
    console.log('✅ MINTER_ROLE granted\n');
  }

  // Grant PRICE_MANAGER_ROLE to deployer
  console.log('Granting PRICE_MANAGER_ROLE to deployer...');
  const PRICE_MANAGER_ROLE = await ticketNFT.PRICE_MANAGER_ROLE();
  const priceTx = await ticketNFT.grantRole(PRICE_MANAGER_ROLE, deployer.address);
  await priceTx.wait();
  console.log('✅ PRICE_MANAGER_ROLE granted\n');
  
  // Get network name
  const network = await deployer.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'sepolia' : network.name;
  
  // Get platform fee
  const platformFee = await ticketNFT.platformFeePercent();
  
  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: Number(network.chainId),
    contractName: 'TicketNFT',
    contractAddress: contractAddress,
    platformWallet: platformWallet,
    platformFeePercent: Number(platformFee) / 100, // Convert basis points to percent
    deployer: deployer.address,
    baseURI: baseURI,
    deployedAt: new Date().toISOString(),
    transactionHash: ticketNFT.deploymentTransaction().hash,
    features: [
      'ERC-1155 Multi-token',
      'ETH Payment with purchaseTicket()',
      '5% Platform Fee',
      '95% to Organizer',
      'Royalty Support (ERC-2981)',
      'Pausable',
      'Access Control'
    ]
  };
  
  console.log('📝 Deployment Info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file
  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('\n✅ Deployment info saved to deployment-info.json');

  // Create .env update instructions
  console.log('\n📋 Update your .env files with:');
  console.log('─'.repeat(50));
  console.log(`NEXT_PUBLIC_TICKET_NFT_CONTRACT=${contractAddress}`);
  console.log(`NEXT_PUBLIC_PLATFORM_WALLET=${platformWallet}`);
  console.log('─'.repeat(50));
  
  // Verification instructions
  console.log('\n📋 To verify on Etherscan:');
  console.log(`npx hardhat verify --network ${networkName} ${contractAddress} "${baseURI}" "${platformWallet}"`);
  
  console.log('\n🎉 Deployment complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Update frontend/.env with NEXT_PUBLIC_TICKET_NFT_CONTRACT');
  console.log('2. Update backend/.env with contract address');
  console.log('3. Connect admin wallet in dashboard to set platform wallet');
  console.log('4. Create events with organizer wallet addresses');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
