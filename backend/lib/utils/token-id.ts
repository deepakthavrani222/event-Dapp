/**
 * Generate unique ERC-1155 token ID
 * Format: Simple incremental number with random component
 * Keeps numbers smaller for blockchain compatibility
 */
export function generateTokenId(): string {
  // Use last 6 digits of timestamp + 4 digit random
  // This creates 10-digit numbers which are blockchain-safe
  const timestamp = Date.now() % 1000000; // Last 6 digits
  const random = Math.floor(Math.random() * 10000); // 4 digits
  
  // Combine for uniqueness (10 digits max)
  const tokenId = `${timestamp}${random.toString().padStart(4, '0')}`;
  
  return tokenId;
}

/**
 * Validate token ID format
 */
export function isValidTokenId(tokenId: string): boolean {
  return /^\d+$/.test(tokenId) && tokenId.length > 10;
}
