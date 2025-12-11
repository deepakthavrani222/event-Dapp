'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Sparkles, 
  TrendingUp, 
  Users, 
  DollarSign,
  Settings,
  MessageCircle,
  BarChart3,
  Ticket,
  Star,
  Award,
  Zap,
  Heart,
  Calendar,
  Gift
} from 'lucide-react';
import { GoldenTicketCreator } from './GoldenTicketCreator';
import { FanMessaging } from './FanMessaging';
import { ArtistPerksHub } from './ArtistPerksHub';
import { CollaborationTools } from './CollaborationTools';
import { NFTCollectiblesCreator } from './NFTCollectiblesCreator';
import { APDhillonWorkflow } from './APDhillonWorkflow';
import { apiClient } from '@/lib/api/client';

interface ArtistProfile {
  id: string;
  artistName: string;
  verificationStatus: string;
  canCreateGoldenTickets: boolean;
  royaltyPercentage: number;
  totalRevenue: number;
  totalTicketsSold: number;
  fanCount: number;
  goldenTicketPerks: string[];
}

interface GoldenTicketTemplate {
  id: string;
  name: string;
  description: string;
  finalPrice: number;
  maxQuantity: number;
  soldQuantity: number;
  totalRoyaltyPercentage: number;
  perks: string[];
  isActive: boolean;
  salesData: {
    totalRevenue: number;
    artistRoyalties: number;
  };
  createdAt: string;
}

