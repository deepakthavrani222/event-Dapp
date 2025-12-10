'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, Shield, Zap, Crown, TrendingUp, Users, 
  Check, Lock, ChevronRight, Sparkles, Trophy, Target
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OrganizerStats {
  completedEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  avgRating: number;
  totalRoyalties: number;
  isVerified: boolean;
  isFeatured: boolean;
  hasPriorityApproval: boolean;
}

interface BadgeInfo {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  requirement: string;
  isUnlocked: (stats: OrganizerStats) => boolean;
  progress: (stats: OrganizerStats) => number;
}

const BADGES: BadgeInfo[] = [
  {
    id: 'first-event',
    name: 'First Event',
    icon: Star,
    color: 'yellow',
    description: 'Created your first event',
    requirement: 'Create 1 event',
    isUnlocked: (stats) => stats.completedEvents >= 1,
    progress: (stats) => Math.min(100, stats.completedEvents * 100),
  },
  {
    id: 'verified',
    name: 'Verified Organizer',
    icon: Shield,
    color: 'blue',
    description: 'Trusted organizer with proven track record',
    requirement: 'Complete 3 successful events',
    isUnlocked: (stats) => stats.isVerified || stats.completedEvents >= 3,
    progress: (stats) => Math.min(100, (stats.completedEvents / 3) * 100),
  },
  {
    id: 'featured',
    name: 'Featured',
    icon: Crown,
    color: 'purple',
    description: 'Top-performing organizer with premium visibility',
    requirement: 'Complete 10 events with 4.5+ rating',
    isUnlocked: (stats) => stats.isFeatured || (stats.completedEvents >= 10 && stats.avgRating >= 4.5),
    progress: (stats) => Math.min(100, (stats.completedEvents / 10) * 100),
  },
  {
    id: 'high-volume',
    name: 'High Volume',
    icon: TrendingUp,
    color: 'green',
    description: 'Sold over 1,000 tickets',
    requirement: 'Sell 1,000+ tickets',
    isUnlocked: (stats) => stats.totalTicketsSold >= 1000,
    progress: (stats) => Math.min(100, (stats.totalTicketsSold / 1000) * 100),
  },
  {
    id: 'royalty-king',
    name: 'Royalty King',
    icon: Sparkles,
    color: 'pink',
    description: 'Earned significant royalties from resales',
    requirement: 'Earn ₹10,000+ in royalties',
    isUnlocked: (stats) => stats.totalRoyalties >= 10000,
    progress: (stats) => Math.min(100, (stats.totalRoyalties / 10000) * 100),
  },
  {
    id: 'priority',
    name: 'Priority Approval',
    icon: Zap,
    color: 'orange',
    description: 'Events approved instantly',
    requirement: 'Maintain 4.8+ rating with 5+ events',
    isUnlocked: (stats) => stats.hasPriorityApproval || (stats.completedEvents >= 5 && stats.avgRating >= 4.8),
    progress: (stats) => Math.min(100, (stats.completedEvents / 5) * 100),
  },
];

const GROWTH_PERKS = [
  {
    title: 'Featured Badge',
    description: 'Get highlighted in search results and homepage',
    requirement: '10+ events with 4.5+ rating',
    icon: Crown,
    color: 'purple',
  },
  {
    title: 'Priority Approvals',
    description: 'Your events get approved instantly',
    requirement: '5+ events with 4.8+ rating',
    icon: Zap,
    color: 'orange',
  },
  {
    title: 'Artist Partnerships',
    description: 'Get invited to partner with artists and venues',
    requirement: 'Featured badge + ₹1L+ revenue',
    icon: Users,
    color: 'cyan',
  },
  {
    title: 'Reduced Fees',
    description: 'Lower platform fees for high-volume organizers',
    requirement: '5,000+ tickets sold',
    icon: Target,
    color: 'green',
  },
];

