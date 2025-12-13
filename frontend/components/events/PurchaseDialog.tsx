'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { notifyTicketPurchased } from '@/lib/hooks/useRealTimeTickets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Wallet } from 'lucide-react';
import { CryptoPayment } from '@/components/web3/CryptoPayment';

interface PurchaseDialogProps {
  ticketType: any;
  eventTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PurchaseDialog({
  ticketType,
  eventTitle,
  onClose,
  onSuccess,
}: PurchaseDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CRYPTO');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);

  const totalPrice = ticketType.price * quantity;
  const platformFee = totalPrice * 0.05;
  const finalPrice = totalPrice + platformFee;

  const handlePurchase = async () => {
    // If crypto payment selected, show crypto payment UI
    if (paymentMethod === 'CRYPTO') {
      setShowCryptoPayment(true);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await apiClient.purchaseTickets({
        ticketTypeId: ticketType.id,
        quantity,
        paymentMethod,
        referralCode: referralCode || undefined,
      });

      if (response.success) {
        console.log('Purchase successful! Refreshing tickets...');
        
        // Trigger My Tickets refresh
        notifyTicketPurchased();
        
        // Also trigger global refresh events
        window.dispatchEvent(new CustomEvent('refreshTickets'));
        
        // Set localStorage flag for cross-tab communication
        localStorage.setItem('ticketPurchased', Date.now().toString());
        
        // Refresh triggers sent
        
        onSuccess();
      } else {
        setError(response.error || 'Purchase failed');
      }
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSuccess = async (txHash: string) => {
    setError('');
    setLoading(true);

    try {
      // Complete purchase with crypto transaction hash
      const response = await apiClient.purchaseTickets({
        ticketTypeId: ticketType.id,
        quantity,
        paymentMethod: 'CRYPTO',
        referralCode: referralCode || undefined,
        transactionHash: txHash,
      });

      if (response.success) {
        console.log('Crypto purchase successful!');
        notifyTicketPurchased();
        window.dispatchEvent(new CustomEvent('refreshTickets'));
        localStorage.setItem('ticketPurchased', Date.now().toString());
        onSuccess();
      } else {
        setError(response.error || 'Purchase failed');
        setShowCryptoPayment(false);
      }
    } catch (err: any) {
      setError(err.message || 'Purchase failed');
      setShowCryptoPayment(false);
    } finally {
      setLoading(false);
    }
  };

  // Show Crypto Payment UI
  if (showCryptoPayment) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg bg-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-400" />
              Pay with Crypto
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {eventTitle} - {ticketType.name}
            </DialogDescription>
          </DialogHeader>

          <CryptoPayment
            amountINR={finalPrice}
            eventTitle={eventTitle}
            ticketType={ticketType.name}
            quantity={quantity}
            onSuccess={handleCryptoSuccess}
            onCancel={() => setShowCryptoPayment(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Tickets</DialogTitle>
          <DialogDescription>
            {eventTitle} - {ticketType.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={Math.min(ticketType.maxPerWallet, ticketType.availableSupply)}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Max {ticketType.maxPerWallet} tickets per wallet
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral">Referral Code (Optional)</Label>
            <Input
              id="referral"
              type="text"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            />
            <p className="text-xs text-muted-foreground">
              Have a referral code? Enter it to support your promoter
            </p>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2 p-2 rounded-lg border border-orange-500/30 bg-orange-500/10">
                <RadioGroupItem value="CRYPTO" id="crypto" />
                <Label htmlFor="crypto" className="font-normal cursor-pointer flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-orange-400" />
                  Pay with ETH (MetaMask)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg border border-white/10">
                <RadioGroupItem value="UPI" id="upi" />
                <Label htmlFor="upi" className="font-normal cursor-pointer">
                  UPI (Google Pay, PhonePe, Paytm)
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg border border-white/10">
                <RadioGroupItem value="CARD" id="card" />
                <Label htmlFor="card" className="font-normal cursor-pointer">
                  Credit/Debit Card
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Ticket Price ({quantity}x)</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee (5%)</span>
              <span>₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>₹{finalPrice.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={loading} className={paymentMethod === 'CRYPTO' ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' : ''}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : paymentMethod === 'CRYPTO' ? (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Pay with ETH
              </>
            ) : (
              `Pay ₹${finalPrice.toLocaleString()}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
