'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Gavel, 
  TrendingUp, 
  Users, 
  Flame,
  MapPin,
  ImageOff
} from 'lucide-react';
import Link from 'next/link';

interface AuctionCardProps {
  auction: {
    _id: string;
    startingBidEth: number;
    currentBidEth: number;
    bidIncrementEth: number;
    endTime: string;
    timeRemainingMs: number;
    timeRemainingFormatted: string;
    totalBids: number;
    uniqueBidders: number;
    views: number;
    status: string;
    eventId: {
      _id: string;
      title: string;
      date: string;
      venue: string;
      city?: string;
      image?: string;
      imageUrl?: string;
    };
    ticketTypeId: {
      name: string;
      description?: string;
    };
    minNextBidEth: number;
  };
  showBidButton?: boolean;
  highlight?: 'ending' | 'hot' | null;
}

export function AuctionCard({ auction, showBidButton = true, highlight = null }: AuctionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState(auction.timeRemainingMs);
  const [imageError, setImageError] = useState(false);

  // Live countdown
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

  const isEndingSoon = timeRemaining > 0 && timeRemaining < 60 * 60 * 1000;
  const isHot = (auction.totalBids || 0) >= 5 || (auction.uniqueBidders || 0) >= 3;
  const hasNoBids = !auction.currentBidEth || auction.currentBidEth === 0;
  
  // Get valid image URL
  const getImageUrl = () => {
    const img = auction.eventId?.image || auction.eventId?.imageUrl;
    if (!img || imageError) return null;
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return null;
  };
  
  const eventImage = getImageUrl();

  // Format date and time like OpenSeaEventCard
  const formatDateTime = () => {
    if (!auction.eventId?.date) return 'Date TBD';
    const date = new Date(auction.eventId.date);
    const day = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString('en-IN', { month: 'short' });
    return `${day}, ${dayNum} ${month}`;
  };

  return (
    <Link href={`/auction/${auction._id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative rounded-xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden w-72 hover:-translate-y-1"
      >
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

          {/* Status badges top-left */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {timeRemaining > 0 && (
              <div className="rounded bg-green-500 text-white font-semibold flex items-center gap-1.5 shadow px-2.5 py-1 text-xs">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
            {(isEndingSoon || highlight === 'ending') && (
              <div className="rounded bg-red-500 text-white font-semibold px-2.5 py-1 text-xs animate-pulse">
                ENDING SOON
              </div>
            )}
            {(isHot || highlight === 'hot') && !isEndingSoon && (
              <div className="rounded bg-orange-500 text-white font-semibold flex items-center gap-1 px-2.5 py-1 text-xs">
                <Flame className="h-3 w-3" />
                HOT
              </div>
            )}
            {timeRemaining <= 0 && (
              <div className="rounded bg-gray-700 text-white font-semibold px-2.5 py-1 text-xs">
                ENDED
              </div>
            )}
          </div>

          {/* Ticket type badge top-right */}
          <div className="absolute top-3 right-3">
            <div className="rounded bg-white/90 backdrop-blur-sm text-gray-800 font-semibold px-2.5 py-1 text-xs shadow">
              {auction.ticketTypeId?.name || 'Ticket'}
            </div>
          </div>
        </div>

        {/* Content section - white background */}
        <div className="bg-white p-4 space-y-1">
          {/* Date - colored text like OpenSeaEventCard */}
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

          {/* Bid Info */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">
                {hasNoBids ? 'Starting Bid' : 'Current Bid'}
              </p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold text-gray-900">
                  {hasNoBids 
                    ? (auction.startingBidEth || 0).toFixed(4) 
                    : (auction.currentBidEth || 0).toFixed(4)
                  }
                </span>
                <span className="text-sm font-semibold text-orange-500">ETH</span>
              </div>
            </div>
            
            {/* Timer */}
            <div className="text-right">
              <p className="text-xs text-gray-500">Ends in</p>
              <p className={`text-sm font-bold font-mono ${isEndingSoon ? 'text-red-500' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <Gavel className="h-3.5 w-3.5 text-orange-500" />
              {auction.totalBids || 0} bids
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-purple-500" />
              {auction.uniqueBidders || 0} bidders
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
