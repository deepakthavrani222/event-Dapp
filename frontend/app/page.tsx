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
import { useTheme } from "@/lib/context/ThemeContext"







export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
      <PublicHeader />
      {/* Spacer for fixed header */}
      <div className="h-16" />
      {/* Hero Section - District Style (Content Left, Image Right) */}
      <section className={`relative min-h-[500px] py-12 md:py-20 overflow-hidden ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
        {/* Light theme - Blurred event image as background (District style) */}
        {!isDark && featuredEvents.length > 0 && (
          <>
            {/* Blurred background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-40"
              style={{ backgroundImage: `url(${getEventImage(featuredEvents[currentSlide])})` }}
            />
            {/* Soft gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#FAFAFA]/60 via-transparent to-[#FAFAFA]/80" />
            {/* Side fade to white */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA]/70 via-transparent to-[#FAFAFA]/70" />
          </>
        )}
        
        <div className="container px-6 md:px-12 mx-auto max-w-7xl relative z-10">
          <AnimatePresence mode="wait">
            {featuredEvents.length > 0 && (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                {/* Left Side - Content */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4 order-2 lg:order-1"
                >
                  {/* Date & Time */}
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(featuredEvents[currentSlide].date).toLocaleDateString('en-IN', { 
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}, {featuredEvents[currentSlide].time || '7:00 PM'}
                  </p>

                  {/* Title */}
                  <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {featuredEvents[currentSlide].title}
                  </h1>

                  {/* Venue */}
                  <p className={`text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {typeof featuredEvents[currentSlide].venue === 'object' 
                      ? `${featuredEvents[currentSlide].venue?.name || ''}${featuredEvents[currentSlide].venue?.city ? `, ${featuredEvents[currentSlide].venue.city}` : (featuredEvents[currentSlide].city ? `, ${featuredEvents[currentSlide].city}` : '')}`
                      : `${featuredEvents[currentSlide].venue || ''}${featuredEvents[currentSlide].city ? `, ${featuredEvents[currentSlide].city}` : ''}`
                    }
                  </p>

                  {/* Price */}
                  <p className={`text-lg font-medium ${isDark ? 'text-[#A78BFA]' : 'text-[#E23744]'}`}>
                    ₹{featuredEvents[currentSlide].price?.toLocaleString('en-IN')} onwards
                  </p>

                  {/* Book Button */}
                  <div className="pt-2">
                    <Link href={`/event/${featuredEvents[currentSlide].id}`}>
                      <Button
                        size="lg"
                        className={`h-12 px-8 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 ${
                          isDark 
                            ? 'bg-white text-black hover:bg-gray-100' 
                            : 'bg-[#1a1a1a] text-white hover:bg-black'
                        }`}
                      >
                        Book tickets
                      </Button>
                    </Link>
                  </div>
                </motion.div>

                {/* Right Side - Event Image Card */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative order-1 lg:order-2 flex justify-center lg:justify-end"
                >
                  <div className={`relative w-full max-w-[400px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ${
                    isDark ? 'shadow-purple-500/20' : 'shadow-gray-400/30'
                  }`}>
                    <img
                      src={getEventImage(featuredEvents[currentSlide])}
                      alt={featuredEvents[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                    {/* Subtle gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                    
                    {/* Category badge on image */}
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      isDark ? 'bg-[#A78BFA] text-white' : 'bg-white/90 text-gray-900'
                    }`}>
                      {featuredEvents[currentSlide].category || 'Event'}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dots Indicator - Below content */}
          {featuredEvents.length > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? isDark ? 'bg-[#A78BFA] w-8' : 'bg-[#1a1a1a] w-8'
                      : isDark ? 'bg-gray-600 w-2 hover:bg-gray-500' : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {featuredEvents.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all z-20 ${
                isDark 
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20' 
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white shadow-lg'
              }`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all z-20 ${
                isDark 
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20' 
                  : 'bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white shadow-lg'
              }`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className={`flex items-center justify-center min-h-[400px] ${isDark ? 'text-[#B0B0B0]' : 'text-gray-500'}`}>
            <div className="flex flex-col items-center gap-3">
              <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isDark ? 'border-[#A78BFA]' : 'border-[#E23744]'}`} />
              <span>Loading events...</span>
            </div>
          </div>
        )}
      </section>





      <section className="container py-20 px-12 mx-auto max-w-7xl space-y-16">
        {loading ? (
          <div className={`text-center py-12 ${isDark ? 'text-[#B0B0B0]' : 'text-gray-500'}`}>Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? 'text-[#B0B0B0]' : 'text-gray-500'}`}>No events found</div>
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
          className={`relative overflow-hidden rounded-3xl ${
            isDark 
              ? 'bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/30' 
              : 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700'
          }`}
        >
          {isDark && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
            </>
          )}
          
          <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Ready to Host Your Own Event?
              </h2>
              <p className="text-lg text-gray-300 max-w-xl">
                Create events, sell tickets, and earn <span className="font-semibold text-[#E23744]">5% royalties</span> on every resale. 
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
              className={`text-lg h-16 px-10 rounded-full font-bold shadow-2xl whitespace-nowrap ${
                isDark 
                  ? 'gradient-purple-cyan hover:opacity-90 border-0 text-white neon-glow' 
                  : 'bg-[#E23744] hover:bg-[#c92f3a] border-0 text-white'
              }`}
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