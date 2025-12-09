/**
 * Property 12: Token ID Uniqueness (Extended)
 * Validates: Requirements 3.2
 * 
 * Property: Every ticket type must have a unique token ID
 * No two ticket types should ever have the same token ID
 */

import * as fc from 'fast-check';
import { generateTokenId, isValidTokenId } from '../lib/utils/token-id';

describe('Property 12: Token ID Uniqueness (Extended)', () => {
  test('should generate unique token IDs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 100 }),
        (count) => {
          const tokenIds = new Set<string>();
          
          for (let i = 0; i < count; i++) {
            const tokenId = generateTokenId();
            tokenIds.add(tokenId);
          }
          
          // All token IDs should be unique
          return tokenIds.size === count;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('should generate valid token ID format', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          const tokenId = generateTokenId();
          return isValidTokenId(tokenId);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('token IDs should be numeric strings', () => {
    for (let i = 0; i < 50; i++) {
      const tokenId = generateTokenId();
      expect(tokenId).toMatch(/^\d+$/);
      expect(tokenId.length).toBeGreaterThan(10);
    }
  });

  test('concurrent token ID generation should produce unique IDs', async () => {
    const promises = Array(20).fill(null).map(() => 
      Promise.resolve(generateTokenId())
    );
    
    const tokenIds = await Promise.all(promises);
    const uniqueIds = new Set(tokenIds);
    
    expect(uniqueIds.size).toBe(tokenIds.length);
  });

  test('token IDs should be different even when generated rapidly', () => {
    const tokenIds: string[] = [];
    
    for (let i = 0; i < 100; i++) {
      tokenIds.push(generateTokenId());
    }
    
    const uniqueIds = new Set(tokenIds);
    expect(uniqueIds.size).toBe(100);
  });
});
