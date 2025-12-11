'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ticket, 
  QrCode, 
  Share2, 
  Gift, 
  DollarSign, 
  Download, 
  Calendar,
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Wallet,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  Star,
  Heart
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { useRealTimeTickets, triggerTicketRefresh } from '@/lib/hooks/useRealTimeTickets';
import { checkRecentPurchase } from '@/lib/api/purchaseWithRefresh';
import { TicketEntryScreen } from './TicketEntryScreen';
import { GiftTransferDialog } from './GiftTransferDialog';
import { ResellDialog } from './ResellDialog';

interface TicketData {
  id: string;
  eventId: string;
  eventTitle: string;
  eventImage: string;
  venue: string;
  city: string;
  date: string;
  seatNumber?: string;
  ticketType: string;
  price: number;
  qrCode: string;
  status: 'upcoming' | 'past' | 'used';
  transferable: boolean;
  resellable: boolean;
}

interface ResaleListingData {
  id: string;
  ticketId: string;
  eventTitle: string;
  eventImage: string;
  originalPrice: number;
  listingPrice: number;
  status: 'active' | 'sold' | 'expired';
  views: number;
  listedDate: string;
}

export function MyTicketsHub() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [resaleListings, setResaleListings] = useState<ResaleListingData[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [showEntryScreen, setShowEntryScreen] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [showResellDialog, setShowResellDialog] = useState(false);

  // Use real-time tickets hook for instant updates
  const { 
    tickets: realTimeTickets, 
    loading: realTimeLoading, 
    refreshTickets: forceRefresh,
    ticketCount 
  } = useRealTimeTickets();

  useEffect(() => {
    // Check for recent purchases on mount
    checkRecentPurchase();
    
    fetchResaleListings();
    fetchWalletBalance();
  }, [user]); // Refresh when user changes

  // Sync real-time tickets with local state
  useEffect(() => {
    if (realTimeTickets && realTimeTickets.length >= 0) {
      // Transform real-time tickets to component format
      const transformedTickets: TicketData[] = realTimeTickets.map((ticket: any) => {
        const eventDate = new Date(ticket.event?.startDate || Date.now());
        const now = new Date();
        
        return {
          id: ticket.id,
          eventId: ticket.event?.id || '',
          eventTitle: ticket.event?.title || 'Unknown Event',
          eventImage: '/concert-stage-purple-lights.jpg',
          venue: ticket.event?.venue || 'TBA',
          city: 'Mumbai',
          date: ticket.event?.startDate || new Date().toISOString(),
          seatNumber: `${ticket.ticketType?.name || 'GA'}-${ticket.tokenId}`,
          ticketType: ticket.ticketType?.name || 'General Admission',
          price: ticket.price || 0,
          qrCode: `QR_${ticket.tokenId}_${ticket.id}`,
          status: ticket.status === 'USED' ? 'past' : 
                 (eventDate < now ? 'past' : 'upcoming') as 'upcoming' | 'past' | 'used',
          transferable: ticket.status === 'ACTIVE',
          resellable: ticket.status === 'ACTIVE' && eventDate > addDays(now, 1)
        };
      });
      
      setTickets(transformedTickets);
      setLoading(realTimeLoading);
      // Real-time sync completed
    }
  }, [realTimeTickets, realTimeLoading]);

  // Refresh when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refreshing tickets
        refreshTickets();
      }
    };

    const handleFocus = () => {
      // Window focused, refreshing tickets
      refreshTickets();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Also refresh every 3 seconds when page is active (very frequent for immediate updates)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        // Auto-refresh interval
        refreshTickets();
      }
    }, 3000); // Very frequent refresh for immediate updates

    return () => clearInterval(interval);
  }, []);

  // Listen for storage events (when other tabs make purchases)
  useEffect(() => {
    const handleStorageChange = () => {
      // Storage change detected, refreshing
      refreshTickets();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for page navigation events
  useEffect(() => {
    const handlePopState = () => {
      // Navigation detected, refreshing
      refreshTickets();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen for keyboard shortcuts (F5 or Ctrl+R)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        // Refresh key detected, refreshing tickets
        refreshTickets();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add a refresh function that can be called manually
  const refreshTickets = () => {
    // Manual refresh triggered
    setLoading(true); // Show loading state during refresh
    forceRefresh(); // Use real-time refresh
    fetchResaleListings();
    fetchWalletBalance();
  };

  const fetchUserTickets = async () => {
    try {
      // Fetching user tickets
      
      // Force clear any cached responses
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      const response = await apiClient.getMyTickets();
      
      if (response.success && response.tickets) {
        // Found tickets, transforming data
        
        // Transform API response to match component interface
        const transformedTickets: TicketData[] = response.tickets.map((ticket: any) => {
          const eventDate = new Date(ticket.event?.startDate || Date.now());
          const now = new Date();
          
          return {
            id: ticket.id,
            eventId: ticket.event?.id || '',
            eventTitle: ticket.event?.title || 'Unknown Event',
            eventImage: '/concert-stage-purple-lights.jpg', // Default image - could be from event data
            venue: ticket.event?.venue || 'TBA',
            city: 'Mumbai', // Default - could be extracted from venue
            date: ticket.event?.startDate || new Date().toISOString(),
            seatNumber: `${ticket.ticketType?.name || 'GA'}-${ticket.tokenId}`,
            ticketType: ticket.ticketType?.name || 'General Admission',
            price: ticket.price || 0,
            qrCode: `QR_${ticket.tokenId}_${ticket.id}`,
            status: ticket.status === 'USED' ? 'past' : 
                   (eventDate < now ? 'past' : 'upcoming') as 'upcoming' | 'past' | 'used',
            transferable: ticket.status === 'ACTIVE',
            resellable: ticket.status === 'ACTIVE' && eventDate > addDays(now, 1) // Can resell if event is more than 1 day away
          };
        });
        
        // Tickets transformed successfully
        setTickets(transformedTickets);
      } else {
        // No tickets found - set empty array
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      // On error, show empty state instead of mock data
      setTickets([]);
    }
  };

  const fetchResaleListings = async () => {
    try {
      // TODO: Implement actual API call when resale listings endpoint is ready
      // const response = await apiClient.getMyResaleListings();
      
      // For now, set empty array - will be populated when resale system is implemented
      setResaleListings([]);
    } catch (error) {
      console.error('Failed to fetch resale listings:', error);
      setResaleListings([]);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      // TODO: Implement actual wallet balance API call
      // const response = await apiClient.getWalletBalance();
      
      // For now, set to 0 - will be populated when wallet system is implemented
      setWalletBalance(0);
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      setWalletBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const getCountdown = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event.getTime() - now.getTime();
    
    if (diff <= 0) return 'Event passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours`;
    return `${hours} hours`;
  };

  const upcomingTickets = tickets.filter(t => t.status === 'upcoming');
  const pastTickets = tickets.filter(t => t.status === 'past');

  const TicketCard = ({ ticket }: { ticket: TicketData }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-white/20 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
    >
      {/* Event Banner */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={ticket.eventImage} 
          alt={ticket.eventTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={
            ticket.status === 'upcoming' 
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
          }>
            {ticket.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
          </Badge>
        </div>

        {/* Countdown for upcoming events */}
        {ticket.status === 'upcoming' && (
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">{getCountdown(ticket.date)}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Event Info */}
        <div className="space-y-2">
          <h3 className="font-bold text-white text-lg line-clamp-1">{ticket.eventTitle}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(ticket.date), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{ticket.venue}</span>
            </div>
          </div>
          
          {/* Seat & Ticket Type */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {ticket.seatNumber && (
                <p className="text-sm text-gray-300">
                  <span className="text-gray-400">Seat:</span> {ticket.seatNumber}
                </p>
              )}
              <p className="text-sm text-gray-300">
                <span className="text-gray-400">Type:</span> {ticket.ticketType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">₹{ticket.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Show QR - Opens Entry Screen */}
          <Button
            onClick={() => {
              setSelectedTicket(ticket);
              setShowEntryScreen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-white hover:bg-purple-500/30"
          >
            <QrCode className="h-4 w-4" />
            <span>Show QR</span>
          </Button>

          {/* Share/Gift */}
          {ticket.transferable && (
            <Button
              onClick={() => {
                setSelectedTicket(ticket);
                setShowGiftDialog(true);
              }}
              variant="outline"
              className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
            >
              <Gift className="h-4 w-4" />
              <span>Gift</span>
            </Button>
          )}

          {/* Resell */}
          {ticket.resellable && (
            <Button
              onClick={() => {
                setSelectedTicket(ticket);
                setShowResellDialog(true);
              }}
              variant="outline"
              className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
            >
              <DollarSign className="h-4 w-4" />
              <span>Resell</span>
            </Button>
          )}

          {/* Download PDF */}
          <Button
            onClick={() => {
              // Generate and download PDF
              console.log('Downloading PDF for ticket:', ticket.id);
            }}
            variant="outline"
            className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </Button>
        </div>
      </CardContent>
    </motion.div>
  );

  const ResaleCard = ({ listing }: { listing: ResaleListingData }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-white/20 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden"
    >
      <div className="flex">
        {/* Event Image */}
        <div className="w-24 h-24 flex-shrink-0">
          <img 
            src={listing.eventImage} 
            alt={listing.eventTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Listing Info */}
        <div className="flex-1 p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-white text-sm line-clamp-1">{listing.eventTitle}</h4>
            <Badge className={
              listing.status === 'active' 
                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                : listing.status === 'sold'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
            }>
              {listing.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-400">Original: ₹{listing.originalPrice.toLocaleString()}</p>
              <p className="text-white font-semibold">Listed: ₹{listing.listingPrice.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">{listing.views} views</p>
              <p className="text-xs text-gray-500">
                {format(new Date(listing.listedDate), 'MMM dd')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-gray-400">Your personal ticket hub - like Amazon orders, but for events</p>
        </div>
        
        {/* Wallet Balance */}
        <div className="glass-card border-green-500/30 bg-green-500/10 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Wallet Balance</p>
              <p className="text-2xl font-bold text-white">₹{walletBalance.toLocaleString()}</p>
              <Button size="sm" className="mt-1 bg-green-500 hover:bg-green-600 text-white">
                Withdraw to Bank
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/20">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-white/20">
            Upcoming ({upcomingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-white/20">
            Past ({pastTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resale" className="data-[state=active]:bg-white/20">
            Resale Listings ({resaleListings.length})
          </TabsTrigger>
          <TabsTrigger value="wallet" className="data-[state=active]:bg-white/20">
            Wallet
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Tickets */}
        <TabsContent value="upcoming" className="space-y-6">
          {upcomingTickets.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No upcoming events</h3>
              <p className="text-gray-400 mb-4">Browse events and book your next experience!</p>
              <Button className="gradient-purple-cyan hover:opacity-90 border-0 text-white">
                Browse Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Tickets */}
        <TabsContent value="past" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-semibold">Collectibles</span>
            <span className="text-gray-400 text-sm">- Keep your memories forever</span>
          </div>
          
          {pastTickets.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No past events yet</h3>
              <p className="text-gray-400">Your attended events will appear here as collectibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Resale Listings */}
        <TabsContent value="resale" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-white font-semibold">Active Listings</span>
            </div>
            <Button className="gradient-purple-cyan hover:opacity-90 border-0 text-white">
              List New Ticket
            </Button>
          </div>

          {resaleListings.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No active listings</h3>
              <p className="text-gray-400 mb-4">List your tickets for resale and earn money</p>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Learn About Reselling
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {resaleListings.map((listing) => (
                <ResaleCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Card */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <h3 className="text-xl font-bold text-white">Wallet Balance</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">₹{walletBalance.toLocaleString()}</p>
                  <p className="text-gray-400">Available for withdrawal</p>
                </div>
                <Button className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white">
                  Withdraw to Bank Account
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Ticket sale - AR Rahman</span>
                    <span className="text-green-400">+₹4,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Platform fee</span>
                    <span className="text-red-400">-₹420</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Withdrawal to bank</span>
                    <span className="text-gray-400">-₹8,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Full Entry Screen with Huge QR */}
      {showEntryScreen && selectedTicket && (
        <TicketEntryScreen
          ticket={{
            id: selectedTicket.id,
            eventTitle: selectedTicket.eventTitle,
            eventImage: selectedTicket.eventImage,
            venue: selectedTicket.venue,
            city: selectedTicket.city,
            date: selectedTicket.date,
            seatNumber: selectedTicket.seatNumber,
            ticketType: selectedTicket.ticketType,
            qrCode: selectedTicket.qrCode,
            ownerName: user?.name || 'Guest',
            tokenId: `TKT-${selectedTicket.id}-${Date.now()}`
          }}
          onBack={() => {
            setShowEntryScreen(false);
            setSelectedTicket(null);
          }}
        />
      )}

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
            fetchUserTickets();
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
            fetchUserTickets();
            fetchResaleListings();
          }}
        />
      )}
    </div>
  );
}