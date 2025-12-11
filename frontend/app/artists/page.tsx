'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  CheckCircle, 
  Music, 
  Star, 
  Crown,
  Calendar,
  Heart,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';

interface Artist {
  id: string;
  slug: string;
  artistName: string;
  genre: string[];
  fanCount: number;
  totalEvents: number;
  averageRating: number;
  verificationStatus: string;
  profileImage?: string;
  upcomingShows: number;
  isFollowing?: boolean;
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await apiClient.getVerifiedArtists();
      
      if (response.success && response.artists) {
        const artistsData = response.artists.map((artist: any) => ({
          id: artist.id,
          slug: artist.artistName.toLowerCase().replace(/\s+/g, '-'),
          artistName: artist.artistName,
          genre: artist.genre || [],
          fanCount: artist.fanCount || 0,
          totalEvents: artist.totalEvents || 0,
          averageRating: artist.averageRating || 0,
          verificationStatus: artist.verificationStatus,
          profileImage: artist.profileImage,
          upcomingShows: artist.upcomingShows || 0,
          isFollowing: false // TODO: Implement following status
        }));
        
        setArtists(artistsData);
      } else {
        // Fallback to mock data for demo
        const mockArtists: Artist[] = [
          {
            id: '1',
            slug: 'badshah',
            artistName: 'Badshah',
            genre: ['Hip Hop', 'Punjabi', 'Bollywood'],
            fanCount: 2500,
            totalEvents: 25,
            averageRating: 4.8,
            verificationStatus: 'verified',
            profileImage: '/artist-badshah.jpg',
            upcomingShows: 3,
            isFollowing: false
          },
          {
            id: '2',
            slug: 'prateek-kuhad',
            artistName: 'Prateek Kuhad',
            genre: ['Indie', 'Folk', 'Alternative'],
            fanCount: 1800,
            totalEvents: 18,
            averageRating: 4.9,
            verificationStatus: 'verified',
            profileImage: '/artist-prateek.jpg',
            upcomingShows: 2,
            isFollowing: true
          },
          {
            id: '3',
            slug: 'nucleya',
            artistName: 'Nucleya',
            genre: ['Electronic', 'Bass', 'EDM'],
            fanCount: 3200,
            totalEvents: 45,
            averageRating: 4.7,
            verificationStatus: 'verified',
            profileImage: '/artist-nucleya.jpg',
            upcomingShows: 5,
            isFollowing: false
          },
          {
            id: '4',
            slug: 'when-chai-met-toast',
            artistName: 'When Chai Met Toast',
            genre: ['Indie', 'Pop', 'Folk'],
            fanCount: 950,
            totalEvents: 12,
            averageRating: 4.6,
            verificationStatus: 'verified',
            profileImage: '/artist-wcmt.jpg',
            upcomingShows: 1,
            isFollowing: false
          },
          {
            id: '5',
            slug: 'divine',
            artistName: 'DIVINE',
            genre: ['Hip Hop', 'Rap', 'Gully Rap'],
            fanCount: 2100,
            totalEvents: 22,
            averageRating: 4.8,
            verificationStatus: 'verified',
            profileImage: '/artist-divine.jpg',
            upcomingShows: 4,
            isFollowing: false
          },
          {
            id: '6',
            slug: 'ritviz',
            artistName: 'Ritviz',
            genre: ['Electronic', 'Indie', 'Pop'],
            fanCount: 1650,
            totalEvents: 28,
            averageRating: 4.7,
            verificationStatus: 'verified',
            profileImage: '/artist-ritviz.jpg',
            upcomingShows: 2,
            isFollowing: true
          }
        ];
        
        setArtists(mockArtists);
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error);
      // Show mock data on error for demo
      const mockArtists: Artist[] = [
        {
          id: '1',
          slug: 'badshah',
          artistName: 'Badshah',
          genre: ['Hip Hop', 'Punjabi', 'Bollywood'],
          fanCount: 2500,
          totalEvents: 25,
          averageRating: 4.8,
          verificationStatus: 'verified',
          profileImage: '/artist-badshah.jpg',
          upcomingShows: 3,
          isFollowing: false
        },
        {
          id: '2',
          slug: 'prateek-kuhad',
          artistName: 'Prateek Kuhad',
          genre: ['Indie', 'Folk', 'Alternative'],
          fanCount: 1800,
          totalEvents: 18,
          averageRating: 4.9,
          verificationStatus: 'verified',
          profileImage: '/artist-prateek.jpg',
          upcomingShows: 2,
          isFollowing: true
        },
        {
          id: '3',
          slug: 'nucleya',
          artistName: 'Nucleya',
          genre: ['Electronic', 'Bass', 'EDM'],
          fanCount: 3200,
          totalEvents: 45,
          averageRating: 4.7,
          verificationStatus: 'verified',
          profileImage: '/artist-nucleya.jpg',
          upcomingShows: 5,
          isFollowing: false
        }
      ];
      
