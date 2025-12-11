'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Users, 
  DollarSign, 
  TrendingUp, 
  MessageCircle, 
  Calendar,
  Award,
  Crown,
  Sparkles,
  Music,
  Heart,
  Eye,
  Send,
  Settings,
  BarChart3,
  Ticket,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { apiClient } from '@/lib/api/client';
import { ArtistProfileSetup } from '@/components/artist/ArtistProfileSetup';
import { ArtistVerification } from '@/components/artist/ArtistVerification';
import { ArtistAnalytics } from '@/components/artist/ArtistAnalytics';
import { ArtistMessaging } from '@/components/artist/ArtistMessaging';
import { GoldenTicketCreator } from '@/components/artist/GoldenTicketCreator';

interface ArtistProfile {
  id: string;
  artistName: string;
  realName: string;
  bio: string;
  genre: string[];
  socialLinks: any;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  fanCount: number;
  averageRating: number;
  royaltyPercentage: number;
  canCreateGoldenTickets: boolean;
  messagingEnabled: boolean;
  goldenTicketPerks: string[];
  createdAt: string;
}

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchArtistProfile();
    }
  }, [user]);

  const fetchArtistProfile = async () => {
    try {
      const response = await apiClient.request('/api/artist/profile', {
        method: 'GET'
      });

      if (response.success) {
        setArtist(response.artist);
      } else {
        // Artist profile doesn't exist yet
        setArtist(null);
      }
    } catch (error) {
      console.error('Failed to fetch artist profile:', error);
      setArtist(null);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified Artist
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Verification Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Verification Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  // If no artist profile exists, show setup
  if (!artist) {
    return <ArtistProfileSetup onProfileCreated={fetchArtistProfile} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-white">{artist.artistName}</h1>
            {getVerificationStatusBadge(artist.verificationStatus)}
            {artist.canCreateGoldenTickets && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <Crown className="h-3 w-3 mr-1" />
                Golden Tickets Enabled
              </Badge>
            )}
          </div>
          <p className="text-gray-400">
            {artist.genre.join(', ')} • {artist.fanCount.toLocaleString()} fans • {artist.royaltyPercentage}% royalties
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => setActiveTab('settings')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          {artist.verificationStatus !== 'verified' && (
            <Button
              onClick={() => setActiveTab('verification')}
              className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
            >
              <Award className="h-4 w-4 mr-2" />
              Get Verified
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">₹{artist.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-400">
                  ₹{Math.round(artist.totalRevenue * (artist.royaltyPercentage / 100)).toLocaleString()} royalties
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Fans</p>
                <p className="text-2xl font-bold text-white">{artist.fanCount.toLocaleString()}</p>
                <p className="text-xs text-blue-400">Across all events</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tickets Sold</p>
                <p className="text-2xl font-bold text-white">{artist.totalTicketsSold.toLocaleString()}</p>
                <p className="text-xs text-purple-400">{artist.totalEvents} events</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Ticket className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rating</p>
                <p className="text-2xl font-bold text-white">{artist.averageRating.toFixed(1)}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= artist.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white/5 border border-white/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="messaging" className="data-[state=active]:bg-white/20">
            <MessageCircle className="h-4 w-4 mr-2" />
            Fan Messages
          </TabsTrigger>
          <TabsTrigger value="golden-tickets" className="data-[state=active]:bg-white/20">
            <Crown className="h-4 w-4 mr-2" />
            Golden Tickets
          </TabsTrigger>
          <TabsTrigger value="verification" className="data-[state=active]:bg-white/20">
            <Award className="h-4 w-4 mr-2" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/20">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Music className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-500">Create an event to get started</p>
                </div>
              </CardContent>
            </Card>

            {/* Fan Engagement */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Fan Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-400">No fan data yet</p>
                  <p className="text-sm text-gray-500">Sell tickets to build your fanbase</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <ArtistAnalytics artistId={artist.id} />
        </TabsContent>

        <TabsContent value="messaging">
          <ArtistMessaging 
            artistId={artist.id} 
            messagingEnabled={artist.messagingEnabled}
            verificationStatus={artist.verificationStatus}
          />
        </TabsContent>

        <TabsContent value="golden-tickets">
          <GoldenTicketCreator 
            artistId={artist.id}
            canCreateGoldenTickets={artist.canCreateGoldenTickets}
            verificationStatus={artist.verificationStatus}
            goldenTicketPerks={artist.goldenTicketPerks}
          />
        </TabsContent>

        <TabsContent value="verification">
          <ArtistVerification 
            artistId={artist.id}
            verificationStatus={artist.verificationStatus}
            onVerificationUpdate={fetchArtistProfile}
          />
        </TabsContent>

        <TabsContent value="settings">
          <ArtistProfileSetup 
            existingProfile={artist}
            onProfileCreated={fetchArtistProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}