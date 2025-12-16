'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Gavel, 
  TrendingUp, 
  Users, 
  Eye,
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  History,
  Shield,
  AlertCircle,
  Zap,
  ImageOff,
  Ticket
} from 'lucide-react';
import { BidForm } from '@/components/auction/BidForm';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/lib/context/ThemeContext';
import Link from 'next/link';
import { Footer } from '@/components/shared/footer';
import { PublicHeader } from '@/components/shared/public-header';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const auctionId = params.auctionId as string;

  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [imageError, setImageError] = useState(false);

  const fetchAuction = useCallback(async () => {
    try {
      const data = await apiClient.getAuction(auctionId);

      if (data.success) {
        setAuction(data.auction);
        setBids(data.bids);
        setTimeRemaining(data.auction.timeRemainingMs);
      } else {
        setError(data.error || 'Failed to load auction');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load auction');
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    fetchAuction();
    const pollInterval = setInterval(fetchAuction, 10000);
    return () => clearInterval(pollInterval);
  }, [fetchAuction]);

  useEffect(() => {
    if (timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (ms: number): { totalHours: number; minutes: number; seconds: number } => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const totalHours = Math.floor(minutes / 60);
    return { totalHours, minutes: minutes % 60, seconds: seconds % 60 };
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'Date TBD';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return 'Date TBD';
    }
  };

  const handleBidPlaced = () => {
    fetchAuction();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `Auction: ${auction?.eventId?.title}`,
        text: `Check out this ticket auction!`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied!', description: 'Auction link copied to clipboard' });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        <PublicHeader />
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
            <Gavel className="h-8 w-8 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className={`mt-6 text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading auction...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
        <PublicHeader />
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Oops! Something went wrong
          </h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error || 'Auction not found'}</p>
          <Button 
            onClick={() => router.back()}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const time = formatTime(timeRemaining);
  const isEnded = timeRemaining <= 0 || auction.status !== 'active';
  const isEndingSoon = timeRemaining > 0 && timeRemaining < 30 * 60 * 1000;

  const getImageUrl = () => {
    const img = auction.eventId?.image || auction.eventId?.imageUrl;
    if (!img || imageError) return null;
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return null;
  };
  const eventImage = getImageUrl();

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      <PublicHeader />
      
      <div className="pt-20">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          {/* Top Section - Image + Info Card (Like Event Detail) */}
          <div className="grid lg:grid-cols-5 gap-8 mb-8">
            {/* Event Image - Left Side */}
            <div className="lg:col-span-3 relative">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-gradient-to-br from-orange-100 to-amber-100">
                {eventImage ? (
                  <img
                    src={eventImage}
                    alt={auction.eventId?.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageOff className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-400">No Image Available</span>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {isEnded ? (
                    <Badge className="bg-gray-700 text-white px-3 py-1">Ended</Badge>
                  ) : isEndingSoon ? (
                    <Badge className="bg-red-500 text-white px-3 py-1 animate-pulse">
                      <Clock className="h-3 w-3 mr-1" />
                      Ending Soon
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-1.5 inline-block" />
                      Live Auction
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Auction Info Card - Right Side */}
            <div className="lg:col-span-2">
              <div className={`rounded-2xl p-6 h-full ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'}`}>
                {/* Ticket Type */}
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className={`h-4 w-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                  <span className={`text-sm font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    {auction.ticketTypeId?.name || 'Ticket'}
                  </span>
                </div>

                {/* Event Title */}
                <h1 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                  {auction.eventId?.title}
                </h1>

                {/* Date & Time */}
                <div className="flex items-start gap-2 mb-3">
                  <Calendar className={`h-4 w-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatDateTime(auction.eventId?.date)}
                  </span>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-2 mb-6">
                  <MapPin className={`h-4 w-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {auction.eventId?.venue}{auction.eventId?.city ? `, ${auction.eventId.city}` : ''}
                  </span>
                </div>

                <Separator className={`mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />

                {/* Current Bid */}
                <div className="mb-4">
                  <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                    {auction.currentBidEth > 0 ? 'Current Bid' : 'Starting Bid'}
                  </p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                      {auction.currentBidEth > 0 ? auction.currentBidEth.toFixed(4) : auction.startingBidEth.toFixed(4)}
                    </span>
                    <span className="text-lg font-bold text-orange-500">ETH</span>
                  </div>
                </div>

                {/* Countdown */}
                {!isEnded && (
                  <div className={`p-4 rounded-xl mb-4 ${isEndingSoon ? 'bg-red-500/10 border border-red-500/20' : isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Auction ends in</p>
                    <div className="flex gap-3">
                      {[
                        { value: time.totalHours, label: 'H' },
                        { value: time.minutes, label: 'M' },
                        { value: time.seconds, label: 'S' },
                      ].map((item, i) => (
                        <div key={i} className="text-center">
                          <div className={`text-xl font-mono font-bold ${isEndingSoon ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                            {String(item.value).padStart(2, '0')}
                          </div>
                          <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Gavel className={`h-4 w-4 mx-auto mb-1 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{auction.totalBids}</p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Bids</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Users className={`h-4 w-4 mx-auto mb-1 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{auction.uniqueBidders}</p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Bidders</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <Eye className={`h-4 w-4 mx-auto mb-1 ${isDark ? 'text-cyan-400' : 'text-cyan-500'}`} />
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{auction.views}</p>
                    <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Views</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Bid Form + History */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Bid History - Left */}
            <div className="lg:col-span-3">
              <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <History className="h-5 w-5 text-orange-500" />
                    Bid History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bids.length === 0 ? (
                    <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No bids yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bids.map((bid, index) => (
                        <motion.div
                          key={bid.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 rounded-xl ${
                            index === 0 
                              ? isDark ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-orange-50 border border-orange-200'
                              : isDark ? 'bg-gray-800' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {index === 0 && <Trophy className="h-5 w-5 text-orange-500" />}
                            <div>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{bid.bidderName}</p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(bid.placedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${index === 0 ? 'text-orange-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
                              {bid.amountEth.toFixed(4)} ETH
                            </p>
                            {bid.causedExtension && (
                              <Badge variant="outline" className="text-xs">+10 min</Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bid Form + Details - Right */}
            <div className="lg:col-span-2 space-y-6">
              <div id="bid-form">
                {!isEnded ? (
                  <BidForm
                    auctionId={auctionId}
                    currentBidEth={auction.currentBidEth}
                    minNextBidEth={auction.minNextBidEth}
                    maxAllowedBidEth={auction.maxAllowedBidEth}
                    bidIncrementEth={auction.bidIncrementEth}
                    onBidPlaced={handleBidPlaced}
                  />
                ) : (
                  <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'}>
                    <CardContent className="py-8 text-center">
                      {auction.status === 'settled' && auction.winnerId ? (
                        <>
                          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Auction Completed</h3>
                          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Sold for {auction.finalPriceEth?.toFixed(4)} ETH
                          </p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Auction Ended</h3>
                          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {auction.status === 'no_bids' ? 'No bids received' : 
                             auction.status === 'reserve_not_met' ? 'Reserve price not met' : 'This auction has ended'}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Auction Details */}
              <Card className={isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'}>
                <CardHeader className="pb-3">
                  <CardTitle className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>Auction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Starting Bid</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{auction.startingBidEth.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Bid Increment</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{auction.bidIncrementEth.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Price Cap</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{auction.maxAllowedBidEth?.toFixed(4)} ETH</span>
                  </div>
                  <Separator className={isDark ? 'bg-gray-800' : 'bg-gray-200'} />
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>Anti-sniping: +10 min on late bids</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bid Section */}
      {!isEnded && (
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-20 ${isDark ? 'bg-[#0A0A0A]/95 border-white/10' : 'bg-white/95 border-gray-200'} border-t backdrop-blur-xl p-4`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {auction.currentBidEth > 0 ? 'Current Bid' : 'Starting Bid'}
              </p>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {auction.currentBidEth > 0 ? auction.currentBidEth.toFixed(4) : auction.startingBidEth.toFixed(4)} ETH
              </p>
            </div>
            <Link href="#bid-form" className="flex-1 max-w-[200px]">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold border-0">
                <Zap className="h-4 w-4 mr-2" />
                Place Bid
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="lg:hidden h-20" />
      <Footer />
    </div>
  );
}
