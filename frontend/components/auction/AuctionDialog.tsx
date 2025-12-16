'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateAuctionForm } from './CreateAuctionForm';
import { useRouter } from 'next/navigation';

interface AuctionDialogProps {
  ticket: {
    _id: string;
    eventId: { _id: string; title: string };
    ticketTypeId: { _id: string; name: string; priceEth?: number; price?: number };
    tokenId: string;
  };
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuctionDialog({ ticket, open, onClose, onSuccess }: AuctionDialogProps) {
  const router = useRouter();

  const handleSuccess = (auction: any) => {
    onClose();
    if (onSuccess) {
      onSuccess();
    }
    // Navigate to the auction page
    router.push(`/auction/${auction.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Auction</DialogTitle>
        </DialogHeader>
        <CreateAuctionForm
          ticket={ticket}
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
