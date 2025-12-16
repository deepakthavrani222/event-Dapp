import { ethers } from 'ethers';
import { getBackendWallet, getProvider } from './provider';
import { BLOCKCHAIN_CONFIG } from './config';

/**
 * TicketAuction Contract ABI
 */
const AUCTION_ABI = [
  // Create auction with struct params
  'function createAuction(tuple(address ticketContract, uint256 tokenId, uint256 amount, uint256 startingBid, uint256 reservePrice, uint256 bidIncrement, uint256 duration, uint256 originalPrice) params, tuple(uint256 organizerRoyalty, uint256 artistRoyalty, address organizerWallet, address artistWallet) royalties) external returns (uint256)',
  
  // Bidding
  'function placeBid(uint256 _auctionId) external payable',
  
  // Settlement
  'function settleAuction(uint256 _auctionId) external',
  'function cancelAuction(uint256 _auctionId) external',
  'function emergencyCancel(uint256 _auctionId) external',
  
  // View functions
  'function getAuction(uint256 _auctionId) external view returns (tuple(address seller, address ticketContract, uint256 tokenId, uint256 amount, uint256 startingBid, uint256 reservePrice, uint256 currentBid, address currentBidder, uint256 bidIncrement, uint256 endTime, uint256 originalPrice, bool active, bool settled))',
  'function getMinNextBid(uint256 _auctionId) external view returns (uint256)',
  'function auctionCounter() external view returns (uint256)',
  'function activeBidCount(address) external view returns (uint256)',
  'function maxBidsPerWallet() external view returns (uint256)',
  
  // Events
  'event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 startingBid, uint256 endTime)',
  'event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount, uint256 newEndTime)',
  'event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 finalPrice)',
  'event AuctionCancelled(uint256 indexed auctionId)',
  'event BidRefunded(uint256 indexed auctionId, address indexed bidder, uint256 amount)',
];

/**
 * Get Auction contract instance
 */
export function getAuctionContract(signer?: ethers.Signer): ethers.Contract {
  const contractAddress = process.env.AUCTION_CONTRACT_ADDRESS || '';
  
  if (!contractAddress) {
    throw new Error('Auction contract address not configured');
  }
  
  const signerOrProvider = signer || getProvider();
  return new ethers.Contract(contractAddress, AUCTION_ABI, signerOrProvider);
}

/**
 * Check if auction contract is configured
 */
export function isAuctionConfigured(): boolean {
  return !!process.env.AUCTION_CONTRACT_ADDRESS;
}

export interface CreateAuctionParams {
  ticketContract: string;
  tokenId: string;
  amount: number;
  startingBidEth: number;
  reservePriceEth: number;
  bidIncrementEth: number;
  durationSeconds: number;
  originalPriceEth: number;
  organizerRoyalty: number; // basis points
  artistRoyalty: number; // basis points
  organizerWallet: string;
  artistWallet: string;
}

/**
 * Create auction on-chain
 */
export async function createAuctionOnChain(params: CreateAuctionParams): Promise<{
  auctionId: number;
  txHash: string;
  success: boolean;
}> {
  try {
    // Mock for testing without deployed contract
    if (!isAuctionConfigured()) {
      console.log('[MOCK] Creating auction:', params);
      return {
        auctionId: Math.floor(Math.random() * 1000000),
        txHash: `0x${Math.random().toString(16).substring(2)}`,
        success: true,
      };
    }

    const wallet = getBackendWallet();
    const contract = getAuctionContract(wallet);
    
    // Create struct params for the contract call
    const auctionParams = {
      ticketContract: params.ticketContract,
      tokenId: params.tokenId,
      amount: params.amount,
      startingBid: ethers.parseEther(params.startingBidEth.toString()),
      reservePrice: ethers.parseEther(params.reservePriceEth.toString()),
      bidIncrement: ethers.parseEther(params.bidIncrementEth.toString()),
      duration: params.durationSeconds,
      originalPrice: ethers.parseEther(params.originalPriceEth.toString()),
    };
    
    const royaltyConfig = {
      organizerRoyalty: params.organizerRoyalty,
      artistRoyalty: params.artistRoyalty,
      organizerWallet: params.organizerWallet || ethers.ZeroAddress,
      artistWallet: params.artistWallet || ethers.ZeroAddress,
    };
    
    const tx = await contract.createAuction(auctionParams, royaltyConfig);
    const receipt = await tx.wait();
    
    // Parse AuctionCreated event to get auctionId
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'AuctionCreated';
      } catch {
        return false;
      }
    });
    
    const parsedEvent = contract.interface.parseLog(event);
    const auctionId = Number(parsedEvent?.args[0] || 0);
    
    return {
      auctionId,
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error('Create auction error:', error);
    throw new Error(`Failed to create auction: ${error.message}`);
  }
}


