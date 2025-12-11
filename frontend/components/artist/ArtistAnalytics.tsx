'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Star,
  Crown,
  Heart,
  Eye,
  ArrowUp,
  ArrowDown,
  Ticket,
  Trophy,
  Target
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ArtistAnalyticsProps {
  artistId: string;
}

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalTicketsSold: number;
    totalFans: number;
    averageTicketPrice: number;
    royaltyPercentage: number;
    estimatedRoyalties: number;
  };
  fanMetrics: {
    totalFans: number;
    fanTiers: Record<string, number>;
    newFansThisPeriod: number;
    averageSpendPerFan: number;
  };
  events: {
    totalEvents: number;
    upcomingEvents: number;
    topEvents: Array<{
      eventId: string;
      title: string;
      date: string;
      revenue: number;
      ticketsSold: number;
      status: string;
    }>;
  };
  trends: {
    revenueTrend: Array<{
      date: string;
      revenue: number;
      tickets: number;
    }>;
    timeRange: string;
  };
  topFans: Array<{
    userId: string;
    totalSpent: number;
    ticketsPurchased: number;
    fanTier: string;
    fanSince: string;
  }>;
}

export function ArtistAnalytics({ artistId }: ArtistAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [artistId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.request(`/api/artist/analytics?timeRange=${timeRange}`, {
        method: 'GET'
      });

      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFanTierColor = (tier: string) => {
    switch (tier) {
      case 'vip': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'superfan': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'regular': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="glass-card border-white/20 bg-white/5">
        <CardContent className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Analytics Data</h3>
          <p className="text-gray-400">Create events and sell tickets to see your analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '1y', label: '1 Year' }
          ].map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range.value)}
              className={timeRange === range.value 
                ? "bg-purple-500 text-white" 
                : "border-white/20 text-white hover:bg-white/10"
              }
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-green-500/30 bg-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
                <p className="text-xs text-green-400">
                  {formatCurrency(analytics.overview.estimatedRoyalties)} royalties ({analytics.overview.royaltyPercentage}%)
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Fans</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.fanMetrics.totalFans.toLocaleString()}
                </p>
                <p className="text-xs text-blue-400">
                  +{analytics.fanMetrics.newFansThisPeriod} new this period
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30 bg-purple-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tickets Sold</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.overview.totalTicketsSold.toLocaleString()}
                </p>
                <p className="text-xs text-purple-400">
                  Avg {formatCurrency(analytics.overview.averageTicketPrice)}
                </p>
              </div>
              <Ticket className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Avg Spend/Fan</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.fanMetrics.averageSpendPerFan)}
                </p>
                <p className="text-xs text-yellow-400">
                  {analytics.events.totalEvents} events
                </p>
              </div>
              <Target className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/20">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white/20">
            Revenue Trends
          </TabsTrigger>
          <TabsTrigger value="fans" className="data-[state=active]:bg-white/20">
            Fan Analytics
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-white/20">
            Event Performance
          </TabsTrigger>
          <TabsTrigger value="top-fans" className="data-[state=active]:bg-white/20">
            Top Fans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trend ({timeRange})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.trends.revenueTrend.length > 0 ? (
                <div className="space-y-4">
                  {/* Simple trend visualization */}
                  <div className="grid grid-cols-7 gap-2">
                    {analytics.trends.revenueTrend.slice(-7).map((day, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t"
                          style={{ 
                            height: `${Math.max(20, (day.revenue / Math.max(...analytics.trends.revenueTrend.map(d => d.revenue))) * 100)}px` 
                          }}
                        ></div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                        </p>
                        <p className="text-xs text-white font-semibold">
                          {formatCurrency(day.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-400">No revenue data for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fan Tiers */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Fan Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.fanMetrics.fanTiers).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getFanTierColor(tier)}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{count}</p>
                      <p className="text-xs text-gray-400">
                        {((count / analytics.fanMetrics.totalFans) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fan Growth */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Fan Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    +{analytics.fanMetrics.newFansThisPeriod}
                  </p>
                  <p className="text-gray-400">New fans this {timeRange}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Fans</span>
                    <span className="text-white font-semibold">
                      {analytics.fanMetrics.totalFans.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Spend/Fan</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(analytics.fanMetrics.averageSpendPerFan)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top Performing Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.events.topEvents.length > 0 ? (
                <div className="space-y-4">
                  {analytics.events.topEvents.map((event, index) => (
                    <div key={event.eventId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">#{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{event.title}</h4>
                          <p className="text-sm text-gray-400">{formatDate(event.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(event.revenue)}</p>
                        <p className="text-sm text-gray-400">{event.ticketsSold} tickets</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-400">No events in this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-fans" className="space-y-6">
          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Spending Fans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topFans.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topFans.map((fan, index) => (
                    <div key={fan.userId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">Fan #{fan.userId.slice(-6)}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={getFanTierColor(fan.fanTier)}>
                              {fan.fanTier}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              Fan since {formatDate(fan.fanSince)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(fan.totalSpent)}</p>
                        <p className="text-sm text-gray-400">{fan.ticketsPurchased} tickets</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-400">No fan data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}