'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Star, 
  Zap, 
  Users, 
  TrendingUp,
  Award,
  Sparkles,
  Clock,
  CheckCircle,
  Target,
  Gift,
  Palette,
  MessageSquare,
  Calendar,
  BarChart3,
  Trophy,
  Gem,
  Shield,
  Rocket
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ArtistTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tierScore: number;
  perks: {
    featuredHomepage: boolean;
    priorityApproval: boolean;
    collabTools: boolean;
    nftCollectibles: boolean;
    customBadge: boolean;
    exclusiveEvents: boolean;
  };
  metrics: {
    totalRevenue: number;
    fanCount: number;
    eventCount: number;
    averageRating: number;
    engagementScore: number;
  };
  nextReviewAt: string;
}

const TIER_CONFIG = {
  bronze: {
    name: 'Bronze',
    icon: Award,
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-300',
    minScore: 0,
    maxScore: 199
  },
  silver: {
    name: 'Silver',
    icon: Shield,
    color: 'from-gray-400 to-gray-600',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    textColor: 'text-gray-300',
    minScore: 200,
    maxScore: 499
  },
  gold: {
    name: 'Gold',
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-300',
    minScore: 500,
    maxScore: 799
  },
  platinum: {
    name: 'Platinum',
    icon: Gem,
    color: 'from-purple-400 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-300',
    minScore: 800,
    maxScore: 999
  },
  diamond: {
    name: 'Diamond',
    icon: Sparkles,
    color: 'from-cyan-400 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    textColor: 'text-cyan-300',
    minScore: 1000,
    maxScore: Infinity
  }
};

const PERK_DESCRIPTIONS = {
  featuredHomepage: {
    title: 'Featured on Homepage',
    description: 'Your profile rotates on the main homepage, getting maximum visibility',
    icon: Star
  },
  priorityApproval: {
    title: 'Priority Event Approval',
    description: 'Your events get approved in under 1 hour instead of 24-48 hours',
    icon: Zap
  },
  collabTools: {
    title: 'Collaboration Tools',
    description: 'Co-create events with other verified artists and share revenue',
    icon: Users
  },
  nftCollectibles: {
    title: 'NFT Collectibles',
    description: 'Turn your past tickets into valuable NFTs with continuous royalty streams',
    icon: Palette
  },
  customBadge: {
    title: 'Custom Tier Badge',
    description: 'Show off your tier status with a custom badge on your profile',
    icon: Award
  },
  exclusiveEvents: {
    title: 'Exclusive Events',
    description: 'Access to diamond-tier only events and collaborations',
    icon: Crown
  }
};

