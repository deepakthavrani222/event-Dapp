/**
 * Deployment script for TicketNFT contract
 * Deploy to Polygon Mumbai testnet
 */

const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying TicketNFT contract...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH\n');

  // Deploy contract
  const TicketNFT = await ethers.getContractFactory('TicketNFT');
  
  // Base URI for metadata (can be IPFS or your API)
  const baseURI = process.env.NFT_BASE_URI || 'https://api.ticketchain.com/metadata/';
  
  console.log('Deploying TicketNFT with base URI:', baseURI);
  const ticketNFT = await TicketNFT.deploy(baseURI);
  
  await ticketNFT.waitForDeployment();
  const contractAddress = await ticketNFT.getAddress();
  
  console.log('\n✅ TicketNFT deployed to:', contractAddress);
  console.log('Transaction hash:', ticketNFT.deploymentTransaction().hash);
  
  // Wait for confirmations
  console.log('\n⏳ Waiting for confirmations...');
  await ticketNFT.deploymentTransaction().wait(5);
  console.log('✅ Confirmed!\n');
  
  // Grant MINTER_ROLE to backend wallet
  const backendWallet = process.env.BACKEND_WALLET_ADDRESS;
  if (backendWallet) {
    console.log('Granting MINTER_ROLE to backend wallet:', backendWallet);
    const MINTER_ROLE = await ticketNFT.MINTER_ROLE();
    const tx = await ticketNFT.grantRole(MINTER_ROLE, backendWallet);
    await tx.wait();
    console.log('✅ MINTER_ROLE granted\n');
  }
  
  // Get network name
  const network = await deployer.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'sepolia' : network.name;
  
  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    contractAddress: contractAddress,
    deployer: deployer.address,
    baseURI: baseURI,
    deployedAt: new Date().toISOString(),
    transactionHash: ticketNFT.deploymentTransaction().hash,
  };
  
  console.log('📝 Deployment Info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('\n✅ Deployment info saved to deployment-info.json');
  
  // Verification instructions
  console.log('\n📋 To verify on Etherscan:');
  console.log(`npx hardhat verify --network ${networkName} ${contractAddress} "${baseURI}"`);
  
  console.log('\n🎉 Deployment complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
