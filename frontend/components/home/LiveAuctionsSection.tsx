'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Gavel, 
  Zap,
  ChevronRight,
  ImageOff
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useTheme } from '@/lib/context/ThemeContext';

interface Auction {
  _id: string;
  startingBidEth: number;
  currentBidEth: number;
  timeRemainingMs: number;
  totalBids: number;
  uniqueBidders: number;
  eventId: {
    _id: string;
    title: string;
    date: string;
    city?: string;
    venue?: string;
    image?: string;
    imageUrl?: string;
  };
  ticketTypeId: {
    name: string;
  };
  minNextBidEth: number;
}

export function LiveAuctionsSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const data = await apiClient.getAuctions({ status: 'active', limit: 6 });
      if (data.success) {
        setAuctions(data.auctions || []);
      }
    } catch (err) {
      console.error('Failed to fetch auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no auctions
  if (!loading && auctions.length === 0) {
    return null;
  }

  return (
    <section className={`py-20 ${isDark ? 'bg-[#0D0D0D]' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 mb-4"
            >
              <Gavel className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Live Auctions</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              Bid on{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Exclusive Tickets
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              Secure your spot at sold-out events with ETH bidding
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/auction">
              <Button 
                variant="outline" 
                className={`group ${isDark ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10' : 'border-orange-500 text-orange-600 hover:bg-orange-50'}`}
              >
                View All Auctions
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-80 rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} 
              />
            ))}
          </div>
        ) : (
          /* Auctions Grid */
          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            {auctions.slice(0, 6).map((auction, index) => (
              <AuctionMiniCard key={auction._id} auction={auction} index={index} />
            ))}
          </div>
        )}

        {/* CTA Banner */}
        {!loading && auctions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mt-12 p-6 md:p-8 rounded-2xl relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-r from-orange-950/50 to-amber-950/50 border border-orange-500/20' 
                : 'bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200'
            }`}
          >
            {/* Background glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] ${isDark ? 'bg-orange-500/20' : 'bg-purple-500/10'}`} />
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl shadow-lg ${
                  isDark 
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/30' 
                    : 'bg-gradient-to-br from-purple-500 to-cyan-500 shadow-purple-500/30'
                }`}>
                  <Gavel className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Have a ticket to sell?
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    List your ticket for auction and let buyers compete
                  </p>
                </div>
              </div>
              
              <Link href="/my-tickets">
                <Button 
                  size="lg"
                  className={`font-semibold px-8 border-0 shadow-lg ${
                    isDark 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/25' 
                      : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-purple-500/25'
                  } text-white`}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Start Auction
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Mini Auction Card - OpenSeaEventCard Style
function AuctionMiniCard({ auction, index }: { auction: Auction; index: number }) {
  const [timeRemaining, setTimeRemaining] = useState(auction.timeRemainingMs);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (ms: number): string => {
    if (ms <= 0) return 'Ended';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Format date like OpenSeaEventCard
  const formatDateTime = () => {
    if (!auction.eventId?.date) return 'Date TBD';
    const date = new Date(auction.eventId.date);
    const day = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('en-IN', { month: 'short' });
    return `${day}, ${dayNum} ${month}`;
  };

  const isEndingSoon = timeRemaining > 0 && timeRemaining < 60 * 60 * 1000;
  const isHot = auction.totalBids >= 5 || auction.uniqueBidders >= 3;
  const hasNoBids = auction.currentBidEth === 0;
  
  // Get valid image URL
  const getImageUrl = () => {
    const img = auction.eventId?.image || auction.eventId?.imageUrl;
    if (!img || imageError) return null;
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return null;
  };
  
  const eventImage = getImageUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/auction/${auction._id}`}>
        <div className="relative rounded-xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden w-72 hover:-translate-y-1">
          {/* Image section */}
          <div className="relative bg-gray-100 aspect-[4/5]">
            {eventImage ? (
              <img
                src={eventImage}
                alt={auction.eventId?.title || 'Event'}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100">
                <div className="text-center">
                  <ImageOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-400">No Image</span>
                </div>
              </div>
            )}

          </div>

          {/* Content section - white background */}
          <div className="bg-white p-4 space-y-1">
            {/* Date - colored text */}
            <p className="font-medium text-red-500 text-sm">
              {formatDateTime()}
            </p>

            {/* Event Title */}
            <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 text-base">
              {auction.eventId?.title || 'Untitled Event'}
            </h3>

            {/* Location */}
            <p className="text-sm font-semibold text-gray-700 line-clamp-1">
              {auction.eventId?.city || auction.eventId?.venue || 'Venue TBA'}
            </p>

            {/* Price - ETH bid */}
            <p className="text-sm font-semibold text-gray-700">
              {hasNoBids 
                ? (auction.startingBidEth || 0).toFixed(4) 
                : (auction.currentBidEth || 0).toFixed(4)
              } ETH onwards
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
