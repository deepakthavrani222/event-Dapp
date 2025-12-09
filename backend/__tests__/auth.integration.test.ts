/**
 * Integration tests for Authentication Module
 * Tests the complete auth flow: login → verify → logout
 */

import { generateToken, verifyToken } from '../lib/auth/jwt';
import { generateSmartWallet } from '../lib/auth/wallet';

describe('Authentication Integration Tests', () => {
  describe('JWT Token Flow', () => {
    test('should generate and verify valid JWT token', () => {
      const payload = {
        userId: '123456',
        walletAddress: '0x1234567890abcdef',
        role: 'BUYER',
        email: 'test@example.com',
      };

      const token = generateToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.walletAddress).toBe(payload.walletAddress);
      expect(decoded?.role).toBe(payload.role);
      expect(decoded?.email).toBe(payload.email);
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = verifyToken(invalidToken);
      expect(decoded).toBeNull();
    });

    test('should reject tampered token', () => {
      const payload = {
        userId: '123456',
        walletAddress: '0x1234567890abcdef',
        role: 'BUYER',
      };

      const token = generateToken(payload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      const decoded = verifyToken(tamperedToken);
      expect(decoded).toBeNull();
    });
  });

  describe('Wallet Generation', () => {
    test('should generate valid wallet for email', () => {
      const email = 'user@example.com';
      const wallet = generateSmartWallet(email);

      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('should generate valid wallet for phone', () => {
      const phone = '+919876543210';
      const wallet = generateSmartWallet(phone);

      expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(wallet.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
    });

    test('should generate consistent wallet for same identifier', () => {
      const email = 'consistent@example.com';
      const wallet1 = generateSmartWallet(email);
      const wallet2 = generateSmartWallet(email);

      expect(wallet1.address).toBe(wallet2.address);
      expect(wallet1.privateKey).toBe(wallet2.privateKey);
    });
  });

  describe('Complete Auth Flow', () => {
    test('should simulate complete login flow', () => {
      const email = 'flowtest@example.com';
      
      // Step 1: Generate wallet
      const wallet = generateSmartWallet(email);
      expect(wallet.address).toBeTruthy();

      // Step 2: Generate JWT
      const token = generateToken({
        userId: 'mock-user-id',
        walletAddress: wallet.address,
        role: 'BUYER',
        email,
      });
      expect(token).toBeTruthy();

      // Step 3: Verify JWT
      const decoded = verifyToken(token);
      expect(decoded).toBeTruthy();
      expect(decoded?.walletAddress).toBe(wallet.address);
      expect(decoded?.email).toBe(email);
    });
  });
});
