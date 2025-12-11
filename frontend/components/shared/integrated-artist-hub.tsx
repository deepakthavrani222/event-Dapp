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

  // Featured artists data (you can replace with API call)
  const featuredArtists: Artist[] = [
    {
      id: "1",
      name: "AP Dhillon",
      slug: "ap-dhillon",
      profileImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop",
      isVerified: true,
      followerCount: 2500000,
      bio: "Punjabi singer, rapper and record producer. Known for hits like 'Brown Munde', 'Excuses' and 'Insane'. Taking Punjabi music global.",
      genre: "Punjabi Hip-Hop",
      location: "Punjab, India",
      socialLinks: {
        instagram: "https://instagram.com/apdhillon",
        twitter: "https://twitter.com/apdhillon",
        spotify: "https://open.spotify.com/artist/apdhillon"
      },
      stats: {
        totalEvents: 45,
        upcomingEvents: 8,
        totalTicketsSold: 125000
      }
    },
    {
      id: "2", 
      name: "Karan Aujla",
      slug: "karan-aujla",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      isVerified: true,
      followerCount: 1800000,
      bio: "Punjabi singer and songwriter. Famous for 'Don't Worry', 'Jhanjar' and 'White Brown Black'. The voice of new generation Punjabi music.",
      genre: "Punjabi Pop",
      location: "Punjab, India", 
      socialLinks: {
        instagram: "https://instagram.com/karanaujla",
        twitter: "https://twitter.com/karanaujla",
        spotify: "https://open.spotify.com/artist/karanaujla"
      },
      stats: {
        totalEvents: 38,
        upcomingEvents: 6,
        totalTicketsSold: 98000
      }
    },
    {
      id: "3",
      name: "Diljit Dosanjh", 
      slug: "diljit-dosanjh",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      isVerified: true,
      followerCount: 3200000,
      bio: "Punjabi singer, actor and television presenter. Bollywood star and international touring artist. Known for 'Proper Patola', 'Do You Know'.",
      genre: "Punjabi/Bollywood",
      location: "Punjab, India",
      socialLinks: {
        instagram: "https://instagram.com/diljitdosanjh",
        twitter: "https://twitter.com/diljitdosanjh", 
        spotify: "https://open.spotify.com/artist/diljitdosanjh"
      },
      stats: {
        totalEvents: 67,
        upcomingEvents: 12,
        totalTicketsSold: 245000
      }
    },
    {
      id: "4",
      name: "Sidhu Moose Wala",
      slug: "sidhu-moose-wala", 
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      isVerified: true,
      followerCount: 4100000,
      bio: "Legendary Punjabi singer, rapper and songwriter. Known for 'So High', '295', 'Bambiha Bole'. His legacy continues to inspire millions.",
      genre: "Punjabi Rap",
      location: "Punjab, India",
      socialLinks: {
        instagram: "https://instagram.com/sidhu_moosewala",
        spotify: "https://open.spotify.com/artist/sidhumoosewala"
      },
      stats: {
        totalEvents: 89,
        upcomingEvents: 0,
        totalTicketsSold: 567000
      }
    },
    {
      id: "5",
      name: "Badshah",
      slug: "badshah",
      profileImage: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face", 
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
      isVerified: true,
      followerCount: 2800000,
      bio: "Indian rapper and music producer. Known for 'Mercy', 'Kala Chashma', 'Genda Phool'. Bollywood's favorite rapper and live performer.",
      genre: "Hip-Hop/Bollywood",
      location: "Delhi, India",
      socialLinks: {
        instagram: "https://instagram.com/badboyshah",
        twitter: "https://twitter.com/its_badshah",
        spotify: "https://open.spotify.com/artist/badshah"
      },
      stats: {
        totalEvents: 52,
        upcomingEvents: 9,
        totalTicketsSold: 178000
      }
    },
    {
      id: "6",
      name: "Divine",
      slug: "divine",
      profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop", 
      isVerified: true,
      followerCount: 1500000,
      bio: "Mumbai-based rapper and hip-hop artist. Known for 'Mere Gully Mein', 'Farak', 'Kohinoor'. Pioneer of Indian street rap and gully rap movement.",
      genre: "Hip-Hop/Rap",
      location: "Mumbai, India",
      socialLinks: {
        instagram: "https://instagram.com/vivianakadivine",
        twitter: "https://twitter.com/VivianDivine", 
        spotify: "https://open.spotify.com/artist/divine"
      },
      stats: {
        totalEvents: 34,
        upcomingEvents: 7,
        totalTicketsSold: 89000
      }
    }
  ]

  useEffect(() => {
    // Simulate API call - replace with real API
    setTimeout(() => {
      setArtists(featuredArtists)
      setLoading(false)
    }, 1000)
  }, [])



  const handleArtistClick = (artist: Artist) => {
    // Redirect to dedicated artist page
    window.location.href = `/artist/${artist.slug}`
  }



  if (loading) {
    return (
      <section className={`py-20 ${className}`}>
        <div className="container px-12 mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white">Featured Artists</h2>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-32 h-32 bg-white/10 rounded-full animate-pulse" />
                <div className="mt-3 h-4 bg-white/10 rounded animate-pulse w-24" />
              </div>
            ))}
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
              <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                Featured <span className="text-gradient-neon">Artists</span>
              </h2>
              <p className="text-gray-400 text-lg">Discover top artists and their upcoming shows</p>
            </div>
            <Button 
              variant="link" 
              onClick={() => window.location.href = '/artists'}
              className="text-cyan-400 hover:text-cyan-300 gap-2"
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
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-transparent group-hover:border-purple-500/50 transition-all duration-300 shadow-2xl">
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
                    <h3 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors duration-300 truncate">
                      {artist.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 truncate">{artist.genre}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
                      <Users className="h-3 w-3" />
                      <span>{(artist.followerCount / 1000000).toFixed(1)}M</span>
                    </div>
                    {artist.stats.upcomingEvents > 0 && (
                      <div className="mt-2">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
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