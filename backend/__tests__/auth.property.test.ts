/**
 * Property 1: Wallet Creation Uniqueness
 * Validates: Requirements 1.1, 1.4
 * 
 * Property: Every user login must create a unique wallet address
 * No two users should ever have the same wallet address
 */

import * as fc from 'fast-check';
import { generateSmartWallet } from '../lib/auth/wallet';

describe('Property 1: Wallet Creation Uniqueness', () => {
  test('should generate unique wallet addresses for different identifiers', () => {
    fc.assert(
      fc.property(
        fc.array(fc.emailAddress(), { minLength: 2, maxLength: 100 }),
        (emails) => {
          const wallets = emails.map(email => generateSmartWallet(email));
          const addresses = wallets.map(w => w.address.toLowerCase());
          
          // Check all addresses are unique
          const uniqueAddresses = new Set(addresses);
          return uniqueAddresses.size === addresses.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('should generate same wallet for same identifier (deterministic)', () => {
    const email = 'test@example.com';
    const wallet1 = generateSmartWallet(email);
    const wallet2 = generateSmartWallet(email);
    
    expect(wallet1.address).toBe(wallet2.address);
    expect(wallet1.privateKey).toBe(wallet2.privateKey);
  });

  test('should generate different wallets for different identifiers', () => {
    const wallet1 = generateSmartWallet('user1@example.com');
    const wallet2 = generateSmartWallet('user2@example.com');
    
    expect(wallet1.address).not.toBe(wallet2.address);
    expect(wallet1.privateKey).not.toBe(wallet2.privateKey);
  });

  test('should generate valid Ethereum addresses', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (email) => {
          const wallet = generateSmartWallet(email);
          // Valid Ethereum address: starts with 0x and is 42 chars long
          return wallet.address.startsWith('0x') && wallet.address.length === 42;
        }
      ),
      { numRuns: 50 }
    );
  });
});
