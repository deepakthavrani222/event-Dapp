"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api/client"
import type { Event } from "@/lib/types"
import { PublicHeader } from "@/components/shared/public-header"
import { EnhancedEventCarousel } from "@/components/shared/enhanced-event-carousel"
import { IntegratedArtistHub } from "@/components/shared/integrated-artist-hub"

import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, MapPin, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Footer } from "@/components/shared/footer"
import Link from "next/link"







export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

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

  // Featured events for carousel (first 5)
  const featuredEvents = events.slice(0, 5)

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (featuredEvents.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredEvents.length])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredEvents.length)
  }, [featuredEvents.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)
  }, [featuredEvents.length])

  // Show all events without filtering
  const filteredEvents = events

  // Get unique categories from events
  const getUniqueCategories = () => {
    const categories = [...new Set(events.map(event => event.category).filter(Boolean))]
    return categories.slice(0, 6)
  }

  const uniqueCategories = getUniqueCategories()

  // Get valid image for event
  const getEventImage = (event: Event) => {
    if (event.image && 
        !event.image.startsWith('blob:') && 
        event.image !== '/placeholder.svg' &&
        (event.image.includes('cloudinary.com') || 
         event.image.includes('unsplash.com') ||
         event.image.startsWith('https://') ||
         event.image.startsWith('http://'))) {
      return event.image
    }
    // Default images based on category
    const defaults: Record<string, string> = {
      music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&h=900&fit=crop',
      comedy: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1600&h=900&fit=crop',
      sports: 'https://images.unsplash.com/photo-1461896836934- voices-of-the-game?w=1600&h=900&fit=crop',
      festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&h=900&fit=crop',
    }
    return defaults[event.category?.toLowerCase()] || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1600&h=900&fit=crop'
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicHeader />
      {/* Spacer for fixed header */}
      <div className="h-16" />
      {/* Hero Section - Event Carousel */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden">
        {/* Carousel Slides */}
        <AnimatePresence mode="wait">
          {featuredEvents.length > 0 && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${getEventImage(featuredEvents[currentSlide])})` }}
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container px-12 mx-auto max-w-7xl">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-2xl space-y-6"
                  >
                    {/* Category Badge */}
                    <span className="inline-block px-4 py-1.5 bg-purple-500/80 text-white text-sm font-semibold rounded-full">
                      {featuredEvents[currentSlide].category || 'Featured'}
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                      {featuredEvents[currentSlide].title}
                    </h1>

                    {/* Event Info */}
                    <div className="flex flex-wrap items-center gap-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        <span>{new Date(featuredEvents[currentSlide].date).toLocaleDateString('en-IN', { 
                          weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-purple-400" />
                        <span>{featuredEvents[currentSlide].city || 'Venue TBA'}</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center gap-4 pt-4">
                      <Link href={`/event/${featuredEvents[currentSlide].id}`}>
                        <Button
                          size="lg"
                          className="gradient-purple-cyan hover:opacity-90 border-0 text-white text-lg h-14 px-8 rounded-full font-bold shadow-xl"
                        >
                          Book Now
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <div className="text-white">
                        <p className="text-sm text-gray-400">Starting from</p>
                        <p className="text-2xl font-bold">₹{featuredEvents[currentSlide].price?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-gray-400">Loading events...</div>
          </div>
        )}

        {/* Navigation Arrows */}
        {featuredEvents.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {featuredEvents.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {featuredEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-purple-500 w-8' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </section>





      <section className="container py-20 px-12 mx-auto max-w-7xl space-y-16">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No events found</div>
        ) : (
          <>
            {/* All Events - First */}
            <EnhancedEventCarousel
              title="All Events"
              subtitle="Browse all available events"
              events={filteredEvents}
              variant="default"
            />

            {/* Comedy Events - Second */}
            <EnhancedEventCarousel
              title="Comedy Events"
              subtitle="Best comedy experiences"
              events={filteredEvents}
              variant="default"
              categoryFilter="Comedy"
            />
          </>
        )}
      </section>

      {/* Integrated Artist Hub - Third */}
      <IntegratedArtistHub />

      <section className="container py-20 px-12 mx-auto max-w-7xl space-y-16">
        {!loading && filteredEvents.length > 0 && (
          <>
            {/* Other Category Sections */}
            {uniqueCategories
              .filter(category => category.toLowerCase() !== 'comedy')
              .map((category) => (
                <EnhancedEventCarousel
                  key={category}
                  title={`${category} Events`}
                  subtitle={`Best ${category.toLowerCase()} experiences`}
                  events={filteredEvents}
                  variant="default"
                  categoryFilter={category}
                />
              ))}

            {/* Trending Now */}
            {filteredEvents.length > 8 && (
              <EnhancedEventCarousel
                title="Trending Now"
                subtitle="🔥 Most popular events this week"
                events={filteredEvents.slice(8, 16)}
                variant="trending"
              />
            )}
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