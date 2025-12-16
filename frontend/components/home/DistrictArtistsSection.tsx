'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { useTheme } from '@/lib/context/ThemeContext';

interface Artist {
  _id: string;
  artistName: string;
  realName?: string;
  profileImage?: string;
  genre?: string;
  fanCount?: number;
  verificationStatus?: string;
}

// Mock artists data with reliable avatar images (using pravatar.cc)
const mockArtists: Artist[] = [
  {
    _id: '1',
    artistName: 'Karan Aujla',
    profileImage: 'https://i.pravatar.cc/150?img=11',
    genre: 'Punjabi',
    verificationStatus: 'verified',
    fanCount: 125000
  },
  {
    _id: '2',
    artistName: 'Sunidhi Chauhan',
    profileImage: 'https://i.pravatar.cc/150?img=5',
    genre: 'Bollywood',
    verificationStatus: 'verified',
    fanCount: 98000
  },
  {
    _id: '3',
    artistName: 'Ilaiyaraaja',
    profileImage: 'https://i.pravatar.cc/150?img=12',
    genre: 'Classical',
    verificationStatus: 'verified',
    fanCount: 156000
  },
  {
    _id: '4',
    artistName: 'Jubin Nautiyal',
    profileImage: 'https://i.pravatar.cc/150?img=13',
    genre: 'Bollywood',
    verificationStatus: 'verified',
    fanCount: 87000
  },
  {
    _id: '5',
    artistName: 'Shreya Ghoshal',
    profileImage: 'https://i.pravatar.cc/150?img=9',
    genre: 'Playback',
    verificationStatus: 'verified',
    fanCount: 145000
  },
  {
    _id: '6',
    artistName: 'Arijit Singh',
    profileImage: 'https://i.pravatar.cc/150?img=14',
    genre: 'Bollywood',
    verificationStatus: 'verified',
    fanCount: 210000
  },
  {
    _id: '7',
    artistName: 'Badshah',
    profileImage: 'https://i.pravatar.cc/150?img=15',
    genre: 'Hip-Hop',
    verificationStatus: 'verified',
    fanCount: 178000
  },
  {
    _id: '8',
    artistName: 'Neha Kakkar',
    profileImage: 'https://i.pravatar.cc/150?img=16',
    genre: 'Pop',
    verificationStatus: 'verified',
    fanCount: 165000
  },
  {
    _id: '9',
    artistName: 'Diljit Dosanjh',
    profileImage: 'https://i.pravatar.cc/150?img=17',
    genre: 'Punjabi',
    verificationStatus: 'verified',
    fanCount: 195000
  },
  {
    _id: '10',
    artistName: 'Armaan Malik',
    profileImage: 'https://i.pravatar.cc/150?img=18',
    genre: 'Bollywood',
    verificationStatus: 'verified',
    fanCount: 92000
  }
];

export function DistrictArtistsSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const data = await apiClient.getVerifiedArtists();
      if (data.artists && data.artists.length > 0) {
        setArtists(data.artists);
      } else {
        // Use mock data if no artists from API
        setArtists(mockArtists);
      }
    } catch (err) {
      console.error('Failed to fetch artists:', err);
      // Use mock data on error
      setArtists(mockArtists);
    } finally {
      setLoading(false);
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  // Don't render if no artists
  if (!loading && artists.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Artists in your District
          </h2>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} disabled:opacity-30`}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} disabled:opacity-30`}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex gap-8 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className={`w-28 h-28 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className={`w-20 h-4 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
        ) : (
          /* Artists Carousel */
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-8 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {artists.map((artist, index) => (
              <ArtistAvatar key={artist._id} artist={artist} index={index} isDark={isDark} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Individual Artist Avatar - District Style
function ArtistAvatar({ artist, index, isDark }: { artist: Artist; index: number; isDark: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Generate slug from artist name
  const slug = artist.artistName?.toLowerCase().replace(/\s+/g, '-') || artist._id;
  
  // Get initials for fallback
  const getInitials = () => {
    const name = artist.artistName || artist.realName || 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get gradient color based on index
  const gradients = [
    'from-orange-400 to-pink-500',
    'from-purple-400 to-indigo-500',
    'from-cyan-400 to-blue-500',
    'from-green-400 to-emerald-500',
    'from-yellow-400 to-orange-500',
    'from-pink-400 to-rose-500',
  ];
  const gradient = gradients[index % gradients.length];

  const hasValidImage = artist.profileImage && !imageError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="flex-shrink-0"
    >
      <Link href={`/artist/${slug}`} className="flex flex-col items-center gap-3 group">
        {/* Circular Avatar */}
        <div className="relative">
          <div className={`w-28 h-28 rounded-full overflow-hidden border-2 ${isDark ? 'border-white/20' : 'border-gray-200'} group-hover:border-orange-500 transition-all duration-300 group-hover:scale-105`}>
            {/* Gradient fallback - always rendered behind */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white text-2xl font-bold">{getInitials()}</span>
            </div>
            
            {/* Image - rendered on top when available */}
            {hasValidImage && (
              <img
                src={artist.profileImage}
                alt={artist.artistName}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading="eager"
                crossOrigin="anonymous"
              />
            )}
          </div>
          
          {/* Verified Badge */}
          {artist.verificationStatus === 'verified' && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Artist Name */}
        <span className={`text-sm font-medium text-center max-w-[120px] truncate ${isDark ? 'text-white group-hover:text-orange-400' : 'text-gray-900 group-hover:text-orange-600'} transition-colors`}>
          {artist.artistName}
        </span>
      </Link>
    </motion.div>
  );
}
