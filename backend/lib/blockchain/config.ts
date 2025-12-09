/**
 * Blockchain configuration for Polygon Mumbai testnet
 */

export const BLOCKCHAIN_CONFIG = {
  // Polygon Mumbai Testnet
  chainId: 80001,
  chainName: 'Polygon Mumbai',
  rpcUrl: process.env.POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  blockExplorer: 'https://mumbai.polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  
  // Contract addresses (will be set after deployment)
  contracts: {
    ticketNFT: process.env.TICKET_NFT_CONTRACT_ADDRESS || '',
  },
  
  // Biconomy configuration for gasless transactions
  biconomy: {
    apiKey: process.env.BICONOMY_API_KEY || '',
    paymasterUrl: process.env.BICONOMY_PAYMASTER_URL || 'https://paymaster.biconomy.io/api/v1/80001',
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