export function ArtistPerksHub() {
  const [artistTier, setArtistTier] = useState<ArtistTier | null>(null);
  const [tierBenefits, setTierBenefits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchArtistPerks();
  }, []);

  const fetchArtistPerks = async () => {
    try {
      const response = await apiClient.request('/api/artist/perks');
      if (response.success) {
        setArtistTier(response.artistTier);
        setTierBenefits(response.tierBenefits);
      }
    } catch (error) {
      console.error('Failed to fetch artist perks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateTier = async () => {
    setRecalculating(true);
    try {
      const response = await apiClient.request('/api/artist/perks', {
        method: 'POST',
        body: JSON.stringify({ action: 'recalculate' })
      });
      
      if (response.success) {
        await fetchArtistPerks();
        alert('🎉 Tier recalculated! Check your new benefits.');
      }
    } catch (error) {
      console.error('Failed to recalculate tier:', error);
      alert('Failed to recalculate tier');
    } finally {
      setRecalculating(false);
    }
  };

  const getNextTier = () => {
    if (!artistTier) return null;
    
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = tiers.indexOf(artistTier.tier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getScoreToNextTier = () => {
    const nextTier = getNextTier();
    if (!nextTier || !artistTier) return 0;
    
    return TIER_CONFIG[nextTier as keyof typeof TIER_CONFIG].minScore - artistTier.tierScore;
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

  if (!artistTier) {
    return (
      <Card className="glass-card border-red-500/30 bg-red-500/10">
        <CardContent className="p-8 text-center">
          <Trophy className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Tier System Unavailable</h3>
          <p className="text-gray-300 mb-4">
            Complete your artist profile to access the tier system and unlock exclusive perks.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentTierConfig = TIER_CONFIG[artistTier.tier];
  const TierIcon = currentTierConfig.icon;
  const nextTier = getNextTier();
  const scoreToNext = getScoreToNextTier();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className={`w-20 h-20 bg-gradient-to-r ${currentTierConfig.color} rounded-full flex items-center justify-center mx-auto`}>
          <TierIcon className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Artist Tier System</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Unlock exclusive perks and benefits as you grow your fanbase and revenue. 
          Higher tiers get better features and more opportunities.
        </p>
      </div>

      {/* Current Tier Status */}
      <Card className={`glass-card ${currentTierConfig.borderColor} ${currentTierConfig.bgColor}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${currentTierConfig.color} rounded-full flex items-center justify-center`}>
                <TierIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{currentTierConfig.name} Tier</h3>
                <p className={`${currentTierConfig.textColor} font-semibold`}>
                  Score: {artistTier.tierScore.toLocaleString()}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleRecalculateTier}
              disabled={recalculating}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {recalculating ? (
                <>
                  <Rocket className="h-4 w-4 mr-2 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recalculate Tier
                </>
              )}
            </Button>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Progress to {TIER_CONFIG[nextTier as keyof typeof TIER_CONFIG].name}</span>
                <span className="text-gray-400 text-sm">{scoreToNext} points needed</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className={`h-3 bg-gradient-to-r ${currentTierConfig.color} rounded-full transition-all duration-500`}
                  style={{ 
                    width: `${Math.min(100, ((artistTier.tierScore - currentTierConfig.minScore) / (TIER_CONFIG[nextTier as keyof typeof TIER_CONFIG].minScore - currentTierConfig.minScore)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">₹{artistTier.metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{artistTier.metrics.fanCount.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Fans</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{artistTier.metrics.eventCount}</p>
              <p className="text-xs text-gray-400">Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{artistTier.metrics.averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-400">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{artistTier.metrics.engagementScore}%</p>
              <p className="text-xs text-gray-400">Engagement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current-perks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/20">
          <TabsTrigger value="current-perks" className="data-[state=active]:bg-white/20">
            <CheckCircle className="h-4 w-4 mr-2" />
            Current Perks
          </TabsTrigger>
          <TabsTrigger value="all-tiers" className="data-[state=active]:bg-white/20">
            <Trophy className="h-4 w-4 mr-2" />
            All Tiers
          </TabsTrigger>
          <TabsTrigger value="how-to-grow" className="data-[state=active]:bg-white/20">
            <Target className="h-4 w-4 mr-2" />
            How to Grow
          </TabsTrigger>
        </TabsList>

        {/* Current Perks */}
        <TabsContent value="current-perks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PERK_DESCRIPTIONS).map(([perkKey, perk]) => {
              const isUnlocked = artistTier.perks[perkKey as keyof typeof artistTier.perks];
              const PerkIcon = perk.icon;
              
              return (
                <Card key={perkKey} className={`glass-card ${
                  isUnlocked 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : 'border-gray-500/30 bg-gray-500/10'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isUnlocked ? 'bg-green-500/20' : 'bg-gray-500/20'
                      }`}>
                        <PerkIcon className={`h-6 w-6 ${
                          isUnlocked ? 'text-green-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white">{perk.title}</h4>
                          {isUnlocked ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                              Unlocked
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">
                              Locked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{perk.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* All Tiers */}
        <TabsContent value="all-tiers" className="space-y-4">
          <div className="space-y-4">
            {Object.entries(TIER_CONFIG).map(([tierKey, tier]) => {
              const TierIcon = tier.icon;
              const isCurrentTier = tierKey === artistTier.tier;
              const tierPerks = tierBenefits?.[tierKey] || {};
              
              return (
                <Card key={tierKey} className={`glass-card ${
                  isCurrentTier 
                    ? `${tier.borderColor} ${tier.bgColor}` 
                    : 'border-white/20 bg-white/5'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center`}>
                          <TierIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{tier.name} Tier</h3>
                          <p className="text-sm text-gray-400">
                            {tier.minScore.toLocaleString()} - {tier.maxScore === Infinity ? '∞' : tier.maxScore.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      
                      {isCurrentTier && (
                        <Badge className={`${tier.bgColor} ${tier.textColor} ${tier.borderColor}`}>
                          Current Tier
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(tierPerks).map(([perkKey, isEnabled]) => {
                        const perk = PERK_DESCRIPTIONS[perkKey as keyof typeof PERK_DESCRIPTIONS];
                        if (!perk) return null;
                        
                        const PerkIcon = perk.icon;
                        
                        return (
                          <div key={perkKey} className={`flex items-center gap-2 p-2 rounded ${
                            isEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
                          }`}>
                            <PerkIcon className={`h-4 w-4 ${
                              isEnabled ? 'text-green-400' : 'text-gray-400'
                            }`} />
                            <span className={`text-sm ${
                              isEnabled ? 'text-green-300' : 'text-gray-400'
                            }`}>
                              {perk.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* How to Grow */}
        <TabsContent value="how-to-grow" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-blue-500/30 bg-blue-500/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Boost Your Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Host More Events</span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">+50 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Increase Revenue</span>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">+1 per ₹1000</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Grow Fan Base</span>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">+1 per 10 fans</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">High Event Ratings</span>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">+25 pts</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Fan Engagement</span>
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">+2 per %</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/30 bg-purple-500/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Quick Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-white mb-1">Create Golden Tickets</h4>
                    <p className="text-sm text-gray-400">Premium NFT tickets boost revenue and score</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-white mb-1">Engage with Fans</h4>
                    <p className="text-sm text-gray-400">Send messages and create NFT drops</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-white mb-1">Collaborate with Artists</h4>
                    <p className="text-sm text-gray-400">Joint events multiply your reach</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-white mb-1">Launch NFT Collections</h4>
                    <p className="text-sm text-gray-400">Turn past tickets into valuable collectibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Review */}
          <Card className="glass-card border-white/20 bg-white/5">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Next Tier Review</h3>
              <p className="text-gray-400">
                Your tier will be automatically reviewed on{' '}
                <span className="text-white font-semibold">
                  {new Date(artistTier.nextReviewAt).toLocaleDateString()}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Tiers are recalculated monthly based on your latest performance metrics
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}