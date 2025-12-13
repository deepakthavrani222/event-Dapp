'use client';

import { useState } from 'react';
import { MyTicketsHub } from '@/components/tickets/MyTicketsHub';
import { GiftTransferDialog } from '@/components/tickets/GiftTransferDialog';
import { ResellDialog } from '@/components/tickets/ResellDialog';
import { useAuth } from '@/lib/context/AuthContext';
import { redirect } from 'next/navigation';
import { PublicHeader } from '@/components/shared/public-header';
import { useTheme } from '@/lib/context/ThemeContext';

export default function MyTicketsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showResellDialog, setShowResellDialog] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Redirect to login if not authenticated
  if (!loading && !isAuthenticated) {
    redirect('/login');
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      <PublicHeader />
      <div className="pt-16">
        <MyTicketsHub />
      </div>
      
      {/* Gift Transfer Dialog */}
      {showGiftDialog && selectedTicket && (
        <GiftTransferDialog
          ticket={selectedTicket}
          onClose={() => {
            setShowGiftDialog(false);
            setSelectedTicket(null);
          }}
          onSuccess={() => {
            setShowGiftDialog(false);
            setSelectedTicket(null);
            // Refresh tickets list
            window.location.reload();
          }}
        />
      )}

      {/* Resell Dialog */}
      {showResellDialog && selectedTicket && (
        <ResellDialog
          ticket={selectedTicket}
          onClose={() => {
            setShowResellDialog(false);
            setSelectedTicket(null);
          }}
          onSuccess={() => {
            setShowResellDialog(false);
            setSelectedTicket(null);
            // Refresh tickets list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}