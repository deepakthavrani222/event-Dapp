/**
 * Blockchain configuration for Polygon Mumbai testnet
 */

export const BLOCKCHAIN_CONFIG = {
  // Ethereum Sepolia Testnet (matching .env configuration)
  chainId: parseInt(process.env.ETHEREUM_CHAIN_ID || '11155111'),
  chainName: 'Ethereum Sepolia',
  rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  
  // Contract addresses (will be set after deployment)
  contracts: {
    ticketNFT: process.env.TICKET_NFT_CONTRACT_ADDRESS || '',
  },
  
  // Biconomy configuration for gasless transactions
  biconomy: {
    apiKey: process.env.BICONOMY_API_KEY || '',
    paymasterUrl: process.env.BICONOMY_PAYMASTER_URL || 'https://paymaster.biconomy.io/api/v1/11155111',
  },
  
  // Gas settings
  gas: {
    maxFeePerGas: '50000000000', // 50 gwei
    maxPriorityFeePerGas: '30000000000', // 30 gwei
  },
};

/**
 * Check if blockchain is properly configured
 */
export function isBlockchainConfigured(): boolean {
  return !!(
    BLOCKCHAIN_CONFIG.rpcUrl &&
    BLOCKCHAIN_CONFIG.contracts.ticketNFT
  );
}

/**
 * Check if Biconomy is configured
 */
export function isBiconomyConfigured(): boolean {
  return !!(
    BLOCKCHAIN_CONFIG.biconomy.apiKey &&
    BLOCKCHAIN_CONFIG.biconomy.paymasterUrl
  );
}
