"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import type { Event } from "@/lib/types"
import { OpenSeaEventCard } from "@/components/shared/opensea-event-card"
import { CategoryCard } from "@/components/shared/category-card"
import { ArtistCard } from "@/components/shared/artist-card"
import { CitySelector } from "@/components/shared/city-selector-modal"
import { Button } from "@/components/ui/button"
import { Filter, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

const categories = [
  { title: "Music", icon: "🎸", href: "/events?category=music" },
  { title: "Nightlife", icon: "🪩", href: "/events?category=nightlife" },
  { title: "Comedy", icon: "🎤", href: "/events?category=comedy" },
  { title: "Sports", icon: "🏟️", href: "/events?category=sports" },
  { title: "Performances", icon: "🎭", href: "/events?category=theater" },
  { title: "Food & Drinks", icon: "🍷", href: "/events?category=food" },
  { title: "Fests & Fairs", icon: "🎪", href: "/events?category=festival" },
  { title: "Social Mixers", icon: "🥂", href: "/events?category=social" },
]

const artists = [
  { name: "Karan Aujla", image: "/placeholder.svg", color: "#FF6B6B" },
  { name: "Sunidhi Chauhan", image: "/placeholder.svg", color: "#4ECDC4" },
  { name: "Ilaiyaraaja", image: "/placeholder.svg", color: "#FFE66D" },
  { name: "Jubin Nautiyal", image: "/placeholder.svg", color: "#C7B3FF" },
  { name: "Shreya Ghoshal", image: "/placeholder.svg", color: "#FF8B94" },
  { name: "Monolink", image: "/placeholder.svg", color: "#D4A574" },
]

const filters = ["Today", "Tomorrow", "This Weekend", "Under 10 km", "Music", "Nightlife"]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [selectedCity, setSelectedCity] = useState("Bangalore")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await apiClient.getEvents()
        setEvents(response.events || [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const filteredEvents = events.filter((event) => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Left Centered */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-background to-cyan-500/10" />
        
        {/* Animated Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container relative z-10 py-20 px-6 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 lg:pl-4 xl:pl-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 backdrop-blur-sm px-4 py-2 text-sm font-semibold">
                  🔥 Trending Now
                </Badge>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight"
              >
                <span className="text-white">Experience</span>
                <br />
                <span className="text-gradient-neon">Live Events</span>
                <br />
                <span className="text-white">Like Never Before</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed"
              >
                Secure, transparent ticketing powered by Web3 blockchain. 
                <span className="text-white font-semibold"> No scalpers, no hidden fees</span>, 
                just authentic experiences.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button
                  size="lg"
                  className="gradient-purple-cyan hover:opacity-90 border-0 text-white text-lg h-16 px-10 rounded-full neon-glow font-bold shadow-2xl"
                >
                  Explore Events
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card hover:bg-white/10 border-white/20 text-white text-lg h-16 px-10 rounded-full font-bold bg-transparent"
                >
                  How It Works
                </Button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-8 pt-8 border-t border-white/10"
              >
                <div>
                  <p className="text-3xl font-bold text-white">50K+</p>
                  <p className="text-sm text-gray-400">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">1000+</p>
                  <p className="text-sm text-gray-400">Events Hosted</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="text-sm text-gray-400">Secure Tickets</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative lg:pr-4 xl:pr-8"
            >
              <div className="relative">
                {/* Featured Event Cards Stack */}
                <div className="relative h-[600px]">
                  {filteredEvents.slice(0, 3).map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 50, rotate: -5 }}
                      animate={{ 
                        opacity: 1, 
                        y: idx * 40, 
                        rotate: idx * 3 - 3,
                        x: idx * 20
                      }}
                      transition={{ delay: 0.5 + idx * 0.2 }}
                      className="absolute top-0 left-0 w-full"
                      style={{ zIndex: 3 - idx }}
                    >
                      <div className="glass-card rounded-2xl overflow-hidden border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300">
                        <img 
                          src={event.image || "/placeholder.svg"} 
                          alt={event.title}
                          className="w-full h-64 object-cover"
                        />
                        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
                          <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                          <p className="text-gray-300 text-sm">{event.city} • {new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Explore Categories */}
      <section className="container py-20 px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Explore <span className="text-gradient-neon">Live</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <CategoryCard {...category} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-20">
        <div className="container px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white">Featured Artists</h2>
            <Button variant="link" className="text-cyan-400 hover:text-cyan-300 gap-2">
              View all
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="container px-6 md:px-8 lg:px-12">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {artists.map((artist, idx) => (
            <motion.div
              key={artist.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <ArtistCard {...artist} />
            </motion.div>
          ))}
          </div>
        </div>
      </section>

      <section className="container py-20 px-6 md:px-8 lg:px-12 space-y-16">
        {/* Featured Collections */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-1">Featured Collections</h2>
              <p className="text-gray-400 text-sm">This week's curated collections</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEvents.slice(0, 4).map((event) => (
              <OpenSeaEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Featured Drops */}
        {!loading && filteredEvents.length > 4 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-1">Featured Drops</h2>
                <p className="text-gray-400 text-sm">This week's curated live and upcoming drops</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEvents.slice(4, 8).map((event) => (
                <OpenSeaEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {!loading && filteredEvents.length > 8 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black text-white mb-1">Trending Events</h2>
                <p className="text-gray-400 text-sm">Most popular events this week</p>
              </div>
              <Button variant="link" className="text-cyan-400 hover:text-cyan-300 gap-2">
                View all
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEvents.slice(8, 12).map((event) => (
                <OpenSeaEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black text-white mb-1">All Events</h2>
              <p className="text-gray-400 text-sm">Browse all available events</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="glass-card border-white/20 text-white hover:bg-white/10 gap-2 rounded-full bg-transparent"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <Button
                key={filter}
                size="sm"
                className="glass-card border-white/20 text-white hover:bg-purple-500/20 hover:border-purple-500/50 whitespace-nowrap rounded-full"
              >
                {filter}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No events found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredEvents.map((event) => (
                <OpenSeaEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* City Selector Modal */}
      <CitySelector open={showCitySelector} onClose={() => setShowCitySelector(false)} />
    </div>
  )
}
