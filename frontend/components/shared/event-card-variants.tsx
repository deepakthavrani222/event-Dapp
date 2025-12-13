"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import Link from "next/link"
import type { Event } from "@/lib/types"
import { useTheme } from "@/lib/context/ThemeContext"

// Helper function to get varied default images
const getVariedDefaultImage = (title: string) => {
  const allImages = [
    '/concert-stage-purple-lights.jpg',
    '/comedy-show-stage-spotlight.jpg',
    '/cricket-stadium-floodlights.jpg',
    '/theater-stage-dramatic-lighting.jpg',
    '/music-festival-crowd-stage.jpg',
    '/tech-conference-stage-futuristic.jpg',
    '/edm-festival-beach-sunset.jpg',
    '/amusement-park-colorful.jpg',
    '/indie-music-festival-outdoor.jpg',
    '/coldplay-concert-colorful-lights.jpg',
    '/sufi-concert-intimate-venue.jpg'
  ]
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return allImages[hash % allImages.length]
}

// Helper to check if image URL is valid
const isValidImageUrl = (image: string | undefined) => {
  if (!image) return false
  if (image === '/placeholder.svg') return false
  if (image.startsWith('blob:')) return false
  // Valid if it's a Cloudinary URL, other http URL, or local path
  if (image.includes('cloudinary.com')) return true
  if (image.includes('unsplash.com')) return true
  if (image.startsWith('https://') || image.startsWith('http://')) return true
  if (image.startsWith('/') && !image.includes('placeholder')) return true
  return false
}

// Large Featured Card (like District.io hero cards)
export function LargeFeaturedCard({ event }: { event: Event }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const imageUrl = isValidImageUrl(event.image) 
    ? event.image 
    : getVariedDefaultImage(event.title)

  return (
    <Link href={`/event/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={`flex-shrink-0 w-80 relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 ${
          isDark 
            ? 'bg-[#1F1F1F] border border-white/5 hover:border-white/20' 
            : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <img 
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/concert-stage-purple-lights.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`border-0 text-xs ${isDark ? 'bg-purple-500/80 text-white' : 'bg-[#E23744] text-white'}`}>
              {event.category}
            </Badge>
          </div>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{event.title}</h3>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Floor price</p>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{(event.price || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className={`text-right text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// Medium Category Card (Sports, Music, etc.)
export function CategoryEventCard({ event }: { event: Event }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const imageUrl = isValidImageUrl(event.image) 
    ? event.image 
    : getVariedDefaultImage(event.title)

  return (
    <Link href={`/event/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={`flex-shrink-0 w-80 relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 ${
          isDark 
            ? 'bg-[#1F1F1F] border border-white/5 hover:border-white/20' 
            : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <img 
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/concert-stage-purple-lights.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`border-0 text-xs ${isDark ? 'bg-purple-500/80 text-white' : 'bg-[#E23744] text-white'}`}>
              {event.category || 'Event'}
            </Badge>
          </div>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{event.title}</h3>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Floor price</p>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{(event.price || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className={`text-right text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// Small Compact Card (for trending/popular sections)
export function CompactEventCard({ event }: { event: Event }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const imageUrl = isValidImageUrl(event.image) 
    ? event.image 
    : getVariedDefaultImage(event.title)

  return (
    <Link href={`/event/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={`flex-shrink-0 w-80 relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 ${
          isDark 
            ? 'bg-[#1F1F1F] border border-white/5 hover:border-white/20' 
            : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <img 
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/concert-stage-purple-lights.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <Badge className={`border-0 text-xs ${isDark ? 'bg-purple-500/80 text-white' : 'bg-[#E23744] text-white'}`}>
              {event.category || 'Event'}
            </Badge>
          </div>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{event.title}</h3>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Floor price</p>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{(event.price || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className={`text-right text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// Trending Card with Stats (like District.io trending section)
export function TrendingEventCard({ event }: { event: Event }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const imageUrl = isValidImageUrl(event.image) 
    ? event.image 
    : getVariedDefaultImage(event.title)

  return (
    <Link href={`/event/${event.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className={`flex-shrink-0 w-80 relative rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 ${
          isDark 
            ? 'bg-[#1F1F1F] border border-white/5 hover:border-white/20' 
            : 'bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg'
        }`}
      >
        {/* Image */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <img 
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/concert-stage-purple-lights.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Trending Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-red-500/90 text-white border-0 text-xs animate-pulse">
              🔥 Trending
            </Badge>
          </div>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-bold text-white text-sm leading-tight line-clamp-1">{event.title}</h3>
          </div>
        </div>
        
        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className={`text-[10px] uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Floor price</p>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{(event.price || 0).toLocaleString("en-IN")}</p>
            </div>
            <div className={`text-right text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}