"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  Users, 
  Calendar, 
  MapPin,
  Instagram,
  Twitter,
  Music,
  Verified,
  Star
} from "lucide-react"
import { apiClient } from "@/lib/api/client"
import { OpenSeaEventCard } from "@/components/shared/opensea-event-card"
import type { Event } from "@/lib/types"
import { useTheme } from "@/lib/context/ThemeContext"

interface Artist {
  id: string
  name: string
  slug: string
  profileImage: string
  coverImage?: string
  isVerified: boolean
  followerCount: number
  bio: string
  genre: string
  location: string
  socialLinks: {
    instagram?: string
    twitter?: string
    spotify?: string
  }
  stats: {
    totalEvents: number
    upcomingEvents: number
    totalTicketsSold: number
  }
}

interface IntegratedArtistHubProps {
  className?: string
}

export function IntegratedArtistHub({ className }: IntegratedArtistHubProps) {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      // Fetch verified artists from API
      const response = await apiClient.request('/api/public/artists?status=verified&limit=10')
      
      // Default Karan Aujla image for artists without profile image
      const defaultArtistImage = 'https://i.scdn.co/image/ab6761610000e5eb5c0fef86231375a6e07e7d82'
      
      if (response.success && response.artists && response.artists.length > 0) {
        const artistsData = response.artists.map((artist: any) => ({
          id: artist.id,
          name: artist.artistName || artist.realName || 'Unknown Artist',
          slug: (artist.artistName || 'artist').toLowerCase().replace(/\s+/g, '-'),
          profileImage: artist.profileImage || defaultArtistImage,
          coverImage: artist.coverImage,
          isVerified: artist.verificationStatus === 'verified',
          followerCount: artist.fanCount || 0,
          bio: artist.bio || '',
          genre: Array.isArray(artist.genre) ? artist.genre.join(', ') : (artist.genre || 'Music'),
          location: 'India',
          socialLinks: artist.socialLinks || {},
          stats: {
            totalEvents: artist.totalEvents || 0,
            upcomingEvents: artist.upcomingEvents || 0,
            totalTicketsSold: artist.totalTicketsSold || 0
          }
        }))
        setArtists(artistsData)
      } else {
        // No artists in database, show empty state
        setArtists([])
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error)
      setArtists([])
    } finally {
      setLoading(false)
    }
  }



  const handleArtistClick = (artist: Artist) => {
    // Redirect to dedicated artist page
    window.location.href = `/artist/${artist.slug}`
  }



  if (loading) {
    return (
      <section className={`py-20 ${className}`}>
        <div className="container px-12 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className={`text-4xl md:text-5xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Featured Artists</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0">
                <div className={`w-32 h-32 rounded-full animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className={`mt-3 h-4 rounded animate-pulse w-24 mx-auto ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Empty state when no artists
  if (artists.length === 0) {
    return (
      <section className={`py-20 ${className}`}>
        <div className="container px-12 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className={`text-4xl md:text-5xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Featured <span className={isDark ? 'text-gradient-neon' : 'text-[#E23744]'}>Artists</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Discover top artists and their upcoming shows</p>
            </div>
          </div>
          <div className={`text-center py-12 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <Music className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Artists Yet</h3>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Be the first artist to join our platform!</p>
            <Button 
              onClick={() => window.location.href = '/artist'}
              className={isDark ? 'gradient-purple-cyan border-0 text-white' : 'bg-[#E23744] hover:bg-[#c92f3a] border-0 text-white'}
            >
              Become an Artist
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-20 ${className}`}>
      <div className="container px-12 mx-auto max-w-7xl">
        {/* Artists Grid View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className={`text-4xl md:text-5xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Featured <span className={isDark ? 'text-gradient-neon' : 'text-[#E23744]'}>Artists</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Discover top artists and their upcoming shows</p>
            </div>
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/artists'}
              className={`gap-2 ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-[#E23744] hover:text-[#c92f3a]'}`}
            >
              View all
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {artists.map((artist, idx) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="flex-shrink-0 cursor-pointer group"
                onClick={() => handleArtistClick(artist)}
              >
                <div className="relative">
                  {/* Artist Image */}
                  <div className={`relative w-36 h-36 rounded-full overflow-hidden border-4 border-transparent transition-all duration-300 shadow-2xl ${isDark ? 'group-hover:border-purple-500/50' : 'group-hover:border-[#E23744]/50'}`}>
                    <img
                      src={artist.profileImage}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="h-10 w-10 text-white" />
                    </div>
                    
                    {/* Verified Badge */}
                    {artist.isVerified && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                        <Verified className="h-5 w-5 text-white" fill="currentColor" />
                      </div>
                    )}
                  </div>
                  
                  {/* Artist Info */}
                  <div className="mt-4 text-center max-w-36">
                    <h3 className={`font-bold text-lg transition-colors duration-300 truncate ${isDark ? 'text-white group-hover:text-purple-400' : 'text-gray-900 group-hover:text-[#E23744]'}`}>
                      {artist.name}
                    </h3>
                    <p className={`text-sm mt-1 truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{artist.genre}</p>
                    <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users className="h-3 w-3" />
                      <span>{(artist.followerCount / 1000000).toFixed(1)}M</span>
                    </div>
                    {artist.stats.upcomingEvents > 0 && (
                      <div className="mt-2">
                        <Badge className={`text-xs ${isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-[#E23744]/10 text-[#E23744] border-[#E23744]/30'}`}>
                          {artist.stats.upcomingEvents} shows
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}