      setArtists(mockArtists);
    } finally {
      setLoading(false);
    }
  };

  const genres = ['all', 'Hip Hop', 'Indie', 'Electronic', 'Folk', 'Punjabi', 'Pop', 'Bollywood'];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.artistName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || artist.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const handleFollow = async (artistId: string, artistSlug: string) => {
    try {
      const artist = artists.find(a => a.id === artistId);
      if (!artist) return;

      const action = artist.isFollowing ? 'unfollow' : 'follow';
      const response = await apiClient.followArtist(artistSlug, action);
      
      if (response.success) {
        setArtists(prev => 
          prev.map(a => 
            a.id === artistId 
              ? { 
                  ...a, 
                  isFollowing: response.following,
                  fanCount: a.fanCount + (response.following ? 1 : -1)
                }
              : a
          )
        );
      }
    } catch (error) {
      console.error('Failed to update follow status:', error);
      alert('Failed to update follow status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Verified Artists
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover amazing verified artists, follow your favorites, and never miss a show
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-400" />
                <span>All Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span>Golden Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-400" />
                <span>Direct Updates</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists..."
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                onClick={() => setSelectedGenre(genre)}
                className={`whitespace-nowrap ${
                  selectedGenre === genre 
                    ? 'gradient-purple-cyan border-0' 
                    : 'border-white/20 text-white hover:bg-white/10'
                }`}
              >
                {genre === 'all' ? 'All Genres' : genre}
              </Button>
            ))}
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => (
            <ArtistCard 
              key={artist.id} 
              artist={artist} 
              onFollow={() => handleFollow(artist.id, artist.slug)}
            />
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <Music className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Artists Found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ArtistCard({ artist, onFollow }: { artist: Artist; onFollow: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-card border-white/20 bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
    >
      <Link href={`/artist/${artist.slug}`}>
        <div className="relative h-48 overflow-hidden cursor-pointer">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ 
              backgroundImage: artist.profileImage 
                ? `url(${artist.profileImage})` 
                : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
            }}
          />
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Verification Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-500/90 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          
          {/* Upcoming Shows */}
          {artist.upcomingShows > 0 && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-green-500/90 text-white border-0">
                <Calendar className="h-3 w-3 mr-1" />
                {artist.upcomingShows} upcoming
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-6 space-y-4">
        <div>
          <Link href={`/artist/${artist.slug}`}>
            <h3 className="font-bold text-white text-lg mb-2 hover:text-purple-400 transition-colors cursor-pointer">
              {artist.artistName}
            </h3>
          </Link>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {artist.genre.slice(0, 2).map((g) => (
              <Badge key={g} className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                {g}
              </Badge>
            ))}
            {artist.genre.length > 2 && (
              <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                +{artist.genre.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-white">{artist.fanCount.toLocaleString()}</p>
            <p className="text-xs text-gray-400">Fans</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{artist.totalEvents}</p>
            <p className="text-xs text-gray-400">Events</p>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{artist.averageRating}</p>
            <p className="text-xs text-gray-400">Rating</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={onFollow}
            className={`flex-1 ${artist.isFollowing 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'gradient-purple-cyan hover:opacity-90 border-0'
            } text-white font-semibold`}
          >
            <Heart className={`h-4 w-4 mr-2 ${artist.isFollowing ? 'fill-current' : ''}`} />
            {artist.isFollowing ? 'Following' : 'Follow'}
          </Button>
          
          <Link href={`/artist/${artist.slug}`}>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </motion.div>
  );
}