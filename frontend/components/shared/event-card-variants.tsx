"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, Star, Ticket } from "lucide-react"
import type { Event } from "@/lib/types"

// Large Featured Card (like District.io hero cards)
export function LargeFeaturedCard({ event }: { event: Event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 w-96 h-80 relative rounded-2xl overflow-hidden group cursor-pointer"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ 
          backgroundImage: event.image 
            ? `url(${event.image})` 
            : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/80 text-white border-0">
              {event.category}
            </Badge>
            {event.price && (
              <Badge className="bg-black/60 text-white border-0">
                ₹{event.price.toLocaleString()}
              </Badge>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-white leading-tight">
            {event.title}
          </h3>
          
          <div className="space-y-1 text-white/90">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('en-IN', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>
                {event.venue 
                  ? (typeof event.venue === 'string' ? event.venue : event.venue.name)
                  : 'Venue TBA'
                }, {event.city || 'City TBA'}
              </span>
            </div>
          </div>
          
          <Button className="w-full gradient-purple-cyan hover:opacity-90 border-0 text-white font-semibold">
            <Ticket className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Medium Category Card (Sports, Music, etc.)
export function CategoryEventCard({ event }: { event: Event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 w-72 h-64 relative rounded-xl overflow-hidden group cursor-pointer"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ 
          backgroundImage: event.image 
            ? `url(${event.image})` 
            : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      
      {/* Category Badge */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-purple-500/80 text-white border-0">
          {event.category || 'Event'}
        </Badge>
      </div>
      
      {/* Price Badge */}
      {event.price && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-black/60 text-white border-0">
            ₹{event.price.toLocaleString()}
          </Badge>
        </div>
      )}
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {event.title}
        </h3>
        <div className="flex items-center justify-between text-white/90 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{event.city || 'City TBA'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Small Compact Card (for trending/popular sections)
export function CompactEventCard({ event }: { event: Event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 w-64 h-48 relative rounded-lg overflow-hidden group cursor-pointer"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ 
          backgroundImage: event.image 
            ? `url(${event.image})` 
            : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      
      {/* Category Badge */}
      <div className="absolute top-3 left-3">
        <Badge className="bg-purple-500/80 text-white border-0 text-xs">
          {event.category || 'Event'}
        </Badge>
      </div>
      
      {/* Price Badge */}
      {event.price && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-black/60 text-white border-0 text-xs">
            ₹{event.price.toLocaleString()}
          </Badge>
        </div>
      )}
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
          {event.title}
        </h3>
        <div className="flex items-center justify-between text-white/80 text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{event.city || 'City TBA'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Trending Card with Stats (like District.io trending section)
export function TrendingEventCard({ event }: { event: Event }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-shrink-0 w-80 h-72 relative rounded-xl overflow-hidden group cursor-pointer"
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ 
          backgroundImage: event.image 
            ? `url(${event.image})` 
            : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      
      {/* Trending Badge */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-red-500/90 text-white border-0 animate-pulse">
          🔥 Trending
        </Badge>
      </div>
      
      {/* Stats */}
      <div className="absolute top-4 right-4 text-right">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
          <div className="flex items-center gap-1 text-white text-xs">
            <Users className="h-3 w-3" />
            <span>{event.ticketsAvailable || 0} left</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white leading-tight">
            {event.title}
          </h3>
          
          <div className="flex items-center justify-between text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('en-IN', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>4.8</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">{event.city || 'City TBA'}</span>
            {event.price && (
              <span className="text-white font-bold">₹{event.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}