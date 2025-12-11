// Real-time tickets hook using polling and events
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';

export function useRealTimeTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const fetchTickets = useCallback(async (force = false) => {
    try {
      // Prevent too frequent calls (minimum 1 second gap)
      const now = Date.now();
      if (!force && now - lastFetchTime < 1000) {
        return;
      }

      // Fetching tickets (real-time)
      const response = await apiClient.getMyTickets();
      
      if (response.success && response.tickets) {
        setTickets(response.tickets);
        setLastFetchTime(now);
        // Real-time update completed
      }
    } catch (error) {
      console.error('🎫 Real-time fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

  // Initial fetch
  useEffect(() => {
    fetchTickets(true);
  }, []);

  // Listen for custom events (when purchase happens)
  useEffect(() => {
    const handleTicketPurchased = () => {
      // Ticket purchased event received
      fetchTickets(true);
    };

    const handleRefreshTickets = () => {
      // Manual refresh event received
      fetchTickets(true);
    };

    // Listen for custom events
    window.addEventListener('ticketPurchased', handleTicketPurchased);
    window.addEventListener('refreshTickets', handleRefreshTickets);

    return () => {
      window.removeEventListener('ticketPurchased', handleTicketPurchased);
      window.removeEventListener('refreshTickets', handleRefreshTickets);
    };
  }, [fetchTickets]);

  // Aggressive polling when page is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchTickets();
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Listen for visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page visible, refreshing tickets
        fetchTickets(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    refreshTickets: () => fetchTickets(true),
    ticketCount: tickets.length
  };
}

// Global function to trigger refresh from anywhere
export function triggerTicketRefresh() {
  // Triggering global ticket refresh
  window.dispatchEvent(new CustomEvent('refreshTickets'));
}

// Function to call after successful purchase
export function notifyTicketPurchased() {
  // Notifying ticket purchased
  window.dispatchEvent(new CustomEvent('ticketPurchased'));
}