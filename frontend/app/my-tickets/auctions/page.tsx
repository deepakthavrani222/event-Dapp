'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gavel, 
  TrendingUp, 
  Trophy,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  Eye
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useTheme } from 'next-themes';
import Link from 'next/link';

export default function MyAuctionsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState<{
    selling: any[];
    bidding: any[];
    won: any[];
    stats: any;
  }>({ selling: [], bidding: [], won: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      const result = await apiClient.getMyAuctions();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to load auctions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (ms: number): string => {
    if (ms <= 0) return 'Ended';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-500 rounded-xl">
            <Gavel className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Auctions
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Manage your auctions and bids
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4 text-center">
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data.stats.activeSellingCount || 0}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Listings
              </p>
            </CardContent>
          </Card>
          <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4 text-center">
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {data.stats.activeBiddingCount || 0}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Bids
              </p>
            </CardContent>
          </Card>
          <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4 text-center">
              <p className={`text-2xl font-bold text-green-500`}>
                {data.stats.totalWon || 0}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Auctions Won
              </p>
            </CardContent>
          </Card>
          <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="py-4 text-center">
              <p className={`text-2xl font-bold text-orange-500`}>
                {data.stats.totalSold || 0}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tickets Sold
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bidding">
          <TabsList className={isDark ? 'bg-gray-800' : 'bg-gray-200'}>
            <TabsTrigger value="bidding" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              My Bids ({data.bidding.length})
            </TabsTrigger>
            <TabsTrigger value="selling" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              Selling ({data.selling.length})
            </TabsTrigger>
            <TabsTrigger value="won" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Won ({data.won.length})
            </TabsTrigger>
          </TabsList>

          {/* My Bids Tab */}
          <TabsContent value="bidding" className="mt-6">
            {data.bidding.length === 0 ? (
              <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    You haven't placed any bids yet
                  </p>
                  <Link href="/auction">
                    <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                      Browse Auctions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {data.bidding.map((auction: any) => (
                  <motion.div
                    key={auction._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} ${
                      auction.userBid?.isWinning ? 'ring-2 ring-green-500/50' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={auction.eventId?.imageUrl || '/placeholder-event.jpg'}
                            alt={auction.eventId?.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {auction.eventId?.title}
                              </h3>
                              {auction.userBid?.isWinning ? (
                                <Badge className="bg-green-500 text-white">Winning</Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-500 border-orange-500">
                                  Outbid
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {auction.ticketTypeId?.name}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Your bid: <span className="font-bold text-orange-500">
                                  {auction.userBid?.amountEth?.toFixed(4)} ETH
                                </span>
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Current: <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {auction.currentBidEth?.toFixed(4)} ETH
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-1 text-sm ${
                              auction.timeRemainingMs < 30 * 60 * 1000 ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <Clock className="h-4 w-4" />
                              {formatTimeRemaining(auction.timeRemainingMs)}
                            </div>
                            <Link href={`/auction/${auction._id}`}>
                              <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                                {auction.userBid?.isWinning ? 'View' : 'Bid Again'}
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Selling Tab */}
          <TabsContent value="selling" className="mt-6">
            {data.selling.length === 0 ? (
              <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    You haven't created any auctions yet
                  </p>
                  <Link href="/my-tickets">
                    <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                      Auction a Ticket
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {data.selling.map((auction: any) => (
                  <motion.div
                    key={auction._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={auction.eventId?.imageUrl || '/placeholder-event.jpg'}
                            alt={auction.eventId?.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {auction.eventId?.title}
                              </h3>
                              <Badge className={
                                auction.status === 'active' ? 'bg-green-500' :
                                auction.status === 'settled' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }>
                                {auction.status}
                              </Badge>
                            </div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {auction.ticketTypeId?.name}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Current: <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {auction.currentBidEth > 0 ? `${auction.currentBidEth.toFixed(4)} ETH` : 'No bids'}
                                </span>
                              </span>
                              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Bids: {auction.totalBids}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            {auction.status === 'active' && (
                              <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <Clock className="h-4 w-4" />
                                {formatTimeRemaining(auction.timeRemainingMs)}
                              </div>
                            )}
                            <Link href={`/auction/${auction._id}`}>
                              <Button size="sm" variant="outline" className="mt-2">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Won Tab */}
          <TabsContent value="won" className="mt-6">
            {data.won.length === 0 ? (
              <Card className={isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    You haven't won any auctions yet
                  </p>
                  <Link href="/auction">
                    <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                      Browse Auctions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {data.won.map((auction: any) => (
                  <motion.div
                    key={auction._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'} ring-2 ring-yellow-500/30`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={auction.eventId?.imageUrl || '/placeholder-event.jpg'}
                              alt={auction.eventId?.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                              <Trophy className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {auction.eventId?.title}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {auction.ticketTypeId?.name}
                            </p>
                            <p className="text-sm mt-1">
                              Won for: <span className="font-bold text-green-500">
                                {auction.finalPriceEth?.toFixed(4)} ETH
                              </span>
                            </p>
                          </div>
                          <Link href="/my-tickets">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600">
                              View Ticket
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
