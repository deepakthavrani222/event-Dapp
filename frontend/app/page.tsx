"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api/client"
import type { Event } from "@/lib/types"
import { PublicHeader } from "@/components/shared/public-header"
import { OpenSeaEventCard } from "@/components/shared/opensea-event-card"
import { HorizontalEventCarousel } from "@/components/shared/horizontal-event-carousel"
import { EnhancedEventCarousel } from "@/components/shared/enhanced-event-carousel"
import { CategoryCard } from "@/components/shared/category-card"
import { IntegratedArtistHub } from "@/components/shared/integrated-artist-hub"

import { Button } from "@/components/ui/button"

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/shared/footer"

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





export default function HomePage() {
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

  // Show all events without filtering
  const filteredEvents = events

  // Get unique categories from events
  const getUniqueCategories = () => {
    const categories = [...new Set(events.map(event => event.category).filter(Boolean))]
    return categories.slice(0, 6) // Limit to 6 categories for better layout
  }

  const uniqueCategories = getUniqueCategories()

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
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

        <div className="container relative z-10 py-20 px-12 mx-auto max-w-7xl">
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
      <section className="container py-20 px-12 mx-auto max-w-7xl">
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

      {/* Integrated Artist Hub */}
      <IntegratedArtistHub />

      <section className="container py-20 px-12 mx-auto max-w-7xl space-y-16">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No events found</div>
        ) : (
          <>
            {/* Featured Collections - Large Cards */}
            <EnhancedEventCarousel
              title="Featured Collections"
              subtitle="This week's curated premium experiences"
              events={filteredEvents.slice(0, 6)}
              variant="large"
            />

            {/* Dynamic Category Sections */}
            {uniqueCategories.map((category, index) => {
              // Use small cards only for Sports and Music/Concert events
              const useSmallCards = category.toLowerCase() === 'sports' || 
                                   category.toLowerCase() === 'music' || 
                                   category.toLowerCase() === 'concert'
              
              return (
                <EnhancedEventCarousel
                  key={category}
                  title={`${category} Events`}
                  subtitle={`Best ${category.toLowerCase()} experiences`}
                  events={filteredEvents}
                  variant={useSmallCards ? "compact" : "large"}
                  categoryFilter={category}
                />
              )
            })}

            {/* Trending Now - Trending Cards */}
            {filteredEvents.length > 8 && (
              <EnhancedEventCarousel
                title="Trending Now"
                subtitle="🔥 Most popular events this week"
                events={filteredEvents.slice(8, 16)}
                variant="trending"
              />
            )}

            {/* All Events - Default Cards */}
            <EnhancedEventCarousel
              title="All Events"
              subtitle="Browse all available events"
              events={filteredEvents}
              variant="default"
            />
          </>
        )}
      </section>

      {/* Become an Organizer CTA */}
      <section className="container py-20 px-12 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to Host Your Own Event?
              </h2>
              <p className="text-lg text-gray-300 max-w-xl">
                Create events, sell tickets, and earn <span className="text-purple-400 font-semibold">5% royalties</span> on every resale. 
                No crypto knowledge required.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Free to start
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Instant payouts
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Anti-scalping protection
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => window.location.href = '/become-organizer'}
              className="gradient-purple-cyan hover:opacity-90 border-0 text-white text-lg h-16 px-10 rounded-full neon-glow font-bold shadow-2xl whitespace-nowrap"
            >
              Become an Organizer
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </section>


      
      {/* Footer */}
      <Footer />
    </div>
  )
}