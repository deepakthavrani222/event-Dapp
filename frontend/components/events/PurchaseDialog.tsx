'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api/client';
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
import { Loader2 } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalPrice = ticketType.price * quantity;
  const platformFee = totalPrice * 0.05;
  const finalPrice = totalPrice + platformFee;

  const handlePurchase = async () => {
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
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="UPI" id="upi" />
                <Label htmlFor="upi" className="font-normal cursor-pointer">
                  UPI (Google Pay, PhonePe, Paytm)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CARD" id="card" />
                <Label htmlFor="card" className="font-normal cursor-pointer">
                  Credit/Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="WALLET" id="wallet" />
                <Label htmlFor="wallet" className="font-normal cursor-pointer">
                  Crypto Wallet
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
          <Button onClick={handlePurchase} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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
