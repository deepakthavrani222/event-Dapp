/**
 * Generate unique ERC-1155 token ID
 * Format: timestamp + random number
 */
export function generateTokenId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000000);
  
  // Combine timestamp and random for uniqueness
  const tokenId = `${timestamp}${random}`;
  
  return tokenId;
}

/**
 * Validate token ID format
 */
export function isValidTokenId(tokenId: string): boolean {
  return /^\d+$/.test(tokenId) && tokenId.length > 10;
}
