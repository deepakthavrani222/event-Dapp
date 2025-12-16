'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  Copy,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '@/lib/web3/useWallet';
import { WEB3_CONFIG, ETH_TO_INR } from '@/lib/web3/config';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';

interface AdminWalletCardProps {
  onWalletConnected?: (address: string) => void;
}

export function AdminWalletCard({ onWalletConnected }: AdminWalletCardProps) {
  const {
    isConnected,
    address,
    balance,
    chainId,
    isMetaMaskInstalled,
    loading,
    error,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance
  } = useWallet();

  const [saving, setSaving] = useState(false);
  const [savedWallet, setSavedWallet] = useState<string | null>(null);

  const isCorrectNetwork = chainId === WEB3_CONFIG.networks.sepolia.chainId;
  const balanceInINR = parseFloat(balance) * ETH_TO_INR;

  // Load saved platform wallet on mount
  useEffect(() => {
    loadPlatformWallet();
  }, []);

  // Save wallet when connected
  useEffect(() => {
    if (isConnected && address && address !== savedWallet) {
      savePlatformWallet(address);
    }
  }, [isConnected, address]);

  const loadPlatformWallet = async () => {
    try {
      const response = await apiClient.request('/api/admin/platform-settings');
      if (response?.platformWallet) {
        setSavedWallet(response.platformWallet);
      }
    } catch (err) {
      console.error('Failed to load platform wallet:', err);
    }
  };

  const savePlatformWallet = async (walletAddress: string) => {
    setSaving(true);
    try {
      await apiClient.request('/api/admin/platform-settings', {
        method: 'PUT',
        body: JSON.stringify({ platformWallet: walletAddress }),
      });
      setSavedWallet(walletAddress);
      onWalletConnected?.(walletAddress);
      toast({
        title: 'Wallet Connected! 🎉',
        description: 'Platform wallet has been updated successfully.',
      });
    } catch (err) {
      console.error('Failed to save platform wallet:', err);
      toast({
        title: 'Failed to save wallet',
        description: 'Could not update platform wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async () => {
    const connected = await connect();
    if (connected && !isCorrectNetwork) {
      await switchNetwork('sepolia');
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard.',
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="border-purple-500/30 bg-purple-500/10">
      <CardHeader>
        <CardTitle className="text-purple-300 flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Platform Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isMetaMaskInstalled ? (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-300 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">MetaMask Not Found</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Install MetaMask to connect your wallet and receive platform fees.
            </p>
            <Button
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Install MetaMask
            </Button>
          </div>
        ) : !isConnected ? (
          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <Wallet className="h-10 w-10 text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400 mb-1">No wallet connected</p>
              <p className="text-xs text-gray-500">
                Connect MetaMask to receive platform fees (5% of ticket sales)
              </p>
            </div>
            <Button
              onClick={handleConnect}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wallet className="h-4 w-4 mr-2" />
              )}
              Connect MetaMask
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Connected Status */}
            <div className="flex items-center justify-between">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
              {!isCorrectNetwork && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  Wrong Network
                </Badge>
              )}
            </div>

            {/* Wallet Address */}
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white font-mono">{formatAddress(address!)}</p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyAddress}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                    className="h-7 w-7 p-0 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {saving && (
                <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving as platform wallet...
                </p>
              )}
            </div>

            {/* Balance */}
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Platform Treasury</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={refreshBalance}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-lg font-bold text-white">{parseFloat(balance).toFixed(4)} ETH</p>
              <p className="text-sm text-gray-400">≈ ₹{balanceInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>

            {/* Network Warning */}
            {!isCorrectNetwork && (
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-300 mb-2">
                  Please switch to Sepolia Testnet for transactions
                </p>
                <Button
                  size="sm"
                  onClick={() => switchNetwork('sepolia')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Switch Network
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Etherscan
              </Button>
              <Button
                variant="outline"
                onClick={disconnect}
                className="border-red-500/50 text-red-300 hover:bg-red-500/20"
              >
                Disconnect
              </Button>
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 text-center">
              5% of all ticket sales will be sent to this wallet
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
