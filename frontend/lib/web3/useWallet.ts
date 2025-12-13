'use client';

import { useState, useEffect, useCallback } from 'react';
import { WEB3_CONFIG, weiToEth } from './config';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  balance: string;
  isMetaMaskInstalled: boolean;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: '0',
    isMetaMaskInstalled: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  useEffect(() => {
    const checkMetaMask = () => {
      const isInstalled = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
      setWallet(prev => ({ ...prev, isMetaMaskInstalled: isInstalled }));
      
      if (isInstalled) {
        // Check if already connected
        checkConnection();
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    };

    checkMetaMask();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnected
      setWallet(prev => ({
        ...prev,
        isConnected: false,
        address: null,
        balance: '0',
      }));
    } else {
      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address: accounts[0],
      }));
      fetchBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setWallet(prev => ({ ...prev, chainId }));
    // Reload page on chain change (recommended by MetaMask)
    window.location.reload();
  };

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        setWallet(prev => ({
          ...prev,
          isConnected: true,
          address: accounts[0],
          chainId,
        }));
        fetchBalance(accounts[0]);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      setWallet(prev => ({ ...prev, balance: weiToEth(BigInt(balance)) }));
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      setWallet(prev => ({
        ...prev,
        isConnected: true,
        address: accounts[0],
        chainId,
      }));

      fetchBalance(accounts[0]);
      return true;
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the connection in MetaMask.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet(prev => ({
      ...prev,
      isConnected: false,
      address: null,
      balance: '0',
    }));
  }, []);

  const switchNetwork = useCallback(async (networkKey: keyof typeof WEB3_CONFIG.networks) => {
    const network = WEB3_CONFIG.networks[networkKey];
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      return true;
    } catch (err: any) {
      // Chain not added, try to add it
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainId,
              chainName: network.chainName,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: network.blockExplorerUrls,
            }],
          });
          return true;
        } catch (addErr) {
          setError('Failed to add network. Please add it manually in MetaMask.');
          return false;
        }
      }
      setError('Failed to switch network.');
      return false;
    }
  }, []);

  const sendTransaction = useCallback(async (to: string, valueInEth: string) => {
    if (!wallet.isConnected || !wallet.address) {
      setError('Wallet not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const valueInWei = '0x' + BigInt(Math.floor(parseFloat(valueInEth) * 1e18)).toString(16);
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet.address,
          to,
          value: valueInWei,
        }],
      });

      return txHash;
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Transaction rejected by user.');
      } else {
        setError('Transaction failed. Please try again.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [wallet.isConnected, wallet.address]);

  const signMessage = useCallback(async (message: string) => {
    if (!wallet.isConnected || !wallet.address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address],
      });
      return signature;
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Signature rejected by user.');
      } else {
        setError('Failed to sign message.');
      }
      return null;
    }
  }, [wallet.isConnected, wallet.address]);

  return {
    ...wallet,
    loading,
    error,
    connect,
    disconnect,
    switchNetwork,
    sendTransaction,
    signMessage,
    refreshBalance: () => wallet.address && fetchBalance(wallet.address),
  };
}
