// Purchase wrapper that triggers immediate refresh
import { apiClient } from './client';
import { triggerTicketRefresh, notifyTicketPurchased } from '../hooks/useRealTimeTickets';

export async function purchaseTicketWithRefresh(
  ticketTypeId: string, 
  quantity: number = 1, 
  paymentMethod: string = 'UPI'
) {
  try {
    // Starting purchase with auto-refresh
    
    // Make the purchase
    const response = await apiClient.purchaseTickets({
      ticketTypeId,
      quantity,
      paymentMethod
    });

    if (response.success) {
      console.log('Purchase successful! Triggering refresh...');
      
      // Immediately notify all My Tickets components to refresh
      notifyTicketPurchased();
      
      // Also trigger a global refresh event
      triggerTicketRefresh();
      
      // Set a flag in localStorage to trigger refresh on navigation
      localStorage.setItem('ticketPurchased', Date.now().toString());
      
      // Dispatch a storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'ticketPurchased',
        newValue: Date.now().toString(),
        storageArea: localStorage
      }));

      // All refresh triggers sent
    }

    return response;
  } catch (error) {
    console.error('🎫 Purchase with refresh error:', error);
    throw error;
  }
}

// Function to check if a recent purchase happened
export function checkRecentPurchase() {
  const lastPurchase = localStorage.getItem('ticketPurchased');
  if (lastPurchase) {
    const purchaseTime = parseInt(lastPurchase);
    const now = Date.now();
    
    // If purchase was within last 30 seconds, trigger refresh
    if (now - purchaseTime < 30000) {
      // Recent purchase detected, triggering refresh
      triggerTicketRefresh();
      
      // Clear the flag
      localStorage.removeItem('ticketPurchased');
      return true;
    }
  }
  return false;
}