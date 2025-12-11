// Purchase button with instant My Tickets refresh
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { purchaseTicketWithRefresh } from '@/lib/api/purchaseWithRefresh';
import { ShoppingCart, CheckCircle } from 'lucide-react';

interface PurchaseButtonProps {
  ticketTypeId: string;
  quantity?: number;
  paymentMethod?: string;
  price: number;
  eventTitle: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PurchaseButton({
  ticketTypeId,
  quantity = 1,
  paymentMethod = 'UPI',
  price,
  eventTitle,
  onSuccess,
  onError,
  className = '',
  children
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      console.log(`🎫 Purchasing ${quantity} ticket(s) for ${eventTitle}...`);
      
      const response = await purchaseTicketWithRefresh(
        ticketTypeId,
        quantity,
        paymentMethod
      );

      if (response.success) {
        console.log('Purchase successful! Tickets will update automatically.');
        setSuccess(true);
        
        // Show success state for 2 seconds
        setTimeout(() => setSuccess(false), 2000);
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Ticket Purchased!', {
            body: `Successfully purchased ${quantity} ticket(s) for ${eventTitle}`,
            icon: '/favicon.ico'
          });
        }
        
      } else {
        throw new Error(response.error || 'Purchase failed');
      }
      
    } catch (error: any) {
      console.error('🎫 Purchase error:', error);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      disabled={loading || success}
      className={`${className} ${success ? 'bg-green-500 hover:bg-green-600' : ''}`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Processing...
        </>
      ) : success ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Purchased!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4 mr-2" />
          {children || `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''} - ₹${(price * quantity).toLocaleString()}`}
        </>
      )}
    </Button>
  );
}

// Hook to request notification permission
export function useNotificationPermission() {
  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return { requestPermission };
}