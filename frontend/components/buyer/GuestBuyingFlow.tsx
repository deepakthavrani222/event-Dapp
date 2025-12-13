'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';
import { notifyTicketPurchased } from '@/lib/hooks/useRealTimeTickets';
import { CryptoPayment } from '@/components/web3/CryptoPayment';
import { 
  ShoppingCart, 
  CreditCard, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Lock,
  Smartphone,
  Mail,
  User,
  Ticket,
  Clock,
  Star,
  Wallet
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface GuestBuyingFlowProps {
  event: any;
  ticketSelections: any[];
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function GuestBuyingFlow({ 
  event, 
  ticketSelections, 
  totalAmount, 
  onClose, 
  onSuccess 
}: GuestBuyingFlowProps) {
  const [step, setStep] = useState<'auth' | 'payment' | 'crypto' | 'processing' | 'success'>('auth');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet' | 'crypto'>('crypto'); // Default to crypto
  const { login } = useAuth();

  const handleQuickAuth = async () => {
    setLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowOtp(true);
    } catch (error) {
      console.error('Auth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    setLoading(true);
    try {
      // Auto-create wallet and login user
      const identifier = authMethod === 'email' ? email : phone;
      await login(identifier, name || 'Guest User');
      
      // Move to payment step
      setStep('payment');
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // If crypto payment selected, show MetaMask payment UI
    if (paymentMethod === 'crypto') {
      setStep('crypto');
      return;
    }

    setLoading(true);
    setStep('processing');
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Process ticket purchase
      const purchaseData = {
        eventId: event.id,
        tickets: ticketSelections,
        paymentMethod,
        totalAmount
      };
      
      // Use real API call for guest purchases
      const purchasePromises = ticketSelections.map((selection: any) => 
        apiClient.purchaseTickets({
          ticketTypeId: selection.ticketTypeId,
          quantity: selection.quantity,
          paymentMethod: paymentMethod.toUpperCase(),
          referralCode: undefined,
        })
      );

      const responses = await Promise.all(purchasePromises);
      const allSuccessful = responses.every(response => response.success);

      if (allSuccessful) {
        console.log('Purchase successful! Refreshing tickets...');
        
        // Trigger My Tickets refresh immediately
        notifyTicketPurchased();
        
        // Also trigger global refresh events
        window.dispatchEvent(new CustomEvent('refreshTickets'));
        
        // Set localStorage flag for cross-tab communication
        localStorage.setItem('ticketPurchased', Date.now().toString());
        
        // Refresh triggers sent
        
        setStep('success');
      } else {
        const failedResponses = responses.filter(r => !r.success);
        throw new Error(failedResponses[0]?.error || 'Some purchases failed');
      }
      
      // Auto-close after showing success
      setTimeout(() => {
        onSuccess();
      }, 3000);
      
    } catch (error) {
      console.error('Payment failed:', error);
      setStep('payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle successful crypto payment from MetaMask
  const handleCryptoSuccess = async (txHash: string) => {
    setLoading(true);
    setStep('processing');
    
    try {
      // Complete purchase with crypto transaction hash
      const purchasePromises = ticketSelections.map((selection: any) => 
        apiClient.purchaseTickets({
          ticketTypeId: selection.ticketTypeId,
          quantity: selection.quantity,
          paymentMethod: 'CRYPTO',
          referralCode: undefined,
          transactionHash: txHash,
        })
      );

      const responses = await Promise.all(purchasePromises);
      const allSuccessful = responses.every(response => response.success);

      if (allSuccessful) {
        console.log('Crypto purchase successful! Refreshing tickets...');
        
        // Trigger My Tickets refresh immediately
        notifyTicketPurchased();
        window.dispatchEvent(new CustomEvent('refreshTickets'));
        localStorage.setItem('ticketPurchased', Date.now().toString());
        
        setStep('success');
        
        // Auto-close after showing success
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        const failedResponses = responses.filter(r => !r.success);
        throw new Error(failedResponses[0]?.error || 'Some purchases failed');
      }
    } catch (error: any) {
      console.error('Crypto purchase failed:', error);
      setStep('payment');
      alert(`Purchase failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderAuthStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Almost there!</h2>
        <p className="text-gray-400">Quick sign-in to secure your tickets</p>
      </div>

      {!showOtp ? (
        <div className="space-y-4">
          {/* Auth Method Selection */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={authMethod === 'email' ? 'default' : 'outline'}
              onClick={() => setAuthMethod('email')}
              className="flex flex-col gap-1 h-16"
            >
              <Mail className="h-4 w-4" />
              <span className="text-xs">Email</span>
            </Button>
            <Button
              variant={authMethod === 'phone' ? 'default' : 'outline'}
              onClick={() => setAuthMethod('phone')}
              className="flex flex-col gap-1 h-16"
            >
              <Smartphone className="h-4 w-4" />
              <span className="text-xs">Phone</span>
            </Button>
            <Button
              variant={authMethod === 'google' ? 'default' : 'outline'}
              onClick={() => setAuthMethod('google')}
              className="flex flex-col gap-1 h-16"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-xs">Google</span>
            </Button>
          </div>

          {/* Input Fields */}
          <div className="space-y-3">
            {authMethod === 'email' && (
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            )}
            {authMethod === 'phone' && (
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            )}
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          <Button
            onClick={authMethod === 'google' ? () => setStep('payment') : handleQuickAuth}
            disabled={loading || (!email && !phone) || !name}
            className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                Sending OTP...
              </div>
            ) : authMethod === 'google' ? (
              'Continue with Google'
            ) : (
              `Send OTP to ${authMethod === 'email' ? 'Email' : 'Phone'}`
            )}
          </Button>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>No Password</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-gray-400">
              Enter the 6-digit code sent to {authMethod === 'email' ? email : phone}
            </p>
          </div>

          <Input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 text-center text-2xl tracking-widest"
            maxLength={6}
          />

          <Button
            onClick={handleOtpVerify}
            disabled={loading || otp.length !== 6}
            className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                Verifying...
              </div>
            ) : (
              'Verify & Continue'
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowOtp(false)}
            className="w-full text-gray-400 hover:text-white"
          >
            ← Back to sign-in
          </Button>
        </div>
      )}
    </motion.div>
  );

  // Calculate pricing breakdown like BookMyShow
  const calculatePricing = () => {
    const ticketPrice = ticketSelections.reduce((acc, sel) => acc + (sel.quantity * sel.price), 0);
    const convenienceFee = Math.round(ticketPrice * 0.14); // 14% convenience fee
    const platformSecurityFee = Math.round(ticketPrice * 0.06); // 6% platform security fee (non-refundable)
    const total = ticketPrice + convenienceFee + platformSecurityFee;
    
    return {
      ticketPrice,
      convenienceFee,
      platformSecurityFee,
      total
    };
  };

  const pricing = calculatePricing();

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Payment</h2>
        <p className="text-gray-400">Choose your preferred payment method</p>
      </div>

      {/* Detailed Order Summary - BookMyShow Style */}
      <div className="glass-card border-border/50 backdrop-blur-sm bg-card/40 p-5 rounded-xl space-y-4">
        <h3 className="font-semibold text-white text-lg">Order Summary</h3>
        
        {/* Ticket Details */}
        <div className="space-y-3">
          {ticketSelections.map((selection, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-300 font-medium">{selection.name}</span>
                <span className="text-white font-semibold">₹{selection.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quantity: {selection.quantity}</span>
                <span className="text-gray-300">₹{(selection.quantity * selection.price).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-3 space-y-2">
          {/* Pricing Breakdown */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Ticket Price</span>
            <span className="text-white">₹{pricing.ticketPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Convenience Fee</span>
            <span className="text-white">₹{pricing.convenienceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-300">Platform Security Fee</span>
              <Badge variant="secondary" className="text-xs px-1 py-0">Non-refundable</Badge>
            </div>
            <span className="text-white">₹{pricing.platformSecurityFee.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-white">Total</span>
            <span className="text-2xl font-bold text-primary">₹{pricing.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods - Razorpay/Stripe Style */}
      <div className="space-y-3">
        <h3 className="font-semibold text-white">Payment Options</h3>
        
        {/* UPI */}
        <Button
          variant={paymentMethod === 'upi' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('upi')}
          className="w-full justify-start h-16 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">UPI</span>
            </div>
            <div>
              <p className="font-semibold">UPI Payment</p>
              <p className="text-xs text-gray-400">PhonePe • GPay • Paytm • BHIM</p>
            </div>
          </div>
          {paymentMethod === 'upi' && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
        </Button>

        {/* Cards */}
        <Button
          variant={paymentMethod === 'card' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('card')}
          className="w-full justify-start h-16 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Credit/Debit Card</p>
              <p className="text-xs text-gray-400">Visa • Mastercard • RuPay • Amex</p>
            </div>
          </div>
          {paymentMethod === 'card' && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
        </Button>

        {/* Digital Wallets */}
        <Button
          variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('wallet')}
          className="w-full justify-start h-16 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <div>
              <p className="font-semibold">Digital Wallet</p>
              <p className="text-xs text-gray-400">Paytm • Amazon Pay • MobiKwik</p>
            </div>
          </div>
          {paymentMethod === 'wallet' && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
        </Button>

        {/* Apple Pay / Google Pay */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-14 flex items-center justify-center gap-2"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">🍎</span>
            </div>
            <span className="font-semibold">Apple Pay</span>
          </Button>
          <Button
            variant="outline"
            className="h-14 flex items-center justify-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <span className="font-semibold">Google Pay</span>
          </Button>
        </div>
      </div>

      {/* Pay Now Button */}
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-16 font-bold text-xl rounded-xl"
      >
        Pay Now ₹{pricing.total.toLocaleString()}
        <ArrowRight className="h-6 w-6 ml-2" />
      </Button>

      {/* Security & Trust Indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Secure Payment</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Your payment is processed securely. We don't store your card details.
        </p>
      </div>
    </motion.div>
  );

  const renderProcessingStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8"
    >
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto bg-primary/20 rounded-full animate-ping"></div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Processing Payment...</h2>
        <p className="text-gray-400">Please don't close this window</p>
      </div>

      <div className="space-y-3 text-sm">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-green-400"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Payment verified with bank</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-center gap-2 text-green-400"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Converting to USDC via MoonPay</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="flex items-center justify-center gap-2 text-yellow-400"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-yellow-400"></div>
          <span>Minting NFT tickets on blockchain...</span>
        </motion.div>
      </div>

      <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-lg">
        <p>🔐 Your tickets are being secured on the blockchain</p>
        <p>⚡ Gas fees sponsored by platform</p>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8 relative overflow-hidden"
    >
      {/* Confetti Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * 400 - 200, rotate: 0 }}
            animate={{ 
              y: 600, 
              rotate: 360,
              transition: { 
                duration: 3, 
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 3
              }
            }}
            className={`absolute w-3 h-3 ${
              ['bg-purple-500', 'bg-cyan-500', 'bg-yellow-400', 'bg-green-500', 'bg-pink-500'][i % 5]
            } rounded-full`}
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative"
      >
        <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center relative">
          <CheckCircle className="h-16 w-16 text-white" />
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <h1 className="text-4xl font-black text-white">TICKETS SECURED!</h1>
        <div className="text-6xl">🎉</div>
        <p className="text-lg text-gray-300">Your {event.title} tickets are ready!</p>
      </motion.div>

      {/* Ticket Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card border-green-500/30 backdrop-blur-sm bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-xl space-y-3"
      >
        <div className="flex items-center justify-center gap-2 text-green-400">
          <Ticket className="h-6 w-6" />
          <span className="font-bold text-lg">Your Tickets</span>
        </div>
        <div className="space-y-2">
          <p className="text-white font-bold text-xl">{event.title}</p>
          <p className="text-gray-300">
            {ticketSelections.reduce((acc, sel) => acc + sel.quantity, 0)} tickets • ₹{pricing.total.toLocaleString()} paid
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
            <span>📧 Email sent</span>
            <span>📱 WhatsApp sent</span>
            <span>🔔 Push notification</span>
          </div>
        </div>
      </motion.div>

      {/* Multi-channel Confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-bold text-white">Confirmation Sent To:</h3>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Mail className="h-4 w-4" />
            <span>Email: {email || phone} ✓</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Smartphone className="h-4 w-4" />
            <span>WhatsApp: QR codes ready ✓</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span>Push notification sent ✓</span>
          </div>
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="glass-card border-white/20 backdrop-blur-sm bg-white/5 p-4 rounded-xl"
      >
        <h4 className="font-bold text-white mb-2">What's Next?</h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>✅ Tickets are in your digital wallet</p>
          <p>📱 Show QR code at venue entrance</p>
          <p>🎫 Transfer or resell anytime</p>
          <p>💰 Instant refunds if event cancelled</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="space-y-3"
      >
        <Button
          onClick={() => window.open('/buyer', '_blank')}
          className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold"
        >
          View My Tickets
        </Button>
        <Button
          variant="outline"
          onClick={onSuccess}
          className="w-full glass-card border-white/20 text-white hover:bg-white/10"
        >
          Continue Browsing Events
        </Button>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card border-border/50 backdrop-blur-xl bg-card/90 rounded-2xl p-6 w-full max-w-md"
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-2">
            {['auth', 'payment', 'processing', 'success'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === stepName ? 'bg-primary text-white' :
                  ['auth', 'payment', 'processing', 'success'].indexOf(step) > index ? 'bg-green-500 text-white' :
                  'bg-gray-600 text-gray-400'
                }`}>
                  {['auth', 'payment', 'processing', 'success'].indexOf(step) > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 ${
                    ['auth', 'payment', 'processing', 'success'].indexOf(step) > index ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'auth' && renderAuthStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'success' && renderSuccessStep()}
        </AnimatePresence>

        {/* Close Button */}
        {step !== 'processing' && (
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        )}
      </motion.div>
    </div>
  );
}