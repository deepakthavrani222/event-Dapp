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

interface CreateReferralDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReferralDialog({ onClose, onSuccess }: CreateReferralDialogProps) {
  const [commissionRate, setCommissionRate] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.request('/api/promoter/referrals', {
        method: 'POST',
        body: JSON.stringify({
          commissionRate,
        }),
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to create referral code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create referral code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Referral Code</DialogTitle>
          <DialogDescription>
            Generate a new referral code to share with potential buyers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="commission">Commission Rate (%)</Label>
            <Input
              id="commission"
              type="number"
              min={1}
              max={20}
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseInt(e.target.value) || 5)}
            />
            <p className="text-xs text-muted-foreground">
              You'll earn {commissionRate}% commission on each sale using this code
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">How it works:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Share your referral code with buyers</li>
              <li>They enter it during ticket purchase</li>
              <li>You earn commission on every sale</li>
              <li>Commission applies to both primary and resale</li>
            </ul>
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
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Code'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
