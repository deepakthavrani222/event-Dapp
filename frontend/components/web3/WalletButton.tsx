'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  LogOut, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '@/lib/web3/useWallet';
import { WEB3_CONFIG } from '@/lib/web3/config';

export function WalletButton() {
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
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getNetworkName = () => {
    if (!chainId) return 'Unknown';
    const networks = WEB3_CONFIG.networks;
    for (const [, config] of Object.entries(networks)) {
      if (config.chainId === chainId) return config.chainName;
    }
    return `Chain ${parseInt(chainId, 16)}`;
  };

  const getNetworkColor = () => {
    if (!chainId) return 'bg-gray-500';
    if (chainId === WEB3_CONFIG.networks.sepolia.chainId) return 'bg-blue-500';
    if (chainId === WEB3_CONFIG.networks.polygon.chainId) return 'bg-purple-500';
    if (chainId === WEB3_CONFIG.networks.mumbai.chainId) return 'bg-purple-400';
    return 'bg-orange-500';
  };

  // Not installed
  if (!isMetaMaskInstalled) {
    return (
      <Button
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
        className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        <Wallet className="h-4 w-4" />
        Install MetaMask
      </Button>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={loading}
        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white gap-2"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        Connect Wallet
      </Button>
    );
  }

  // Connected
  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        variant="outline"
        className="border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2"
      >
        <div className={`w-2 h-2 rounded-full ${getNetworkColor()}`} />
        <span className="font-mono text-sm">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-72 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-orange-500/20 to-amber-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Connected Wallet</span>
                  <Badge className={`${getNetworkColor()} text-white border-0 text-xs`}>
                    {getNetworkName()}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-white text-sm">
                    {address?.slice(0, 10)}...{address?.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              {/* Balance */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Balance</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshBalance}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-2xl font-bold text-white mt-1">
                  {parseFloat(balance).toFixed(4)} ETH
                </p>
              </div>

              {/* Network Switch */}
              <div className="p-4 border-b border-white/10">
                <p className="text-xs text-gray-400 mb-2">Switch Network</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={chainId === WEB3_CONFIG.networks.sepolia.chainId ? 'default' : 'outline'}
                    onClick={() => switchNetwork('sepolia')}
                    className="flex-1 text-xs"
                  >
                    Sepolia
                  </Button>
                  <Button
                    size="sm"
                    variant={chainId === WEB3_CONFIG.networks.polygon.chainId ? 'default' : 'outline'}
                    onClick={() => switchNetwork('polygon')}
                    className="flex-1 text-xs"
                  >
                    Polygon
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Explorer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    disconnect();
                    setShowDropdown(false);
                  }}
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/20 border-t border-red-500/30">
                  <div className="flex items-center gap-2 text-red-300 text-xs">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
