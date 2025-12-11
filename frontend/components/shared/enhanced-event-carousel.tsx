"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { OpenSeaEventCard } from "@/components/shared/opensea-event-card"
import { 
  LargeFeaturedCard, 
  CategoryEventCard, 
  CompactEventCard, 
  TrendingEventCard 
} from "@/components/shared/event-card-variants"
import type { Event } from "@/lib/types"

type CardVariant = 'default' | 'large' | 'category' | 'compact' | 'trending'

interface EnhancedEventCarouselProps {
  title: string
  subtitle?: string
  events: Event[]
  variant?: CardVariant
  categoryFilter?: string
}

export function EnhancedEventCarousel({ 
  title, 
  subtitle, 
  events, 
  variant = 'default',
  categoryFilter
}: EnhancedEventCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const scrollAmount = container.clientWidth * 0.8
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const { scrollLeft, scrollWidth, clientWidth } = container
      
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Filter events by category if specified
  const filteredEvents = categoryFilter 
    ? events.filter(event => event.category.toLowerCase() === categoryFilter.toLowerCase())
    : events

  if (!filteredEvents || filteredEvents.length === 0) {
    return null
  }

  // Render appropriate card component based on variant
  const renderCard = (event: Event, index: number) => {
    const motionProps = {
      initial: { opacity: 0, x: 50 },
      animate: { opacity: 1, x: 0 },
      transition: { delay: index * 0.1 }
    }

    switch (variant) {
      case 'large':
        return (
          <motion.div key={event.id} {...motionProps}>
            <LargeFeaturedCard event={event} />
          </motion.div>
        )
      case 'category':
        return (
          <motion.div key={event.id} {...motionProps}>
            <CategoryEventCard event={event} />
          </motion.div>
        )
      case 'compact':
        return (
          <motion.div key={event.id} {...motionProps}>
            <CompactEventCard event={event} />
          </motion.div>
        )
      case 'trending':
        return (
          <motion.div key={event.id} {...motionProps}>
            <TrendingEventCard event={event} />
          </motion.div>
        )
      default:
        return (
          <motion.div key={event.id} {...motionProps} className="flex-shrink-0 w-80">
            <OpenSeaEventCard event={event} />
          </motion.div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black text-white mb-1">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 text-sm">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Horizontal Scrolling Container */}
      <div className="relative">
        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {filteredEvents.map((event, index) => renderCard(event, index))}
        </div>
        
        {/* Show arrows only if there are enough cards to scroll */}
        {filteredEvents.length > 4 && (
          <>
            {/* Left Arrow - Positioned at cards container middle, screen left edge */}
            <div className="absolute top-1/2 transform -translate-y-1/2 z-50" style={{ left: '-100vw' }}>
              <div className="relative" style={{ left: '100vw', marginLeft: '16px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className="w-12 h-12 p-0 border-white/20 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed bg-black/50 backdrop-blur-sm shadow-lg rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right Arrow - Positioned at cards container middle, screen right edge */}
            <div className="absolute top-1/2 transform -translate-y-1/2 z-50" style={{ right: '-100vw' }}>
              <div className="relative" style={{ right: '100vw', marginRight: '16px' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className="w-12 h-12 p-0 border-white/20 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed bg-black/50 backdrop-blur-sm shadow-lg rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Gradient Fade Effects */}
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      </div>
    </div>
  )
}