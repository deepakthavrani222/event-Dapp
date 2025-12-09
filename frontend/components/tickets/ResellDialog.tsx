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
import { Loader2 } from 'lucide-react';

interface ResellDialogProps {
  ticket: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResellDialog({ ticket, onClose, onSuccess }: ResellDialogProps) {
  const [price, setPrice] = useState(ticket.price);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platformFee = price * 0.05;
  const royaltyFee = price * 0.10; // Approximate
  const youReceive = price - platformFee - royaltyFee;

  const handleResell = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.request('/api/buyer/resell', {
        method: 'POST',
        body: JSON.stringify({
          ticketId: ticket.id,
          price,
        }),
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to list ticket');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to list ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resell Ticket</DialogTitle>
          <DialogDescription>
            List your ticket for resale on the marketplace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Resale Price (₹)</Label>
            <Input
              id="price"
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Original price: ₹{ticket.price.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Listing Price</span>
              <span>₹{price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee (5%)</span>
              <span>-₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Royalty Fee (~10%)</span>
              <span>-₹{royaltyFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>You Receive</span>
              <span className="text-green-600">₹{youReceive.toLocaleString()}</span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="font-semibold mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Once listed, you cannot use this ticket</li>
              <li>Royalties go to organizers and artists</li>
              <li>You can cancel the listing anytime</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleResell} disabled={loading || price <= 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Listing...
              </>
            ) : (
              'List for Resale'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
