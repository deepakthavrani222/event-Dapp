import { ethers } from 'ethers';
import { BLOCKCHAIN_CONFIG } from './config';

/**
 * Get JSON-RPC provider for Polygon Mumbai
 */
export function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.rpcUrl);
}

/**
 * Get wallet instance for backend operations
 * Uses private key from environment
 */
export function getBackendWallet(): ethers.Wallet {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not configured in environment');
  }
  
  const provider = getProvider();
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Get wallet balance in MATIC
 */
export async function getWalletBalance(address: string): Promise<string> {
  const provider = getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

/**
 * Check if address has sufficient balance for gas
 */
export async function hasSufficientBalance(address: string, minBalance: string = '0.01'): Promise<boolean> {
  const balance = await getWalletBalance(address);
  return parseFloat(balance) >= parseFloat(minBalance);
}

/**
 * Get current gas price
 */
export async function getCurrentGasPrice(): Promise<bigint> {
  const provider = getProvider();
  const feeData = await provider.getFeeData();
  return feeData.gasPrice || BigInt(0);
}

/**
 * Estimate gas for transaction
 */
export async function estimateGas(tx: any): Promise<bigint> {
  const provider = getProvider();
  return await provider.estimateGas(tx);
}
