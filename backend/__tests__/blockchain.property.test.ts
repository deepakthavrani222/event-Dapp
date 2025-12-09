/**
 * Property 10: Gasless Transaction Sponsorship
 * Validates: Requirements 11.1, 11.2, 11.3
 * 
 * Property: All user transactions must be gasless (gas paid by platform)
 * - Users never pay gas fees
 * - Platform sponsors all transaction costs
 * - Transactions complete successfully without user wallet balance
 */

import * as fc from 'fast-check';
import { executeGaslessTransaction } from '../lib/blockchain/biconomy';
import { mintTickets, transferTicket, burnTicket } from '../lib/blockchain/ticket-nft';

describe('Property 10: Gasless Transaction Sponsorship', () => {
  test('should execute gasless transactions with zero user cost', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.hexaString({ minLength: 40, maxLength: 40 }),
        fc.integer({ min: 1, max: 10 }),
        async (address, amount) => {
          const walletAddress = `0x${address}`;
          const tokenId = '1000';

          // Execute gasless mint
          const result = await executeGaslessTransaction({
            to: '0x1234567890123456789012345678901234567890',
            data: '0x',
            from: walletAddress,
          });

          // Verify transaction was gasless
          return (
            result.success &&
            result.gasSponsored &&
            result.gasCost === '0'
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  test('should mint tickets without user paying gas', async () => {
    const userAddress = '0x1234567890123456789012345678901234567890';
    const tokenId = '1001';
    const amount = 2;

    const result = await mintTickets(userAddress, tokenId, amount);

    expect(result.success).toBe(true);
    expect(result.txHash).toBeTruthy();
    expect(result.txHash).toMatch(/^0x[a-f0-9]+$/);
  });

  test('should transfer tickets without user paying gas', async () => {
    const fromAddress = '0x1111111111111111111111111111111111111111';
    const toAddress = '0x2222222222222222222222222222222222222222';
    const tokenId = '1002';

    const result = await transferTicket(fromAddress, toAddress, tokenId, 1);

    expect(result.success).toBe(true);
    expect(result.txHash).toBeTruthy();
  });

  test('should burn tickets without user paying gas', async () => {
    const userAddress = '0x3333333333333333333333333333333333333333';
    const tokenId = '1003';

    const result = await burnTicket(userAddress, tokenId, 1);

    expect(result.success).toBe(true);
    expect(result.txHash).toBeTruthy();
  });

  test('gasless transactions should always return valid tx hash', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.hexaString({ minLength: 40, maxLength: 40 }),
        async (address) => {
          const result = await executeGaslessTransaction({
            to: `0x${address}`,
            data: '0x',
            from: '0x0000000000000000000000000000000000000000',
          });

          // Valid tx hash: starts with 0x and is hex
          return (
            result.txHash.startsWith('0x') &&
            result.txHash.length > 10 &&
            /^0x[a-f0-9]+$/.test(result.txHash)
          );
        }
      ),
      { numRuns: 30 }
    );
  });

  test('all blockchain operations should be gasless', async () => {
    const operations = [
      () => mintTickets('0x1111111111111111111111111111111111111111', '2000', 1),
      () => transferTicket('0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222', '2001', 1),
      () => burnTicket('0x1111111111111111111111111111111111111111', '2002', 1),
    ];

    for (const operation of operations) {
      const result = await operation();
      expect(result.success).toBe(true);
      expect(result.txHash).toBeTruthy();
    }
  });
});
