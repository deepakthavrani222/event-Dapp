'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Crown, 
  Users, 
  Calendar,
  Music,
  TrendingUp,
  Award,
  Gem,
  Sparkles,
  Eye,
  Heart,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';

interface FeaturedArtist {
  id: string;
  position: number;
  artistId: {
    _id: string;
    artistName: string;
    profileImage?: string;
    verificationStatus: string;
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      spotify?: string;
    };
    userId: {
      name: string;
      email: string;
    };
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const TIER_BADGES = {
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

export function FeaturedArtists() {
  const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedArtists();
  }, []);

  const fetchFeaturedArtists = async () => {
    try {
      const response = await apiClient.request('/api/admin/featured-artists', {
        headers: {} // Public endpoint
      });
      if (response.success) {
        setFeaturedArtists(response.featuredArtists || []);
      }
    } catch (error) {
      console.error('Failed to fetch featured artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = async (artistId: string) => {
    try {
      // Track click for analytics
      await apiClient.request(`/api/admin/featured-artists/${artistId}/click`, {
        method: 'POST',
        headers: {}
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-64 bg-white/10 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (featuredArtists.length === 0) {
    return null; // Don't show section if no featured artists
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="h-6 w-6 text-yellow-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Featured Artists</h2>
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover top-tier artists who are creating amazing experiences and building 
              incredible fan communities on our platform.
            </p>
          </motion.div>
        </div>

        {/* Featured Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featuredArtists
            .sort((a, b) => a.position - b.position)
            .map((featured, index) => {
              const artist = featured.artistId;
              const tierKey = index === 0 ? 'diamond' : index < 3 ? 'platinum' : 'gold';
              const tier = TIER_BADGES[tierKey];
              const TierIcon = tier.icon;

              return (
                <motion.div
                  key={featured.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`glass-card border-white/20 bg-white/5 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer ${
                    index === 0 ? 'md:col-span-1 lg:col-span-2 md:row-span-2' : ''
                  }`}>
                    <CardContent className={`p-6 ${index === 0 ? 'md:p-8' : ''}`}>
                      {/* Position Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`${tier.bgColor} ${tier.textColor} border-0`}>
                          <TierIcon className="h-3 w-3 mr-1" />
                          #{featured.position}
                        </Badge>
                        {artist.verificationStatus === 'verified' && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            <Star className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {/* Artist Avatar */}
                      <div className="text-center mb-4">
                        <div className={`${
                          index === 0 ? 'w-24 h-24' : 'w-16 h-16'
                        } mx-auto bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center mb-3`}>
                          {artist.profileImage ? (
                            <img 
                              src={artist.profileImage} 
                              alt={artist.artistName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Music className={`${index === 0 ? 'h-12 w-12' : 'h-8 w-8'} text-white`} />
                          )}
                        </div>
                        <h3 className={`${
                          index === 0 ? 'text-xl' : 'text-lg'
                        } font-bold text-white mb-1`}>
                          {artist.artistName}
                        </h3>
                        <p className="text-gray-400 text-sm">{tier.name} Artist</p>
                      </div>

                      {/* Stats (for featured position) */}
                      {index === 0 && (
                        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-white">
                              {featured.metrics.impressions.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">Views</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white">
                              {featured.metrics.clicks.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">Clicks</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-white">
                              {featured.metrics.conversions.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">Fans</p>
                          </div>
                        </div>
                      )}

                      {/* Social Links */}
                      {artist.socialLinks && (
                        <div className="flex items-center justify-center gap-2 mb-4">
                          {artist.socialLinks.instagram && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(artist.socialLinks.instagram, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          {artist.socialLinks.spotify && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(artist.socialLinks.spotify, '_blank');
                              }}
                            >
                              <Music className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <Link 
                        href={`/artist/${artist.artistName.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => handleArtistClick(artist._id)}
                      >
                        <Button 
                          className={`w-full gradient-purple-cyan hover:opacity-90 border-0 text-white group-hover:scale-105 transition-transform ${
                            index === 0 ? 'h-12 font-bold' : 'h-10'
                          }`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </Link>

                      {/* Featured Until */}
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Featured until {new Date(featured.endDate).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Card className="glass-card border-purple-500/30 bg-purple-500/10 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <TrendingUp className="h-12 w-12 mx-auto text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Want to be Featured?</h3>
              <p className="text-gray-400 mb-6">
                Build your fanbase, create amazing events, and climb the artist tiers to get 
                featured on our homepage and unlock exclusive perks.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/artist-verification">
                  <Button className="gradient-purple-cyan hover:opacity-90 border-0 text-white">
                    <Award className="h-4 w-4 mr-2" />
                    Become an Artist
                  </Button>
                </Link>
                <Link href="/artists">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Users className="h-4 w-4 mr-2" />
                    View All Artists
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}