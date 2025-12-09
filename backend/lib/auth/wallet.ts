import { ethers } from 'ethers';

/**
 * Generate a new ERC-4337 smart wallet address
 * For testing: creates a deterministic wallet from user email/phone
 * In production: integrate with Web3Auth SDK
 */
export function generateSmartWallet(identifier: string): {
  address: string;
  privateKey: string;
} {
  // Create deterministic wallet from identifier (email/phone)
  const hash = ethers.keccak256(ethers.toUtf8Bytes(identifier));
  const wallet = new ethers.Wallet(hash);
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

/**
 * Verify wallet ownership (mock for testing)
 * In production: verify signature from Web3Auth
 */
export function verifyWalletOwnership(
  walletAddress: string,
  signature: string,
  message: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    return false;
  }
}

/**
 * Check if wallet address is valid
 */
export function isValidWalletAddress(address: string): boolean {
  return ethers.isAddress(address);
}
