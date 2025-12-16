'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Gavel, 
  Clock, 
  TrendingUp, 
  Shield,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface CreateAuctionFormProps {
  ticket: {
    _id: string;
    eventId: { title: string };
    ticketTypeId: { name: string; priceEth?: number; price?: number };
    tokenId: string;
  };
  onSuccess: (auction: any) => void;
  onCancel: () => void;
}

export function CreateAuctionForm({ ticket, onSuccess, onCancel }: CreateAuctionFormProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate original price in ETH (1 ETH ≈ 250,000 INR)
  const ETH_TO_INR = 250000;
  const ticketPriceInr = ticket.ticketTypeId.price || 1000; // Default 1000 INR
  const originalPriceEth = ticket.ticketTypeId.priceEth || Math.max(ticketPriceInr / ETH_TO_INR, 0.001);

  const [formData, setFormData] = useState({
    startingBidEth: Math.max(0.001, originalPriceEth * 0.5), // 50% of original, min 0.001
    reservePriceEth: 0, // No reserve by default
    bidIncrementEth: 0.001,
    durationHours: 24,
    hasReserve: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate fees preview
  const platformFee = 7.5;
  const organizerRoyalty = 5;
  const artistRoyalty = 10;
  const totalFees = platformFee + organizerRoyalty + artistRoyalty;
  const estimatedProceeds = formData.startingBidEth * (1 - totalFees / 100);

  // Price cap (150% of original, minimum 1 ETH to allow reasonable bids)
  const maxPriceCap = Math.max(originalPriceEth * 1.5, 1);

  const handleSubmit = async () => {
    if (formData.startingBidEth <= 0) {
      toast({
        title: 'Invalid Starting Bid',
        description: 'Starting bid must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (formData.hasReserve && formData.reservePriceEth < formData.startingBidEth) {
      toast({
        title: 'Invalid Reserve Price',
        description: 'Reserve price must be at least equal to starting bid',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.createAuction({
        ticketId: ticket._id,
        startingBidEth: formData.startingBidEth,
        reservePriceEth: formData.hasReserve ? formData.reservePriceEth : 0,
        bidIncrementEth: formData.bidIncrementEth,
        durationHours: formData.durationHours,
      });

      if (data.success) {
        toast({
          title: '🎉 Auction Created!',
          description: 'Your ticket is now up for auction',
        });
        onSuccess(data.auction);
      } else {
        throw new Error(data.error || 'Failed to create auction');
      }
    } catch (err: any) {
      console.error('Create auction error:', err);
      setError(err.message);
      toast({
        title: 'Failed to Create Auction',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const durationOptions = [
    { hours: 1, label: '1 hour' },
    { hours: 6, label: '6 hours' },
    { hours: 12, label: '12 hours' },
    { hours: 24, label: '24 hours' },
    { hours: 48, label: '2 days' },
    { hours: 72, label: '3 days' },
    { hours: 168, label: '7 days' },
  ];

  return (
    <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Gavel className="h-5 w-5 text-orange-500" />
          Create Auction
        </CardTitle>
        <CardDescription>
          Auction your ticket for {ticket.eventId.title} - {ticket.ticketTypeId.name}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Starting Bid */}
        <div className="space-y-2">
          <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            Starting Bid (ETH)
          </Label>
          <Input
            type="number"
            step="0.001"
            min="0.001"
            value={formData.startingBidEth}
            onChange={(e) => setFormData({ ...formData, startingBidEth: parseFloat(e.target.value) || 0 })}
            className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}
          />
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Original price: {originalPriceEth.toFixed(4)} ETH | Suggested: 50-100% of original
          </p>
        </div>

        {/* Reserve Price Toggle */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                Reserve Price (Hidden Minimum)
              </Label>
            </div>
            <Switch
              checked={formData.hasReserve}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                hasReserve: checked,
                reservePriceEth: checked ? formData.startingBidEth : 0
              })}
            />
          </div>
          
          {formData.hasReserve && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Input
                type="number"
                step="0.001"
                min={formData.startingBidEth}
                value={formData.reservePriceEth}
                onChange={(e) => setFormData({ ...formData, reservePriceEth: parseFloat(e.target.value) || 0 })}
                className={isDark ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}
              />
              <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Info className="h-3 w-3" />
                If not met, auction ends without sale
              </p>
            </motion.div>
          )}
        </div>

        {/* Bid Increment */}
        <div className="space-y-2">
          <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            Minimum Bid Increment (ETH)
          </Label>
          <div className="flex gap-2">
            {[0.001, 0.005, 0.01, 0.05].map((increment) => (
              <Button
                key={increment}
                size="sm"
                variant={formData.bidIncrementEth === increment ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, bidIncrementEth: increment })}
                className={formData.bidIncrementEth === increment 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : isDark ? 'border-gray-600' : 'border-gray-300'
                }
              >
                {increment} ETH
              </Button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-3">
          <Label className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <Clock className="h-4 w-4" />
            Auction Duration
          </Label>
          <div className="flex flex-wrap gap-2">
            {durationOptions.map((option) => (
              <Button
                key={option.hours}
                size="sm"
                variant={formData.durationHours === option.hours ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, durationHours: option.hours })}
                className={formData.durationHours === option.hours 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : isDark ? 'border-gray-600' : 'border-gray-300'
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Fee Preview */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="h-4 w-4 text-green-500" />
            Fee Preview (on sale)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Platform Fee</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{platformFee}%</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Organizer Royalty</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{organizerRoyalty}%</span>
            </div>
            <div className="flex justify-between">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Artist Royalty</span>
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{artistRoyalty}%</span>
            </div>
            <div className={`border-t pt-2 mt-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
              <div className="flex justify-between font-medium">
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>You receive</span>
                <span className="text-green-500">{(100 - totalFees).toFixed(1)}%</span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                At starting bid: ~{estimatedProceeds.toFixed(4)} ETH
              </p>
            </div>
          </div>
        </div>

        {/* Price Cap Notice */}
        <div className={`p-3 rounded-lg flex items-start gap-2 ${isDark ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
          <Info className={`h-4 w-4 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            <p className="font-medium">Price Cap Active</p>
            <p className="text-xs mt-1">
              Maximum bid is capped at {maxPriceCap.toFixed(4)} ETH (150% of original price) to ensure fair access.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${isDark ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className={`flex-1 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || formData.startingBidEth <= 0}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Gavel className="h-4 w-4 mr-2" />
                Start Auction
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
