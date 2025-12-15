'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Info,
  Zap,
  Target,
  Clock
} from 'lucide-react';

interface ResellDialogProps {
  ticket: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResellDialog({ ticket, onClose, onSuccess }: ResellDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'pricing' | 'confirm' | 'success'>('pricing');
  const [listingPrice, setListingPrice] = useState(ticket.price);
  const [priceSlider, setPriceSlider] = useState([100]); // Percentage of original price
  const [loading, setLoading] = useState(false);

  // Calculate pricing breakdown
  const platformFee = Math.round(listingPrice * 0.05); // 5% platform fee
  const youReceive = listingPrice - platformFee;
  const profitLoss = youReceive - ticket.price;
  const profitPercentage = ((profitLoss / ticket.price) * 100).toFixed(1);

  // Market suggestions
  const marketPrice = ticket.price * 1.2; // 20% above original
  const quickSalePrice = ticket.price * 0.9; // 10% below original
  const maxPrice = ticket.price * 2; // 100% markup limit

  const handlePriceSliderChange = (value: number[]) => {
    setPriceSlider(value);
    const newPrice = Math.round((ticket.price * value[0]) / 100);
    setListingPrice(newPrice);
  };

  const handleListTicket = async () => {
    setLoading(true);
    try {
      // Use apiClient for proper authentication
      const { apiClient } = await import('@/lib/api/client');
      const data = await apiClient.resellTicket(ticket.id, listingPrice);
      
      if (data.success) {
        setStep('success');
        
        // Auto-close after success
        setTimeout(() => {
          onSuccess();
        }, 3000);
      } else {
        console.error('Listing failed:', data.error);
        alert(data.error || 'Failed to list ticket');
      }
    } catch (error: any) {
      console.error('Listing failed:', error);
      alert(error.message || 'Failed to list ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPricingStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>List for Resale</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Set your price and list in seconds</p>
      </div>

      {/* Ticket Info */}
      <div className={`p-4 rounded-xl ${isDark ? 'glass-card border-white/20 bg-white/5' : 'bg-gray-100 border border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <img 
            src={ticket.eventImage} 
            alt={ticket.eventTitle}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.eventTitle}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {ticket.ticketType} • Original: ₹{ticket.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Price Suggestions */}
      <div className="space-y-3">
        <Label className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Price Options:</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => setListingPrice(quickSalePrice)}
            className={`flex flex-col gap-1 h-16 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
          >
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-xs">Quick Sale</span>
            <span className="text-xs font-bold">₹{quickSalePrice.toLocaleString()}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setListingPrice(marketPrice)}
            className={`flex flex-col gap-1 h-16 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
          >
            <Target className="h-4 w-4 text-green-500" />
            <span className="text-xs">Market Price</span>
            <span className="text-xs font-bold">₹{marketPrice.toLocaleString()}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setListingPrice(maxPrice)}
            className={`flex flex-col gap-1 h-16 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
          >
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-xs">Premium</span>
            <span className="text-xs font-bold">₹{maxPrice.toLocaleString()}</span>
          </Button>
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-4">
        <Label className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Custom Price:</Label>
        <div className="space-y-3">
          <Slider
            value={priceSlider}
            onValueChange={handlePriceSliderChange}
            max={200}
            min={50}
            step={5}
            className="w-full"
          />
          <div className={`flex justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>50% (₹{Math.round(ticket.price * 0.5).toLocaleString()})</span>
            <span>200% (₹{Math.round(ticket.price * 2).toLocaleString()})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={isDark ? 'text-white' : 'text-gray-900'}>₹</span>
          <Input
            type="number"
            value={listingPrice}
            onChange={(e) => setListingPrice(parseInt(e.target.value) || ticket.price)}
            className={`text-2xl font-bold text-center ${isDark ? 'bg-white/5 border-white/20 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
          />
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className={`p-4 rounded-xl space-y-3 ${isDark ? 'glass-card border-white/20 bg-white/5' : 'bg-gray-50 border border-gray-200'}`}>
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pricing Breakdown:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Listing Price</span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{listingPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Platform Fee (5%)</span>
            <span className="text-red-500">-₹{platformFee.toLocaleString()}</span>
          </div>
          <div className={`border-t pt-2 flex justify-between font-semibold ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <span className={isDark ? 'text-white' : 'text-gray-900'}>You Receive</span>
            <span className="text-green-500">₹{youReceive.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Profit/Loss</span>
            <span className={profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
              {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toLocaleString()} ({profitPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Market Info */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className={`font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Market Insights:</p>
            <ul className={`space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
              <li>• Similar tickets selling for ₹{marketPrice.toLocaleString()}</li>
              <li>• Average time to sell: 2-3 days</li>
              <li>• Higher prices may take longer to sell</li>
            </ul>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setStep('confirm')}
        disabled={listingPrice < ticket.price * 0.5 || listingPrice > ticket.price * 2}
        className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white h-12 font-semibold"
      >
        Continue to List
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </motion.div>
  );

  const renderConfirmStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Listing</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Review before going live</p>
      </div>

      {/* Listing Summary */}
      <div className={`p-6 rounded-xl space-y-4 ${isDark ? 'glass-card border-white/20 bg-white/5' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <img 
            src={ticket.eventImage} 
            alt={ticket.eventTitle}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.eventTitle}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{ticket.ticketType}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Seat: {ticket.seatNumber}</p>
          </div>
        </div>

        <div className={`border-t pt-4 space-y-2 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex justify-between">
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Listing Price</span>
            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{listingPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>You&apos;ll receive</span>
            <span className="text-green-500 font-semibold">₹{youReceive.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
        <h4 className={`font-semibold mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>Listing Terms:</h4>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-yellow-200' : 'text-yellow-600'}`}>
          <li>• Listing goes live immediately</li>
          <li>• 5% platform fee deducted on sale</li>
          <li>• You can edit or remove anytime</li>
          <li>• Automatic transfer on purchase</li>
          <li>• Funds available within 24 hours</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setStep('pricing')}
          className={`flex-1 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}
        >
          Back
        </Button>
        <Button
          onClick={handleListTicket}
          disabled={loading}
          className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              Listing...
            </div>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              List Ticket
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6 py-8"
    >
      <div className="relative">
        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto bg-green-500/20 rounded-full animate-ping"></div>
      </div>
      
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Listed Successfully! 🎉</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Your ticket is now live on the marketplace</p>
      </div>

      <div className={`p-4 rounded-xl ${isDark ? 'glass-card border-green-500/30 bg-green-500/10' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-center gap-2 text-green-500 mb-2">
          <TrendingUp className="h-5 w-5" />
          <span className="font-semibold">Now Live</span>
        </div>
        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.eventTitle}</p>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Listed for ₹{listingPrice.toLocaleString()}
        </p>
      </div>

      <div className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Visible to buyers immediately</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Smart contract handles automatic transfer</span>
        </div>
      </div>

      <Button
        onClick={onSuccess}
        className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white"
      >
        View My Listings
      </Button>
    </motion.div>
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const modalContent = (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide ${
          isDark 
            ? 'glass-card border-border/50 backdrop-blur-xl bg-card/90' 
            : 'bg-white border-gray-200 shadow-2xl'
        }`}
      >
        {step === 'pricing' && renderPricingStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}

        {/* Close Button */}
        {step !== 'success' && (
          <Button
            variant="ghost"
            onClick={onClose}
            className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ✕
          </Button>
        )}
      </motion.div>
    </div>
  );

  // Use portal to render modal at document body level
  if (!mounted) return null;
  
  return createPortal(modalContent, document.body);
}