export function ArtistToolsDashboard() {
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [goldenTickets, setGoldenTickets] = useState<GoldenTicketTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchArtistData();
    fetchGoldenTickets();
  }, []);

  const fetchArtistData = async () => {
    try {
      const response = await apiClient.getArtistProfile();
      if (response.success && response.artist) {
        setArtist(response.artist);
      }
    } catch (error) {
      console.error('Failed to fetch artist data:', error);
    }
  };

  const fetchGoldenTickets = async () => {
    try {
      const response = await apiClient.getGoldenTicketTemplates();
      if (response.success) {
        setGoldenTickets(response.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch golden tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalGoldenRevenue = () => {
    return goldenTickets.reduce((total, ticket) => total + ticket.salesData.artistRoyalties, 0);
  };

  const calculateTotalGoldenSales = () => {
    return goldenTickets.reduce((total, ticket) => total + ticket.soldQuantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="glass-card border-red-500/30 bg-red-500/10 max-w-md">
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Artist Profile Required</h3>
            <p className="text-gray-300 mb-4">
              You need to set up your artist profile to access these tools.
            </p>
            <Button className="gradient-purple-cyan hover:opacity-90 border-0 text-white">
              Set Up Artist Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Artist Tools
              </h1>
              <p className="text-gray-400">
                Welcome back, {artist.artistName}! Manage your premium experiences and fan engagement.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Star className="h-3 w-3 mr-1" />
                Verified Artist
              </Badge>
              {artist.canCreateGoldenTickets && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Crown className="h-3 w-3 mr-1" />
                  Golden Tickets Enabled
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-8 bg-white/5 border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="success-journey" className="data-[state=active]:bg-white/20">
              <Star className="h-4 w-4 mr-2" />
              Success Journey
            </TabsTrigger>
            <TabsTrigger value="golden-tickets" className="data-[state=active]:bg-white/20">
              <Crown className="h-4 w-4 mr-2" />
              Golden Tickets
            </TabsTrigger>
            <TabsTrigger value="fan-engagement" className="data-[state=active]:bg-white/20">
              <Heart className="h-4 w-4 mr-2" />
              Fan Engagement
            </TabsTrigger>
            <TabsTrigger value="perks" className="data-[state=active]:bg-white/20">
              <Award className="h-4 w-4 mr-2" />
              Tier Perks
            </TabsTrigger>
            <TabsTrigger value="collaborations" className="data-[state=active]:bg-white/20">
              <Users className="h-4 w-4 mr-2" />
              Collaborations
            </TabsTrigger>
            <TabsTrigger value="nft-collectibles" className="data-[state=active]:bg-white/20">
              <Sparkles className="h-4 w-4 mr-2" />
              NFT Collections
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* AP Dhillon Success Teaser */}
            <Card className="glass-card border-gradient-to-r from-yellow-500/30 to-orange-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Follow AP Dhillon's Success Path</h3>
                      <p className="text-gray-400 text-sm">₹2.5 Cr in 11 minutes + ₹3+ Cr ongoing royalties</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab('success-journey')}
                    className="gradient-yellow-orange hover:opacity-90 border-0 text-black font-semibold"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    View Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-card border-green-500/30 bg-green-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        ₹{(artist.totalRevenue + calculateTotalGoldenRevenue()).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-green-400">
                      +₹{calculateTotalGoldenRevenue().toLocaleString()} from Golden Tickets
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-blue-500/30 bg-blue-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Fans</p>
                      <p className="text-2xl font-bold text-white">{artist.fanCount.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-blue-400">Growing community</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-500/30 bg-purple-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Tickets Sold</p>
                      <p className="text-2xl font-bold text-white">
                        {(artist.totalTicketsSold + calculateTotalGoldenSales()).toLocaleString()}
                      </p>
                    </div>
                    <Ticket className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-purple-400">
                      {calculateTotalGoldenSales()} Golden Tickets
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-yellow-500/30 bg-yellow-500/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Royalty Rate</p>
                      <p className="text-2xl font-bold text-white">{artist.royaltyPercentage}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-yellow-400">Premium tier</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Golden Tickets Overview */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Golden Tickets Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {goldenTickets.length > 0 ? (
                  <div className="space-y-4">
                    {goldenTickets.slice(0, 3).map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-white">{ticket.name}</h4>
                          <p className="text-sm text-gray-400">
                            {ticket.soldQuantity} / {ticket.maxQuantity} sold • ₹{ticket.finalPrice.toLocaleString()} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">
                            ₹{ticket.salesData.artistRoyalties.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">Your earnings</p>
                        </div>
                      </div>
                    ))}
                    
                    {goldenTickets.length > 3 && (
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('golden-tickets')}
                        className="w-full border-white/20 text-white hover:bg-white/10"
                      >
                        View All {goldenTickets.length} Golden Tickets
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Golden Tickets Yet</h3>
                    <p className="text-gray-400 mb-4">
                      Create premium NFT tickets with exclusive perks to boost your revenue.
                    </p>
                    <Button
                      onClick={() => setActiveTab('golden-tickets')}
                      className="gradient-yellow-orange hover:opacity-90 border-0 text-black font-semibold"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Create Golden Ticket
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Success Journey Tab */}
          <TabsContent value="success-journey" className="space-y-6">
            <APDhillonWorkflow />
          </TabsContent>

          {/* Golden Tickets Tab */}
          <TabsContent value="golden-tickets" className="space-y-6">
            <GoldenTicketCreator
              artistId={artist.id}
              canCreateGoldenTickets={artist.canCreateGoldenTickets}
              verificationStatus={artist.verificationStatus}
              goldenTicketPerks={artist.goldenTicketPerks}
            />
          </TabsContent>

          {/* Fan Engagement Tab */}
          <TabsContent value="fan-engagement" className="space-y-6">
            <FanMessaging />
          </TabsContent>

          {/* Tier Perks Tab */}
          <TabsContent value="perks" className="space-y-6">
            <ArtistPerksHub />
          </TabsContent>

          {/* Collaborations Tab */}
          <TabsContent value="collaborations" className="space-y-6">
            <CollaborationTools />
          </TabsContent>

          {/* NFT Collectibles Tab */}
          <TabsContent value="nft-collectibles" className="space-y-6">
            <NFTCollectiblesCreator />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Artist Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Royalty Settings</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Your current royalty rate: {artist.royaltyPercentage}%
                    </p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Adjust Royalties
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Golden Ticket Access</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Status: {artist.canCreateGoldenTickets ? 'Enabled' : 'Disabled'}
                    </p>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Manage Access
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}