import { ethers } from 'ethers';
import { getBackendWallet, getProvider } from './provider';
import { BLOCKCHAIN_CONFIG } from './config';

/**
 * ERC-1155 Ticket NFT Contract ABI (minimal interface)
 * Full contract will be deployed in Task 6
 */
const TICKET_NFT_ABI = [
  // Mint function
  'function mint(address to, uint256 id, uint256 amount, bytes data) external',
  'function mintBatch(address to, uint256[] ids, uint256[] amounts, bytes data) external',
  
  // Transfer functions
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data) external',
  
  // Balance queries
  'function balanceOf(address account, uint256 id) external view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) external view returns (uint256[])',
  
  // Burn function
  'function burn(address from, uint256 id, uint256 amount) external',
  
  // Events
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
];

/**
 * Get Ticket NFT contract instance
 */
export function getTicketNFTContract(signer?: ethers.Signer): ethers.Contract {
  const contractAddress = BLOCKCHAIN_CONFIG.contracts.ticketNFT;
  
  if (!contractAddress) {
    throw new Error('Ticket NFT contract address not configured');
  }
  
  const signerOrProvider = signer || getProvider();
  return new ethers.Contract(contractAddress, TICKET_NFT_ABI, signerOrProvider);
}

/**
 * Mint tickets (gasless via Biconomy in production)
 * For testing: uses backend wallet to pay gas
 */
export async function mintTickets(
  toAddress: string,
  tokenId: string,
  amount: number
): Promise<{ txHash: string; success: boolean }> {
  try {
    // Convert large tokenIds to smaller blockchain-safe values
    let safeTokenId = tokenId;
    if (tokenId.length > 10) {
      // Hash large tokenId to create smaller value
      const hash = tokenId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      safeTokenId = Math.abs(hash % 1000000000).toString(); // Max 9 digits
      console.log(`[BLOCKCHAIN] Converting large tokenId ${tokenId} -> ${safeTokenId}`);
    }

    // For testing without deployed contract
    if (!BLOCKCHAIN_CONFIG.contracts.ticketNFT) {
      console.log('[MOCK] Minting tickets:', { toAddress, tokenId: safeTokenId, amount });
      return {
        txHash: `0x${Math.random().toString(16).substring(2)}`,
        success: true,
      };
    }

    const wallet = getBackendWallet();
    const contract = getTicketNFTContract(wallet);
    
    const tx = await contract.mint(
      toAddress,
      safeTokenId,
      amount,
      '0x' // empty data
    );
    
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error('Mint error:', error);
    throw new Error(`Failed to mint tickets: ${error.message}`);
  }
}

/**
 * Mint multiple ticket types in batch
 */
export async function mintTicketsBatch(
  toAddress: string,
  tokenIds: string[],
  amounts: number[]
): Promise<{ txHash: string; success: boolean }> {
  try {
    // For testing without deployed contract
    if (!BLOCKCHAIN_CONFIG.contracts.ticketNFT) {
      console.log('[MOCK] Batch minting tickets:', { toAddress, tokenIds, amounts });
      return {
        txHash: `0x${Math.random().toString(16).substring(2)}`,
        success: true,
      };
    }

    const wallet = getBackendWallet();
    const contract = getTicketNFTContract(wallet);
    
    const tx = await contract.mintBatch(
      toAddress,
      tokenIds,
      amounts,
      '0x'
    );
    
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error('Batch mint error:', error);
    throw new Error(`Failed to batch mint tickets: ${error.message}`);
  }
}

/**
 * Transfer ticket to another address
 */
export async function transferTicket(
  fromAddress: string,
  toAddress: string,
  tokenId: string,
  amount: number = 1
): Promise<{ txHash: string; success: boolean }> {
  try {
    // For testing without deployed contract
    if (!BLOCKCHAIN_CONFIG.contracts.ticketNFT) {
      console.log('[MOCK] Transferring ticket:', { fromAddress, toAddress, tokenId, amount });
      return {
        txHash: `0x${Math.random().toString(16).substring(2)}`,
        success: true,
      };
    }

    const wallet = getBackendWallet();
    const contract = getTicketNFTContract(wallet);
    
    const tx = await contract.safeTransferFrom(
      fromAddress,
      toAddress,
      tokenId,
      amount,
      '0x'
    );
    
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error('Transfer error:', error);
    throw new Error(`Failed to transfer ticket: ${error.message}`);
  }
}

/**
 * Burn ticket (for refunds)
 */
export async function burnTicket(
  fromAddress: string,
  tokenId: string,
  amount: number = 1
): Promise<{ txHash: string; success: boolean }> {
  try {
    // For testing without deployed contract
    if (!BLOCKCHAIN_CONFIG.contracts.ticketNFT) {
      console.log('[MOCK] Burning ticket:', { fromAddress, tokenId, amount });
      return {
        txHash: `0x${Math.random().toString(16).substring(2)}`,
        success: true,
      };
    }

    const wallet = getBackendWallet();
    const contract = getTicketNFTContract(wallet);
    
    const tx = await contract.burn(fromAddress, tokenId, amount);
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error('Burn error:', error);
    throw new Error(`Failed to burn ticket: ${error.message}`);
  }
}

/**
 * Get ticket balance for an address
 */
export async function getTicketBalance(
  ownerAddress: string,
  tokenId: string
): Promise<number> {
  try {
    // For testing without deployed contract
    if (!BLOCKCHAIN_CONFIG.contracts.ticketNFT) {
      console.log('[MOCK] Getting ticket balance:', { ownerAddress, tokenId });
      return 0;
    }

    const contract = getTicketNFTContract();
    const balance = await contract.balanceOf(ownerAddress, tokenId);
    return Number(balance);
  } catch (error: any) {
    console.error('Balance query error:', error);
    return 0;
  }
}

/**
 * Verify ticket ownership
 */
export async function verifyTicketOwnership(
  ownerAddress: string,
  tokenId: string
): Promise<boolean> {
  const balance = await getTicketBalance(ownerAddress, tokenId);
  return balance > 0;
}
