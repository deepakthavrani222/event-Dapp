/**
 * Web3 Configuration
 */

export const WEB3_CONFIG = {
  // Supported Networks
  networks: {
    sepolia: {
      chainId: '0xaa36a7', // 11155111 in hex
      chainName: 'Sepolia Testnet',
      nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
    polygon: {
      chainId: '0x89', // 137 in hex
      chainName: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
    mumbai: {
      chainId: '0x13881', // 80001 in hex
      chainName: 'Polygon Mumbai',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
      blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    },
  },
  
  // Default network
  defaultNetwork: 'sepolia',
  
  // Contract addresses (update after deployment)
  contracts: {
    ticketNFT: process.env.NEXT_PUBLIC_TICKET_NFT_CONTRACT || '',
  },
  
  // Platform wallet for receiving payments
  platformWallet: process.env.NEXT_PUBLIC_PLATFORM_WALLET || '0x742d35Cc6634C0532925a3b844Bc9e7595f5bE21',
};

// ETH to INR conversion (approximate, should use API in production)
export const ETH_TO_INR = 300000; // 1 ETH = ₹3,00,000 (update as needed)

export function weiToEth(wei: bigint | string): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  return (Number(weiValue) / 1e18).toFixed(6);
}

export function ethToWei(eth: number | string): bigint {
  const ethValue = typeof eth === 'string' ? parseFloat(eth) : eth;
  return BigInt(Math.floor(ethValue * 1e18));
}

export function inrToEth(inr: number): number {
  return inr / ETH_TO_INR;
}

export function ethToInr(eth: number): number {
  return eth * ETH_TO_INR;
}
