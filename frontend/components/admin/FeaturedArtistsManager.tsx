'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Crown, 
  Users, 
  Calendar,
  Plus,
  X,
  Eye,
  TrendingUp,
  Award,
  Gem,
  Sparkles,
  RotateCcw,
  Settings,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface FeaturedArtist {
  id: string;
  position: number;
  artistId: any;
  startDate: string;
  endDate: string;
  isActive: boolean;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
}

interface EligibleArtist {
  artistId: any;
  tier: string;
  tierScore: number;
  metrics: {
    totalRevenue: number;
    fanCount: number;
    eventCount: number;
    averageRating: number;
    engagementScore: number;
  };
}

const TIER_CONFIG = {
  gold: {
    name: 'Gold',
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-300'
  },
  platinum: {
    name: 'Platinum',
    icon: Gem,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-300'
  },
  diamond: {
    name: 'Diamond',
    icon: Sparkles,
    color: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-cyan-500/20',
    textColor: 'text-cyan-300'
  }
};

export function FeaturedArtistsManager() {
  const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtist[]>([]);
  const [eligibleArtists, setEligibleArtists] = useState<EligibleArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    artistId: '',
    position: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchFeaturedArtists();
  }, []);

  const fetchFeaturedArtists = async () => {
    try {
      const response = await apiClient.manageFeaturedArtists('get', {});
      if (response.success) {
        setFeaturedArtists(response.featuredArtists || []);
        setEligibleArtists(response.eligibleArtists || []);
      }
    } catch (error) {
      console.error('Failed to fetch featured artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureArtist = async () => {
    if (!formData.artistId) {
      alert('Please select an artist');
      return;
    }

    setProcessing(true);
    try {
      const response = await apiClient.manageFeaturedArtists('feature', {
        artistId: formData.artistId,
        position: formData.position,
        startDate: formData.startDate,
        endDate: formData.endDate
      });

      if (response.success) {
        await fetchFeaturedArtists();
        setShowAddForm(false);
        setFormData({
          artistId: '',
          position: 1,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        alert('🌟 Artist featured successfully!');
      }
    } catch (error: any) {
      console.error('Failed to feature artist:', error);
      alert(`Failed to feature artist: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveFromFeatured = async (featuredId: string) => {
    if (!confirm('Are you sure you want to remove this artist from featured rotation?')) {
      return;
    }

    try {
      const response = await apiClient.manageFeaturedArtists('remove', {
        artistId: featuredId
      });

      if (response.success) {
        await fetchFeaturedArtists();
        alert('Artist removed from featured rotation');
      }
    } catch (error: any) {
      console.error('Failed to remove featured artist:', error);
      alert(`Failed to remove artist: ${error.message}`);
    }
  };

  const handleAutoRotate = async () => {
    if (!confirm('This will replace all current featured artists with top-performing artists. Continue?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await apiClient.manageFeaturedArtists('auto_rotate', {});

      if (response.success) {
        await fetchFeaturedArtists();
        alert(`🎉 Auto-rotated ${response.rotations?.length || 0} featured artists based on tier scores!`);
      }
    } catch (error: any) {
      console.error('Failed to auto-rotate artists:', error);
      alert(`Failed to auto-rotate: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Featured Artists Management</h2>
          <p className="text-gray-400">
            Manage homepage featured artist rotation and auto-promote top performers
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleAutoRotate}
            disabled={processing}
            variant="outline"
            className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Auto-Rotate
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Feature Artist
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/20">
          <TabsTrigger value="current" className="data-[state=active]:bg-white/20">
            <Star className="h-4 w-4 mr-2" />
            Current Featured ({featuredArtists.length})
          </TabsTrigger>
          <TabsTrigger value="eligible" className="data-[state=active]:bg-white/20">
            <Award className="h-4 w-4 mr-2" />
            Eligible Artists ({eligibleArtists.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Current Featured Tab */}
        <TabsContent value="current" className="space-y-6">
          {/* Add Artist Form */}
          {showAddForm && (
            <Card className="glass-card border-purple-500/30 bg-purple-500/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Feature New Artist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Select Artist</Label>
                    <select
                      value={formData.artistId}
                      onChange={(e) => setFormData(prev => ({ ...prev, artistId: e.target.value }))}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                    >
                      <option value="">Choose an artist...</option>
                      {eligibleArtists.map((eligible) => (
                        <option key={eligible.artistId._id} value={eligible.artistId._id}>
                          {eligible.artistId.artistName} ({eligible.tier} - {eligible.tierScore} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Position (1-5)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFeatureArtist}
                    disabled={processing || !formData.artistId}
                    className="flex-1 gradient-purple-cyan hover:opacity-90 border-0 text-white"
                  >
                    {processing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Featuring...
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-2" />
                        Feature Artist
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Featured Artists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtists.length > 0 ? (
              featuredArtists
                .sort((a, b) => a.position - b.position)
                .map((featured) => {
                  const artist = featured.artistId;
                  const tierKey = featured.position === 1 ? 'diamond' : featured.position <= 3 ? 'platinum' : 'gold';
                  const tier = TIER_CONFIG[tierKey];
                  const TierIcon = tier.icon;

                  return (
                    <Card key={featured.id} className={`glass-card ${tier.bgColor} border-white/20`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={`${tier.bgColor} ${tier.textColor} border-0`}>
                            <TierIcon className="h-3 w-3 mr-1" />
                            Position #{featured.position}
                          </Badge>
                          <Button
                            onClick={() => handleRemoveFromFeatured(featured.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-center mb-4">
                          <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center mb-3`}>
                            <Crown className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">{artist?.artistName || 'Unknown Artist'}</h3>
                          <p className="text-gray-400 text-sm">{artist?.userId?.email}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          <div>
                            <p className="text-sm font-bold text-white">{featured.metrics.impressions.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Views</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{featured.metrics.clicks.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Clicks</p>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{featured.metrics.conversions.toLocaleString()}</p>
                            <p className="text-xs text-gray-400">Converts</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-gray-400">
                            Until: {new Date(featured.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            ) : (
              <div className="col-span-full">
                <Card className="glass-card border-white/20 bg-white/5">
                  <CardContent className="p-8 text-center">
                    <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Featured Artists</h3>
                    <p className="text-gray-400 mb-4">
                      Start featuring top artists to showcase them on the homepage.
                    </p>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="gradient-purple-cyan hover:opacity-90 border-0 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Feature First Artist
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Eligible Artists Tab */}
        <TabsContent value="eligible" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eligibleArtists.map((eligible) => {
              const artist = eligible.artistId;
              const tier = TIER_CONFIG[eligible.tier as keyof typeof TIER_CONFIG];
              const TierIcon = tier?.icon || Award;

              return (
                <Card key={artist._id} className="glass-card border-white/20 bg-white/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tier?.color || 'from-gray-400 to-gray-600'} rounded-full flex items-center justify-center`}>
                          <TierIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{artist.artistName}</h3>
                          <p className="text-gray-400 text-sm">{artist.userId?.email}</p>
                        </div>
                      </div>
                      
                      <Badge className={`${tier?.bgColor || 'bg-gray-500/20'} ${tier?.textColor || 'text-gray-300'} border-0`}>
                        {eligible.tier} • {eligible.tierScore} pts
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                      <div>
                        <p className="text-sm font-bold text-white">₹{eligible.metrics.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{eligible.metrics.fanCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">Fans</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{eligible.metrics.eventCount}</p>
                        <p className="text-xs text-gray-400">Events</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{eligible.metrics.engagementScore}%</p>
                        <p className="text-xs text-gray-400">Engagement</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, artistId: artist._id }));
                        setShowAddForm(true);
                      }}
                      className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Feature This Artist
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card border-blue-500/30 bg-blue-500/10">
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">
                  {featuredArtists.reduce((sum, f) => sum + f.metrics.impressions, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Impressions</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/30 bg-green-500/10">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">
                  {featuredArtists.reduce((sum, f) => sum + f.metrics.clicks, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Clicks</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/30 bg-purple-500/10">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">
                  {featuredArtists.reduce((sum, f) => sum + f.metrics.conversions, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">Total Conversions</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-white/20 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Featured Artist Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredArtists.map((featured) => {
                  const ctr = featured.metrics.impressions > 0 
                    ? (featured.metrics.clicks / featured.metrics.impressions * 100).toFixed(2)
                    : '0.00';
                  const conversionRate = featured.metrics.clicks > 0
                    ? (featured.metrics.conversions / featured.metrics.clicks * 100).toFixed(2)
                    : '0.00';

                  return (
                    <div key={featured.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">{featured.artistId?.artistName}</h4>
                        <p className="text-sm text-gray-400">Position #{featured.position}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">CTR: {ctr}% • CVR: {conversionRate}%</p>
                        <p className="text-xs text-gray-400">
                          {featured.metrics.impressions} views → {featured.metrics.clicks} clicks → {featured.metrics.conversions} converts
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}