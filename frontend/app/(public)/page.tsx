"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api/client"
import type { Event } from "@/lib/types"
import { OpenSeaEventCard } from "@/components/shared/opensea-event-card"
import { HorizontalEventCarousel } from "@/components/shared/horizontal-event-carousel"
import { CategoryCard } from "@/components/shared/category-card"
import { IntegratedArtistHub } from "@/components/shared/integrated-artist-hub"

import { Button } from "@/components/ui/button"

import { ChevronRight, ChevronLeft, Calendar, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/lib/context/ThemeContext"
import Link from "next/link"
import { format } from "date-fns"

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
  const [currentSlide, setCurrentSlide] = useState(0)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Get featured events for hero carousel (max 6)
  const heroEvents = events.slice(0, 6)

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

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (heroEvents.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroEvents.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroEvents.length])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroEvents.length)
  }, [heroEvents.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroEvents.length) % heroEvents.length)
  }, [heroEvents.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Show all events without filtering
  const filteredEvents = events
  const currentEvent = heroEvents[currentSlide]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - District Style Carousel */}
      <section className="relative h-[calc(100vh-64px)] flex items-center overflow-hidden">
        {/* Dynamic Blurred Background from Current Event Image */}
        <AnimatePresence mode="wait">
          {currentEvent && (
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={currentEvent.image || "/concert-stage-purple-lights.jpg"}
                alt=""
                className="w-full h-full object-cover blur-sm scale-105 opacity-90"
              />
              <div className={`absolute inset-0 ${isDark 
                ? 'bg-gradient-to-r from-black/50 via-black/20 to-transparent' 
                : 'bg-gradient-to-r from-white/60 via-white/30 to-transparent'}`} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Gradient Orbs */}
        <div className={`absolute top-20 left-10 w-72 h-72 ${isDark ? 'bg-purple-500/20' : 'bg-purple-400/15'} rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 right-1/3 w-56 h-56 ${isDark ? 'bg-cyan-500/15' : 'bg-cyan-400/10'} rounded-full blur-3xl`} />

        <div className="container relative z-10 py-8 px-8 mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Content - Dynamic based on current event */}
            <AnimatePresence mode="wait">
              {currentEvent && (
                <motion.div 
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="space-y-4 -mt-8"
                >
                  {/* Event Date & Category */}
                  <div className="flex items-center gap-3">
                    <Badge className={`${isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300'} px-3 py-1.5`}>
                      {currentEvent.category || 'Event'}
                    </Badge>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar className="inline h-4 w-4 mr-1" />
                      {format(new Date(currentEvent.date), 'EEE, dd MMM, HH:mm')}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {currentEvent.title}
                  </h1>

                  {/* Venue */}
                  <div className={`flex items-center gap-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <MapPin className="h-5 w-5" />
                    <span>{currentEvent.venue}, {currentEvent.city}</span>
                  </div>

                  {/* Price */}
                  <p className="text-2xl font-bold text-[#E23744]">
                    ₹{currentEvent.ticketTypes?.[0]?.price || 499} onwards
                  </p>

                  {/* Book Button */}
                  <Link href={`/event/${currentEvent.id}`}>
                    <Button
                      size="lg"
                      className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-6 rounded-lg text-lg mt-2"
                    >
                      Book tickets
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right Visual - Single Event Card with Navigation */}
            <div className="hidden lg:block relative">
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isDark 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <button
                onClick={nextSlide}
                className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isDark 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-md'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Event Card */}
              <AnimatePresence mode="wait">
                {currentEvent && (
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Link href={`/event/${currentEvent.id}`}>
                      <div className={`rounded-2xl overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform duration-300 ${
                        isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'
                      }`}>
                        {/* Category Badge on Image */}
                        <div className="relative">
                          <img 
                            src={currentEvent.image || "/placeholder.svg"} 
                            alt={currentEvent.title}
                            className="w-full h-[240px] object-cover"
                          />
                          <Badge className="absolute top-4 left-4 bg-white/90 text-gray-900 border-0 font-semibold">
                            {currentEvent.category || 'Event'}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        {heroEvents.length > 0 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {heroEvents.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide 
                    ? `w-8 h-2 ${isDark ? 'bg-white' : 'bg-gray-900'}` 
                    : `w-2 h-2 ${isDark ? 'bg-white/40 hover:bg-white/60' : 'bg-gray-400 hover:bg-gray-600'}`
                }`}
              />
            ))}
          </div>
        )}
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
            {/* Featured Collections - Horizontal Carousel */}
            <HorizontalEventCarousel
              title="Featured Collections"
              subtitle="This week's curated collections"
              events={filteredEvents.slice(0, 8)}
            />

            {/* Featured Drops - Horizontal Carousel */}
            {filteredEvents.length > 8 && (
              <HorizontalEventCarousel
                title="Featured Drops"
                subtitle="This week's curated live and upcoming drops"
                events={filteredEvents.slice(8, 16)}
              />
            )}

            {/* Trending Events - Horizontal Carousel */}
            {filteredEvents.length > 16 && (
              <HorizontalEventCarousel
                title="Trending Events"
                subtitle="Most popular events this week"
                events={filteredEvents.slice(16, 24)}
              />
            )}

            {/* All Events - Horizontal Carousel */}
            <HorizontalEventCarousel
              title="All Events"
              subtitle="Browse all available events"
              events={filteredEvents}
            />
          </>
        )}
      </section>


    </div>
  )
}
