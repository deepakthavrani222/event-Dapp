'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { useWallet } from '@/lib/web3/useWallet';
import { WEB3_CONFIG } from '@/lib/web3/config';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface BidFormProps {
  auctionId: string;
  currentBidEth: number;
  minNextBidEth: number;
  maxAllowedBidEth: number;
  bidIncrementEth: number;
  onBidPlaced: (bid: { amountEth: number; txHash?: string }) => void;
  disabled?: boolean;
}

export function BidForm({
  auctionId,
  currentBidEth,
  minNextBidEth,
  maxAllowedBidEth,
  bidIncrementEth,
  onBidPlaced,
  disabled = false
}: BidFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const {
    isConnected,
    address,
    balance,
    chainId,
    isMetaMaskInstalled,
    loading: walletLoading,
    connect,
    sendTransaction,
    switchNetwork
  } = useWallet();

  const [bidAmount, setBidAmount] = useState(minNextBidEth.toFixed(4));
  const [bidStatus, setBidStatus] = useState<'idle' | 'processing' | 'confirming' | 'success' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  const parsedBidAmount = parseFloat(bidAmount) || 0;
  const hasEnoughBalance = parseFloat(balance) >= parsedBidAmount;
  const isCorrectNetwork = chainId === WEB3_CONFIG.networks.sepolia.chainId;
  const isValidBid = parsedBidAmount >= minNextBidEth && parsedBidAmount <= maxAllowedBidEth;

  const quickBidAmounts = [
    { label: 'Min', value: minNextBidEth },
    { label: '+0.01', value: minNextBidEth + 0.01 },
    { label: '+0.05', value: minNextBidEth + 0.05 },
    { label: '+0.1', value: minNextBidEth + 0.1 },
  ].filter(b => b.value <= maxAllowedBidEth);

  const handlePlaceBid = async () => {
    if (!isConnected) {
      const connected = await connect();
      if (!connected) return;
    }

    if (!isCorrectNetwork) {
      const switched = await switchNetwork('sepolia');
      if (!switched) return;
    }

    if (!hasEnoughBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${parsedBidAmount.toFixed(4)} ETH to place this bid.`,
        variant: 'destructive',
      });
      return;
    }

    if (!isValidBid) {
      toast({
        title: 'Invalid Bid Amount',
        description: `Bid must be between ${minNextBidEth.toFixed(4)} and ${maxAllowedBidEth.toFixed(4)} ETH`,
        variant: 'destructive',
      });
      return;
    }

    setBidStatus('processing');
    setError(null);

    try {
      // Send ETH to auction contract (or platform wallet for escrow)
      const txHash = await sendTransaction(
        process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS || WEB3_CONFIG.platformWallet,
        parsedBidAmount.toFixed(6)
      );

      if (txHash) {
        setBidStatus('confirming');

        // Record bid in backend
        const data = await apiClient.placeBid(auctionId, {
          amountEth: parsedBidAmount,
          txHash,
          walletAddress: address,
        });

        if (data.success) {
          setBidStatus('success');
          toast({
            title: '🎉 Bid Placed Successfully!',
            description: `You bid ${parsedBidAmount.toFixed(4)} ETH`,
          });
          onBidPlaced({ amountEth: parsedBidAmount, txHash });
          
          // Reset after success
          setTimeout(() => {
            setBidStatus('idle');
            setBidAmount(data.auction?.minNextBidEth?.toFixed(4) || minNextBidEth.toFixed(4));
          }, 2000);
        } else {
          throw new Error(data.error || 'Failed to record bid');
        }
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      console.error('Bid error:', err);
      setBidStatus('failed');
      setError(err.message || 'Failed to place bid');
      toast({
        title: 'Bid Failed',
        description: err.message || 'Failed to place bid',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Zap className="h-5 w-5 text-orange-500" />
          Place Your Bid
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Bid Info */}
        <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Current Bid
            </span>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {currentBidEth > 0 ? `${currentBidEth.toFixed(4)} ETH` : 'No bids yet'}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1 text-sm">
            <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
              Minimum bid
            </span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              {minNextBidEth.toFixed(4)} ETH
            </span>
          </div>
        </div>

        {/* Wallet Status */}
        {!isConnected ? (
          <Button
            onClick={connect}
            disabled={walletLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {walletLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Wallet className="h-4 w-4 mr-2" />
            )}
            Connect Wallet to Bid
          </Button>
        ) : (
          <>
            {/* Connected Wallet Info */}
            <div className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-green-500/20 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <Badge variant="secondary" className={isDark ? 'bg-gray-700' : 'bg-gray-200'}>
                {parseFloat(balance).toFixed(4)} ETH
              </Badge>
            </div>

            {/* Network Warning */}
            {!isCorrectNetwork && (
              <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                      Switch to Sepolia
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => switchNetwork('sepolia')}
                    className="h-7 text-xs"
                  >
                    Switch
                  </Button>
                </div>
              </div>
            )}

            {/* Bid Input */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Your Bid (ETH)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.0001"
                  min={minNextBidEth}
                  max={maxAllowedBidEth}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className={`pr-16 text-lg font-mono ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  disabled={disabled || bidStatus !== 'idle'}
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ETH
                </span>
              </div>
              
              {/* Quick Bid Buttons */}
              <div className="flex gap-2 flex-wrap">
                {quickBidAmounts.map((quick) => (
                  <Button
                    key={quick.label}
                    size="sm"
                    variant="outline"
                    onClick={() => setBidAmount(quick.value.toFixed(4))}
                    className={`text-xs ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}`}
                    disabled={disabled || bidStatus !== 'idle'}
                  >
                    {quick.label}
                  </Button>
                ))}
              </div>

              {/* Validation Messages */}
              {parsedBidAmount > 0 && parsedBidAmount < minNextBidEth && (
                <p className="text-xs text-red-500">
                  Bid must be at least {minNextBidEth.toFixed(4)} ETH
                </p>
              )}
              {parsedBidAmount > maxAllowedBidEth && (
                <p className="text-xs text-red-500">
                  Bid cannot exceed {maxAllowedBidEth.toFixed(4)} ETH (price cap)
                </p>
              )}
              {isConnected && !hasEnoughBalance && parsedBidAmount > 0 && (
                <p className="text-xs text-red-500">
                  Insufficient balance
                </p>
              )}
            </div>

            {/* Place Bid Button */}
            <AnimatePresence mode="wait">
              {bidStatus === 'idle' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={handlePlaceBid}
                    disabled={disabled || !isValidBid || !hasEnoughBalance || !isCorrectNetwork}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
                  >
                    Place Bid: {parsedBidAmount.toFixed(4)} ETH
                  </Button>
                </motion.div>
              )}

              {bidStatus === 'processing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Confirm in MetaMask...
                  </p>
                </motion.div>
              )}

              {bidStatus === 'confirming' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Recording bid...
                  </p>
                </motion.div>
              )}

              {bidStatus === 'success' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-4"
                >
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Bid Placed!
                  </p>
                </motion.div>
              )}

              {bidStatus === 'failed' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      {error || 'Bid failed'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setBidStatus('idle')}
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security Note */}
            <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <Shield className="h-3 w-3" />
              <span>Bids are secured via smart contract escrow</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
