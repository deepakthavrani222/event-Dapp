'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useWallet } from '@/lib/web3/useWallet';
import { WEB3_CONFIG, inrToEth, ETH_TO_INR } from '@/lib/web3/config';
import { toast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface CryptoPaymentProps {
  amountINR: number;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  onSuccess: (txHash: string) => void;
  onCancel: () => void;
  recipientAddress?: string;
}

export function CryptoPayment({
  amountINR,
  eventTitle,
  ticketType,
  quantity,
  onSuccess,
  onCancel,
  recipientAddress = WEB3_CONFIG.platformWallet
}: CryptoPaymentProps) {
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
    sendTransaction,
    switchNetwork
  } = useWallet();

  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'confirming' | 'success' | 'failed'>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const amountETH = inrToEth(amountINR);
  const hasEnoughBalance = parseFloat(balance) >= amountETH;
  const isCorrectNetwork = chainId === WEB3_CONFIG.networks.sepolia.chainId;

  const handlePayment = async () => {
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
        description: `You need at least ${amountETH.toFixed(6)} ETH to complete this purchase.`,
        variant: 'destructive',
      });
      return;
    }

    setPaymentStatus('processing');

    try {
      const hash = await sendTransaction(recipientAddress, amountETH.toFixed(6));
      
      if (hash) {
        setTxHash(hash);
        setPaymentStatus('confirming');
        
        // Wait for confirmation (simplified - in production use proper confirmation)
        setTimeout(() => {
          setPaymentStatus('success');
          toast({
            title: 'Payment Successful! 🎉',
            description: 'Your tickets are being minted as NFTs.',
          });
          onSuccess(hash);
        }, 3000);
      } else {
        setPaymentStatus('failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentStatus('failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className={isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}>
        <CardContent className="p-6">
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Event</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{eventTitle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Ticket Type</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{ticketType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Quantity</span>
              <span className={isDark ? 'text-white' : 'text-gray-900'}>{quantity}</span>
            </div>
            <div className={`border-t pt-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total (INR)</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{amountINR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total (ETH)</span>
                <span className="text-orange-500 font-bold">{amountETH.toFixed(6)} ETH</span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Rate: 1 ETH = ₹{ETH_TO_INR.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Status */}
      <Card className={`border-2 ${isConnected 
        ? isDark ? 'border-green-500/30 bg-green-900/20' : 'border-green-300 bg-green-50' 
        : isDark ? 'border-orange-500/30 bg-orange-900/20' : 'border-orange-300 bg-orange-50'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`}>
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                {isConnected ? (
                  <>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Balance: {parseFloat(balance).toFixed(4)} ETH
                    </p>
                  </>
                ) : (
                  <>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Wallet Not Connected</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connect MetaMask to pay</p>
                  </>
                )}
              </div>
            </div>
            
            {isConnected ? (
              <div className="flex items-center gap-2">
                <Badge className={isDark ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-green-100 text-green-700 border-green-300'}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={disconnect}
                  className={`h-7 px-2 text-xs ${isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20' : 'text-red-600 hover:text-red-700 hover:bg-red-100'}`}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={connect}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Connect'}
              </Button>
            )}
          </div>

          {/* Network Warning */}
          {isConnected && !isCorrectNetwork && (
            <div className={`mt-3 p-2 rounded-lg border ${isDark ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-300'}`}>
              <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                <AlertCircle className="h-4 w-4" />
                <span>Please switch to Sepolia Testnet</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => switchNetwork('sepolia')}
                  className={`h-6 text-xs ${isDark ? 'text-yellow-300 hover:text-yellow-200' : 'text-yellow-700 hover:text-yellow-800'}`}
                >
                  Switch
                </Button>
              </div>
            </div>
          )}

          {/* Balance Warning */}
          {isConnected && !hasEnoughBalance && (
            <div className={`mt-3 p-2 rounded-lg border ${isDark ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-300'}`}>
              <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                <AlertCircle className="h-4 w-4" />
                <span>Insufficient balance. Need {amountETH.toFixed(6)} ETH</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Status */}
      {paymentStatus !== 'idle' && (
        <Card className={isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}>
          <CardContent className="p-6 text-center">
            {paymentStatus === 'processing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Processing Payment</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please confirm in MetaMask...</p>
                </div>
              </motion.div>
            )}

            {paymentStatus === 'confirming' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirming Transaction</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Waiting for blockchain confirmation...</p>
                  {txHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1 mt-2"
                    >
                      View on Etherscan <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {paymentStatus === 'success' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Successful!</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your NFT tickets are being minted</p>
                </div>
              </motion.div>
            )}

            {paymentStatus === 'failed' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment Failed</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error || 'Transaction was rejected or failed'}</p>
                </div>
                <Button
                  onClick={() => setPaymentStatus('idle')}
                  variant="outline"
                  className={isDark ? 'border-gray-600 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {paymentStatus === 'idle' && (
        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            disabled={loading || (isConnected && (!isCorrectNetwork || !hasEnoughBalance))}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
          >
            {!isMetaMaskInstalled ? (
              <>Install MetaMask</>
            ) : !isConnected ? (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet & Pay
              </>
            ) : (
              <>
                Pay {amountETH.toFixed(6)} ETH
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>

          <Button
            onClick={onCancel}
            variant="ghost"
            className={`w-full ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Cancel
          </Button>

          {/* Security Note */}
          <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <Shield className="h-3 w-3" />
            <span>Secured by Ethereum blockchain</span>
          </div>
        </div>
      )}
    </div>
  );
}