/**
 * Place bid on-chain (called by user's wallet via frontend)
 * This returns the transaction data for the user to sign
 */
export async function getBidTransactionData(
  auctionId: number,
  bidAmountEth: number
): Promise<{
  to: string;
  data: string;
  value: string;
}> {
  const contractAddress = process.env.AUCTION_CONTRACT_ADDRESS || '';
  
  if (!contractAddress) {
    throw new Error('Auction contract address not configured');
  }
  
  const iface = new ethers.Interface(AUCTION_ABI);
  const data = iface.encodeFunctionData('placeBid', [auctionId]);
  
  return {
    to: contractAddress,
    data,
    value: ethers.parseEther(bidAmountEth.toString()).toString(),
  };
}

/**
 * Settle auction on-chain
 */
export async function settleAuctionOnChain(auctionId: number): Promise<{
  txHash: string;
  success: boolean;
}> {
  try {
    if (!isAuctionConfigured()) {
      console.log('[MOCK] Settling auction:', auctionId);
      return {
        txHash: `0x${Math.random().toString(16).substring(2)}`,
        success: true,
      };
    }

    const wallet = getBackendWallet();
    const contract = getAuctionContract(wallet);
    
    const tx = await contract.settleAuction(auctionId);
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error('Settle auction error:', error);
    throw new Error(`Failed to settle auction: ${error.message}`);
  }
}

/**
 * Cancel auction on-chain
 */
export async function cancelAuctionOnChain(auctionId: number): Promise<{
  txHash: string;
  success: boolean;
}> {
  try {
    if (!isAuctionConfigured()) {
      console.log('[MOCK] Cancelling auction:', auctionId);
      return {
        txHash: `0x${Math.random().toString(16).substring(2)}`,
        success: true,
      };
    }

    const wallet = getBackendWallet();
    const contract = getAuctionContract(wallet);
    
    const tx = await contract.cancelAuction(auctionId);
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      success: receipt.status === 1,
    };
  } catch (error: any) {
    console.error('Cancel auction error:', error);
    throw new Error(`Failed to cancel auction: ${error.message}`);
  }
}

/**
 * Get auction details from chain
 */
export async function getAuctionFromChain(auctionId: number): Promise<{
  seller: string;
  currentBid: string;
  currentBidder: string;
  endTime: number;
  active: boolean;
  settled: boolean;
} | null> {
  try {
    if (!isAuctionConfigured()) {
      return null;
    }

    const contract = getAuctionContract();
    const auction = await contract.getAuction(auctionId);
    
    return {
      seller: auction.seller,
      currentBid: ethers.formatEther(auction.currentBid),
      currentBidder: auction.currentBidder,
      endTime: Number(auction.endTime),
      active: auction.active,
      settled: auction.settled,
    };
  } catch (error: any) {
    console.error('Get auction error:', error);
    return null;
  }
}

/**
 * Get minimum next bid amount
 */
export async function getMinNextBid(auctionId: number): Promise<string> {
  try {
    if (!isAuctionConfigured()) {
      return '0';
    }

    const contract = getAuctionContract();
    const minBid = await contract.getMinNextBid(auctionId);
    return ethers.formatEther(minBid);
  } catch (error: any) {
    console.error('Get min bid error:', error);
    return '0';
  }
}

/**
 * Check user's active bid count
 */
export async function getUserActiveBidCount(walletAddress: string): Promise<number> {
  try {
    if (!isAuctionConfigured()) {
      return 0;
    }

    const contract = getAuctionContract();
    const count = await contract.activeBidCount(walletAddress);
    return Number(count);
  } catch (error: any) {
    console.error('Get bid count error:', error);
    return 0;
  }
}

/**
 * Get max bids per wallet
 */
export async function getMaxBidsPerWallet(): Promise<number> {
  try {
    if (!isAuctionConfigured()) {
      return 4; // Default
    }

    const contract = getAuctionContract();
    const max = await contract.maxBidsPerWallet();
    return Number(max);
  } catch (error: any) {
    console.error('Get max bids error:', error);
    return 4;
  }
}
