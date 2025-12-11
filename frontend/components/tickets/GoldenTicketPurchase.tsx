'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Sparkles, 
  Star, 
  Gift, 
  Users, 
  DollarSign,
  Award,
  Heart,
  Camera,
  Music,
  Ticket,
  Check,
  Lock,
  Zap,
  TrendingUp,
  Loader2,
  ShoppingCart,
  CreditCard,
  Wallet
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface GoldenTicketTemplate {
  id: string;
  name: string;
  description: string;
  finalPrice: number;
  maxQuantity: number;
  soldQuantity: number;
  availableQuantity: number;
  totalRoyaltyPercentage: number;
  perks: string[];
  isLimited: boolean;
  isSoulbound: boolean;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  customMessage?: string;
  artist: {
    artistName: string;
    verificationStatus: string;
  };
  createdAt: string;
}

interface GoldenTicketPurchaseProps {
  templateId: string;
  onClose: () => void;
  onSuccess: (purchase: any) => void;
}

const PERK_ICONS: { [key: string]: any } = {
  'meet_greet': Users,
  'backstage': Star,
  'merchandise': Gift,
  'priority_entry': Zap,
  'vip_seating': Crown,
  'photo_op': Camera,
  'signed_items': Award,
  'exclusive_content': Music,
  'direct_messages': Heart,
  'early_access': Ticket,
  'complimentary': Sparkles,
  'support': Users
};

const PERK_LABELS: { [key: string]: string } = {
  'meet_greet': 'Meet & Greet Access',
  'backstage': 'Backstage Pass',
  'merchandise': 'Limited Merchandise',
  'priority_entry': 'Priority Entry',
  'vip_seating': 'VIP Seating',
  'photo_op': 'Photo Opportunity',
  'signed_items': 'Signed Memorabilia',
  'exclusive_content': 'Exclusive Content',
  'direct_messages': 'Direct Messages',
  'early_access': 'Early Event Access',
  'complimentary': 'Complimentary Items',
  'support': 'Dedicated Support'
};

export function GoldenTicketPurchase({ templateId, onClose, onSuccess }: GoldenTicketPurchaseProps) {
  const [template, setTemplate] = useState<GoldenTicketTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');

  useEffect(() => {
    fetchTemplate();
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await apiClient.getGoldenTicketTemplate(templateId);
      if (response.success) {
        setTemplate(response.template);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Failed to fetch golden ticket template:', error);
      alert('Failed to load Golden Ticket details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!template) return;

    setPurchasing(true);
    
    try {
      const purchaseData = {
        paymentMethod,
        walletAddress: '0x1234567890123456789012345678901234567890' // Mock wallet
      };

      const response = await apiClient.purchaseGoldenTicket(templateId, purchaseData);
      
      if (response.success) {
        onSuccess(response.purchase);
        
        // Show success message with confetti effect
        alert(`🎉 Golden Ticket Purchased Successfully!\n\n` +
              `Token ID: ${response.purchase.tokenId}\n` +
              `Price: ₹${response.purchase.purchasePrice.toLocaleString()}\n` +
              `Perks: ${template.perks.length} exclusive benefits\n\n` +
              `Your NFT ticket is now in your wallet!`);
        
        onClose();
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      console.error('Purchase failed:', error);
      alert(`Purchase failed: ${error.message}`);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const isAvailable = template.isActive && template.availableQuantity > 0;
  const urgencyLevel = template.availableQuantity <= 5 ? 'high' : 
                      template.availableQuantity <= 20 ? 'medium' : 'low';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div 
          className="p-6 text-black relative overflow-hidden"
          style={{ backgroundColor: template.backgroundColor }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-black/30 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                Golden NFT Ticket
              </Badge>
              <button
                onClick={onClose}
                className="text-black/70 hover:text-black text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
            <p className="opacity-80 mb-4">{template.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{template.artist.artistName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="h-4 w-4" />
                <span>{template.perks.length} Perks</span>
              </div>
              {template.isLimited && (
                <div className="flex items-center gap-1">
                  <Ticket className="h-4 w-4" />
                  <span>#{template.soldQuantity + 1} of {template.maxQuantity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Availability Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">₹{template.finalPrice.toLocaleString()}</h3>
              <p className="text-sm text-gray-400">
                {template.availableQuantity} of {template.maxQuantity} available
              </p>
            </div>
            
            {urgencyLevel === 'high' && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Almost Sold Out!
              </Badge>
            )}
            {urgencyLevel === 'medium' && (
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Limited Remaining
              </Badge>
            )}
          </div>

          {/* Perks List */}
          <div>
            <h4 className="font-semibold text-white mb-3">Exclusive Perks Included:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {template.perks.map((perk) => {
                const Icon = PERK_ICONS[perk] || Gift;
                const label = PERK_LABELS[perk] || perk;
                
                return (
                  <div key={perk} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <Icon className="h-5 w-5 text-yellow-400" />
                    <span className="text-white text-sm">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Special Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-white text-sm font-semibold">NFT Collectible</p>
                  <p className="text-purple-300 text-xs">Unique digital artwork</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-white text-sm font-semibold">{template.totalRoyaltyPercentage}% Artist Royalty</p>
                  <p className="text-green-300 text-xs">Supporting the artist</p>
                </div>
              </div>
              
              {template.isSoulbound && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-white text-sm font-semibold">Soulbound NFT</p>
                    <p className="text-blue-300 text-xs">Non-transferable</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <h4 className="font-semibold text-white mb-3">Payment Method:</h4>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-yellow-500/50 bg-yellow-500/20'
                    : 'border-white/20 bg-white/5 hover:border-yellow-500/30'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-6 w-6 mx-auto text-white mb-2" />
                  <p className="text-white text-sm font-semibold">Credit Card</p>
                  <p className="text-gray-400 text-xs">Instant payment</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-yellow-500/50 bg-yellow-500/20'
                    : 'border-white/20 bg-white/5 hover:border-yellow-500/30'
                }`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <CardContent className="p-4 text-center">
                  <Wallet className="h-6 w-6 mx-auto text-white mb-2" />
                  <p className="text-white text-sm font-semibold">Crypto Wallet</p>
                  <p className="text-gray-400 text-xs">Web3 payment</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Custom Message */}
          {template.customMessage && (
            <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <h4 className="font-semibold text-white mb-2">Message from {template.artist.artistName}:</h4>
              <p className="text-yellow-100 text-sm italic">"{template.customMessage}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20 bg-white/5">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!isAvailable || purchasing}
              className="flex-1 gradient-yellow-orange hover:opacity-90 border-0 text-black font-bold"
            >
              {purchasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : !isAvailable ? (
                'Sold Out'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Golden Ticket - ₹{template.finalPrice.toLocaleString()}
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 text-center mt-3">
            By purchasing, you agree to the terms and conditions. NFT will be minted to your wallet.
          </p>
        </div>
      </motion.div>
    </div>
  );
}