export function OrganizerBadges({ stats }: { stats: OrganizerStats }) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);

  const unlockedCount = BADGES.filter(b => b.isUnlocked(stats)).length;

  return (
    <div className="space-y-6">
      {/* Badge Summary */}
      <Card className="border-white/20 bg-gray-900/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Your Badges
          </CardTitle>
          <CardDescription>
            {unlockedCount} of {BADGES.length} badges unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = badge.isUnlocked(stats);
              const progress = badge.progress(stats);
              const colorClasses: Record<string, string> = {
                yellow: 'from-yellow-500 to-amber-500',
                blue: 'from-blue-500 to-cyan-500',
                purple: 'from-purple-500 to-pink-500',
                green: 'from-green-500 to-emerald-500',
                pink: 'from-pink-500 to-rose-500',
                orange: 'from-orange-500 to-amber-500',
              };

              return (
                <motion.button
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`relative p-4 rounded-xl text-center transition-all ${
                    isUnlocked 
                      ? 'bg-gradient-to-br ' + colorClasses[badge.color] + ' shadow-lg' 
                      : 'bg-white/5 border border-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <badge.icon className={`h-8 w-8 mx-auto ${isUnlocked ? 'text-white' : 'text-gray-500'}`} />
                  <p className={`text-xs mt-2 font-medium ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {badge.name}
                  </p>
                  {!isUnlocked && (
                    <div className="mt-2 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${colorClasses[badge.color]}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBadge(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/20 rounded-xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                selectedBadge.isUnlocked(stats) 
                  ? `bg-gradient-to-br from-${selectedBadge.color}-500 to-${selectedBadge.color}-600` 
                  : 'bg-white/10'
              }`}>
                <selectedBadge.icon className={`h-10 w-10 ${selectedBadge.isUnlocked(stats) ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <h3 className="text-xl font-bold text-white">{selectedBadge.name}</h3>
              <p className="text-gray-400 mt-2">{selectedBadge.description}</p>
              
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400">Requirement:</p>
                <p className="text-white font-medium">{selectedBadge.requirement}</p>
              </div>

              {!selectedBadge.isUnlocked(stats) && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{Math.round(selectedBadge.progress(stats))}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                      style={{ width: `${selectedBadge.progress(stats)}%` }}
                    />
                  </div>
                </div>
              )}

              {selectedBadge.isUnlocked(stats) && (
                <Badge className="mt-4 bg-green-500/20 text-green-300 border-green-500/30">
                  <Check className="h-3 w-3 mr-1" /> Unlocked!
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              className="w-full mt-4" 
              onClick={() => setSelectedBadge(null)}
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}

      {/* Growth Loop Perks */}
      <Card className="border-purple-500/30 bg-purple-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <TrendingUp className="h-5 w-5" />
            Growth Perks
          </CardTitle>
          <CardDescription className="text-purple-300/70">
            Unlock exclusive benefits as you grow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GROWTH_PERKS.map((perk, i) => {
              const colorClasses: Record<string, string> = {
                purple: 'text-purple-400 bg-purple-500/20',
                orange: 'text-orange-400 bg-orange-500/20',
                cyan: 'text-cyan-400 bg-cyan-500/20',
                green: 'text-green-400 bg-green-500/20',
              };

              return (
                <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClasses[perk.color]}`}>
                      <perk.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{perk.title}</h4>
                      <p className="text-sm text-gray-400">{perk.description}</p>
                      <p className="text-xs text-purple-400 mt-2">{perk.requirement}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Partner Invitations */}
      {stats.isFeatured && (
        <Card className="border-cyan-500/30 bg-cyan-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-cyan-300">
              <Users className="h-5 w-5" />
              Partner Opportunities
            </CardTitle>
            <CardDescription className="text-cyan-300/70">
              Exclusive invitations for Featured organizers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Mumbai Arena', type: 'Venue', offer: 'Reduced venue fees' },
                { name: 'SoundWave Records', type: 'Artist Agency', offer: 'Artist booking priority' },
                { name: 'EventPro Sponsors', type: 'Sponsor Network', offer: 'Sponsorship matching' },
              ].map((partner, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{partner.name}</p>
                    <p className="text-xs text-gray-400">{partner.type} • {partner.offer}</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-cyan-500/50 text-cyan-300">
                    View <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Display badge on organizer profile
export function OrganizerBadgeDisplay({ 
  isVerified, 
  isFeatured,
  hasPriorityApproval 
}: { 
  isVerified?: boolean; 
  isFeatured?: boolean;
  hasPriorityApproval?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {isFeatured && (
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          <Crown className="h-3 w-3 mr-1" /> Featured
        </Badge>
      )}
      {isVerified && (
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <Shield className="h-3 w-3 mr-1" /> Verified
        </Badge>
      )}
      {hasPriorityApproval && (
        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
          <Zap className="h-3 w-3 mr-1" /> Priority
        </Badge>
      )}
    </div>
  );
}
