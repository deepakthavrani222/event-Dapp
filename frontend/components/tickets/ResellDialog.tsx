'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
      // Simulate listing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
      
      // Auto-close after success
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error('Listing failed:', error);
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
        <h2 className="text-2xl font-bold text-white">List for Resale</h2>
        <p className="text-gray-400">Set your price and list in seconds</p>
      </div>

      {/* Ticket Info */}
      <div className="glass-card border-white/20 bg-white/5 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <img 
            src={ticket.eventImage} 
            alt={ticket.eventTitle}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-white text-sm">{ticket.eventTitle}</p>
            <p className="text-xs text-gray-400">
              {ticket.ticketType} • Original: ₹{ticket.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Price Suggestions */}
      <div className="space-y-3">
        <Label className="text-white font-semibold">Quick Price Options:</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => setListingPrice(quickSalePrice)}
            className="flex flex-col gap-1 h-16 border-white/20 text-white hover:bg-white/10"
          >
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-xs">Quick Sale</span>
            <span className="text-xs font-bold">₹{quickSalePrice.toLocaleString()}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setListingPrice(marketPrice)}
            className="flex flex-col gap-1 h-16 border-white/20 text-white hover:bg-white/10"
          >
            <Target className="h-4 w-4 text-green-400" />
            <span className="text-xs">Market Price</span>
            <span className="text-xs font-bold">₹{marketPrice.toLocaleString()}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setListingPrice(maxPrice)}
            className="flex flex-col gap-1 h-16 border-white/20 text-white hover:bg-white/10"
          >
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span className="text-xs">Premium</span>
            <span className="text-xs font-bold">₹{maxPrice.toLocaleString()}</span>
          </Button>
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-4">
        <Label className="text-white font-semibold">Custom Price:</Label>
        <div className="space-y-3">
          <Slider
            value={priceSlider}
            onValueChange={handlePriceSliderChange}
            max={200}
            min={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>50% (₹{Math.round(ticket.price * 0.5).toLocaleString()})</span>
            <span>200% (₹{Math.round(ticket.price * 2).toLocaleString()})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white">₹</span>
          <Input
            type="number"
            value={listingPrice}
            onChange={(e) => setListingPrice(parseInt(e.target.value) || ticket.price)}
            className="bg-white/5 border-white/20 text-white text-2xl font-bold text-center"
          />
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="glass-card border-white/20 bg-white/5 p-4 rounded-xl space-y-3">
        <h3 className="font-semibold text-white">Pricing Breakdown:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Listing Price</span>
            <span className="text-white font-semibold">₹{listingPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Platform Fee (5%)</span>
            <span className="text-red-400">-₹{platformFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
            <span className="text-white">You Receive</span>
            <span className="text-green-400">₹{youReceive.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Profit/Loss</span>
            <span className={profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
              {profitLoss >= 0 ? '+' : ''}₹{profitLoss.toLocaleString()} ({profitPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Market Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-300 font-semibold mb-1">Market Insights:</p>
            <ul className="text-blue-200 space-y-1">
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
        <h2 className="text-2xl font-bold text-white">Confirm Listing</h2>
        <p className="text-gray-400">Review before going live</p>
      </div>

      {/* Listing Summary */}
      <div className="glass-card border-white/20 bg-white/5 p-6 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <img 
            src={ticket.eventImage} 
            alt={ticket.eventTitle}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <p className="font-semibold text-white">{ticket.eventTitle}</p>
            <p className="text-sm text-gray-400">{ticket.ticketType}</p>
            <p className="text-sm text-gray-400">Seat: {ticket.seatNumber}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Listing Price</span>
            <span className="text-white font-bold text-xl">₹{listingPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">You'll receive</span>
            <span className="text-green-400 font-semibold">₹{youReceive.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
        <h4 className="font-semibold text-yellow-300 mb-2">Listing Terms:</h4>
        <ul className="text-sm text-yellow-200 space-y-1">
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
          className="flex-1 border-white/20 text-white hover:bg-white/10"
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
        <h2 className="text-2xl font-bold text-white">Listed Successfully! 🎉</h2>
        <p className="text-gray-400">Your ticket is now live on the marketplace</p>
      </div>

      <div className="glass-card border-green-500/30 bg-green-500/10 p-4 rounded-xl">
        <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
          <TrendingUp className="h-5 w-5" />
          <span className="font-semibold">Now Live</span>
        </div>
        <p className="text-white font-semibold">{ticket.eventTitle}</p>
        <p className="text-sm text-gray-300">
          Listed for ₹{listingPrice.toLocaleString()}
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-400">
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card border-border/50 backdrop-blur-xl bg-card/90 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {step === 'pricing' && renderPricingStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}

        {/* Close Button */}
        {step !== 'success' && (
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